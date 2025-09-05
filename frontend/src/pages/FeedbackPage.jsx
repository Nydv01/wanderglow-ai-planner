// src/pages/FeedbackPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// import DarkModeToggle from '../components/DarkModeToggle'; // Removed DarkModeToggle
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faArrowLeft, faCheckCircle, faStar as faSolidStar } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next'; 

const FeedbackPage = ({ toggleTheme, theme }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { error, starRating } = location.state || { error: t('unexpectedError') };

  const [feedbackText, setFeedbackText] = useState('');

  const handleBack = () => {
    navigate('/input');
  };
  
  const handleSubmitFeedback = (e) => {
      e.preventDefault();
      // Here you would typically send the feedback to your backend
      // For this example, we'll just log it to the console
      console.log('Feedback submitted:', { starRating, feedbackText });
      // Using a custom modal/toast instead of alert() for better UX
      // For now, we'll log a message and navigate back.
      // In a real app, you'd show a success message to the user.
      console.log(t('feedbackSubmitSuccess')); 
      navigate('/input');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center space-y-6"
      >
        {/* Removed DarkModeToggle from here */}
        
        {error && (
            <div className="text-center">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, -10, 10, -10, 0] }}
                transition={{ duration: 0.8 }}
                className="mb-4"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-6xl" />
              </motion.div>
              <h1 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-2">
                {t('oopsTitle')}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {error}
              </p>
            </div>
        )}

        {starRating > 0 && (
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="mb-4 text-green-500 text-6xl"
                >
                    <FontAwesomeIcon icon={faCheckCircle} />
                </motion.div>
                <h1 className="text-3xl font-extrabold text-green-600 dark:text-green-400 mb-2">
                    Your Feedback {/* Hardcoded title */}
                </h1>
                <div className="flex justify-center items-center mb-6 text-3xl text-yellow-400">
                    {[...Array(starRating)].map((_, i) => (
                        <FontAwesomeIcon key={i} icon={faSolidStar} className="mx-1" />
                    ))}
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    Leave your precious message {/* Hardcoded message with capitalized 'L' */}
                </p>
                
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                    <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder={t('feedbackPlaceholder')}
                        rows="4"
                        className="w-full p-4 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <motion.button
                        type="submit"
                        className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Submit Feedback {/* Hardcoded text for the button */}
                    </motion.button>
                </form>
            </div>
        )}

        {!starRating && (
            <motion.button
                onClick={handleBack}
                className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                {t('goBackHome')}
            </motion.button>
        )}
        
      </motion.div>
    </div>
  );
};

export default FeedbackPage;
