// src/components/DayItineraryCard.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ItineraryCard from './ItineraryCard'; // Assuming ItineraryCard is in components folder

// Variants for scroll-triggered day animation - adjusted y for softer effect
const dayVariants = {
  hidden: { opacity: 0, y: 50 }, // Reduced y from 100 to 50
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15, duration: 0.8 } }
};

const DayItineraryCard = ({ day, onDragEnd, fetchNearbyPlaces, t }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <motion.div
      key={day.day} // Keep key here
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={dayVariants}
      // Adjusted background and border for a softer, more integrated look
      className="mb-10 bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700" // Softer background, more diffused shadow, lighter border
      whileHover={{ scale: 1.01, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }} // Enhanced hover shadow
      transition={{ duration: 0.2 }} // Smooth transition for hover
    >
      <h2 className="text-3xl font-bold mb-4 flex items-center text-gray-800 dark:text-gray-100">
        <span className="p-3 bg-ocean-blue-deep text-white rounded-full mr-4">{t('day')} {day.day}</span>
        {day.title}
      </h2>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{day.summary}</p>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={`activities-${day.day}`}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {day.activities.map((activity, activityIndex) => (
                <Draggable
                  key={activity.name}
                  draggableId={`${day.day}-${activity.name}`}
                  index={activityIndex}
                >
                  {(provided, snapshot) => (
                    <ItineraryCard
                      day={day.day}
                      activity={activity}
                      provided={provided}
                      snapshot={snapshot}
                      fetchNearbyPlaces={fetchNearbyPlaces}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </motion.div>
  );
};

export default DayItineraryCard;
