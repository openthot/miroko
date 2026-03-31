import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(req) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    })

    const { amount, currency = 'INR', receipt = 'rcpt_' + Date.now() } = await req.json()

    // Create an order via Razorpay SDK
    const options = {
      amount: amount * 100, // INR in paise
      currency,
      receipt
    }

    const order = await razorpay.orders.create(options)
    return NextResponse.json(order)
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Payment Order Failed' }, { status: 500 })
  }
}
