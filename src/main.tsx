import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx' // Your main application component
import './index.css'     // Tailwind CSS and global styles

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
