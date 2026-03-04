const db = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, phone, department, status, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, phone, department, status, created_at FROM users WHERE id = ?', [req.params.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, department, status } = req.body;

    await db.query(
      'UPDATE users SET name = ?, email = ?, role = ?, phone = ?, department = ?, status = ? WHERE id = ?',
      [name, email, role, phone, department, status, req.params.id]
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
