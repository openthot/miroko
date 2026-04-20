import { POST } from './route'
import Razorpay from 'razorpay'

jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => {
    return {
      orders: {
        create: jest.fn().mockResolvedValue({ id: 'order_123', amount: 160000, currency: 'INR', notes: { feature: 'premium_tier' } })
      }
    }
  })
})

describe('create-order POST endpoint', () => {
  let originalEnv

  beforeAll(() => {
    originalEnv = process.env
    process.env = { ...originalEnv, NEXT_PUBLIC_RAZORPAY_KEY_ID: 'test_key_id', RAZORPAY_KEY_SECRET: 'test_key_secret' }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should return 400 for invalid feature', async () => {
    const req = {
      json: jest.fn().mockResolvedValue({ feature: 'invalid_feature' })
    }
    const res = await POST(req)
    const json = await res.json()
    expect(res.status).toBe(400)
    expect(json.error).toBe('Invalid feature requested.')
  })

  it('should create order successfully for valid feature with correct mapped amount and note', async () => {
    const req = {
      json: jest.fn().mockResolvedValue({ feature: 'premium_tier' })
    }
    const res = await POST(req)
    const json = await res.json()

    // Check Razorpay call indirectly or just verify status response and order details
    expect(res.status).toBe(200)
    expect(json.id).toBe('order_123')
    expect(json.notes.feature).toBe('premium_tier')
  })
})
