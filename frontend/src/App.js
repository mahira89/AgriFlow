import React, { useState } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import CropInfo from './components/CropInfo';
import { FaLeaf, FaComment, FaSeedling } from 'react-icons/fa';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));

  return (
    <div className="App">
      <header className="app-header">
        <h1>
          <FaLeaf className="icon" /> AgriFlow - Your Farming Assistant
        </h1>
        <p>Ask me anything about farming, crops, and agriculture</p>
      </header>
      
      <div className="tab-container">
        <button 
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <FaComment /> Chat Assistant
        </button>
        <button 
          className={`tab ${activeTab === 'crops' ? 'active' : ''}`}
          onClick={() => setActiveTab('crops')}
        >
          <FaSeedling /> Crop Guide
        </button>
      </div>
      
      <div className="content-area">
        {activeTab === 'chat' && <ChatInterface userId={userId} />}
        {activeTab === 'crops' && <CropInfo />}
      </div>
      
      <footer>
        <p>🌱 Helping farmers with AI-powered assistance</p>
      </footer>
    </div>
  );
}

export default App;
