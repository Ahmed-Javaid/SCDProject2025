const { MongoClient } = require('mongodb');
require('dotenv').config();

let db = null;
let client = null;

async function connect() {
  if (db) return db;
  
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not found in .env file');
    }
    
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();
    console.log('Connected to MongoDB successfully!');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

async function getCollection() {
  const database = await connect();
  return database.collection('records');
}

async function close() {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = { connect, getCollection, close };
