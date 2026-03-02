import React, { useState, useEffect, useRef } from 'react'

// Chatbot component: manages conversation history, UI, and API calls.
// This component supports both OpenAI and Google Gemini (Generative Language)
// controlled by the `VITE_AI_PROVIDER` env var. Set it to `openai` or `gemini`.
export default function Chatbot() {
  // conversation holds an array of { role, content } objects
  const [conversation, setConversation] = useState([
    { role: 'assistant', content: 'Hello! How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ref used to auto-scroll to the latest message
  const endRef = useRef(null)

  // Auto-scroll whenever conversation changes
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversation, loading])

  // Helper: map our conversation format to provider-specific payloads
  const sendToOpenAI = async updated => {
    // Use the server-side proxy to call OpenAI so the API key stays on server
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation: updated, provider: 'openai' })
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || `Proxy/OpenAI error ${res.status}`)
    }

    const data = await res.json()
    return data.text || (data.raw && JSON.stringify(data.raw)) || 'No response'
  }

  // Gemini / Google Generative Language call (best-effort browser API key usage)
  const sendToGemini = async updated => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
    // When running in the browser, call our local proxy `/api/generate`.
    // The proxy keeps the API key server-side and avoids CORS issues.
    const proxyUrl = '/api/generate'
    const model = import.meta.env.VITE_GEMINI_MODEL || 'models/gemini-2.5-flash'

    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation: updated, model })
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || `Proxy error ${res.status}`)
    }

    const data = await res.json()
    return data.text || (data.raw && JSON.stringify(data.raw)) || 'No response'
  }

  // Send a message: add user message, call selected provider, append assistant response
  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return

    // Add user's message to conversation state
    const userMessage = { role: 'user', content: text }
    const updated = [...conversation, userMessage]
    setConversation(updated)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const provider = (import.meta.env.VITE_AI_PROVIDER || 'gemini').toLowerCase()
      let assistantText = ''

      if (provider === 'openai') {
        assistantText = await sendToOpenAI(updated)
      } else if (provider === 'gemini') {
        assistantText = await sendToGemini(updated)
      } else {
        throw new Error(`Unknown VITE_AI_PROVIDER: ${provider}`)
      }

      const assistantMessage = { role: 'assistant', content: assistantText }
      setConversation(prev => [...prev, assistantMessage])
    } catch (err) {
      // Handle network / API errors
      const message = err?.message || 'Unknown error'
      setError(message)
      setConversation(prev => [...prev, { role: 'assistant', content: `Error: ${message}` }])
    } finally {
      setLoading(false)
    }
  }

  // Allow sending on Enter (no shift). Prevents multi-line send.
  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!loading) sendMessage()
    }
  }

  return (
    <div className="chatbot-container">
      <div className="messages" role="log" aria-live="polite">
        {conversation.map((m, idx) => (
          <div
            key={idx}
            className={`message ${m.role === 'user' ? 'user' : 'assistant'}`}
          >
            <div className="bubble">{m.content}</div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="bubble loading">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {error && <div className="error">Error: {error}</div>}

      <div className="composer">
        <input
          aria-label="Type your message"
          placeholder="Type a message and press Enter"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
