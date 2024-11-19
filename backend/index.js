import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const port = 3000;

// Open SQLite database
const dbPromise = open({
  filename: './database.db',
  driver: sqlite3.Database,
});

// API to fetch data from a table
app.get('/data', async (req, res) => {
  try {
    const db = await dbPromise;
    const rows = await db.all('SELECT * FROM food_items');
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
