const axios = require('axios');
const db = require('../config/database');

exports.generateContent = async (req, res) => {
  try {
    const { topic, contentType } = req.body;

    const prompts = {
      'social_media': `Create 3 engaging social media captions about: ${topic}`,
      'blog_idea': `Generate 5 creative blog post ideas about: ${topic}`,
      'ad_copy': `Write 3 compelling ad copy variations for: ${topic}`
    };

    // Use Google Gemini API (FREE - Recommended)
    if (process.env.GEMINI_API_KEY) {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompts[contentType] || prompts['social_media']
            }]
          }]
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return res.json({
        topic,
        contentType,
        content: response.data.candidates[0].content.parts[0].text
      });
    }

    // Use Hugging Face API (Free Alternative)
    if (process.env.HUGGINGFACE_API_KEY) {
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
        {
          inputs: prompts[contentType] || prompts['social_media'],
          parameters: { max_new_tokens: 250, temperature: 0.7 }
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return res.json({
        topic,
        contentType,
        content: response.data[0].generated_text
      });
    }

    // Fallback to OpenAI if configured
    if (process.env.OPENAI_API_KEY) {
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

      return res.json({
        topic,
        contentType,
        content: response.data.choices[0].message.content
      });
    }

    // Mock fallback if no API configured
    const mockContent = {
      'social_media': `🚀 Exciting news about ${topic}! \n💡 Discover how ${topic} can transform your business\n✨ Join thousands who trust ${topic}`,
      'blog_idea': `1. The Ultimate Guide to ${topic}\n2. 10 Ways ${topic} Can Boost Your Business\n3. ${topic}: Trends to Watch in 2024\n4. Common Mistakes with ${topic}\n5. Success Stories: ${topic} in Action`,
      'ad_copy': `Transform your business with ${topic}! Limited time offer - Get started today. Click now!`
    };
    
    return res.json({
      topic,
      contentType,
      content: mockContent[contentType] || mockContent['social_media'],
      note: 'Demo content - Add GEMINI_API_KEY to .env for AI generation'
    });

  } catch (error) {
    console.error('AI Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    if (error.response?.status === 429) {
      const mockContent = {
        'social_media': `🚀 Exciting news about ${req.body.topic}! \n💡 Discover how ${req.body.topic} can transform your business\n✨ Join thousands who trust ${req.body.topic}`,
        'blog_idea': `1. The Ultimate Guide to ${req.body.topic}\n2. 10 Ways ${req.body.topic} Can Boost Your Business\n3. ${req.body.topic}: Trends to Watch in 2024\n4. Common Mistakes with ${req.body.topic}\n5. Success Stories: ${req.body.topic} in Action`,
        'ad_copy': `Transform your business with ${req.body.topic}! Limited time offer - Get started today. Click now!`
      };
      return res.json({
        topic: req.body.topic,
        contentType: req.body.contentType,
        content: mockContent[req.body.contentType] || mockContent['social_media'],
        note: 'Demo content - API quota exceeded'
      });
    }
    
    // Fallback to mock on any error
    const mockContent = {
      'social_media': `🚀 Exciting news about ${req.body.topic}! \n💡 Discover how ${req.body.topic} can transform your business\n✨ Join thousands who trust ${req.body.topic}`,
      'blog_idea': `1. The Ultimate Guide to ${req.body.topic}\n2. 10 Ways ${req.body.topic} Can Boost Your Business\n3. ${req.body.topic}: Trends to Watch in 2024\n4. Common Mistakes with ${req.body.topic}\n5. Success Stories: ${req.body.topic} in Action`,
      'ad_copy': `Transform your business with ${req.body.topic}! Limited time offer - Get started today. Click now!`
    };
    return res.json({
      topic: req.body.topic,
      contentType: req.body.contentType,
      content: mockContent[req.body.contentType] || mockContent['social_media'],
      note: 'Demo content - Using fallback mode'
    });
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
      GROUP BY p.id, c.company_name
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
