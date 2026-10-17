// Loads data/books.js and data/authors.js into the "books" and "authors" collections.
// Usage: npm run seed   (requires MONGODB_URI in .env)
require('dotenv').config({ quiet: true });

const mongodb = require('../db/connect');
const books = require('../data/books');
const authors = require('../data/authors');

// Replaces the document with the same value in the key field, or inserts it
// if there isn't one. Running the seed again updates the documents
// instead of duplicating them, and their _id values stay the same.
const upsertAll = (db, collection, docs, key) =>
  db.collection(collection).bulkWrite(
    docs.map((doc) => ({
      replaceOne: {
        filter: { [key]: doc[key] },
        replacement: { ...doc },
        upsert: true,
      },
    }))
  );

const seed = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to your .env file.');
  }

  const db = await mongodb.initDb();

  await upsertAll(db, 'books', books, 'isbn');
  console.log(`Seeded ${books.length} books into "${db.databaseName}.books"`);

  await upsertAll(db, 'authors', authors, 'name');
  console.log(`Seeded ${authors.length} authors into "${db.databaseName}.authors"`);
};

seed()
  .catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongodb.closeDb());
