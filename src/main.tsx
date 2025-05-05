import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSampleLeads } from './store/initLeads';

// Initialize sample data before rendering
const initializeApp = async () => {
  try {
    await initSampleLeads();
    const root = document.getElementById("root");
    if (!root) throw new Error("Root element not found");
    
    createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to initialize app:", error);
  }
};

initializeApp();
