import { POST } from './route';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Mock Next.js NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: jest.fn((body, init) => {
        return {
          body,
          status: init?.status || 200,
        };
      }),
    },
  };
});

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const mockEq = jest.fn();
  const mockUpdate = jest.fn(() => ({ eq: mockEq }));
  const mockInsert = jest.fn();
  const mockFrom = jest.fn(() => ({
    insert: mockInsert,
    update: mockUpdate,
  }));

  return {
    createClient: jest.fn(() => ({
      from: mockFrom,
    })),
  };
});

// We don't necessarily need to mock crypto if we set a dummy secret, but the route has top-level evaluation
// of process.env.RAZORPAY_KEY_SECRET, so let's mock crypto to make tests isolated and deterministic without env setup.
jest.mock('crypto', () => {
  return {
    createHmac: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mocked_valid_signature'),
  };
});

describe('POST /api/verify-payment', () => {
  let req;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default request mock
    req = {
      json: jest.fn().mockResolvedValue({
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'mocked_valid_signature',
        user_id: 'user_123',
        feature: 'some_feature',
        amount: 10000,
      }),
    };
  });

  it('should return success and not call Supabase when signature is valid but no user_id is provided', async () => {
    req.json.mockResolvedValueOnce({
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_123',
      razorpay_signature: 'mocked_valid_signature',
      // no user_id
      feature: 'some_feature',
      amount: 10000,
    });

    const response = await POST(req);

    const supabase = createClient();

    expect(response.body).toEqual({ success: true, message: 'Payment verified successfully.' });
    expect(response.status).toBe(200);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should insert transaction but not update profile when feature is non-premium', async () => {
    // Uses the default `req` from beforeEach (with user_id and feature='some_feature')
    const response = await POST(req);

    const supabase = createClient();
    const mockFrom = supabase.from;
    const mockInsert = mockFrom().insert;
    const mockUpdate = mockFrom().update;

    expect(response.body).toEqual({ success: true, message: 'Payment verified successfully.' });
    expect(response.status).toBe(200);

    expect(mockFrom).toHaveBeenCalledWith('transactions');
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user_123',
      amount: 100, // 10000 / 100
      currency: 'INR',
      feature_purchased: 'some_feature',
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_123',
      status: 'completed',
    });

    // It should not call update for 'profiles' since feature !== 'premium_tier'
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should insert transaction and update profile when feature is premium_tier', async () => {
    req.json.mockResolvedValueOnce({
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_123',
      razorpay_signature: 'mocked_valid_signature',
      user_id: 'user_123',
      feature: 'premium_tier',
      amount: 10000,
    });

    const response = await POST(req);

    const supabase = createClient();
    const mockFrom = supabase.from;
    const mockInsert = mockFrom().insert;
    const mockUpdate = mockFrom().update;
    const mockEq = mockUpdate().eq;

    expect(response.body).toEqual({ success: true, message: 'Payment verified successfully.' });
    expect(response.status).toBe(200);

    // First call to `from` is for transactions
    expect(mockFrom).toHaveBeenCalledWith('transactions');
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user_123',
      amount: 100, // 10000 / 100
      currency: 'INR',
      feature_purchased: 'premium_tier',
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_123',
      status: 'completed',
    });

    // Second call to `from` is for profiles
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpdate).toHaveBeenCalledWith({ tier: 'premium' });
    expect(mockEq).toHaveBeenCalledWith('id', 'user_123');
  });

  it('should return 400 error when signature is invalid', async () => {
    req.json.mockResolvedValueOnce({
      razorpay_order_id: 'order_123',
      razorpay_payment_id: 'pay_123',
      razorpay_signature: 'invalid_signature',
      user_id: 'user_123',
      feature: 'some_feature',
      amount: 10000,
    });

    const response = await POST(req);

    const supabase = createClient();

    expect(response.body).toEqual({ success: false, error: 'Invalid Payment Signature' });
    expect(response.status).toBe(400);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should return 500 error when an internal error occurs', async () => {
    req.json.mockRejectedValueOnce(new Error('Internal JSON parsing error'));

    const response = await POST(req);

    const supabase = createClient();

    expect(response.body).toEqual({ error: 'Internal JSON parsing error' });
    expect(response.status).toBe(500);
    expect(supabase.from).not.toHaveBeenCalled();
  });
});
