import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const [knowledge, setKnowledge] = useState([]);
  const [agentProfiles, setAgentProfiles] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const [uploadedImg, setUploadedImg] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState({ provider: 'ollama' });
  
  // KB Form
  const [kbTitle, setKbTitle] = useState('');
  const [kbContent, setKbContent] = useState('');

  useEffect(() => {
    fetchKnowledge();
    fetchAgent();
    fetchHistory();
    fetchSettings();
  }, []);

  const fetchKnowledge = async () => {
    const res = await axios.get(`${API_BASE}/knowledge`);
    setKnowledge(res.data);
  };

  const fetchAgent = async () => {
    const res = await axios.get(`${API_BASE}/agent`);
    setAgentProfiles(res.data);
    const active = res.data.find(a => a.is_active);
    setActiveAgent(active || res.data[0]);
  };

  const fetchSettings = async () => {
    const res = await axios.get(`${API_BASE}/settings`);
    if (res.data) setSettings(res.data);
  };

  const updateProvider = async (provider) => {
    const res = await axios.post(`${API_BASE}/settings`, { provider });
    setSettings(res.data);
  };

  const selectAgent = async (id) => {
    await axios.post(`${API_BASE}/agent/select`, { id });
    fetchAgent();
  };

  const fetchHistory = async () => {
    const res = await axios.get(`${API_BASE}/history`);
    setHistory(res.data);
  };

  const handleFileUpload = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await axios.post(`${API_BASE}/upload`, formData);
      setUploadedImg(res.data);
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const generateDrafts = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/generate-draft`, { imageId: uploadedImg.id });
      setDrafts(res.data.draft);
    } catch (err) {
      alert('Drafting failed. Check your API settings.');
    } finally {
      setLoading(false);
    }
  };

  const schedulePost = async () => {
    await axios.post(`${API_BASE}/schedule`, {
      imageId: uploadedImg.id,
      content: drafts,
      scheduledAt: new Date(Date.now() + 86400000).toISOString()
    });
    alert('Scheduled! Image marked as USED.');
    setUploadedImg(prev => ({ ...prev, is_used: true }));
    fetchHistory();
  };

  const saveKnowledge = async () => {
    await axios.post(`${API_BASE}/knowledge`, { title: kbTitle, content: kbContent });
    setKbTitle(''); setKbContent('');
    fetchKnowledge();
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-title">X-Marketing</div>
        <div className={`nav-item ${activeTab === 'generator' ? 'active' : ''}`} onClick={() => setActiveTab('generator')}>
          <span>✨</span> Generator
        </div>
        <div className={`nav-item ${activeTab === 'knowledge' ? 'active' : ''}`} onClick={() => setActiveTab('knowledge')}>
          <span>📚</span> Knowledge Base
        </div>
        <div className={`nav-item ${activeTab === 'agent' ? 'active' : ''}`} onClick={() => setActiveTab('agent')}>
          <span>🧠</span> Agent Brain
        </div>
        <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <span>🕒</span> History
        </div>
        <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <span>⚙️</span> Settings
        </div>
      </div>

      <div className="main-content">
        {activeTab === 'generator' ? (
          <div className="generator-view">
            <div className="card">
              <h2>Create New Post</h2>
              {!uploadedImg ? (
                <div 
                  className="drop-zone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileUpload(e.dataTransfer.files[0]);
                  }}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <p>{loading ? 'Extracting OCR Text...' : 'Drag & Drop Image or Click to Upload'}</p>
                  <input type="file" id="fileInput" hidden onChange={(e) => handleFileUpload(e.target.files[0])} />
                </div>
              ) : (
                <div className="image-preview">
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <img src={`http://localhost:3001/${uploadedImg.file_path}`} style={{ width: '150px', borderRadius: '8px' }} />
                    <div style={{ flex: 1 }}>
                      <h3>OCR Text Detected:</h3>
                      <p style={{ fontStyle: 'italic', color: 'var(--text-dim)' }}>{uploadedImg.ocr_text || 'No text found.'}</p>
                      <div className={`status-badge ${uploadedImg.is_used ? 'status-used' : 'status-ready'}`}>
                        {uploadedImg.is_used ? 'Label: USED' : 'Label: READY'}
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button onClick={generateDrafts} disabled={loading}>Generate Drafts</button>
                    <button className="secondary" onClick={() => setUploadedImg(null)}>Change Image</button>
                  </div>
                </div>
              )}
            </div>

            {drafts && (
              <div className="card">
                <h2>LinkedIn Drafts</h2>
                <div className="draft-card">{drafts}</div>
                <button onClick={schedulePost} style={{ marginTop: '20px', background: '#00ba7c' }}>Schedule on LinkedIn</button>
              </div>
            )}
          </div>
        ) : activeTab === 'knowledge' ? (
          <div className="knowledge-view">
            <div className="card">
              <h2>Add to Knowledge Base</h2>
              <input placeholder="Title (e.g. Brand Tone)" value={kbTitle} onChange={(e) => setKbTitle(e.target.value)} />
              <textarea placeholder="Content details..." value={kbContent} onChange={(e) => setKbContent(e.target.value)} rows={4} />
              <button onClick={saveKnowledge}>Save Fact</button>
            </div>
            <div className="card">
              <h2>Stored Knowledge</h2>
              {knowledge.map((k) => (
                <div key={k.id} className="kb-item">
                  <h3>{k.title}</h3>
                  <p>{k.content}</p>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'agent' ? (
          <div className="agent-view">
            <div className="card">
              <h2>Select Agent Persona</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
                {agentProfiles.map((a) => (
                  <div 
                    key={a.id} 
                    className="card" 
                    style={{ 
                      cursor: 'pointer', 
                      borderColor: a.is_active ? 'var(--x-blue)' : '#2f3336',
                      background: a.is_active ? 'rgba(29, 155, 240, 0.05)' : 'rgba(255,255,255,0.02)',
                      padding: '15px',
                      marginBottom: 0
                    }}
                    onClick={() => selectAgent(a.id)}
                  >
                    <h3 style={{ margin: '0 0 10px 0', color: a.is_active ? 'var(--x-blue)' : '#fff' }}>{a.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0, height: '40px', overflow: 'hidden' }}>{a.system_prompt.substring(0, 80)}...</p>
                    {a.is_active && <div className="status-badge status-ready" style={{ marginTop: '10px' }}>ACTIVE</div>}
                  </div>
                ))}
              </div>
            </div>
            {activeAgent && (
              <div className="card identity-card">
                <h2>Custom Modelfile: {activeAgent.name}</h2>
                <textarea 
                  value={activeAgent.system_prompt} 
                  onChange={(e) => setActiveAgent({...activeAgent, system_prompt: e.target.value})} 
                  rows={8}
                  style={{ fontFamily: 'monospace', background: '#000' }}
                />
                <button onClick={() => axios.post(`${API_BASE}/agent`, { name: activeAgent.name, system_prompt: activeAgent.system_prompt }).then(() => alert('Updated!'))}>
                  Update Current Brain
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'settings' ? (
          <div className="settings-view">
            <div className="card">
              <h2>System Settings</h2>
              <p style={{ color: 'var(--text-dim)' }}>Select the AI Engine to power your content generation.</p>
              <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
                <div 
                  className="card" 
                  style={{ 
                    flex: 1, cursor: 'pointer',
                    borderColor: settings.provider === 'ollama' ? 'var(--x-blue)' : '#2f3336',
                    background: settings.provider === 'ollama' ? 'rgba(29, 155, 240, 0.05)' : 'transparent'
                  }}
                  onClick={() => updateProvider('ollama')}
                >
                  <h3>Ollama Cloud</h3>
                  <p style={{ fontSize: '0.85rem' }}>Local & Cloud Inference (Qwen 3.5)</p>
                </div>
                <div 
                  className="card" 
                  style={{ 
                    flex: 1, cursor: 'pointer',
                    borderColor: settings.provider === 'grok' ? 'var(--x-blue)' : '#2f3336',
                    background: settings.provider === 'grok' ? 'rgba(29, 155, 240, 0.05)' : 'transparent'
                  }}
                  onClick={() => updateProvider('grok')}
                >
                  <h3>xAI Grok</h3>
                  <p style={{ fontSize: '0.85rem' }}>High-Performance Cloud AI</p>
                </div>
              </div>
              {settings.provider === 'grok' && (
                <div className="status-badge status-ready" style={{ marginTop: '20px' }}>
                  Grok Engine Active: Ensure GROK_API_KEY is set in .env
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="history-view">
            <div className="card">
              <h2>Scheduled Posts History</h2>
              {history.map((h) => (
                <div key={h.id} className="kb-item" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <img src={`http://localhost:3001/${h.file_path}`} style={{ width: '80px', borderRadius: '4px' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--x-blue)' }}>Scheduled For: {new Date(h.scheduled_at).toLocaleDateString()}</p>
                    <div className="draft-card" style={{ padding: '12px', marginTop: '8px', fontSize: '0.9rem' }}>{h.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
