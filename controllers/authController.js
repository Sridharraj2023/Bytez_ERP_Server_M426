const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const logSecurityEvent = (event, email, ip) => {
  console.log(`[SECURITY] ${new Date().toISOString()} - ${event} - Email: ${email} - IP: ${ip}`);
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    const [users] = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (users.length === 0) {
      logSecurityEvent('LOGIN_FAILED_USER_NOT_FOUND', email, clientIP);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logSecurityEvent('LOGIN_FAILED_WRONG_PASSWORD', email, clientIP);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'Active') {
      logSecurityEvent('LOGIN_FAILED_INACTIVE_ACCOUNT', email, clientIP);
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    logSecurityEvent('LOGIN_SUCCESS', email, clientIP);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, department } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role, phone, department) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, email, hashedPassword, role || 'Employee', phone, department]
    );

    logSecurityEvent('USER_REGISTERED', email, clientIP);
    res.status(201).json({ message: 'User created successfully', userId: result[0].id });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, phone, department, status, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
