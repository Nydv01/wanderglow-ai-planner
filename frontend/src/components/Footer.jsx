// src/components/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }, 1200);
  };

  return (
    <footer className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-t border-gray-200/20 dark:border-slate-800/20 py-16 px-4 sm:px-6 lg:px-8 relative z-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Column 1: Branding */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <Link to="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-500 dark:text-blue-400"
            >
              <path d="M12 2l-8 14h6l-2 6 8-14h-6z" />
            </svg>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              WanderGlow
            </span>
          </Link>
          <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">
            {t('footerTagline')}
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="lg:col-span-2 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
            {t('exploreLinks')}
          </h3>
          <ul className="space-y-2">
            <li>
              <Link to="/" className="text-sm text-gray-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium">
                {t('Home')}
              </Link>
            </li>
            <li>
              <Link to="/explore" className="text-sm text-gray-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium">
                {t('Explore')}
              </Link>
            </li>
            <li>
              <Link to="/plan" className="text-sm text-gray-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium">
                {t('Plan Trip')}
              </Link>
            </li>
            <li>
              <Link to="/favorites" className="text-sm text-gray-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-medium">
                {t('Favorites')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Services */}
        <div className="lg:col-span-3 flex flex-col space-y-3">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
            {t('aiServices')}
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400 font-medium">
            <li className="hover:text-gray-800 dark:hover:text-slate-200 transition-colors cursor-pointer">🗺️ {t('aiEngine')}</li>
            <li className="hover:text-gray-800 dark:hover:text-slate-200 transition-colors cursor-pointer">🌐 {t('interactiveGlobe')}</li>
            <li className="hover:text-gray-800 dark:hover:text-slate-200 transition-colors cursor-pointer">💬 {t('chatbotTitle')}</li>
            <li className="hover:text-gray-800 dark:hover:text-slate-200 transition-colors cursor-pointer">✈️ {t('searchFlights')}</li>
          </ul>
        </div>

        {/* Column 4: Subscribe */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
            {t('stayUpdated')}
          </h3>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-2 relative">
            <div className="relative">
              <input
                type="email"
                placeholder={t('subscribePlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 transition-all"
              />
            </div>
            <motion.button
              type="submit"
              disabled={isSubmitting || isSubscribed}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{t('subscribe')}</span>
              )}
            </motion.button>
          </form>

          <AnimatePresence>
            {isSubscribed && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center"
              >
                ✓ {t('subscribeSuccess')}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Social Icons */}
          <div className="flex space-x-4 pt-2">
            <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-blue-500 dark:hover:bg-blue-500 hover:text-white dark:text-slate-400 text-gray-600 flex items-center justify-center transition-all shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:text-slate-400 text-gray-600 flex items-center justify-center transition-all shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 hover:text-white dark:text-slate-400 text-gray-600 flex items-center justify-center transition-all shadow-sm">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>

      </div>

      {/* Under footer copyright */}
      <div className="max-w-7xl mx-auto border-t border-gray-200/10 dark:border-slate-800/10 mt-12 pt-8 text-center text-xs text-gray-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} WanderGlow AI Travel Planner. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;