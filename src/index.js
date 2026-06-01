require('dotenv').config();

const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const pool = require('./db');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const FILE_PATH = process.env.FILE_PATH || './data/data.txt';

async function ensureFileExists() {
  const fileDirectory = path.dirname(FILE_PATH);
  await fs.mkdir(fileDirectory, { recursive: true });

  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.writeFile(FILE_PATH, '', 'utf8');
  }
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'devops-node-api',
  });
});

app.get('/db-data', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      LIMIT 20;
    `);

    res.json({
      message: 'Database connected successfully',
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database query failed',
      details: error.message,
    });
  }
});

app.post('/file-data', async (req, res) => {
  try {
    const { content } = req.body;

    if (typeof content !== 'string') {
      return res.status(400).json({
        error: 'content must be a string',
      });
    }

    await ensureFileExists();
    await fs.writeFile(FILE_PATH, content, 'utf8');

    res.json({
      message: 'File written successfully',
      content,
    });
  } catch (error) {
    res.status(500).json({
      error: 'File write failed',
      details: error.message,
    });
  }
});

app.get('/file-data', async (req, res) => {
  try {
    await ensureFileExists();

    const content = await fs.readFile(FILE_PATH, 'utf8');

    res.json({
      content,
    });
  } catch (error) {
    res.status(500).json({
      error: 'File read failed',
      details: error.message,
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
