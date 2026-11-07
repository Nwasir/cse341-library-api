const { ObjectId } = require('mongodb');

const mongodb = require('../db/connect');

// The routes check the id and the body first (middleware/validate.js),
// so these functions only get valid ids, and req.body holds just the
// eight book fields.

const booksCollection = () => mongodb.getDb().collection('books');

const notFound = (res, id) => res.status(404).json({ message: `No book found with id ${id}` });

// Each isbn belongs to one book, so two books can't share an isbn.
const isbnTaken = (res, isbn) =>
  res.status(409).json({ message: `Another book already has isbn ${isbn}` });

// GET /books
// Returns every document in the books collection.
const getAll = async (req, res) => {
  /*
    #swagger.tags = ['Books']
    #swagger.summary = 'Get all books'
    #swagger.responses[200] = {
      description: 'Every book in the database',
      '@schema': { type: 'array', items: { $ref: '#/definitions/Book' } }
    }
    #swagger.responses[500] = { description: 'The database request failed', schema: { $ref: '#/definitions/Error' } }
  */
  try {
    const books = await booksCollection().find().toArray();
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /books/:id
// Returns the book whose _id matches the id.
const getSingle = async (req, res) => {
  /*
    #swagger.tags = ['Books']
    #swagger.summary = 'Get a book by id'
    #swagger.parameters['id'] = { description: 'The book\'s _id, copied from Get all books' }
    #swagger.responses[200] = { description: 'The book', schema: { $ref: '#/definitions/Book' } }
    #swagger.responses[400] = { description: 'The id is not a 24 character hex string', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[404] = { description: 'No book has this id', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[500] = { description: 'The database request failed', schema: { $ref: '#/definitions/Error' } }
  */
  const { id } = req.params;

  try {
    const book = await booksCollection().findOne({ _id: new ObjectId(id) });
    if (!book) return notFound(res, id);

    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /books
// Creates a book from the JSON body. All fields are required.
// Responds 201 with the new book's id.
const createBook = async (req, res) => {
  /*
    #swagger.tags = ['Books']
    #swagger.summary = 'Create a book'
    #swagger.description = 'Needs a login: log in at /login first. All eight fields are required. The Book model at the bottom of this page lists the rules for each field. Anything else in the body, including an _id, is ignored.'
    #swagger.security = [{ "loginCookie": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'The new book',
      required: true,
      schema: { $ref: '#/definitions/Book' }
    }
    #swagger.responses[201] = {
      description: 'Created. The body has the new book\'s id, and the Location header is its url.',
      schema: { $ref: '#/definitions/BookId' }
    }
    #swagger.responses[400] = { description: 'A field is missing or invalid, or the body is not a valid JSON object', schema: { $ref: '#/definitions/ValidationError' } }
    #swagger.responses[401] = { description: 'You are not logged in', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[409] = { description: 'Another book already has this isbn', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[500] = { description: 'The database request failed', schema: { $ref: '#/definitions/Error' } }
  */
  const book = req.body;

  try {
    const duplicate = await booksCollection().findOne({ isbn: book.isbn });
    if (duplicate) return isbnTaken(res, book.isbn);

    const result = await booksCollection().insertOne(book);

    // The Location header points to the new book, e.g. /books/<id>
    res
      .status(201)
      .location(`${req.baseUrl}/${result.insertedId}`)
      .json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /books/:id
// Replaces the book's fields with the JSON body. All fields are required.
// The id in the url is only used to find the book; it is never changed.
// Responds 204 with no body.
const updateBook = async (req, res) => {
  /*
    #swagger.tags = ['Books']
    #swagger.summary = 'Update a book'
    #swagger.description = 'Needs a login: log in at /login first. Replaces all eight fields, so every field is required. The Book model at the bottom of this page lists the rules for each field. The _id never changes.'
    #swagger.security = [{ "loginCookie": [] }]
    #swagger.parameters['id'] = { description: 'The book\'s _id, copied from Get all books' }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'The book\'s new values',
      required: true,
      schema: { $ref: '#/definitions/Book' }
    }
    #swagger.responses[204] = { description: 'Updated. The response has no body.' }
    #swagger.responses[400] = { description: 'The id is not a 24 character hex string, a field is missing or invalid, or the body is not a valid JSON object', schema: { $ref: '#/definitions/ValidationError' } }
    #swagger.responses[401] = { description: 'You are not logged in', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[404] = { description: 'No book has this id', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[409] = { description: 'A different book already has this isbn', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[500] = { description: 'The database request failed', schema: { $ref: '#/definitions/Error' } }
  */
  const { id } = req.params;
  const _id = new ObjectId(id);
  const book = req.body;

  try {
    const existing = await booksCollection().findOne({ _id });
    if (!existing) return notFound(res, id);

    // Any book other than this one with the same isbn
    const duplicate = await booksCollection().findOne({ isbn: book.isbn, _id: { $ne: _id } });
    if (duplicate) return isbnTaken(res, book.isbn);

    await booksCollection().replaceOne({ _id }, book);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /books/:id
// Deletes the book. Responds 200 with the book that was deleted.
const deleteBook = async (req, res) => {
  /*
    #swagger.tags = ['Books']
    #swagger.summary = 'Delete a book'
    #swagger.description = 'Needs a login: log in at /login first.'
    #swagger.security = [{ "loginCookie": [] }]
    #swagger.parameters['id'] = { description: 'The book\'s _id, copied from Get all books' }
    #swagger.responses[200] = { description: 'Deleted. The body is the book that was deleted.', schema: { $ref: '#/definitions/Book' } }
    #swagger.responses[400] = { description: 'The id is not a 24 character hex string', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[401] = { description: 'You are not logged in', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[404] = { description: 'No book has this id', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[500] = { description: 'The database request failed', schema: { $ref: '#/definitions/Error' } }
  */
  const { id } = req.params;

  try {
    const book = await booksCollection().findOneAndDelete({ _id: new ObjectId(id) });
    if (!book) return notFound(res, id);

    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getSingle, createBook, updateBook, deleteBook };
