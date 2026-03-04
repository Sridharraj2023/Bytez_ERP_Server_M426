const db = require('../config/database');

exports.getAllProjects = async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT p.*, c.company_name, u.name as created_by_name 
      FROM projects p 
      LEFT JOIN clients c ON p.client_id = c.id 
      LEFT JOIN users u ON p.created_by = u.id 
      ORDER BY p.created_at DESC
    `);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT p.*, c.company_name 
      FROM projects p 
      LEFT JOIN clients c ON p.client_id = c.id 
      WHERE p.id = $1
    `, [req.params.id]);
    
    if (projects.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const [members] = await db.query(`
      SELECT pm.*, u.name, u.email 
      FROM project_members pm 
      JOIN users u ON pm.user_id = u.id 
      WHERE pm.project_id = $1
    `, [req.params.id]);

    const [tasks] = await db.query('SELECT * FROM tasks WHERE project_id = $1', [req.params.id]);

    res.json({ ...projects[0], members, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { client_id, project_name, description, start_date, end_date, budget, status } = req.body;

    const [result] = await db.query(
      'INSERT INTO projects (client_id, project_name, description, start_date, end_date, budget, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [client_id, project_name, description, start_date, end_date, budget, status || 'Pending', req.user.id]
    );

    await db.query('UPDATE clients SET project_count = project_count + 1 WHERE id = $1', [client_id]);

    res.status(201).json({ message: 'Project created successfully', projectId: result[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { project_name, description, start_date, end_date, budget, status } = req.body;

    await db.query(
      'UPDATE projects SET project_name = $1, description = $2, start_date = $3, end_date = $4, budget = $5, status = $6 WHERE id = $7',
      [project_name, description, start_date, end_date, budget, status, req.params.id]
    );

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const [projects] = await db.query('SELECT client_id FROM projects WHERE id = $1', [req.params.id]);
    
    if (projects.length > 0) {
      await db.query('UPDATE clients SET project_count = project_count - 1 WHERE id = $1', [projects[0].client_id]);
    }

    await db.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignMember = async (req, res) => {
  try {
    const { user_id, role } = req.body;

    await db.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [req.params.id, user_id, role]
    );

    res.status(201).json({ message: 'Member assigned successfully' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Member already assigned to this project' });
    }
    res.status(500).json({ error: error.message });
  }
};
