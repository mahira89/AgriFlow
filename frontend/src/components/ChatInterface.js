import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import './ChatInterface.css';
import { FaPaperPlane, FaUser, FaRobot, FaTrash, FaLeaf } from 'react-icons/fa';

function ChatInterface({ userId }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "**Namaste!** I'm AgriFlow, your AI farming assistant.\n\nI can help you with:\n- Crop-specific advice (fertilizers, pests, diseases)\n- Organic farming techniques\n- Weather-based recommendations\n- Irrigation scheduling\n- Government schemes\n\nAsk me anything about farming!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamRef = useRef({ fullText: '', interval: null });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, streamingText]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Cleanup streaming interval on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current.interval) clearInterval(streamRef.current.interval);
    };
  }, []);

  const startStreaming = (fullText) => {
    streamRef.current.fullText = fullText;
    let i = 0;
    setIsStreaming(true);
    setStreamingText('');

    const interval = setInterval(() => {
      i += 2; // 2 chars at a time for speed
      if (i >= fullText.length) {
        setStreamingText(fullText);
        clearInterval(interval);
        setIsStreaming(false);
        // Add final message
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: fullText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setStreamingText('');
      } else {
        setStreamingText(fullText.slice(0, i));
      }
    }, 10);

    streamRef.current.interval = interval;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat/message`, {
        message: currentInput,
        userId: userId
      });
      setLoading(false);
      startStreaming(response.data.response);
    } catch (error) {
      setLoading(false);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Sorry, I\'m having trouble connecting. Please check if the server is running.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (streamRef.current.interval) clearInterval(streamRef.current.interval);
    setIsStreaming(false);
    setStreamingText('');
    setMessages([{
      sender: 'bot',
      text: 'Chat cleared! How can I help you with farming today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const quickQuestions = [
    'What fertilizer for wheat?',
    'How to control tomato pests?',
    'Organic pesticide recipe',
    'Wheat irrigation schedule',
    'Government schemes for farmers',
    'Best season for rice?',
    'Drip irrigation benefits',
  ];

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar-header"><FaLeaf /></div>
            <div>
              <h3>AgriFlow Assistant</h3>
              <span className="chat-status">
                <span className="status-dot"></span> AI Powered
              </span>
            </div>
          </div>
          <button className="clear-btn" onClick={clearChat}><FaTrash /> Clear</button>
        </div>

        {/* Quick Questions */}
        <div className="quick-questions">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              className="quick-q-btn"
              onClick={() => { setInput(q); inputRef.current?.focus(); }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="messages-area">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                className={`message ${msg.sender}`}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <div className="msg-avatar">
                  {msg.sender === 'user' ? <FaUser /> : <FaRobot />}
                </div>
                <div className="msg-content">
                  <div className="msg-text">
                    {msg.sender === 'bot' ? (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                  <span className="msg-time">{msg.timestamp}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Streaming message */}
          {isStreaming && (
            <motion.div
              className="message bot"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="msg-avatar"><FaRobot /></div>
              <div className="msg-content">
                <div className="msg-text streaming">
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                  <span className="cursor-blink">|</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading indicator */}
          {loading && !isStreaming && (
            <motion.div
              className="message bot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="msg-avatar"><FaRobot /></div>
              <div className="msg-content">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask me about farming, crops, pests, weather..."
            rows="1"
            disabled={loading || isStreaming}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!input.trim() || loading || isStreaming}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
