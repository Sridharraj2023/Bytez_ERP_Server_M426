const axios = require('axios');
const db = require('../config/database');

exports.generateContent = async (req, res) => {
  try {
    const { topic, contentType } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ error: 'OpenAI API key not configured' });
    }

    const prompts = {
      'social_media': `Create 3 engaging social media captions about: ${topic}`,
      'blog_idea': `Generate 5 creative blog post ideas about: ${topic}`,
      'ad_copy': `Write 3 compelling ad copy variations for: ${topic}`
    };

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a creative marketing content writer.' },
          { role: 'user', content: prompts[contentType] || prompts['social_media'] }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      topic,
      contentType,
      content: response.data.choices[0].message.content
    });
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid OpenAI API key' });
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getProjectInsights = async (req, res) => {
  try {
    const [projects] = await db.query(`
      SELECT p.*, c.company_name, COUNT(t.id) as task_count,
      SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN tasks t ON p.id = t.project_id
      GROUP BY p.id
      ORDER BY completed_tasks DESC, p.created_at DESC
    `);

    const insights = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'In Progress').length,
      completedProjects: projects.filter(p => p.status === 'Completed').length,
      bestPerforming: projects.slice(0, 3),
      suggestions: [
        'Focus on projects with approaching deadlines',
        'Allocate more resources to high-priority tasks',
        'Review completed projects for best practices'
      ]
    };

    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
