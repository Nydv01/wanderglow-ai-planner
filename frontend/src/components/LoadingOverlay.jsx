// src/components/LoadingOverlay.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlaneDeparture } from '@fortawesome/free-solid-svg-icons';

const travelQuotes = [
  "The world is a book, and those who do not travel read only one page.",
  "Travel is the only thing you buy that makes you richer.",
  "Live with no excuses, travel with no regrets.",
  "Jobs fill your pocket, but adventures fill your soul.",
  "To travel is to live.",
  "Travel far, travel wide, travel deep.",
];

const LoadingOverlay = ({ theme }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md overflow-hidden ${
        theme === 'dark' ? 'bg-gray-900 bg-opacity-70' : 'bg-white bg-opacity-70'
      }`}
    >
      <div className="absolute inset-0 flex flex-col justify-around text-center pointer-events-none">
        {travelQuotes.map((quote, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 150 }}
            animate={{
              opacity: 0.6,
              y: -150,
              transition: {
                delay: index * 1.5,
                duration: 10,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
              },
            }}
            className="whitespace-nowrap text-xl font-bold text-gray-700 dark:text-gray-200"
          >
            {quote}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="relative w-40 h-40 flex items-center justify-center"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute w-full h-full rounded-full border-4 border-blue-500 dark:border-blue-400 border-t-transparent animate-spin-slow"
        />
        <motion.div
          className="absolute text-blue-600 dark:text-blue-400 text-6xl"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            transition: {
              y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            },
          }}
        >
          <FontAwesomeIcon icon={faPlaneDeparture} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingOverlay;