# ✨ WanderGlow - Elite AI-Powered Travel Planner

WanderGlow is a state-of-the-art, high-fidelity AI travel planner that crafts custom, personalized itineraries in seconds. Combining an immersive 3D world globe, real-time map plotting, multi-language support, and sleek layouts, it represents a world-class travel planning experience (MakeMyTrip/Goibibo standard).

---

## 🚀 Key Features

*   **Interactive 3D World Globe (Three.js)**:
    *   Holographic dotted landmasses with glowing coordinate grids.
    *   Smooth momentum-based inertia drag and release physics.
    *   Scenic atmospheric glow and pulsating flight arcs with faded comet trails.
    *   Back-face label culling: City name labels automatically fade out when rotating to the back hemisphere of the Earth to prevent screen clutter.
*   **Split-Screen Interactive Map (Leaflet)**:
    *   Toggle between full destination grid and map split-screen layouts on the Explore page.
    *   Real-world coordinates mapping with dynamic fly-to zooming when hovering destination cards.
    *   Animated floating favorites hearts linked directly to browser local storage.
*   **Typeform-Style Conversational AI Wizard**:
    *    Prefilled steps, search recommendation lists, calendars, and step progress indicators.
    *   Live audio waveform animation showing active voice search status.
*   **Zero Layout-Shift Navigation & i18n**:
    *   Fully localized English and Spanish interfaces.
    *   Grid-locked navigation controls preventing shifts on language toggles.
*   **Premium Footer & Newsletter Services**:
    *   4-column glassmorphic footer featuring quick exploration, social directories, and dynamic subscription states.

---

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Framer Motion, Three.js, Leaflet Map, Tailwind CSS, i18next
*   **Backend**: Node.js, Express.js
*   **AI Engines**: OpenAI API

---

## ⚙️ Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn

### Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Nydv01/wanderglow-ai-planner.git
    cd wanderglow-ai-planner
    ```

2.  **Run the Backend**:
    ```bash
    cd backend
    npm install
    # Configure your OpenAI API keys and database details in a .env file
    npm run dev
    ```

3.  **Run the Frontend**:
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

---

## ⚡ Vercel Deployment Guide

Vercel is optimized for frontend hosting. Deploying WanderGlow requires hosting the frontend on Vercel and connecting it to your backend API.

### Step 1: Deploying the Frontend (React Vite)

1.  Sign in to [Vercel](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import the `wanderglow-ai-planner` repository.
4.  In the Project Configuration:
    *   **Framework Preset**: Select **Vite**.
    *   **Root Directory**: Set this to `frontend` (crucial so Vercel builds from the correct folder).
5.  Under **Environment Variables**, add:
    *   `VITE_API_URL`: Set this to your deployed backend URL (e.g., `https://wanderglow-api.onrender.com`).
6.  Click **Deploy**.

### Step 2: Handling Client-Side Routing in Vite
To ensure React Router routes (like `/explore`, `/plan`) load properly on reload without throwing `404` errors, add a `vercel.json` file inside the `frontend/` directory:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Step 3: Deploying the Express Backend

Vercel can host Express APIs as Serverless Functions, or you can host the backend on platform services like **Render**, **Railway**, or **Heroku**:

*   **Deploying on Render / Railway (Recommended)**:
    1. Import the same repository.
    2. Set the Root Directory to `backend`.
    3. Build Command: `npm install`
    4. Start Command: `node index.js` (or `npm start`)
    5. Add your environment variables (e.g., `PORT`, `OPENAI_API_KEY`).
    6. Take the resulting service URL and save it as `VITE_API_URL` in your Vercel frontend dashboard.