import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API = 'http://127.0.0.1:5000'

// ─── Auth Page ────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/signup'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }
      const res = await axios.post(`${API}${url}`, payload)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      onLogin(res.data.user)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-glow" />
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">QueryGen<span className="logo-ai">AI</span></span>
        </div>
        <p className="auth-sub">Natural Language → SQL, intelligently</p>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign Up</button>
        </div>

        <div className="auth-form">
          {mode === 'signup' && (
            <div className="field">
              <label>Name</label>
              <input name="name" placeholder="Your name" value={form.name} onChange={handle} />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handle} />
          </div>
          <div className="field">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle}
              onKeyDown={(e) => e.key === 'Enter' && submit()} />
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}

          <button className="btn-primary" onClick={submit} disabled={loading}>
            {loading ? <span className="spinner" /> : mode === 'login' ? 'Login →' : 'Create Account →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────
function MainApp({ user, onLogout }) {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [copied, setCopied] = useState(false)

  const token = localStorage.getItem('token')

  useEffect(() => { fetchHistory() }, [])

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/api/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistory(res.data.queries)
    } catch (err) {
      console.error('History fetch failed')
    }
  }

  const generateSQL = async () => {
    if (!query.trim()) return
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const res = await axios.post(`${API}/api/generate-sql`,
        { query: query.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResult(res.data)
      fetchHistory()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate SQL')
    } finally {
      setLoading(false)
    }
  }

  const copySQL = () => {
    navigator.clipboard.writeText(result?.generatedSQL || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const loadFromHistory = (item) => {
    setQuery(item.naturalLanguageQuery)
    setResult({
      generatedSQL: item.generatedSQL,
      naturalLanguageQuery: item.naturalLanguageQuery,
      modelUsed: item.modelUsed
    })
    setShowHistory(false)
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${showHistory ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span>Query History</span>
          <button className="close-btn" onClick={() => setShowHistory(false)}>✕</button>
        </div>
        <div className="history-list">
          {history.length === 0 && (
            <p className="empty-history">No queries yet</p>
          )}
          {history.map((item, i) => (
            <div key={i} className="history-item" onClick={() => loadFromHistory(item)}>
              <p className="history-nl">{item.naturalLanguageQuery}</p>
              <code className="history-sql">{item.generatedSQL}</code>
              <span className="history-time">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Header */}
        <header className="app-header">
          <div className="header-left">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">QueryGen<span className="logo-ai">AI</span></span>
          </div>
          <div className="header-right">
            <button className="btn-ghost" onClick={() => setShowHistory(!showHistory)}>
              ⏱ History
            </button>
            <span className="user-badge">{user.name}</span>
            <button className="btn-ghost" onClick={onLogout}>Logout</button>
          </div>
        </header>

        {/* Hero */}
        <div className="hero">
          <div className="hero-glow" />
          <h1 className="hero-title">
            Ask in English.<br />
            <span className="hero-accent">Get SQL instantly.</span>
          </h1>
          <p className="hero-sub">
            Powered by RAG — keyword extraction, real DB values, and vector search
          </p>
        </div>

        {/* Query Input */}
        <div className="query-card">
          <div className="query-label">Natural Language Query</div>
          <div className="query-input-row">
            <input
              className="query-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Show all users from Delhi aged 25"
              onKeyDown={(e) => e.key === 'Enter' && !loading && generateSQL()}
            />
            <button className="btn-generate" onClick={generateSQL} disabled={loading}>
              {loading ? <span className="spinner" /> : '⚡ Generate'}
            </button>
          </div>

          {/* Example queries */}
          <div className="examples">
            {['Show all users from Delhi', 'Find users aged 25', 'List users named Alice'].map((ex) => (
              <button key={ex} className="example-chip" onClick={() => setQuery(ex)}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="result-card error-card">
            <span>⚠ {error}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="result-card">
            <div className="result-header">
              <span className="result-label">✦ Generated SQL</span>
              <button className="btn-copy" onClick={copySQL}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre className="sql-output">{result.generatedSQL}</pre>

            {result.keywords?.length > 0 && (
              <div className="meta-row">
                <span className="meta-label">Keywords</span>
                <div className="tags">
                  {result.keywords.map((k) => (
                    <span key={k} className="tag">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {result.similarQueries?.length > 0 && (
              <div className="meta-row">
                <span className="meta-label">Similar Past Queries</span>
                <div className="similar-list">
                  {result.similarQueries.map((sq, i) => (
                    <div key={i} className="similar-item">
                      <span className="similar-score">{sq.score}</span>
                      <span className="similar-q">{sq.query}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="result-footer">
              <span>Model: {result.modelUsed}</span>
              <span className="rag-badge">⬡ RAG Enhanced</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  })

  const handleLogin = (u) => setUser(u)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (!user) return <AuthPage onLogin={handleLogin} />
  return <MainApp user={user} onLogout={handleLogout} />
}