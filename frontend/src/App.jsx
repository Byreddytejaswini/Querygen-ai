import { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import './App.css'

SyntaxHighlighter.registerLanguage('sql', sql)

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

// ─── Skeleton Loader ──────────────────────────────────────
function SkeletonLoader() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line" style={{ height: 16, width: '40%' }} />
      <div className="skeleton-line" style={{ height: 80 }} />
      <div className="skeleton-line" style={{ height: 16, width: '60%' }} />
      <div className="skeleton-line" style={{ height: 120 }} />
    </div>
  )
}

// ─── Admin Dashboard ──────────────────────────────────────
function AdminDashboard({ onBack, token }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data)
    } catch (err) {
      console.error('Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }

  const keywordChartData = stats?.topKeywords?.map(k => ({
    name: k._id,
    count: k.count
  })) || []

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <div>
          <div className="auth-logo" style={{ marginBottom: 4 }}>
            <span className="logo-icon">⬡</span>
            <span className="logo-text">QueryGen<span className="logo-ai">AI</span></span>
          </div>
          <h1 className="admin-title">Admin Dashboard</h1>
        </div>
        <button className="btn-ghost" onClick={onBack}>← Back to App</button>
      </div>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats?.totalQueries || 0}</div>
              <div className="stat-label">Total Queries</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.totalUsers || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.todayQueries || 0}</div>
              <div className="stat-label">Today's Queries</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.avgResultRows || 0}</div>
              <div className="stat-label">Avg Result Rows</div>
            </div>
          </div>

          {keywordChartData.length > 0 && (
            <div className="admin-section">
              <div className="admin-section-title">Top Keywords</div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={keywordChartData}>
                    <XAxis dataKey="name" stroke="#7878aa" fontSize={12} />
                    <YAxis stroke="#7878aa" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: '#0f0f1a', border: '1px solid #252540', borderRadius: 8 }}
                      labelStyle={{ color: '#e8e8f5' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {keywordChartData.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? '#6c63ff' : '#63ffda'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="admin-section">
            <div className="admin-section-title">Recent Queries (All Users)</div>
            <div className="results-table-wrap">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Query</th>
                    <th>SQL</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentQueries?.map((q, i) => (
                    <tr key={i}>
                      <td>{q.naturalLanguageQuery}</td>
                      <td><code style={{ color: 'var(--accent2)', fontSize: 11 }}>{q.generatedSQL}</code></td>
                      <td style={{ color: 'var(--text2)', whiteSpace: 'nowrap' }}>
                        {new Date(q.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
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
  const [viewMode, setViewMode] = useState('table')
  const [showAdmin, setShowAdmin] = useState(false)

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
    setViewMode('table')
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

  const exportCSV = () => {
    if (!result?.queryResults?.rows?.length) return
    const { columns, rows } = result.queryResults
    const csv = [
      columns.join(','),
      ...rows.map(row => columns.map(col => `"${row[col]}"`).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'query_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const getChartData = () => {
    if (!result?.queryResults?.rows?.length) return []
    const { columns, rows } = result.queryResults
    const numericCol = columns.find(col =>
      rows.every(row => !isNaN(row[col]) && row[col] !== '')
    )
    const labelCol = columns.find(col => col !== numericCol && col !== 'id')
    if (!numericCol || !labelCol) return []
    return rows.slice(0, 10).map(row => ({
      name: String(row[labelCol]),
      value: Number(row[numericCol])
    }))
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

  if (showAdmin) {
    return <AdminDashboard token={token} onBack={() => setShowAdmin(false)} />
  }

  const chartData = getChartData()
  const hasChart = chartData.length > 0

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${showHistory ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span>Query History</span>
          <button className="close-btn" onClick={() => setShowHistory(false)}>✕</button>
        </div>
        <div className="history-list">
          {history.length === 0 && <p className="empty-history">No queries yet</p>}
          {history.map((item, i) => (
            <div key={i} className="history-item" onClick={() => loadFromHistory(item)}>
              <p className="history-nl">{item.naturalLanguageQuery}</p>
              <code className="history-sql">{item.generatedSQL}</code>
              <span className="history-time">{new Date(item.createdAt).toLocaleDateString()}</span>
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
            <button className="btn-ghost" onClick={() => setShowAdmin(true)}>⚙ Admin</button>
            <button className="btn-ghost" onClick={() => setShowHistory(!showHistory)}>⏱ History</button>
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
          <div className="examples">
            {['Show all users from Delhi', 'Find users aged 25', 'List users named Alice'].map((ex) => (
              <button key={ex} className="example-chip" onClick={() => setQuery(ex)}>{ex}</button>
            ))}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && <SkeletonLoader />}

        {/* Error */}
        {error && !loading && (
          <div className="result-card error-card">
            <span>⚠ {error}</span>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="result-card">
            <div className="result-header">
              <span className="result-label">✦ Generated SQL</span>
              <div className="result-actions">
                {result.queryResults?.count > 0 && (
                  <button className="btn-export" onClick={exportCSV}>↓ CSV</button>
                )}
                <button className={`btn-copy ${copied ? 'copied' : ''}`} onClick={copySQL}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {result.autoFixed && (
              <div className="auto-fixed-badge">⚡ Auto-fixed by AI</div>
            )}

            <SyntaxHighlighter
              language="sql"
              style={atomOneDark}
              customStyle={{
                borderRadius: 12,
                padding: '22px',
                fontSize: 14,
                marginBottom: 24,
                background: 'var(--bg)',
                border: '1px solid var(--border)'
              }}
            >
              {result.generatedSQL}
            </SyntaxHighlighter>

            {result.queryResults?.count > 0 && (
              <div className="meta-row">
                <span className="meta-label">📊 Results — {result.queryResults.count} rows</span>

                {hasChart && (
                  <div className="view-toggle">
                    <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>
                      ▦ Table
                    </button>
                    <button className={viewMode === 'chart' ? 'active' : ''} onClick={() => setViewMode('chart')}>
                      ▮ Chart
                    </button>
                  </div>
                )}

                {viewMode === 'table' && (
                  <div className="results-table-wrap">
                    <table className="results-table">
                      <thead>
                        <tr>{result.queryResults.columns.map(col => <th key={col}>{col}</th>)}</tr>
                      </thead>
                      <tbody>
                        {result.queryResults.rows.map((row, i) => (
                          <tr key={i}>
                            {result.queryResults.columns.map(col => <td key={col}>{row[col]}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {viewMode === 'chart' && hasChart && (
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#7878aa" fontSize={12} />
                        <YAxis stroke="#7878aa" fontSize={12} />
                        <Tooltip
                          contentStyle={{ background: '#0f0f1a', border: '1px solid #252540', borderRadius: 8 }}
                          labelStyle={{ color: '#e8e8f5' }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {chartData.map((_, i) => (
                            <Cell key={i} fill={i % 2 === 0 ? '#6c63ff' : '#63ffda'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {result.queryResults?.error && (
              <div className="meta-row">
                <span className="meta-label" style={{ color: 'var(--error)' }}>⚠ SQL Error</span>
                <p style={{ color: 'var(--error)', fontSize: 13 }}>{result.queryResults.error}</p>
              </div>
            )}

            {result.keywords?.length > 0 && (
              <div className="meta-row">
                <span className="meta-label">Keywords</span>
                <div className="tags">
                  {result.keywords.map(k => <span key={k} className="tag">{k}</span>)}
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