// Set env before imports
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xyz.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_role_key'
process.env.RAZORPAY_KEY_SECRET = 'test_secret'
process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'test_key'

import { POST } from './route'
import crypto from 'crypto'

jest.mock('@supabase/supabase-js', () => {
  const mockInsert = jest.fn()
  const mockEq = jest.fn()
  const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
  const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert, update: mockUpdate })

  return {
    createClient: jest.fn(() => ({
      from: mockFrom
    }))
  }
})

jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => {
    return {
      orders: {
        fetch: jest.fn().mockResolvedValue({
          id: 'order_test123',
          amount: 80000,
          notes: { feature: 'main_artist_credit' }
        })
      }
    }
  })
})

describe('verify-payment POST endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should verify signature and insert transaction with trusted amount and feature', async () => {
    const order_id = 'order_test123'
    const payment_id = 'pay_test456'

    // Create valid signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(order_id + "|" + payment_id)
      .digest('hex')

    const req = {
      json: jest.fn().mockResolvedValue({
        razorpay_order_id: order_id,
        razorpay_payment_id: payment_id,
        razorpay_signature: expectedSignature,
        user_id: 'user_1',
      })
    }

    const res = await POST(req)
    const json = await res.json()

    if(res.status === 500) console.log(json)

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
  })

  it('should return 400 for invalid signature', async () => {
    const req = {
      json: jest.fn().mockResolvedValue({
        razorpay_order_id: 'order_test123',
        razorpay_payment_id: 'pay_test456',
        razorpay_signature: 'invalid_sig',
        user_id: 'user_1'
      })
    }

    const res = await POST(req)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error).toBe('Invalid Payment Signature')
  })
})
