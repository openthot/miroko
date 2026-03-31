import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

// Using mock/test keys for prototype. In production, move to .env.local
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key_12345',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret_67890',
})

export async function POST(req) {
  try {
    const { amount, currency = 'INR', receipt = 'receipt_1' } = await req.json()

    // Create an order via Razorpay SDK
    const options = {
      amount: amount * 100, // Razorpay takes amount in paise (1 INR = 100 paise)
      currency,
      receipt
    }

    // Since we may not actually have a valid Razorpay key yet if env vars aren't set,
    // we fallback to returning a mock order id for the prototype if razorpay fails, 
    // or if the razorpay SDK initialization rejects the fake key.
    try {
      if (razorpay.key_id.includes('mock')) throw new Error('Mock key')
      const order = await razorpay.orders.create(options)
      return NextResponse.json(order)
    } catch (apiErr) {
      console.warn('Falling back to mock order (Razorpay keys not configured):', apiErr.message)
      return NextResponse.json({
        id: 'order_mock_' + Math.floor(Math.random() * 1000000),
        amount: options.amount,
        currency: options.currency,
        mock: true
      })
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
