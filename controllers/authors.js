const { ObjectId } = require('mongodb');

const mongodb = require('../db/connect');

// The routes check the id and the body first (middleware/validate.js),
// so these functions only get valid ids, and req.body holds just the
// five author fields.

const authorsCollection = () => mongodb.getDb().collection('authors');

const notFound = (res, id) => res.status(404).json({ message: `No author found with id ${id}` });

// GET /authors
// Returns every document in the authors collection.
const getAll = async (req, res) => {
  /*
    #swagger.tags = ['Authors']
    #swagger.summary = 'Get all authors'
    #swagger.responses[200] = {
      description: 'Every author in the database',
      '@schema': { type: 'array', items: { $ref: '#/definitions/Author' } }
    }
    #swagger.responses[500] = { description: 'The database request failed', schema: { $ref: '#/definitions/Error' } }
  */
  try {
    const authors = await authorsCollection().find().toArray();
    res.status(200).json(authors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /authors/:id
// Returns the author whose _id matches the id.
const getSingle = async (req, res) => {
  /*
    #swagger.tags = ['Authors']
    #swagger.summary = 'Get an author by id'
    #swagger.parameters['id'] = { description: 'The author\'s _id, copied from Get all authors' }
    #swagger.responses[200] = { description: 'The author', schema: { $ref: '#/definitions/Author' } }
    #swagger.responses[400] = { description: 'The id is not a 24 character hex string', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[404] = { description: 'No author has this id', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[500] = { description: 'The database request failed', schema: { $ref: '#/definitions/Error' } }
  */
  const { id } = req.params;

  try {
    const author = await authorsCollection().findOne({ _id: new ObjectId(id) });
    if (!author) return notFound(res, id);

    res.status(200).json(author);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /authors
// Creates an author from the JSON body. All fields are required.
// Responds 201 with the new author's id.
const createAuthor = async (req, res) => {
  /*
    #swagger.tags = ['Authors']
    #swagger.summary = 'Create an author'
    #swagger.description = 'All five fields are required. The Author model at the bottom of this page lists the rules for each field. Anything else in the body, including an _id, is ignored.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'The new author',
      required: true,
      schema: { $ref: '#/definitions/Author' }
    }
    #swagger.responses[201] = {
      description: 'Created. The body has the new author\'s id, and the Location header is its url.',
      schema: { $ref: '#/definitions/AuthorId' }
    }
    #swagger.responses[400] = { description: 'A field is missing or invalid, or the body is not a valid JSON object', schema: { $ref: '#/definitions/ValidationError' } }
    #swagger.responses[500] = { description: 'The database request failed', schema: { $ref: '#/definitions/Error' } }
  */
  try {
    const result = await authorsCollection().insertOne(req.body);

    // The Location header points to the new author, e.g. /authors/<id>
    res
      .status(201)
      .location(`${req.baseUrl}/${result.insertedId}`)
      .json({ id: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /authors/:id
// Replaces the author's fields with the JSON body. All fields are required.
// The id in the url is only used to find the author; it is never changed.
// Responds 204 with no body.
const updateAuthor = async (req, res) => {
  /*
    #swagger.tags = ['Authors']
    #swagger.summary = 'Update an author'
    #swagger.description = 'Replaces all five fields, so every field is required. The Author model at the bottom of this page lists the rules for each field. The _id never changes.'
    #swagger.parameters['id'] = { description: 'The author\'s _id, copied from Get all authors' }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'The author\'s new values',
      required: true,
      schema: { $ref: '#/definitions/Author' }
    }
    #swagger.responses[204] = { description: 'Updated. The response has no body.' }
    #swagger.responses[400] = { description: 'The id is not a 24 character hex string, a field is missing or invalid, or the body is not a valid JSON object', schema: { $ref: '#/definitions/ValidationError' } }
    #swagger.responses[404] = { description: 'No author has this id', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[500] = { description: 'The database request failed', schema: { $ref: '#/definitions/Error' } }
  */
  const { id } = req.params;

  try {
    const result = await authorsCollection().replaceOne({ _id: new ObjectId(id) }, req.body);
    if (result.matchedCount === 0) return notFound(res, id);

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /authors/:id
// Deletes the author. Responds 200 with the author that was deleted.
const deleteAuthor = async (req, res) => {
  /*
    #swagger.tags = ['Authors']
    #swagger.summary = 'Delete an author'
    #swagger.parameters['id'] = { description: 'The author\'s _id, copied from Get all authors' }
    #swagger.responses[200] = { description: 'Deleted. The body is the author that was deleted.', schema: { $ref: '#/definitions/Author' } }
    #swagger.responses[400] = { description: 'The id is not a 24 character hex string', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[404] = { description: 'No author has this id', schema: { $ref: '#/definitions/Error' } }
    #swagger.responses[500] = { description: 'The database request failed', schema: { $ref: '#/definitions/Error' } }
  */
  const { id } = req.params;

  try {
    const author = await authorsCollection().findOneAndDelete({ _id: new ObjectId(id) });
    if (!author) return notFound(res, id);

    res.status(200).json(author);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getSingle, createAuthor, updateAuthor, deleteAuthor };
