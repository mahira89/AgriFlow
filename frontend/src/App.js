import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaLeaf, FaHome, FaCommentDots, FaSeedling, FaCloudSun, FaBars, FaTimes } from 'react-icons/fa';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import CropInfo from './components/CropInfo';
import Weather from './components/Weather';
import './App.css';

const navItems = [
  { path: '/', icon: FaHome, label: 'Dashboard' },
  { path: '/chat', icon: FaCommentDots, label: 'Chat Assistant' },
  { path: '/crops', icon: FaSeedling, label: 'Crop Guide' },
  { path: '/weather', icon: FaCloudSun, label: 'Weather' },
];

function AnimatedRoutes({ userId }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrap><Dashboard /></PageWrap>} />
        <Route path="/chat" element={<PageWrap><ChatInterface userId={userId} /></PageWrap>} />
        <Route path="/crops" element={<PageWrap><CropInfo /></PageWrap>} />
        <Route path="/weather" element={<PageWrap><Weather /></PageWrap>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrap({ children }) {
  return (
    <motion.div
      className="page-wrapper"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));

  return (
    <BrowserRouter>
      <div className="app-layout">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </button>
          <h1><FaLeaf /> AgriFlow</h1>
        </div>

        {/* Sidebar Overlay (mobile) */}
        <div
          className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h1>
              <FaLeaf className="logo-icon" /> AgriFlow
            </h1>
            <p>AI Farming Assistant</p>
            {sidebarOpen && (
              <button
                className="hamburger-btn"
                style={{ position: 'absolute', top: 16, right: 12 }}
                onClick={() => setSidebarOpen(false)}
              >
                <FaTimes />
              </button>
            )}
          </div>

          <nav className="sidebar-nav">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="nav-icon" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            Powered by Gemini AI + RAG
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <AnimatedRoutes userId={userId} />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
