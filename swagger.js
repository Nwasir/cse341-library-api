// Generates swagger.json from the routes and the #swagger comments in
// the controllers. Run "npm run swagger" after changing either one.
const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Library API',
    description:
      'A REST API for a library catalog. It stores books and authors in MongoDB and can create, read, update and delete both. Requests and responses are JSON. A request with an invalid id or body gets a 400 response that explains what is wrong.',
  },
  // null leaves host and schemes out of swagger.json, so "Try it out" sends
  // requests to the server showing the docs: localhost or Render.
  host: null,
  schemes: null,
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    { name: 'Books', description: 'The books collection' },
    { name: 'Authors', description: 'The authors collection' },
  ],
  // '@definitions' is copied into swagger.json as written.
  '@definitions': {
    Book: {
      type: 'object',
      description:
        'Every field except _id is required. Text fields cannot be empty, and spaces at the start and end are removed.',
      required: [
        'title',
        'author',
        'isbn',
        'genre',
        'publishedYear',
        'pageCount',
        'publisher',
        'language',
      ],
      properties: {
        _id: {
          type: 'string',
          readOnly: true,
          description: 'Created by MongoDB. Ignored if sent in a request body.',
          example: '64f1c2e9a1b2c3d4e5f60718',
        },
        title: { type: 'string', example: 'Purple Hibiscus' },
        author: {
          type: 'string',
          description: "The author's full name",
          example: 'Chimamanda Ngozi Adichie',
        },
        isbn: {
          type: 'string',
          description:
            'An ISBN-10 or ISBN-13 that no other book has. Hyphens and spaces are removed before it is saved.',
          example: '9781616202415',
        },
        genre: { type: 'string', example: 'Literary Fiction' },
        publishedYear: {
          type: 'integer',
          minimum: 1,
          description: 'The year the book was first published, from 1 to the current year',
          example: 2003,
        },
        pageCount: {
          type: 'integer',
          minimum: 1,
          description: 'The number of pages in this edition',
          example: 307,
        },
        publisher: {
          type: 'string',
          description: 'The publisher of this edition',
          example: 'Algonquin Books',
        },
        language: { type: 'string', example: 'English' },
      },
    },
    Author: {
      type: 'object',
      description:
        'Every field except _id is required. Text fields cannot be empty, and spaces at the start and end are removed.',
      required: ['name', 'birthDate', 'birthplace', 'nationality', 'biography'],
      properties: {
        _id: {
          type: 'string',
          readOnly: true,
          description: 'Created by MongoDB. Ignored if sent in a request body.',
          example: '64f1c2e9a1b2c3d4e5f60719',
        },
        name: {
          type: 'string',
          description: "The author's full name, as it appears on their books",
          example: 'Wole Soyinka',
        },
        birthDate: {
          type: 'string',
          format: 'date',
          description: 'A real date in YYYY-MM-DD format that is not in the future',
          example: '1934-07-13',
        },
        birthplace: { type: 'string', example: 'Abeokuta, Nigeria' },
        nationality: { type: 'string', example: 'Nigerian' },
        biography: {
          type: 'string',
          description: "A short summary of the author's life and work",
          example:
            'Nigerian playwright, poet and essayist who won the 1986 Nobel Prize in Literature.',
        },
      },
    },
    BookId: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: "The new book's _id",
          example: '64f1c2e9a1b2c3d4e5f60718',
        },
      },
    },
    AuthorId: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: "The new author's _id",
          example: '64f1c2e9a1b2c3d4e5f60719',
        },
      },
    },
    Error: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Explains what went wrong' },
      },
    },
    ValidationError: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Explains what went wrong',
          example: 'The book has missing or invalid fields.',
        },
        errors: {
          type: 'object',
          description:
            'What is wrong with each missing or invalid field. Not sent when the id or the whole body is the problem.',
          additionalProperties: { type: 'string' },
          example: {
            isbn: 'isbn is required',
            pageCount: 'pageCount must be a whole number greater than 0',
          },
        },
      },
    },
  },
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
