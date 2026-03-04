const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    await pool.query(`
      INSERT INTO users (name, email, password, role) VALUES 
      ('Admin User', 'admin@bytez.com', $1, 'Admin')
      ON CONFLICT (email) DO UPDATE SET password = $1
    `, [hashedPassword]);
    
    console.log('✅ Admin user created/updated with password: password123');
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

seedAdmin();