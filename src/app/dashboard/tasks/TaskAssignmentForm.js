'use client'

import { useState, useMemo } from 'react'

export default function TaskAssignmentForm({ producers, createTask }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProducerId, setSelectedProducerId] = useState(producers?.[0]?.id || '')
  const [isOpen, setIsOpen] = useState(false)

  const filteredProducers = useMemo(() => {
    if (!searchTerm) return producers
    return producers.filter(p => 
      (p.name || 'Unnamed').toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [producers, searchTerm])

  const selectedProducer = producers.find(p => p.id === selectedProducerId)

  return (
    <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px' }}>
      <h2 style={{ marginBottom: '24px' }}>Assign New Task</h2>
      <form action={createTask} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="input-group" style={{ marginBottom: 0, position: 'relative' }}>
          <label>Assign To Producer</label>
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setIsOpen(!isOpen)}
              className="input-control" 
              style={{ 
                cursor: 'pointer', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'var(--secondary)'
              }}
            >
              <span>{selectedProducer?.name || 'Select a producer'}</span>
              <svg 
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              >
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </div>

            {isOpen && (
              <div 
                className="glass-panel" 
                style={{ 
                  position: 'absolute', 
                  top: 'calc(100% + 8px)', 
                  left: 0, 
                  right: 0, 
                  zIndex: 50, 
                  padding: '12px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}
              >
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="Search producers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  style={{ 
                    marginBottom: '12px', 
                    padding: '8px 12px', 
                    fontSize: '14px', 
                    width: '100%' 
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {filteredProducers.length > 0 ? (
                    filteredProducers.map(p => (
                      <div 
                        key={p.id} 
                        className={`nav-link ${selectedProducerId === p.id ? 'active' : ''}`}
                        style={{ cursor: 'pointer', opacity: 1 }}
                        onClick={() => {
                          setSelectedProducerId(p.id)
                          setIsOpen(false)
                          setSearchTerm('')
                        }}
                      >
                        {p.name || 'Unnamed'}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '8px', color: '#86868b', fontSize: '14px' }}>No producers found</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <input type="hidden" name="producer_id" value={selectedProducerId} required />
        </div>

        <div className="input-group" style={{ marginBottom: 0 }}>
          <label>Task Title</label>
          <input name="title" className="input-control" required />
        </div>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label>Instructions / Description</label>
          <textarea name="description" className="input-control" rows="3"></textarea>
        </div>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label>Refurbished File Link (URL)</label>
          <input name="file_url" className="input-control" placeholder="https://..." />
        </div>
        <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Assign Task</button>
      </form>
      
      {/* Click outside to close custom dropdown */}
      {isOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }} 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
