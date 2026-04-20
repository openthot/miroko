import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { FEATURE_PRICES } from '@/utils/pricing'

export async function POST(req) {
  try {
    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET

    if (!key_id || !key_secret) {
      throw new Error('Razorpay keys are missing from environment variables. Please restart your dev server if you recently added them.')
    }

    const razorpay = new Razorpay({ key_id, key_secret })

    const { feature, currency = 'INR', receipt = 'rcpt_' + Date.now() } = await req.json()

    if (!feature || !FEATURE_PRICES[feature]) {
      return NextResponse.json({ error: 'Invalid feature requested.' }, { status: 400 })
    }

    const expectedAmount = FEATURE_PRICES[feature]

    // Create an order via Razorpay SDK
    const options = {
      amount: expectedAmount * 100, // INR in paise
      currency,
      receipt,
      notes: { feature }
    }

    const order = await razorpay.orders.create(options)
    return NextResponse.json(order)
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Payment Order Failed' }, { status: 500 })
  }
}
