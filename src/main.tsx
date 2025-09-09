import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize security framework in development mode only
if (import.meta.env.DEV) {
  console.log('Development mode - security features disabled');
  
  // Simple service worker cleanup without aggressive reloading
  if ('serviceWorker' in navigator) {
    // Block new registrations
    navigator.serviceWorker.register = function() {
      console.log('Service worker registration blocked in development mode');
      return Promise.reject(new Error('Service worker disabled in development'));
    };
    
    // Clean up existing registrations quietly
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().then(() => {
          console.log('Service worker unregistered');
        });
      });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
