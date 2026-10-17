require('dotenv').config({ quiet: true });
const express = require('express');

const mongodb = require('./db/connect');

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
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to .env or the Render environment variables.');
  }

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
