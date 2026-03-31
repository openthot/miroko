import { createClient } from '@/utils/supabase/server'
import AiSearch from './AiSearch.client'

const ADMIN_DOCS = [
  {
    title: 'Project Pipeline Assembly',
    content: "When you 'Initiate Project Pipeline', a new Project is created alongside the first 'Composer' task. This locks into a strict sequential chain: Composer -> Sound Designer -> Arranger -> FX Mixer -> Mastering Engineer. To advance the project, an admin must click 'Advance to [Next Stage]' after reviewing submitted files."
  },
  {
    title: 'Custom Standalone Tasks',
    content: "If you need an isolated edit outside the main pipeline, use 'Create Custom Standalone Task'. You can check multiple target specializations. Whichever producer (from the selected groups) accepts it first will lock the task to themselves."
  },
  {
    title: 'Provisioning New Users',
    content: "Administrators can instantly provision user accounts from the 'Users' tab. Provisioned accounts automatically bypass the /onboarding flow and have their Specialization assigned immediately."
  },
  {
    title: 'Razorpay Revenue Ledger',
    content: "The Payments tab contains the incoming revenue ledger. It tracks all live payments made by users upgrading to the Premium Artist Tier or purchasing Deadline Extensions. Click a name to expand lifetime history."
  },
  {
    title: 'Delay Penalties',
    content: "Standard users accumulate a $1 penalty per day if they miss their 3-day deadline limit on a task. Premium members are fully exempt from delay penalties."
  }
]

const PRODUCER_DOCS = [
  {
    title: 'Accepting and Locking Tasks',
    content: "On your dashboard, 'Available Projects' lists work that fits your specialization. The first producer to click 'Accept & Lock' claims the task exclusively. No one else can work on it."
  },
  {
    title: 'Deadlines and Delay Penalties',
    content: "You have 3 days to deliver an accepted task. After 3 days, standard producers incur a $1 per day penalty against their final payout. Premium Artist Tier producers do not have deadlines."
  },
  {
    title: 'Monthly Capacity Limits',
    content: "Standard accounts are capped at accepting 2 Active Projects per month. If you exceed this, you must complete your current assignments. Artist Tier members can accept up to 5 concurrent projects."
  },
  {
    title: 'Upgrading to Premium Artist Tier',
    content: "You can upgrade your account in the /pricing page using Razorpay. The Premium Tier removes all delay penalties, adds a coveted Verified Badge next to your profile, and unlocks the complete global catalogue of tasks regardless of your specialization."
  },
  {
    title: 'Getting Paid',
    content: "Provide your PayPal, Crypto, or Bank Details in the 'Payments' tab. Once tasks are submitted and approved by an Admin, payouts are manually dispatched down the pipeline."
  }
]

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  const isAdmin = profile?.role === 'admin'
  const docs = isAdmin ? ADMIN_DOCS : PRODUCER_DOCS

  return (
    <div className="animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">{isAdmin ? 'Admin Support Center' : 'Producer Support Center'}</h1>
      </header>

      <AiSearch docs={docs} />

      <div className="glass-panel" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '24px' }}>Documentation Directory</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {docs.map((doc, i) => (
            <div key={i} style={{ padding: '24px', background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>{doc.title}</h3>
              <p style={{ color: '#86868b', lineHeight: '1.5', fontSize: '14px' }}>{doc.content}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '32px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--surface-border)' }}>
        <h2 style={{ marginBottom: '12px' }}>Still need help?</h2>
        <p style={{ color: '#86868b', marginBottom: '24px' }}>
          {isAdmin ? "For severe infrastructure or server-tier escalations, directly contact the primary systems administrator." : "For account issues or dispute resolutions, contact the platform administrators."}
        </p>
        <a href={isAdmin ? "mailto:dramrxt@proton.me" : "mailto:support@miroko.app"} className="btn btn-primary" style={{ display: 'inline-flex' }}>
          {isAdmin ? "Email dramrxt@proton.me" : "Contact Admin Support"}
        </a>
      </div>
    </div>
  )
}
