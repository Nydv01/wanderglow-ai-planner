// src/i18n.js (NEW FILE)

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "title": "AI Travel Planner",
          "subtitle": "Create your dream itinerary in seconds.",
          "getStarted": "Get Started",
          "destinationPrompt": "Where do you want to go?",
          "voiceInput": "Use Voice Input",
          "durationPrompt": "How many days?",
          "interestsPrompt": "What are your interests?",
          "budgetPrompt": "What is your budget?",
          "generateItinerary": "Generate Itinerary",
          "yourItinerary": "Your Itinerary for {{destination}}",
          "tripDuration": "A {{duration}}-day trip from {{startDate}} to {{endDate}}",
          "downloadPDF": "Download Full PDF",
          "shareItinerary": "Share Itinerary",
          "saveFavorites": "Save to Favorites",
          "saved": "Saved",
          "exportStory": "Export as Story",
          "tripLocation": "Trip Location",
          "viewOnMap": "View on Map",
          "tripDates": "Your Trip Dates",
          "downloadCalendar": "Download Calendar PDF",
          "tripDetails": "Trip Details",
          "destination": "Destination",
          "duration": "Duration",
          "interests": "Interests",
          "budget": "Budget",
          "estimatedBudget": "Estimated Budget",
          "back": "Back",
          "exploreNearby": "Explore Nearby",
          "nearbyPlaces": "Nearby Places",
          "noPlacesFound": "No places found nearby.",
          "chatbotTitle": "AI Assistant",
          "chatbotPlaceholder": "Type a message...",
          "greeting": "Hello! I'm your AI Travel Assistant. How can I help you today? Try typing 'help'.",
          "onboardingSkip": "Skip",
          "onboardingNext": "Next",
          "onboardingDone": "Done",
        }
      },
      es: {
        translation: {
          "title": "Planificador de Viajes con IA",
          "subtitle": "Crea tu itinerario soñado en segundos.",
          "getStarted": "Empezar",
          "destinationPrompt": "¿A dónde quieres ir?",
          "voiceInput": "Usar Entrada de Voz",
          "durationPrompt": "¿Cuántos días?",
          "interestsPrompt": "¿Cuáles son tus intereses?",
          "budgetPrompt": "¿Cuál es tu presupuesto?",
          "generateItinerary": "Generar Itinerario",
          "yourItinerary": "Tu Itinerario para {{destination}}",
          "tripDuration": "Un viaje de {{duration}} días del {{startDate}} al {{endDate}}",
          "downloadPDF": "Descargar PDF Completo",
          "shareItinerary": "Compartir Itinerario",
          "saveFavorites": "Guardar en Favoritos",
          "saved": "Guardado",
          "exportStory": "Exportar como Historia",
          "tripLocation": "Ubicación del Viaje",
          "viewOnMap": "Ver en el Mapa",
          "tripDates": "Tus Fechas de Viaje",
          "downloadCalendar": "Descargar PDF de Calendario",
          "tripDetails": "Detalles del Viaje",
          "destination": "Destino",
          "duration": "Duración",
          "interests": "Intereses",
          "budget": "Presupuesto",
          "estimatedBudget": "Presupuesto Estimado",
          "back": "Atrás",
          "exploreNearby": "Explorar Cerca",
          "nearbyPlaces": "Lugares Cercanos",
          "noPlacesFound": "No se encontraron lugares cercanos.",
          "chatbotTitle": "Asistente de IA",
          "chatbotPlaceholder": "Escribe un mensaje...",
          "greeting": "¡Hola! Soy tu Asistente de Viajes con IA. ¿En qué puedo ayudarte hoy? Intenta escribir 'ayuda'.",
          "onboardingSkip": "Saltar",
          "onboardingNext": "Siguiente",
          "onboardingDone": "Listo",
        }
      }
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;