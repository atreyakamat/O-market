# Tech Stack - OCR Marketing AI Agent

## 1. AI & Machine Learning
- **Model**: `qwen3.5:cloud` (Vision-Language).
- **Inference**: Ollama Cloud / OpenAI-compatible API.
- **Agent Logic**: Modular system prompting (Modelfile style).

## 2. Backend (The Engine)
- **Runtime**: Node.js (Express).
- **Database**: PostgreSQL (Persistence).
- **Client**: `pg` for SQL operations, `axios` for AI communication.
- **Security**: `dotenv` for credential management, `cors` for safe cross-origin requests.

## 3. Frontend (The UI)
- **Framework**: React 18 (Vite).
- **Styling**: Pure CSS (Vanilla) with **Glassmorphism** and Aero-Glass aesthetics.
- **Transitions**: CSS Animations for smooth interactions.

## 4. Deployment & DevOps
- **Backend Port**: 3001.
- **Frontend Port**: 5173.
- **Setup**: `setup.ps1` for automated environment configuration.
