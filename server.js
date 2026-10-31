require('dotenv').config({ quiet: true });
const express = require('express');
const { auth } = require('express-openid-connect');

const mongodb = require('./db/connect');

// The server can't connect to MongoDB or log users in without these.
const missing = ['MONGODB_URI', 'SECRET', 'CLIENT_ID', 'CLIENT_SECRET', 'ISSUER_BASE_URL'].filter(
  (name) => !process.env[name]
);
if (missing.length) {
  console.error(
    `Failed to start server: ${missing.join(', ')} not set. Add them to .env or the Render environment variables.`
  );
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

// Lets web pages on other sites call the API from the browser,
// including POST and PUT requests that send a JSON body.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Reads JSON request bodies into req.body.
app.use(express.json());

// Auth0 login. This adds the /login, /logout and /callback routes, and
// req.oidc, which tells the other routes who is logged in. authRequired
// is false so the GET routes stay public.
// response_type 'code' makes Auth0 redirect back to /callback with a code
// that the server swaps for the user's details. The default sends them in
// a form POST instead, which browsers can block on http://localhost.
app.use(
  auth({
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASE_URL || `http://localhost:${port}`,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    authorizationParams: { response_type: 'code' },
  })
);

app.use('/', require('./routes'));

// Any request that doesn't match a route gets a JSON 404
// instead of Express's HTML "Cannot GET" page.
app.use((req, res) => {
  res.status(404).json({
    message: `${req.method} ${req.originalUrl} is not a route in this API. See /api-docs for the routes.`,
  });
});

// Sends errors as JSON instead of Express's HTML error page,
// e.g. a 400 when a request body is not valid JSON.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status = err.status || 500;
  if (status >= 500) console.error(err);

  const message =
    err.type === 'entity.parse.failed' ? 'The request body is not valid JSON.' : err.message;
  res.status(status).json({ message });
});

const start = async () => {
  const db = await mongodb.initDb();
  console.log(`Connected to MongoDB database "${db.databaseName}"`);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
