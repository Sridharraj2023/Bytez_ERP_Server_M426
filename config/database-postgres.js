const { Pool } = require('pg');
require('dotenv').config();

// Support both individual params and DATABASE_URL
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
        ssl: {
          rejectUnauthorized: false
        }
      }
);

// Wrapper to match MySQL2 promise API
const query = async (text, params) => {
  const result = await pool.query(text, params);
  return [result.rows, result.fields];
};

module.exports = { query, pool };
