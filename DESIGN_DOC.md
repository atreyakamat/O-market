# Design Document - OCR Marketing AI Agent

## 1. System Architecture
The system follows a three-tier architecture: **User (React UI)** -> **Orchestrator (Express API)** -> **AI Engine (Qwen3-VL)**.

## 2. Core Logic: The "SAM" (Smart Agent Manager) Pattern
The **SAM** logic is implemented through:
1. **Agent Brain (Modelfile)**: Stored in the `agent_identity` table and mirrored in the `Cloud.Modelfile` template. This defines the agent's behavior, parameters, and system instructions.
2. **Long-Term Memory (Knowledge Base)**: Stored in the `knowledge_base` table, providing persistent brand facts.
3. **Current Task Context (Vision Input)**: Short-term context provided through image analysis.

## 3. Image Analysis Flow
When a user uploads an image:
- The backend fetches the latest **Agent Modelfile** and **Brand Facts**.
- The model receives a multi-modal prompt (Text + Image URL).
- The model synthesizes the visual data with the brand's tone.

## 4. UI/UX Principles
- **Aesthetic**: Glassmorphism (Aero-Glass look).
- **Navigation**: Persistent sidebar for easy access between the **Generator** and **Brain Editor**.
- **Interactive Feedback**: Loading states during AI analysis to keep the user engaged.
