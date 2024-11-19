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
// enabling static file serving in Express app
app.use(express.static('public'));
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
// Endpoint to add a new item to the "Beans" category
app.post('/add-item', express.json(), async (req, res) => {
  try {
    const db = await dbPromise;
    const { english_item } = req.body;

    if (!english_item) {
      res.status(400).json({ error: 'english_item is required' });
      return;
    }

    // Insert a new item with "Beans" category and default translations
    await db.run(
      `INSERT INTO food_items 
       (english_category, spanish_category, vietnamese_category, chinese_category, russian_category, korean_category, ukrainian_category, arabic_category, english_item) 
       VALUES 
       (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Beans",
        "Frijoles (Beans)",
        "Đậu (Beans)",
        "豆类 (Beans)",
        "Бобы (Beans)",
        "콩 (Beans)",
        "Квасоля (Beans)",
        "فاصوليا (Beans)",
        english_item
      ]
    );

    res.json({ success: true, message: 'Item added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
