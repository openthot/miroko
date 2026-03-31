'use client'

import { useState } from 'react'

export default function LedgerTable({ transactions }) {
  const [expandedUser, setExpandedUser] = useState(null)

  // Group transactions by user_id for aggregated stats
  const userLedger = transactions.reduce((acc, tx) => {
    if (!acc[tx.user_id]) {
       acc[tx.user_id] = {
         user: tx.profiles,
         total_spent: 0,
         history: []
       }
    }
    acc[tx.user_id].total_spent += Number(tx.amount)
    acc[tx.user_id].history.push(tx)
    return acc
  }, {})

  const users = Object.keys(userLedger)

  if (users.length === 0) {
    return <p style={{ color: '#86868b', marginTop: '1rem' }}>No incoming transaction data found.</p>
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--surface-border)' }}>
            <th style={{ padding: '14px 16px' }}>User Name</th>
            <th style={{ padding: '14px 16px' }}>Lifetime Spent</th>
            <th style={{ padding: '14px 16px' }}>Purchases</th>
          </tr>
        </thead>
        <tbody>
          {users.map(uid => {
            const data = userLedger[uid]
            const isExpanded = expandedUser === uid
            return (
              <React.Fragment key={uid}>
                <tr 
                  onClick={() => setExpandedUser(isExpanded ? null : uid)} 
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                >
                  <td style={{ padding: '14px 16px', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {data.user?.name || 'Unknown'} 
                    {data.user?.tier === 'premium' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--primary)" xmlns="http://www.w3.org/2000/svg" title="Verified Premium"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 'bold' }}>₹{data.total_spent}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#86868b' }}>{data.history.length} events {isExpanded ? '▲' : '▼'}</td>
                </tr>
                
                {isExpanded && (
                  <tr>
                    <td colSpan="3" style={{ padding: '24px 16px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid var(--surface-border)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '12px', color: '#86868b', marginBottom: '4px' }}>Artist Alias</div>
                          <div style={{ fontWeight: '500' }}>{data.user?.artist_name || 'N/A'}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '12px', color: '#86868b', marginBottom: '4px' }}>Email Contact</div>
                          <div style={{ fontWeight: '500' }}>{data.user?.email || 'N/A'}</div>
                        </div>
                      </div>
                      
                      <h4 style={{ marginBottom: '16px', color: '#86868b' }}>Transaction History</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {data.history.map(tx => (
                          <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '13px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <strong style={{ color: 'var(--foreground)' }}>{tx.feature_purchased.replace('_', ' ').toUpperCase()}</strong>
                              <span style={{ color: '#86868b', fontFamily: 'monospace' }}>OrderID: {tx.razorpay_order_id || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                              <strong style={{ color: tx.status === 'completed' ? '#34c759' : '#ff9500' }}>₹{tx.amount}</strong>
                              <span style={{ color: '#86868b' }}>{new Date(tx.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
