# O-market: AI-Powered LinkedIn Marketing Agent 🚀

**O-market** is a high-performance, visually stunning marketing automation tool. It leverages the **qwen3.5:cloud** vision-language model via **Ollama** to transform images into viral LinkedIn, Indeed, and X.com content.

![X.com Style Glassmorphism](https://img.shields.io/badge/UI-X.com%20Glassmorphism-1d9bf0?style=for-the-badge)
![AI Model](https://img.shields.io/badge/AI-qwen3.5%3Acloud-blueviolet?style=for-the-badge)

---

## ✨ Key Features

- **X.com-Style UI**: A premium "Black & Blue" Glassmorphism interface with animated mesh backgrounds.
- **Vision-to-Post Workflow**: Drag & Drop images to extract context and generate 3 unique content drafts.
- **Integrated OCR**: Automatically extracts text from images using **Tesseract.js** to ground AI generation.
- **Multi-Persona Agent Brain**: Switch between specialized AI profiles:
  - **LinkedIn Expert**: Professional storytelling.
  - **Indeed Recruiter**: Culture & impact-focused.
  - **X.com Growth Hacker**: Concise & viral.
  - **O-market Cloud 3.5 Agent**: The elite, reasoning-optimized persona.
- **Structured Knowledge Base**: Store brand facts with a Title/Content format for persistent AI memory.
- **LinkedIn Scheduler**: Track your content lifecycle. Scheduled images are labeled as **USED** to prevent duplication.
- **Content History**: A visual log of all past scheduled posts and their associated assets.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (Vite), Vanilla CSS (Aero-Glassmorphism).
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL (Local Service).
- **AI/ML**: Ollama Cloud (`qwen3.5:cloud`).
- **OCR**: Tesseract.js.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (Running locally)
- [Ollama](https://ollama.com/) (Installed and pulling `qwen3.5:cloud`)

### 1. Database Setup
Create a database named `ocr_marketing` and run the schema:
```bash
psql -U postgres -d ocr_marketing -f backend/schema.sql
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
AI_API_KEY=your_api_key_here
AI_BASE_URL=https://api.ollama.com/v1
DATABASE_URL=postgres://user:pass@localhost:5432/ocr_marketing
```

### 3. Automated Setup
Run the included PowerShell script to install dependencies and verify your environment:
```powershell
.\setup.ps1
```

### 4. Launch the Application
**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🧠 Using the Agent Brain
Navigate to the **Agent Brain** tab to select your persona. You can customize the **Modelfile** (System Prompt) for each profile to refine how the AI interprets your brand voice.

## 🕒 Scheduling Workflow
1. Upload an image in the **Generator**.
2. AI extracts OCR text and analyzes the visual context.
3. Click **Schedule on LinkedIn**.
4. The image is marked as **USED** (Red Label) and saved to your **History**.

---

## 📄 Documentation
For deep technical details, refer to:
- [PRD.md](./PRD.md)
- [TECH_STACK.md](./TECH_STACK.md)
- [DESIGN_DOC.md](./DESIGN_DOC.md)
