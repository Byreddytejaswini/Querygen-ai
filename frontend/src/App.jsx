import { useState } from 'react'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [sqlResult, setSqlResult] = useState('')

  const handleSubmit = () => {
    // Temporary mock - we'll connect to backend later
    setSqlResult(`SELECT * FROM users WHERE condition = '${query}';`)
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
          />
          <button onClick={handleSubmit}>Generate SQL</button>
        </div>

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