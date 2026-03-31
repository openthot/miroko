import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const razorpaySecret = process.env.RAZORPAY_KEY_SECRET

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id,
      feature,
      amount
    } = await req.json()

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(body.toString())
      .digest('hex')
    
    if (expectedSignature === razorpay_signature) {
      if (user_id) {
         await supabase.from('transactions').insert({
           user_id,
           amount: amount / 100, 
           currency: 'INR',
           feature_purchased: feature,
           razorpay_order_id,
           razorpay_payment_id,
           status: 'completed'
         })

         if (feature === 'premium_tier') {
           await supabase.from('profiles').update({ tier: 'premium' }).eq('id', user_id)
         }
      }

      return NextResponse.json({ success: true, message: 'Payment verified successfully.' })
    } else {
      return NextResponse.json({ success: false, error: 'Invalid Payment Signature' }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
