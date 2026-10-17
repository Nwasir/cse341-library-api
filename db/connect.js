// Shared MongoDB connection, opened once when the server starts.
const { MongoClient } = require('mongodb');

let client;
let db;

const initDb = async () => {
  if (db) return db;

  client = await MongoClient.connect(process.env.MONGODB_URI);
  db = client.db(process.env.MONGODB_DB_NAME || 'library');
  return db;
};

const getDb = () => {
  if (!db) throw new Error('Database has not been initialized');
  return db;
};

const closeDb = async () => {
  if (client) await client.close();
  client = undefined;
  db = undefined;
};

module.exports = { initDb, getDb, closeDb };
