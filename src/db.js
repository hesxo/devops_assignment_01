const { Pool } = require('pg');

const useSsl = process.env.DB_SSL === 'true';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: useSsl
    ? {
        rejectUnauthorized: false,
      }
    : false,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
});

module.exports = pool;
