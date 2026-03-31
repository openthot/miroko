'use client'

import { useState } from 'react'

export default function AiSearch({ docs }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    
    // Simulate AI processing delay
    setTimeout(() => {
      const keywords = query.toLowerCase().split(' ').filter(w => w.length > 2)
      
      let matches = []
      docs.forEach(section => {
        let score = 0
        const textToSearch = (section.title + ' ' + section.content).toLowerCase()
        keywords.forEach(kw => {
          if (textToSearch.includes(kw)) score++
        })
        if (score > 0) {
          matches.push({ ...section, score })
        }
      })

      // Sort by best match
      matches.sort((a, b) => b.score - a.score)
      
      setResults(matches)
      setIsSearching(false)
    }, 600) // Synthesizing response time
  }

  return (
    <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', border: '1px solid var(--primary)', background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.05) 0%, rgba(0, 113, 227, 0) 100%)' }}>
      <h2 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--primary)" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        AI Support Assistant
      </h2>
      <p style={{ color: '#86868b', marginBottom: '24px', fontSize: '14px' }}>Ask me anything about the Miroko platform. I will instantly scan the documentation and return the exact answer you need.</p>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
        <input 
          type="text" 
          className="input-control" 
          placeholder="E.g., How do I create a custom task?" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          style={{ flex: 1, padding: '12px 16px', fontSize: '15px' }}
        />
        <button type="submit" className="btn btn-primary" disabled={isSearching} style={{ padding: '12px 24px' }}>
          {isSearching ? 'Thinking...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ color: '#86868b', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Match Results</h4>
          {results.map((r, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--foreground)' }}>{r.title}</h3>
              <p style={{ color: '#86868b', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{r.content}</p>
            </div>
          ))}
        </div>
      )}
      
      {results.length === 0 && query && !isSearching && (
        <div style={{ marginTop: '24px', textAlign: 'center', color: '#86868b' }}>
          I couldn't find a highly relevant answer for that query. Try using different keywords or contact Admin support directly!
        </div>
      )}
    </div>
  )
}
