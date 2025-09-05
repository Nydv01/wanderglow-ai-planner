// src/pages/GeneratingPage.jsx (NEW, VISIONARY CODE)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobeAmericas, faPlane, faCameraRetro, faMapMarkedAlt } from '@fortawesome/free-solid-svg-icons';

const messages = [
  { text: "Analyzing your travel preferences...", icon: faPlane },
  { text: "Crafting a unique itinerary...", icon: faMapMarkedAlt },
  { text: "Sourcing stunning visuals...", icon: faCameraRetro },
  { text: "Putting the final touches on your journey...", icon: faGlobeAmericas },
];

const messageVariants = {
  enter: {
    opacity: 0,
    y: 20,
  },
  center: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

const GeneratingPage = () => {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    // Loop through the messages
    const messageTimer = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2000); // Change message every 2 seconds

    // After 8 seconds, navigate to the output page
    const navigateTimer = setTimeout(() => {
      clearInterval(messageTimer);
      navigate('/output');
    }, 8000);

    return () => {
      clearInterval(messageTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  const currentMessage = messages[currentMessageIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
      {/* Background gradients for a futuristic, graphical feel */}
      <div className="absolute w-96 h-96 rounded-full bg-blue-600 blur-3xl opacity-10 animate-pulse-slow"></div>
      <div className="absolute w-96 h-96 rounded-full bg-green-600 blur-3xl opacity-10 -bottom-20 -right-20 animate-pulse"></div>

      <div className="relative z-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, ease: "linear", repeat: Infinity }}
          className="text-8xl text-blue-600 mb-8"
        >
          <FontAwesomeIcon icon={faGlobeAmericas} />
        </motion.div>
        
        <div className="h-20 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessage.text}
              variants={messageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex items-center text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100"
            >
              <FontAwesomeIcon icon={currentMessage.icon} className="mr-4 text-blue-500" />
              <span>{currentMessage.text}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GeneratingPage;