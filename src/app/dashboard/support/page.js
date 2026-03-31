import { createClient } from '@/utils/supabase/server'
import AiSearch from './AiSearch.client'

const ADMIN_DOCS = [
  {
    title: 'Project Pipeline Overview',
    content: "Miroko uses a strict sequential music production assembly line. When an Admin initiates a Project Pipeline, a master Project record is created, and the first stage ('Composer') is spawned. The project flows strictly from Composer -> Sound Designer -> Arranger -> FX Mixer -> Mastering Engineer. Projects will only become visible to the next specialization once you (the Admin) review the submitted files and click 'Advance to Next Stage' on the task board."
  },
  {
    title: 'Custom Standalone Tasks',
    content: "If you need an isolated edit outside the main pipeline (e.g., an emergency vocal harmony edit), use the 'Create Custom Standalone Task' interface. You can check multiple target specializations. Whichever producer from those selected groups accepts it first will lock the task to themselves. This completely bypasses the sequential pipeline."
  },
  {
    title: 'Producer Provisioning & Registration',
    content: "You can instantly provision user accounts from the 'Manage Users' tab by entering their email, a temporary password, and selecting their exact specialization. Alternatively, users can create their own accounts via the public sign-up page, but they must complete the mandatory /onboarding flow to select their role and legally agree to the Soundwave Music Group Terms of Service."
  },
  {
    title: 'Razorpay Revenue & Payment Ledger',
    content: "Miroko monetizes producers via the 'Artist Tier' upgrades and a-la-carte Deadline Extensions. The backend automatically cryptographically verifies all incoming live INR payments through Razorpay. You can track this in the 'Payments' tab. Clicking a producer's name expands their lifetime revenue history and premium status, linked directly to their specific Razorpay Order IDs. For outgoing payments (paying producers for their work), their PayPal/Crypto wallet preferences are listed directly above the ledger."
  },
  {
    title: 'Delay Penalties system',
    content: "Standard users have a strict 3-day deadline to submit assigned tasks. If they fail to deliver on time, the system automatically begins deducting a $1 penalty per day from their ultimate payout, which is visible on the 'Completed' task status. Premium users (Artist Tier) are completely exempt from all deadlines and delay penalties."
  },
  {
    title: 'Managing Active Projects',
    content: "On the Tasks board, Admins can manually 'Delete' a project entirely if it is cancelled, which cascades and permanently deletes all associated tasks and uploaded stems. Admins can also force a project to be 'Marked as Completed', instantly finalizing it and removing it from the Active Projects board."
  },
  {
    title: 'Dashboard Analytics & Statistics',
    content: "The main Dashboard automatically calculates your total active workforce, active projects, ongoing tasks, and new producer hires over the last 30 days. It renders this data with glassmorphism Sparkline trends so you can visually gauge productivity and platform growth at a glance."
  }
]

const PRODUCER_DOCS = [
  {
    title: 'Accepting and Locking Tasks',
    content: "When an Admin creates a task that matches your precise Specialization (e.g., 'FX Mixer'), it will appear in your 'Available Projects' tab. The first producer to click 'Accept & Lock' claims the task exclusively. No one else can work on it, and it immediately moves to your 'My Assigned Tasks' queue."
  },
  {
    title: 'Deadlines and Delay Penalties',
    content: "Standard tier producers must deliver accepted tasks within 3 days. After 3 days, you incur a $1 per day delay penalty against your final payout. You can purchase a Deadline Extension on the Pricing page if you need more time. Note: Premium Artist Tier producers do not have deadlines and never incur penalties."
  },
  {
    title: 'Submitting Your Work',
    content: "Once you lock a task, download the Admin's provided stems or instructions via the 'Download Resources' button. When finished, provide a secure Dropbox or Google Drive link to your bounced stems in the 'Submit Work' input and click Submit. An Admin will review your work."
  },
  {
    title: 'Monthly Capacity Limits',
    content: "Free standard accounts are capped at accepting 2 Active Projects per month to prevent task-hoarding. If you exceed this, you must complete your current assignments before accepting more. Premium Artist Tier members have their limit permanently expanded to 5 concurrent projects."
  },
  {
    title: 'Upgrading to the Premium Artist Tier',
    content: "You can upgrade your account in the /pricing page. Using the secure Razorpay integration, you can pay via UPI, Credit Card, or Netbanking. The Premium Tier removes all delay penalties, expands your monthly capacity, adds a coveted Blue/Gold Verified Badge next to your profile, and unlocks the complete global catalogue of tasks regardless of your specialization."
  },
  {
    title: 'Getting Paid',
    content: "In the 'Payments' tab, you must update your Payment Preferences to include your PayPal QR code link, Bank Details, or Cryptocurrency wallet address. Once tasks are submitted and approved, payouts are processed directly utilizing your saved preference."
  },
  {
    title: 'Profile Customization & Onboarding',
    content: "You can change your Artist Name, Specialization, and Avatar (via a direct image URL) in the 'My Profile' tab. Remember that by utilizing Miroko, you have agreed that all produced works are released exclusively under Soundwave Music Group / Universal Group."
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
