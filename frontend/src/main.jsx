import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';
// PWA — isolated, fails silently, production only
import { registerServiceWorker, initInstallPrompt } from './pwa/registerSW';
registerServiceWorker();
initInstallPrompt();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);