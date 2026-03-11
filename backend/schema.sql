-- Brand Knowledge Base (Title/Content)
CREATE TABLE IF NOT EXISTS knowledge_base (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Agent Modelfile (Persona)
CREATE TABLE IF NOT EXISTS agent_identity (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    system_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Profiles
INSERT INTO agent_identity (name, system_prompt, is_active) VALUES 
('LinkedIn Expert', 'You are a LinkedIn Thought Leader. Focus on professional storytelling, networking, and industry insights. Use line breaks for readability and include 3-5 relevant hashtags.', TRUE),
('Indeed Recruiter', 'You are a professional Recruitment Specialist. Focus on company culture, role impact, and clear calls to action for job seekers. Keep it professional and inviting.', FALSE),
('X.com Growth Hacker', 'You are an X.com (Twitter) viral growth expert. Focus on high-impact hooks, concise points, and engagement-driven content. Use emojis and keep it under 280 characters per post.', FALSE)
ON CONFLICT (name) DO NOTHING;

-- Image Tracking (Used/OCR/Path)
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    file_path TEXT NOT NULL,
    ocr_text TEXT,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LinkedIn Scheduler
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id SERIAL PRIMARY KEY,
    image_id INTEGER REFERENCES images(id),
    content TEXT NOT NULL,
    scheduled_at TIMESTAMP,
    is_posted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
