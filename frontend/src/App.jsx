import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [sqlResult, setSqlResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!query.trim()) {
      setError('Please enter a query')
      return
    }

    setLoading(true)
    setError('')
    setSqlResult('')

    try {
      // Call backend API
      const response = await axios.post('http://localhost:5000/api/generate-sql', {
        query: query
      })

      setSqlResult(response.data.generatedSQL)
    } catch (err) {
      setError('Failed to generate SQL. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <header>
        <h1>🤖 QueryGen AI</h1>
        <p>Convert Natural Language to SQL</p>
      </header>

      <main>
        <div className="input-section">
          <label>Enter your query in plain English:</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Show all users from Delhi"
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Generating...' : 'Generate SQL'}
          </button>
        </div>

        {error && (
          <div className="error-section">
            <p>{error}</p>
          </div>
        )}

        {sqlResult && (
          <div className="output-section">
            <h3>Generated SQL:</h3>
            <code>{sqlResult}</code>
          </div>
        )}
      </main>
    </div>
  )
}

export default App