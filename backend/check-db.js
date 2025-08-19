const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

console.log('🔍 Checking database contents...\n');

// Check employees
db.all('SELECT COUNT(*) as count FROM employees', (err, rows) => {
  if (err) console.error('Error:', err);
  else console.log(`📦 Employees/Products: ${rows[0].count}`);
  
  // Show first 3 employees
  db.all('SELECT id, name, category FROM employees LIMIT 3', (err, rows) => {
    if (err) console.error('Error:', err);
    else {
      console.log('   Sample products:');
      rows.forEach(row => {
        console.log(`   - ${row.name} (${row.category || 'no category'})`);
      });
    }
  });
});

// Check scores
db.all('SELECT COUNT(*) as count FROM scores', (err, rows) => {
  if (err) console.error('Error:', err);
  else console.log(`\n📊 Scores: ${rows[0].count}`);
  
  // Show recent scores
  db.all('SELECT employee_id, date, category, score FROM scores ORDER BY date DESC LIMIT 5', (err, rows) => {
    if (err) console.error('Error:', err);
    else {
      console.log('   Recent scores:');
      rows.forEach(row => {
        const dateStr = row.date.toString();
        const formattedDate = `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
        console.log(`   - ${formattedDate}: ${row.category} = ${row.score}`);
      });
    }
  });
});

// Check categories
db.all('SELECT COUNT(*) as count FROM categories', (err, rows) => {
  if (err) console.error('Error:', err);
  else console.log(`\n🏷️ Categories: ${rows[0].count}`);
  
  db.all('SELECT key, label FROM categories', (err, rows) => {
    if (err) console.error('Error:', err);
    else {
      console.log('   Categories:');
      rows.forEach(row => {
        console.log(`   - ${row.key}: ${row.label}`);
      });
    }
  });
});

// Check database size
const fs = require('fs');
const stats = fs.statSync('./database.db');
console.log(`\n💾 Database size: ${(stats.size / 1024).toFixed(2)} KB`);

setTimeout(() => {
  db.close();
  console.log('\n✅ Database check complete!');
}, 1000);