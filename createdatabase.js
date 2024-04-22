const sqlite3 = require('sqlite3').verbose();

// Connect to the database
const db = new sqlite3.Database('database.db');

// Create users table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        email TEXT,
        password TEXT
    )`);
});

// Close the database connection
db.close();
