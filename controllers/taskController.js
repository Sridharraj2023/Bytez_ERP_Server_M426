const db = require('../config/database');

exports.getAllTasks = async (req, res) => {
  try {
    const [tasks] = await db.query(`
      SELECT t.*, p.project_name, u.name as assigned_to_name 
      FROM tasks t 
      LEFT JOIN projects p ON t.project_id = p.id 
      LEFT JOIN users u ON t.assigned_to = u.id 
      ORDER BY t.created_at DESC
    `);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const [tasks] = await db.query(`
      SELECT t.*, p.project_name, u.name as assigned_to_name 
      FROM tasks t 
      LEFT JOIN projects p ON t.project_id = p.id 
      LEFT JOIN users u ON t.assigned_to = u.id 
      WHERE t.id = $1
    `, [req.params.id]);
    
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [comments] = await db.query(`
      SELECT c.*, u.name as user_name 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.task_id = $1 
      ORDER BY c.created_at DESC
    `, [req.params.id]);

    const [attachments] = await db.query('SELECT * FROM attachments WHERE task_id = $1', [req.params.id]);

    res.json({ ...tasks[0], comments, attachments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { project_id, title, description, assigned_to, status, priority, due_date } = req.body;

    const [result] = await db.query(
      'INSERT INTO tasks (project_id, title, description, assigned_to, status, priority, due_date, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [project_id, title, description, assigned_to, status || 'To Do', priority || 'Medium', due_date, req.user.id]
    );

    res.status(201).json({ message: 'Task created successfully', taskId: result[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, assigned_to, status, priority, due_date } = req.body;

    await db.query(
      'UPDATE tasks SET title = $1, description = $2, assigned_to = $3, status = $4, priority = $5, due_date = $6 WHERE id = $7',
      [title, description, assigned_to, status, priority, due_date, req.params.id]
    );

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    await db.query(
      'INSERT INTO comments (task_id, user_id, comment) VALUES ($1, $2, $3)',
      [req.params.id, req.user.id, comment]
    );

    res.status(201).json({ message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
