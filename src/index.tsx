import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // I will create this file later for basic styling

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
