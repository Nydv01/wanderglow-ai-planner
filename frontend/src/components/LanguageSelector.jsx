// src/components/LanguageSelector.jsx (NEW FILE)

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <motion.div
      className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-800 rounded-full px-4 py-2 shadow-md transition-colors"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
          i18n.language === 'en'
            ? 'bg-blue-500 text-white'
            : 'text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('es')}
        className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
          i18n.language === 'es'
            ? 'bg-blue-500 text-white'
            : 'text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        ES
      </button>
    </motion.div>
  );
};

export default LanguageSelector;