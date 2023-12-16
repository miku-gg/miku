import React from 'react'
import ReactDOM from 'react-dom/client'
import './root.scss'; // Import your main SCSS file
import App from './src/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
