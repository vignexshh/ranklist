import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const RAZORPAY_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || ''

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature') || ''

  // Verify Razorpay webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_SECRET)
    .update(body)
    .digest('hex')

  if (expectedSignature !== signature) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(body)

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity

    try {
      await prisma.payment.create({
        data: {
          email: payment.email || 'unknown@example.com',
          paymentId: payment.id,
          amount: payment.amount, // Amount is in paise (e.g. 50000 = ₹500)
          status: payment.status,
          contact: payment.contact || payment.notes?.phone || null
        }
      })

      return NextResponse.json({ message: 'Payment recorded' }, { status: 200 })
    } catch (err) {
      console.error('Database insert error:', err)
      return NextResponse.json({ message: 'Error saving payment' }, { status: 500 })
    }
  }

  return NextResponse.json({ message: 'Event ignored' }, { status: 200 })
}
