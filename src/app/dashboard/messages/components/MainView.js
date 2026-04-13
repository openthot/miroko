export default function MainView({ activeRecipient, messages, user, isAdmin, sendMessage }) {
  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {activeRecipient ? (
        <>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem' }}>{activeRecipient.name}</h2>
            {activeRecipient.id === 'all' && <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>BROADCAST CHANNEL</span>}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map(m => {
              const isMe = m.sender_id === user.id
              return (
                <div key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: isMe ? 'var(--primary)' : 'var(--secondary)',
                    color: isMe ? '#fff' : 'inherit',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                  }}>
                    <p style={{ fontSize: '15px', lineHeight: '1.4' }}>{m.content}</p>
                  </div>
                  <div style={{ fontSize: '10px', color: '#86868b', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                    {!isMe && <span style={{ fontWeight: '600', marginRight: '4px' }}>{m.sender?.name}</span>}
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )
            })}
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#86868b', marginTop: '20%' }}>No messages yet. Say hello!</div>
            )}
          </div>

          {(activeRecipient.id !== 'all' || isAdmin) && (
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
              <form action={sendMessage} style={{ display: 'flex', gap: '1rem' }}>
                <input type="hidden" name="receiver_id" value={activeRecipient.id} />
                <input
                  name="content"
                  className="input-control"
                  placeholder="Type a message..."
                  required
                  autoComplete="off"
                  style={{ flex: 1 }}
                />
                <button className="btn btn-primary" type="submit">Send</button>
              </form>
            </div>
          )}
        </>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#86868b', flexDirection: 'column', gap: '1rem' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  )
}
