export default function ALaCarteSection({ loadingFeature, handlePayment }) {
  return (
    <div className="glass-panel" style={{ padding: '40px', margin: '0 20px' }}>
      <h2 style={{ marginBottom: 24, fontSize: 28, letterSpacing: '-0.02em', textAlign: 'center' }}>À La Carte Feature Access</h2>
      <p style={{ textAlign: 'center', color: '#86868b', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px auto' }}>Need a specific feature without the monthly commitment? Purchase privileges securely via Razorpay.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
        <div style={{ padding: 24, background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>₹400</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Deadline Extension</div>
          <p style={{ fontSize: 13, color: '#86868b', marginBottom: 24 }}>Add extra time to your current project stage without accumulating day-by-day penalties.</p>
          <button disabled={loadingFeature} onClick={() => handlePayment(400, 'deadline_extension')} className="btn btn-secondary" style={{ width: '100%', padding: '8px 0', fontSize: 13 }}>Pay via UPI</button>
        </div>

        <div style={{ padding: 24, background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>₹160</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Increased Capacity</div>
          <p style={{ fontSize: 13, color: '#86868b', marginBottom: 24 }}>Increase your monthly cap to 5 projects for the current billing cycle.</p>
          <button disabled={loadingFeature} onClick={() => handlePayment(160, 'capacity_increase')} className="btn btn-secondary" style={{ width: '100%', padding: '8px 0', fontSize: 13 }}>Pay via UPI</button>
        </div>

        <div style={{ padding: 24, background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning)', marginBottom: 8 }}>₹80</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Project Withdrawal</div>
          <p style={{ fontSize: 13, color: '#86868b', marginBottom: 24 }}>Mandatory fee if you fail to complete or choose to withdraw from an accepted project.</p>
          <button disabled={loadingFeature} onClick={() => handlePayment(80, 'project_withdrawal')} className="btn btn-secondary" style={{ width: '100%', padding: '8px 0', fontSize: 13, borderColor: 'var(--warning)' }}>Pay penalty</button>
        </div>

        <div style={{ padding: 24, background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 8px', background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700, borderBottomLeftRadius: 8 }}>POPULAR</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>₹800</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Main Artist Credit</div>
          <p style={{ fontSize: 13, color: '#86868b', marginBottom: 24 }}>Receive Main Artist placement on a single official release.</p>
          <button disabled={loadingFeature} onClick={() => handlePayment(800, 'main_artist_credit')} className="btn btn-primary" style={{ width: '100%', padding: '8px 0', fontSize: 13 }}>Buy Credit</button>
        </div>
      </div>
    </div>
  )
}
