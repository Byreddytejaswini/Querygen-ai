import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [sqlResult, setSqlResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    setSqlResult('')
    
    if (!query.trim()) {
      setError('Please enter a query')
      return
    }

    setLoading(true)

    try {
      console.log('Making request to backend...')
      
      const response = await axios.post('http://127.0.0.1:5000/api/generate-sql', {
        query: query.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('✅ Response:', response.data)

      if (response.data && response.data.generatedSQL) {
        setSqlResult(response.data.generatedSQL)
      } else {
        setError('No SQL generated')
      }
      
    } catch (err) {
      console.error('❌ Error:', err)
      
      if (err.response) {
        setError(`Backend Error: ${err.response.status} - ${JSON.stringify(err.response.data)}`)
      } else if (err.request) {
        setError('Cannot connect to backend at http://127.0.0.1:5000. Is it running?')
      } else {
        setError(`Request Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <header>
        <h1>🤖 QueryGen AI</h1>
        <p>Convert Natural Language to SQL</p>
        <small style={{color: '#888'}}>
          Backend: http://127.0.0.1:5000 | AI: http://127.0.0.1:8000 | Frontend: http://127.0.0.1:5173
        </small>
      </header>

      <main>
        <div className="input-section">
          <label>Enter your query in plain English:</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Show all users from Delhi"
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
          />
          <button 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? '⏳ Generating...' : '🚀 Generate SQL'}
          </button>
        </div>

        {error && (
          <div className="error-section">
            <h3>❌ Error</h3>
            <p>{error}</p>
            <small>Check browser console (F12) for more details</small>
          </div>
        )}

        {sqlResult && (
          <div className="output-section">
            <h3>✅ Generated SQL:</h3>
            <code>{sqlResult}</code>
          </div>
        )}
      </main>
    </div>
  )
}

export default App