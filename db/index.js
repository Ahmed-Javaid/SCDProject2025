const { getCollection } = require('./mongodb');
const recordUtils = require('./record');
const vaultEvents = require('../events');
const fs = require('fs');
const path = require('path');

// Create automatic backup
async function createBackup() {
  const collection = await getCollection();
  const data = await collection.find({}).toArray();
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '')
    .replace('T', '_');
  
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const filename = `backup_${timestamp}.json`;
  const filepath = path.join(backupDir, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Backup created: ${filename}`);
}

async function addRecord({ name }) {
  recordUtils.validateRecord({ name });
  const collection = await getCollection();
  const newRecord = { 
    id: recordUtils.generateId(), 
    name,
    createdAt: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  };
  await collection.insertOne(newRecord);
  await createBackup(); // Automatic backup
  vaultEvents.emit('recordAdded', newRecord);
  return newRecord;
}

async function listRecords() {
  const collection = await getCollection();
  return await collection.find({}).toArray();
}

async function updateRecord(id, newName) {
  const collection = await getCollection();
  const result = await collection.findOneAndUpdate(
    { id: id },
    { $set: { name: newName } },
    { returnDocument: 'after' }
  );
  if (!result.value) return null;
  vaultEvents.emit('recordUpdated', result.value);
  return result.value;
}

async function deleteRecord(id) {
  const collection = await getCollection();
  const record = await collection.findOne({ id: id });
  if (!record) return null;
  await collection.deleteOne({ id: id });
  await createBackup(); // Automatic backup
  vaultEvents.emit('recordDeleted', record);
  return record;
}

async function searchRecords(searchBy, keyword) {
  const collection = await getCollection();
  let query;
  
  if (searchBy === 'id') {
    query = { id: keyword };
  } else {
    query = { name: { $regex: keyword, $options: 'i' } };
  }
  
  return await collection.find(query).toArray();
}

async function sortRecords(field, order) {
  const collection = await getCollection();
  const sortOrder = (order === 'asc' || order === 'ascending') ? 1 : -1;
  let sortField = field;
  
  if (field === 'date' || field === 'creation date') {
    sortField = 'createdAt';
  }
  
  return await collection.find({}).sort({ [sortField]: sortOrder }).toArray();
}

module.exports = { addRecord, listRecords, updateRecord, deleteRecord, searchRecords, sortRecords };
