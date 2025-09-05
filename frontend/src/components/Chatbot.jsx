// src/components/Chatbot.jsx (NEW FILE)

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faRobot, faTimes } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      setTimeout(() => {
        handleAIMessage("Hello! I'm your AI Travel Assistant. How can I help you today? Try typing 'help'.");
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    const userMessage = input.trim().toLowerCase();
    handleUserMessage(input);
    setInput('');

    // Simulate AI response with a delay
    setTimeout(() => {
      let aiResponse = "I'm sorry, I don't understand that. Try typing 'help' to see what I can do.";
      
      if (userMessage.includes('hello') || userMessage.includes('hi')) {
        aiResponse = "Hi there! I can help you with your travel plans. What's on your mind?";
      } else if (userMessage.includes('help')) {
        aiResponse = "I am a demo AI assistant. I can only respond to a few keywords: 'hello', 'help', 'weather', or 'joke'.";
      } else if (userMessage.includes('weather')) {
        aiResponse = "I'm currently unable to fetch real-time weather, but I can tell you the forecast is sunny with a chance of adventure!";
      } else if (userMessage.includes('joke')) {
        aiResponse = "Why did the scarecrow win an award? Because he was outstanding in his field! 🤣";
      }

      handleAIMessage(aiResponse);
      toast('This is a demo AI. It only responds to certain keywords.', { icon: '🤖' });

    }, 1000);
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
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center transition-colors hover:bg-blue-700"
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
            className="fixed bottom-24 right-6 z-50 w-full max-w-sm h-[60vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col transition-colors duration-500"
          >
            <header className="p-4 bg-blue-600 text-white rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center">
                <FontAwesomeIcon icon={faRobot} className="mr-2" />
                AI Assistant
              </h3>
              <button onClick={toggleChatbot} className="p-1 hover:bg-blue-700 rounded-full transition-colors">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </header>
            <div className="flex-grow overflow-y-auto p-4 space-y-4 chat-bg">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-xl max-w-[75%] ${
                    msg.type === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <span className="block text-right text-xs mt-1 text-gray-400 dark:text-gray-500">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow p-3 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
              <button
                type="submit"
                className="ml-2 w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;