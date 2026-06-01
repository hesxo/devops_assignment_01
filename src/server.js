require('dotenv').config();

const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { Pool } = require('pg');

const app = express();

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'file-data.txt');

app.use(express.json());

const requiredEnvVars = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
];

for (const envName of requiredEnvVars) {
  if (!process.env[envName]) {
    console.warn(`Missing environment variable: ${envName}`);
  }
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 10000,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(FILE_PATH);
  } catch {
    await fs.writeFile(FILE_PATH, '', 'utf8');
  }
}

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'devops-assignment-api',
  });
});

app.get('/db-data', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Database error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve data from database',
      error: error.message,
    });
  }
});

app.post('/file-data', async (req, res) => {
  try {
    const { data } = req.body;

    if (data === undefined || data === null) {
      return res.status(400).json({
        success: false,
        message: 'Request body must include "data"',
      });
    }

    await ensureDataFile();

    const valueToWrite =
      typeof data === 'string' ? data : JSON.stringify(data, null, 2);

    await fs.writeFile(FILE_PATH, valueToWrite, 'utf8');

    return res.json({
      success: true,
      message: 'Data written to file successfully',
      filePath: FILE_PATH,
    });
  } catch (error) {
    console.error('File write error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to write data to file',
      error: error.message,
    });
  }
});

app.get('/file-data', async (req, res) => {
  try {
    await ensureDataFile();

    const fileContent = await fs.readFile(FILE_PATH, 'utf8');

    res.json({
      success: true,
      data: fileContent,
      filePath: FILE_PATH,
    });
  } catch (error) {
    console.error('File read error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to read data from file',
      error: error.message,
    });
  }
});

app.listen(PORT, async () => {
  await ensureDataFile();

  console.log(`API server running on port ${PORT}`);
  console.log(`Data file path: ${FILE_PATH}`);
});