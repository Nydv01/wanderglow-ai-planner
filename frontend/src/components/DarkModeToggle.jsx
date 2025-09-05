// src/components/DarkModeToggle.jsx (NEW, FUNCTIONAL CODE)

import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const DarkModeToggle = ({ toggleTheme, theme }) => {
  return (
    <motion.button
      onClick={toggleTheme}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="p-3 rounded-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-lg"
    >
      <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
    </motion.button>
  );
};

export default DarkModeToggle;
