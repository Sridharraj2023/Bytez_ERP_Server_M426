const db = require('../config/database');

exports.getAllClients = async (req, res) => {
  try {
    const [clients] = await db.query('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const [clients] = await db.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
    
    if (clients.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const [projects] = await db.query('SELECT * FROM projects WHERE client_id = $1', [req.params.id]);
    
    res.json({ ...clients[0], projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { company_name, industry, contact_name, phone, email, address } = req.body;

    const [result] = await db.query(
      'INSERT INTO clients (company_name, industry, contact_name, phone, email, address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [company_name, industry, contact_name, phone, email, address]
    );

    res.status(201).json({ message: 'Client created successfully', clientId: result[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { company_name, industry, contact_name, phone, email, address, status } = req.body;

    await db.query(
      'UPDATE clients SET company_name = $1, industry = $2, contact_name = $3, phone = $4, email = $5, address = $6, status = $7 WHERE id = $8',
      [company_name, industry, contact_name, phone, email, address, status, req.params.id]
    );

    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    await db.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
