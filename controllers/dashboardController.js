const db = require('../config/database');

exports.getDashboardStats = async (req, res) => {
  try {
    const [clientCount] = await db.query('SELECT COUNT(*) as total FROM clients WHERE status = $1', ['Active']);
    const [projectStats] = await db.query('SELECT status, COUNT(*) as count FROM projects GROUP BY status');
    const [taskStats] = await db.query('SELECT status, COUNT(*) as count FROM tasks GROUP BY status');
    const [employeeCount] = await db.query('SELECT COUNT(*) as total FROM users WHERE status = $1', ['Active']);

    const stats = {
      totalClients: parseInt(clientCount[0].total),
      totalEmployees: parseInt(employeeCount[0].total),
      projects: projectStats.reduce((acc, curr) => {
        acc[curr.status.toLowerCase().replace(' ', '_')] = parseInt(curr.count);
        return acc;
      }, {}),
      tasks: taskStats.reduce((acc, curr) => {
        acc[curr.status.toLowerCase().replace(' ', '_')] = parseInt(curr.count);
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
