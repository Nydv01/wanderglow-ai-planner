import React from 'react';
import { motion } from 'framer-motion';

const PlanPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500 flex items-center justify-center pt-24">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
      >
        <h1 className="text-4xl font-extrabold mb-4">Plan Your Trip</h1>
        <p className="text-lg">This page is under construction. We'll soon have a powerful AI wizard here!</p>
      </motion.div>
    </div>
  );
};

export default PlanPage;