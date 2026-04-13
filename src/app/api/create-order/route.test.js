import { POST } from './route'
import Razorpay from 'razorpay'
import { NextRequest } from 'next/server'

jest.mock('razorpay')

describe('POST /api/create-order', () => {
  let mockCreate;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreate = jest.fn();
    Razorpay.mockImplementation(() => {
      return {
        orders: {
          create: mockCreate
        }
      }
    });

    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'test_key_id';
    process.env.RAZORPAY_KEY_SECRET = 'test_key_secret';
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
  })

  function createMockRequest(body) {
    return new NextRequest('http://localhost/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  it('should successfully create an order', async () => {
    const mockOrderResponse = { id: 'order_123', amount: 50000, currency: 'INR' };
    mockCreate.mockResolvedValue(mockOrderResponse);

    const req = createMockRequest({ amount: 500, currency: 'INR', receipt: 'receipt_test' });
    const res = await POST(req);

    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(mockOrderResponse);
    expect(mockCreate).toHaveBeenCalledWith({
      amount: 50000, // amount * 100
      currency: 'INR',
      receipt: 'receipt_test'
    });
  });

  it('should return 500 if Razorpay keys are missing', async () => {
    delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    const req = createMockRequest({ amount: 500 });
    const res = await POST(req);

    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({ error: 'Razorpay keys are missing from environment variables. Please restart your dev server if you recently added them.' });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should return 500 if Razorpay SDK throws an error', async () => {
    mockCreate.mockRejectedValue(new Error('Razorpay error'));

    const req = createMockRequest({ amount: 500 });
    const res = await POST(req);

    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({ error: 'Razorpay error' });
  });

  it('should use default currency and dynamically generated receipt if not provided', async () => {
    const mockOrderResponse = { id: 'order_123', amount: 50000, currency: 'INR' };
    mockCreate.mockResolvedValue(mockOrderResponse);

    const req = createMockRequest({ amount: 500 });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      amount: 50000,
      currency: 'INR',
      receipt: expect.stringMatching(/^rcpt_\d+$/)
    }));
  });
});
