import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // 👈 Solo llamamos a App, todo sale de ahí
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)