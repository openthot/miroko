import { createClient, getUserAndProfile } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import LedgerTable from './LedgerTable'

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { user, profile } = await getUserAndProfile()
  const isAdmin = profile?.role === 'admin'

  const { data: producers } = await supabase.from('profiles').select('id, name, payment_method, payment_details').eq('role', 'producer')
  
  // Fetch incoming transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, profiles(name, email, artist_name, tier)')
    .order('created_at', { ascending: false })


  async function updatePaymentDetails(formData) {
    'use server'
    const supabase = await createClient()
    const { user } = await getUserAndProfile()
    
    await supabase.from('profiles').update({
      payment_method: formData.get('payment_method'),
      payment_details: formData.get('payment_details'),
    }).eq('id', user.id)
    
    revalidatePath('/dashboard/payments')
  }

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Payments</h1>
      </header>

      {!isAdmin ? (
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ marginBottom: '24px' }}>Your Payment Preferences</h2>
          <form action={updatePaymentDetails} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Preferred Payment Medium</label>
              <select name="payment_method" className="input-control" defaultValue={profile?.payment_method || 'paypal'} required>
                <option value="paypal">PayPal QR</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Payment Details / QR Code Link</label>
              <textarea name="payment_details" className="input-control" rows="3" defaultValue={profile?.payment_details || ''} placeholder="Provide your PayPal email or link to your QR code..." required></textarea>
            </div>
            <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>Save Preferences</button>
          </form>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '40px' }}>
          <h2 style={{ marginBottom: '24px' }}>Producer Payment Details</h2>
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--surface-border)' }}>
                <th style={{ padding: '14px 16px' }}>Producer</th>
                <th style={{ padding: '14px 16px' }}>Method</th>
                <th style={{ padding: '14px 16px' }}>Details / Link</th>
              </tr>
            </thead>
            <tbody>
              {producers?.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 16px' }}>{p.name || 'Unnamed'}</td>
                  <td style={{ padding: '14px 16px', textTransform: 'capitalize' }}>{p.payment_method || 'Not Set'}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '14px' }}>{p.payment_details || 'N/A'}</td>
                </tr>
              ))}
              {(!producers || producers.length === 0) && (
                <tr>
                  <td colSpan="3" style={{ padding: '14px 16px', textAlign: 'center', color: '#86868b' }}>No producers found.</td>
                </tr>
              )}
            </tbody>
          </table>

          <hr style={{ margin: '40px 0', borderColor: 'var(--surface-border)', opacity: 0.5 }} />

          <h2 style={{ marginBottom: '8px' }}>Incoming Revenue Ledger (Razorpay)</h2>
          <p style={{ color: '#86868b', marginBottom: '24px', fontSize: '14px' }}>Click on a user to expand their full commercial history and premium status.</p>
          <LedgerTable transactions={transactions || []} />
        </div>
      )}
    </div>
  )
}
