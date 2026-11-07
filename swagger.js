// Generates swagger.json from the routes and the #swagger comments in
// the controllers. Run "npm run swagger" after changing either one.
const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Library API',
    description:
      'A REST API for a library catalog. It stores books and authors in MongoDB and can create, read, update and delete both. Requests and responses are JSON. A request with an invalid id or body gets a 400 response that explains what is wrong.\n\n' +
      '**Logging in:** anyone can read books and authors, but creating, updating and deleting them needs a login, and so does getting your profile. Those routes have a lock icon. [Log in](/login) with Auth0 in this browser, or [create an account](/signup), then come back to this page. The browser then sends your login with every request you try here. [Log out](/logout) when you are done. A request to a locked route without a login gets a 401 response.',
  },
  // null leaves host and schemes out of swagger.json, so "Try it out" sends
  // requests to the server showing the docs: localhost or Render.
  host: null,
  schemes: null,
  consumes: ['application/json'],
  produces: ['application/json'],
  // The login that the routes with "#swagger.security" need. Logging in at
  // /login sets the appSession cookie, and the browser sends it in the
  // Cookie header with every request to this server.
  securityDefinitions: {
    loginCookie: {
      type: 'apiKey',
      in: 'header',
      name: 'Cookie',
      description:
        'The appSession cookie that the server sets when you log in at /login. On this page you can leave it empty: after you log in, the browser sends the cookie for you. Tools like curl or Postman have to send it themselves. Copy the appSession cookie from the browser after logging in, and enter appSession=<its value> here.',
    },
  },
  tags: [
    { name: 'Books', description: 'The books collection' },
    { name: 'Authors', description: 'The authors collection' },
    {
      name: 'Profile',
      description:
        'The logged-in user. Log in at /login (or create an account at /signup) and log out at /logout.',
    },
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
        title: { type: 'string', example: 'No Longer at Ease' },
        author: {
          type: 'string',
          description: "The author's full name",
          example: 'Chinua Achebe',
        },
        isbn: {
          type: 'string',
          description:
            'An ISBN-10 or ISBN-13 that no other book has. Hyphens and spaces are removed before it is saved.',
          example: '9780385474559',
        },
        genre: { type: 'string', example: 'Fiction' },
        publishedYear: {
          type: 'integer',
          minimum: 1,
          description: 'The year the book was first published, from 1 to the current year',
          example: 1960,
        },
        pageCount: {
          type: 'integer',
          minimum: 1,
          description: 'The number of pages in this edition',
          example: 194,
        },
        publisher: {
          type: 'string',
          description: 'The publisher of this edition',
          example: 'Anchor Books',
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
    Profile: {
      type: 'object',
      description:
        'The user Auth0 logged in. Which fields are sent depends on how the user logged in, e.g. with Google or an email and password.',
      properties: {
        sub: {
          type: 'string',
          description: "The user's Auth0 id",
          example: 'google-oauth2|103547991597142817347',
        },
        name: { type: 'string', example: 'Ada Obi' },
        given_name: { type: 'string', example: 'Ada' },
        family_name: { type: 'string', example: 'Obi' },
        nickname: { type: 'string', example: 'adaobi' },
        email: { type: 'string', format: 'email', example: 'ada.obi@example.com' },
        email_verified: { type: 'boolean', example: true },
        picture: {
          type: 'string',
          format: 'uri',
          description: "A link to the user's profile picture",
          example: 'https://s.gravatar.com/avatar/0000.png',
        },
        updated_at: {
          type: 'string',
          format: 'date-time',
          description: 'When Auth0 last updated the profile',
          example: '2026-10-31T09:15:00.000Z',
        },
        sid: {
          type: 'string',
          description: "The id of the user's Auth0 login session",
          example: 'Qm9vazFTZXNzaW9uSWQxMjM0NTY3',
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
