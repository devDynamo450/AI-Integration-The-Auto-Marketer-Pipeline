import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { MessageCircle, Send, Loader2, Bot, User, Sparkles, Zap, AlertCircle } from 'lucide-react'
import api from '../lib/api'

const SUGGESTIONS = [
  'Which college is best for CS in Maharashtra under ₹5L?',
  'Compare IIT Bombay vs BITS Pilani for Electronics',
  'Best government colleges with less than ₹2L fees',
  'JEE rank needed for NIT Trichy Computer Science?',
  'Which college has best startup ecosystem in India?',
  'Tell me about VIT Vellore placements',
]

export default function ChatbotPage() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi! I'm your AI Career Counselor powered by Google Gemini. 🎓\n\nAsk me anything about colleges, fees, placements, or entrance exams — I'll give you honest, data-backed answers without any bias or advertising.",
    time: new Date(),
    isWelcome: true,
  }])
  const [input, setInput] = useState('')
  const [geminiActive, setGeminiActive] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  const mutation = useMutation({
    mutationFn: (query) => api.post('/recommendations/chatbot', { query }).then(r => r.data.data),
    onSuccess: (data) => {
      setGeminiActive(data.disclaimer?.includes('Gemini'))
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        disclaimer: data.disclaimer,
        time: new Date(),
      }])
    },
    onError: (err) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.response?.data?.message || "Sorry, I couldn't process that. Please try again.",
        isError: true,
        time: new Date(),
      }])
    },
  })

  const sendMessage = (text) => {
    const q = (text || input).trim()
    if (!q) return
    setMessages(prev => [...prev, { role: 'user', content: q, time: new Date() }])
    setInput('')
    mutation.mutate(q)
    inputRef.current?.focus()
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, mutation.isLoading])

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 max-w-3xl mx-auto pb-4 flex flex-col" style={{ height: '100vh' }}>
      {/* Header */}
      <div className="pt-4 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/30 to-blue-600/30 flex items-center justify-center">
            <MessageCircle size={20} className="text-cyan-400"/>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-2xl text-white">AI Career Counselor</h1>
              {geminiActive && (
                <span className="badge bg-blue-500/15 text-blue-300 border border-blue-500/20 text-[10px] flex items-center gap-1">
                  <Zap size={9}/>Gemini AI
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs">Honest, unbiased college guidance powered by Google AI</p>
          </div>
        </div>
      </div>

      {/* Suggestion Chips (show only if no conversation yet) */}
      {messages.length === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 flex-shrink-0">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              className="glass-card p-3 text-left text-xs text-slate-400 hover:text-white hover:border-primary-500/30 transition-all duration-200 border border-white/5 rounded-xl group">
              <Sparkles size={10} className="text-primary-400 mb-1.5 group-hover:text-primary-300"/>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-slide-up`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' ? 'bg-primary-600/40' : 'bg-gradient-to-br from-cyan-600/30 to-blue-600/30'
            }`}>
              {msg.role === 'user'
                ? <User size={14} className="text-primary-300"/>
                : <Bot size={14} className="text-cyan-400"/>
              }
            </div>
            {/* Bubble */}
            <div className={`max-w-[82%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary-600/20 border border-primary-500/20 text-slate-100 rounded-tr-sm'
                  : msg.isError
                  ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-tl-sm'
                  : 'glass-card border border-white/5 text-slate-300 rounded-tl-sm'
              }`}>
                {msg.content}
                {msg.disclaimer && (
                  <p className="text-[10px] text-slate-600 mt-2 pt-2 border-t border-white/5 flex items-center gap-1">
                    <AlertCircle size={9}/>{msg.disclaimer}
                  </p>
                )}
              </div>
              <span className="text-[10px] text-slate-600 px-1">
                {msg.time?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {mutation.isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600/30 to-blue-600/30 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-cyan-400"/>
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm border border-white/5">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}/>
                ))}
                <span className="text-xs text-slate-600 ml-1">Gemini is thinking…</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input Bar */}
      <div className="glass-card p-2.5 border border-white/10 flex items-center gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          placeholder="Ask about any college, course, fees, or career…"
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none px-2"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || mutation.isLoading}
          className="btn-primary py-2 px-3 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          {mutation.isLoading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-700 mt-2 flex-shrink-0">
        Powered by Google Gemini AI · Always verify with official sources
      </p>
    </div>
  )
}
