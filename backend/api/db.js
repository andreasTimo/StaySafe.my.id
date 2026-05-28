/**
 * StaySafe.my.id — Database connection manager
 * Caches the connection across serverless function warm runs.
 */

const { MongoClient } = require('mongodb');

let client = null;
let db = null;

async function getDb() {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  if (!client) {
    client = new MongoClient(uri, {
      maxPoolSize: 10, // Keep connection pool small in serverless environment
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
  }

  db = client.db('staysafe');
  return db;
}

module.exports = { getDb };
