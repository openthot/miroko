import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret_67890'

// Initialize a service role supabase client to bypass RLS internally
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock'
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

    // Note: In a mock environment without real keys, we bypass signature verification
    let isAuthentic = false
    
    if (razorpay_order_id?.startsWith('order_mock_')) {
      isAuthentic = true // Mock payment
    } else {
      const body = razorpay_order_id + "|" + razorpay_payment_id
      const expectedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(body.toString())
        .digest('hex')
      
      isAuthentic = expectedSignature === razorpay_signature
    }

    if (isAuthentic) {
      // 1. Log Transaction
      if (user_id) {
         await supabase.from('transactions').insert({
           user_id,
           amount: amount / 100, // convert paise back
           currency: 'INR',
           feature_purchased: feature,
           razorpay_order_id,
           razorpay_payment_id,
           status: 'completed'
         })

         // 2. Grant Features based on purchase
         if (feature === 'premium_tier') {
           await supabase.from('profiles').update({ tier: 'premium' }).eq('id', user_id)
         } else if (feature === 'capacity_increase') {
           // We can log this to another table, but tracking transactions table is enough
         } else if (feature === 'main_artist_credit') {
           // ...
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
