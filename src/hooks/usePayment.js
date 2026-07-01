import { useState } from 'react'

export function usePayment(profile, setProfile) {
  const [loadingFeature, setLoadingFeature] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handlePayment = async (amountInr, featureName) => {
    if (!profile) {
      setError('You must be logged in to purchase features.')
      return
    }

    setLoadingFeature(featureName)
    setError('')
    setMessage('')

    try {
      // 1. Create order on server
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInr, currency: 'INR', feature: featureName, user_id: profile.id })
      })
      const order = await res.json()

      if (order.error) {
        throw new Error(order.error)
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Soundwave Music Group',
        description: `Purchase: ${featureName.replace('_', ' ').toUpperCase()}`,
        order_id: order.id,
        handler: async function (response) {
           // 3. Verify Payment
           const verifyRes = await fetch('/api/verify-payment', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               razorpay_order_id: response.razorpay_order_id,
               razorpay_payment_id: response.razorpay_payment_id,
               razorpay_signature: response.razorpay_signature,
               user_id: profile.id,
               feature: featureName,
               amount: order.amount
             })
           })
           const verifyData = await verifyRes.json()
           if (verifyData.success) {
             setMessage(`Payment successful! Enjoy your new ${featureName.replace('_', ' ')}.`)
             if (featureName === 'premium_tier') setProfile(prev => ({ ...prev, tier: 'premium' }))
           } else {
             setError(verifyData.error || 'Payment verification failed.')
           }
        },
        prefill: {
          name: profile.name || '',
          email: profile.email || '',
        },
        theme: {
          color: '#ffffff'
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response){
         setError(response.error.description || 'Payment Failed.')
      })
      rzp.open()

    } catch (err) {
      setError(err.message || 'Something went wrong initiating the payment.')
    } finally {
      setLoadingFeature(null)
    }
  }

  return { loadingFeature, message, error, handlePayment }
}
