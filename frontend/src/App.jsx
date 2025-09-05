// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InputPage from './pages/InputPage';
import OutputPage from './pages/OutputPage';
import LandingPage from './pages/Landing'; // Corrected import path to match Landing.jsx
import FeedbackPage from './pages/FeedbackPage';
import FavoritesPage from './pages/FavoritesPage';
import ScrollNav from './components/ScrollNav';
import Chatbot from './components/Chatbot';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// Imported the new placeholder pages
import ExplorePage from './pages/ExplorePage';
import MyTripsPage from './pages/MyTripsPage';

function App() {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [runTour, setRunTour] = useState(false);

  // Effect to apply theme class to documentElement and save to localStorage
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark'); // Remove existing classes
    document.documentElement.classList.add(theme); // Add current theme class
    localStorage.setItem('theme', theme); // Save current theme to localStorage
  }, [theme]); // Re-run when theme changes

  // Toggle theme function - REMOVED direct DOM manipulation
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const tourCompleted = localStorage.getItem('tourCompleted');
    if (!tourCompleted) {
      setRunTour(true);
    }
  }, []);

  const handleTourCallback = (data) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') {
      setRunTour(false);
      localStorage.setItem('tourCompleted', 'true');
    }
  };

  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        {/* Apply theme class to the main div for global styling */}
        <div className={`relative min-h-screen font-sans ${theme}`}>
          {/* Background pattern and transition */}
          <div className="absolute inset-0 z-0 bg-white dark:bg-gray-900 transition-colors duration-500 pattern-flight-paths" />
          <div className="relative z-10">
            <Toaster />
            {/* Pass toggleTheme and theme to ScrollNav */}
            <ScrollNav toggleTheme={toggleTheme} theme={theme} />
            <Routes>
              {/* Pass theme and toggleTheme to all page components */}
              <Route path="/" element={<LandingPage theme={theme} toggleTheme={toggleTheme} runTour={runTour} handleTourCallback={handleTourCallback} />} />
              <Route path="/input" element={<InputPage theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/output" element={<OutputPage theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/feedback" element={<FeedbackPage theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/favorites" element={<FavoritesPage theme={theme} toggleTheme={toggleTheme} />} />

              {/* This route now correctly renders the InputPage.jsx component */}
              <Route path="/plan" element={<InputPage theme={theme} toggleTheme={toggleTheme} />} />

              {/* Your other routes */}
              <Route path="/explore" element={<ExplorePage theme={theme} toggleTheme={toggleTheme} />} />
              <Route path="/my-trips" element={<MyTripsPage theme={theme} toggleTheme={toggleTheme} />} />
            </Routes>
            <Chatbot />
          </div>
        </div>
      </Router>
    </I18nextProvider>
  );
}

export default App;
