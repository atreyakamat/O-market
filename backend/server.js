require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const Tesseract = require('tesseract.js');

const app = express();
const port = process.env.PORT || 3001;

// Multer Setup
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database setup
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Health check and connection test
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', database: 'Connected' });
  } catch (err) {
    res.status(500).json({ status: 'Degraded', database: 'Not Connected', error: err.message });
  }
});

// AI Helper (Ollama)
const callAI = async (messages, model = "qwen3.5:cloud") => {
  try {
    const response = await axios.post(`${process.env.AI_BASE_URL}/chat/completions`, {
      model, messages,
    }, {
      headers: { 'Authorization': `Bearer ${process.env.AI_API_KEY}`, 'Content-Type': 'application/json' }
    });
    return response.data.choices[0].message.content;
  } catch (err) {
    console.error('Ollama API Error:', err.message);
    throw new Error('Ollama Engine failed.');
  }
};

// Grok Helper (xAI)
const callGrok = async (messages, model = "grok-beta") => {
  try {
    const response = await axios.post(`${process.env.GROK_BASE_URL || 'https://api.x.ai/v1'}/chat/completions`, {
      model, messages,
    }, {
      headers: { 
        'Authorization': `Bearer ${process.env.GROK_API_KEY}`, 
        'Content-Type': 'application/json' 
      }
    });
    return response.data.choices[0].message.content;
  } catch (err) {
    console.error('Grok API Error:', err.message);
    throw new Error('Grok Engine failed.');
  }
};

// --- Routes: System Settings ---
app.get('/api/settings', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM system_settings ORDER BY id DESC LIMIT 1');
  res.json(rows[0]);
});

app.post('/api/settings', async (req, res) => {
  const { provider } = req.body;
  const { rows } = await pool.query('INSERT INTO system_settings (provider) VALUES ($1) RETURNING *', [provider]);
  res.json(rows[0]);
});

// --- Routes: OCR & Upload ---
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    const { path: filePath } = req.file;
    // Perform OCR
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    const result = await pool.query(
      'INSERT INTO images (file_path, ocr_text) VALUES ($1, $2) RETURNING *',
      [filePath, text]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Routes: Knowledge Base ---
app.get('/api/knowledge', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM knowledge_base ORDER BY id DESC');
  res.json(rows);
});

app.post('/api/knowledge', async (req, res) => {
  const { title, content } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO knowledge_base (title, content) VALUES ($1, $2) RETURNING *',
    [title, content]
  );
  res.json(rows[0]);
});

// --- Routes: Agent Brain (Persona Switching) ---
app.get('/api/agent', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM agent_identity ORDER BY name ASC');
  res.json(rows);
});

app.post('/api/agent/select', async (req, res) => {
  const { id } = req.body;
  try {
    await pool.query('UPDATE agent_identity SET is_active = FALSE');
    const { rows } = await pool.query('UPDATE agent_identity SET is_active = TRUE WHERE id = $1 RETURNING *', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agent', async (req, res) => {
  const { name, system_prompt } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO agent_identity (name, system_prompt) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET system_prompt = $2 RETURNING *', 
    [name, system_prompt]
  );
  res.json(rows[0]);
});

// --- Routes: Drafting (Using Active Persona & Provider) ---
app.post('/api/generate-draft', async (req, res) => {
  const { imageId } = req.body;
  try {
    const { rows: img } = await pool.query('SELECT * FROM images WHERE id = $1', [imageId]);
    const { rows: kb } = await pool.query('SELECT * FROM knowledge_base');
    const { rows: agent } = await pool.query('SELECT * FROM agent_identity WHERE is_active = TRUE LIMIT 1');
    const { rows: settings } = await pool.query('SELECT provider FROM system_settings ORDER BY id DESC LIMIT 1');

    const brandFacts = kb.map(k => `${k.title}: ${k.content}`).join('\n');
    const ocrText = img[0]?.ocr_text || "No text detected.";
    const systemPrompt = agent[0]?.system_prompt || "You are a professional marketer.";
    const provider = settings[0]?.provider || 'ollama';

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `OCR Text from Image: ${ocrText}\n\nBrand Context:\n${brandFacts}\n\nTask: Create 3 LinkedIn drafts for this image.` }
    ];

    const draft = provider === 'grok' 
      ? await callGrok(messages) 
      : await callAI(messages);

    res.json({ draft, provider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Routes: Scheduling & Posting ---
app.get('/api/history', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT sp.*, i.file_path, i.ocr_text 
      FROM scheduled_posts sp 
      JOIN images i ON sp.image_id = i.id 
      ORDER BY sp.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedule', async (req, res) => {
  const { imageId, content, scheduledAt } = req.body;
  try {
    // 1. Mark image as used
    await pool.query('UPDATE images SET is_used = TRUE WHERE id = $1', [imageId]);
    // 2. Schedule the post
    const { rows } = await pool.query(
      'INSERT INTO scheduled_posts (image_id, content, scheduled_at) VALUES ($1, $2, $3) RETURNING *',
      [imageId, content, scheduledAt]
    );
    res.json({ message: 'Post Scheduled! Image marked as USED.', post: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`X-Marketing Engine running on port ${port}`));
