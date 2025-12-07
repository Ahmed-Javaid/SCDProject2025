const readline = require('readline');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const { close } = require('./db/mongodb');
require('./events/logger'); // Initialize event logger

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

// Export data to text file
async function exportData() {
  const records = await db.listRecords();
  const now = new Date();
  const timestamp = now.toLocaleString();
  
  let content = '='.repeat(60) + '\n';
  content += '           VAULT DATA EXPORT\n';
  content += '='.repeat(60) + '\n\n';
  content += `Export Date: ${timestamp}\n`;
  content += `Total Records: ${records.length}\n`;
  content += `File: export.txt\n\n`;
  content += '='.repeat(60) + '\n\n';
  
  records.forEach((record, index) => {
    content += `Record ${index + 1}:\n`;
    content += `  ID: ${record.id}\n`;
    content += `  Name: ${record.name}\n`;
    content += `  Created: ${record.createdAt || 'N/A'}\n`;
    content += '-'.repeat(40) + '\n\n';
  });
  
  fs.writeFileSync('export.txt', content, 'utf8');
  console.log('✅ Data exported successfully to export.txt');
  await menu();
}

// View vault statistics
async function viewStatistics() {
  const records = await db.listRecords();
  
  if (records.length === 0) {
    console.log('No records in vault.');
    await menu();
    return;
  }
  
  // Longest name
  let longestName = records[0].name;
  records.forEach(record => {
    if (record.name.length > longestName.length) {
      longestName = record.name;
    }
  });
  
  // Earliest and latest record dates
  let earliestDate = records[0].createdAt;
  let latestDate = records[0].createdAt;
  records.forEach(record => {
    if (record.createdAt && record.createdAt < earliestDate) earliestDate = record.createdAt;
    if (record.createdAt && record.createdAt > latestDate) latestDate = record.createdAt;
  });
  
  // Get current timestamp as last modified
  const lastModified = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/(\d+)\/(\d+)\/(\d+),/, '$3-$1-$2');
  
  console.log('\nVault Statistics:');
  console.log('-'.repeat(50));
  console.log(`Total Records: ${records.length}`);
  console.log(`Last Modified: ${lastModified}`);
  console.log(`Longest Name: ${longestName} (${longestName.length} characters)`);
  console.log(`Earliest Record: ${earliestDate || 'N/A'}`);
  console.log(`Latest Record: ${latestDate || 'N/A'}`);
  console.log('-'.repeat(50));
  await menu();
}

async function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
=====================
  `);

  const ans = await question('Choose option: ');
  
  try {
    switch (ans.trim()) {
      case '1':
        const name = await question('Enter name: ');
        await db.addRecord({ name });
        console.log('✅ Record added successfully!');
        await menu();
        break;

      case '2':
        const records = await db.listRecords();
        if (records.length === 0) console.log('No records found.');
        else records.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Created: ${r.createdAt || 'N/A'}`));
        await menu();
        break;

      case '3':
        const updateId = await question('Enter record ID to update: ');
        const newName = await question('New name: ');
        const updated = await db.updateRecord(updateId, newName);
        console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
        await menu();
        break;

      case '4':
        const deleteId = await question('Enter record ID to delete: ');
        const deleted = await db.deleteRecord(deleteId);
        console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
        await menu();
        break;

      case '5':
        const searchBy = await question('Search by (id/name): ');
        const keyword = await question('Enter search keyword: ');
        const results = await db.searchRecords(searchBy.toLowerCase().trim(), keyword);
        if (results.length === 0) {
          console.log('No records found.');
        } else {
          console.log(`\nFound ${results.length} matching record(s):\n`);
          results.forEach((record, index) => {
            console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name} | Created: ${record.createdAt || 'N/A'}`);
          });
        }
        await menu();
        break;

      case '6':
        const field = await question('Choose field to sort by (name/id/date): ');
        const order = await question('Choose order (Ascending/Descending): ');
        const sorted = await db.sortRecords(field.toLowerCase(), order.toLowerCase());
        console.log(`\nSorted Records:\n`);
        sorted.forEach((record, index) => {
          console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name} | Created: ${record.createdAt || 'N/A'}`);
        });
        await menu();
        break;

      case '7':
        await exportData();
        break;

      case '8':
        await viewStatistics();
        break;

      case '9':
        console.log('👋 Exiting NodeVault...');
        await close();
        rl.close();
        process.exit(0);
        break;

      default:
        console.log('Invalid option.');
        await menu();
    }
  } catch (error) {
    console.error('Error:', error.message);
    await menu();
  }
}

// Start the application
(async () => {
  try {
    await menu();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();
