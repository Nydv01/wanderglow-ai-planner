// src/components/Footer.jsx

import React from 'react';

const Footer = () => (
  <footer className="w-full text-center p-6 text-gray-600 dark:text-gray-400 text-sm">
    <p>&copy; {new Date().getFullYear()} AI Travel Planner. All rights reserved.</p>
  </footer>
);

export default Footer;