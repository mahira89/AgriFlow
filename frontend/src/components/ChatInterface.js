import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatInterface.css';
import { FaPaperPlane, FaUser, FaRobot, FaMicrophone, FaTrash } from 'react-icons/fa';

function ChatInterface({ userId }) {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: '🌾 Namaste! I am AgriFlow, your farming assistant. How can I help you today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      sender: 'user', 
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5002/api/chat/message', {
        message: input,
        userId: userId
      });

      const botMessage = { 
        sender: 'bot', 
        text: response.data.response,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: '❌ Sorry, I am having trouble connecting. Please check if the server is running.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      { 
        sender: 'bot', 
        text: '🌾 Chat cleared! How can I help you with farming today?',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const quickQuestions = [
    "What fertilizer for wheat?",
    "How to control tomato pests?",
    "Best season for rice?",
    "Organic pesticide recipe",
    "Wheat disease symptoms",
    "Market price tips",
    "Irrigation for vegetables"
  ];

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>💬 Ask AgriFlow</h3>
        <button className="clear-btn" onClick={clearChat} title="Clear chat">
          <FaTrash /> Clear
        </button>
      </div>

      <div className="quick-questions">
        {quickQuestions.map((question, index) => (
          <button 
            key={index}
            className="quick-question-btn"
            onClick={() => setInput(question)}
          >
            {question}
          </button>
        ))}
      </div>

      <div className="messages-area">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === 'user' ? <FaUser /> : <FaRobot />}
            </div>
            <div className="message-content">
              <div className="message-text">{msg.text}</div>
              <div className="message-time">{msg.timestamp}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message bot">
            <div className="message-avatar"><FaRobot /></div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <button className="mic-btn"><FaMicrophone /></button>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your farming question here..."
          rows="1"
        />
        <button 
          className="send-btn" 
          onClick={handleSend}
          disabled={!input.trim() || loading}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}

export default ChatInterface;
