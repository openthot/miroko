import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import Razorpay from 'razorpay'

export async function POST(req) {
  try {
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id
    } = await req.json()

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(body.toString())
      .digest('hex')
    
    if (expectedSignature === razorpay_signature) {
      if (user_id) {
         const razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpaySecret })
         const order = await razorpay.orders.fetch(razorpay_order_id)

         const trustedAmount = order.amount / 100
         const trustedFeature = order.notes?.feature

         if (!trustedFeature) {
           return NextResponse.json({ success: false, error: 'Feature details missing from order.' }, { status: 400 })
         }

         await supabase.from('transactions').insert({
           user_id,
           amount: trustedAmount,
           currency: 'INR',
           feature_purchased: trustedFeature,
           razorpay_order_id,
           razorpay_payment_id,
           status: 'completed'
         })

         if (trustedFeature === 'premium_tier') {
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
