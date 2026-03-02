// Top-level App component. Imports the Chatbot component and provides layout.
import React from 'react'
import Chatbot from './components/Chatbot'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">React Chatbot</header>
      <main className="app-main">
        <Chatbot />
      </main>
      <footer className="app-footer">Built with Vite + React</footer>
    </div>
  )
}
