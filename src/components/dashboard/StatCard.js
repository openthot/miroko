import Sparkline from './Sparkline'

export default function StatCard({ label, value, trend, trendValue, sparkData, color }) {
  const isPositive = trend === 'up'
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ color: '#86868b', fontSize: '0.9rem', fontWeight: '500' }}>{label}</span>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: '600',
          color: isPositive ? '#34c759' : '#ff3b30',
          background: isPositive ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 59, 48, 0.1)',
          padding: '2px 8px',
          borderRadius: '980px'
        }}>
          {isPositive ? '↑' : '↓'} {trendValue}%
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: '600', letterSpacing: '-0.02em' }}>{value}</span>
        <div style={{ marginBottom: '8px' }}>
          <Sparkline data={sparkData} color={color} />
        </div>
      </div>
    </div>
  )
}
