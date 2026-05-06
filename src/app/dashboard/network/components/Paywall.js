'use client'

import { useState } from 'react'

export default function Paywall({ onPaymentSuccess, price, user_id }) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: price, feature: 'social_unlock' })
      })
      const order = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Miroko Social Network",
        description: "Unlock Network Features",
        order_id: order.id,
        handler: async function (response) {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: user_id
            })
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            onPaymentSuccess()
          } else {
            alert("Payment Verification Failed")
          }
        },
        theme: { color: "#0070f3" }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      console.error(e)
      alert("Error initiating payment")
    }
    setLoading(false)
  }

  return (
    <div className="paywall-container" style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
      <h2>Unlock Network Access</h2>
      <p style={{ margin: '16px 0', color: 'var(--text-secondary)' }}>
        Connect with other producers, see what they're working on, and send direct messages.
      </p>
      <button
        className="button primary"
        onClick={handlePayment}
        disabled={loading}
        style={{ fontSize: '1.2rem', padding: '12px 24px' }}
      >
        {loading ? 'Processing...' : `Unlock for ₹${price}`}
      </button>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  )
}
