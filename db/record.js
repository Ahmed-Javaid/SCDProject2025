function validateRecord(record) {
  if (!record.name) throw new Error('Record must have a name.');
  return true;
}

function generateId() {
  // Generate a shorter random ID (100000-999999)
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { validateRecord, generateId };
