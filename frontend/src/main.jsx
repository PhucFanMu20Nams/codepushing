import React from 'react'
import ReactDOM from 'react-dom/client'
// Import console configuration first to override console methods in production
import './config/console.config.js'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
