// src/components/Chatbot.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faRobot, faTimes } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      setTimeout(() => {
        handleAIMessage("Hello! I'm your AI Travel Assistant. How can I help you plan your next adventure today? Ask me about destinations, hotels, or packing tips!");
      }, 500);
    }
  };

  const handleAIMessage = (text) => {
    setMessages(prevMessages => [
      ...prevMessages,
      { type: 'ai', text, timestamp: new Date() }
    ]);
  };

  const handleUserMessage = (text) => {
    setMessages(prevMessages => [
      ...prevMessages,
      { type: 'user', text, timestamp: new Date() }
    ]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || loading) return;
    
    const userText = input.trim();
    handleUserMessage(userText);
    setInput('');
    setLoading(true);

    try {
      // Send message list including the new user message
      const history = [...messages, { type: 'user', text: userText }];
      const response = await axios.post('/api/chat', { messages: history });
      
      handleAIMessage(response.data.text);
    } catch (error) {
      console.error('Chatbot API call failed:', error);
      handleAIMessage("I'm sorry, I'm having trouble connecting to my central travel mainframe right now. Please try again in a moment! 🌐");
    } finally {
      setLoading(false);
    }
  };
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  return (
    <>
      {/* Floating Chatbot Button */}
      <motion.button
        onClick={toggleChatbot}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl flex items-center justify-center hover:shadow-2xl transition-all"
      >
        <FontAwesomeIcon icon={faRobot} size="2x" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 50, y: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 50, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-sm h-[60vh] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col border border-gray-100 dark:border-gray-800/30"
          >
            <header className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-2xl flex justify-between items-center shadow-sm">
              <h3 className="text-xl font-bold flex items-center">
                <FontAwesomeIcon icon={faRobot} className="mr-2 animate-bounce" />
                Travel Advisor AI
              </h3>
              <button onClick={toggleChatbot} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </header>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[80%] shadow-sm ${
                    msg.type === 'user'
                      ? 'bg-blue-500 text-white rounded-tr-none'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200/50 dark:border-gray-700/50'
                  }`}>
                    <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                    <span className="block text-right text-[9px] mt-1 text-gray-400 dark:text-gray-500 font-semibold">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="p-3.5 bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none border border-gray-250 dark:border-gray-700/50 flex space-x-1 items-center">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your trip..."
                className="flex-grow p-3 text-sm rounded-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="ml-2 w-11 h-11 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md transition-colors"
              >
                <FontAwesomeIcon icon={faPaperPlane} size="sm" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;