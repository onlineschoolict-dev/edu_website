import SSLCommerzPayment from 'sslcommerz-lts'
import { adminDb } from './_lib/firebaseAdmin.js'

const store_id = process.env.SSLCZ_STORE_ID
const store_passwd = process.env.SSLCZ_STORE_PASSWORD
const is_live = process.env.SSLCZ_IS_LIVE === 'true' // false = sandbox (free to test)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { courseId, courseTitle, amount, userId, userEmail, userName, phone } = req.body || {}

    if (!courseId || !amount || !userId || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Create a pending enrollment first so we have a doc id to use as the transaction id
    const enrollmentRef = await adminDb.collection('enrollments').add({
      userId,
      userEmail,
      courseId,
      method: 'sslcommerz',
      status: 'pending',
      amount: Number(amount),
      createdAt: new Date()
    })

    const tran_id = enrollmentRef.id
    const baseUrl = process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`

    const data = {
      total_amount: Number(amount),
      currency: 'BDT',
      tran_id,
      success_url: `${baseUrl}/api/payment/success?tran_id=${tran_id}`,
      fail_url: `${baseUrl}/api/payment/fail?tran_id=${tran_id}`,
      cancel_url: `${baseUrl}/api/payment/cancel?tran_id=${tran_id}`,
      ipn_url: `${baseUrl}/api/payment/ipn`,
      shipping_method: 'No',
      product_name: courseTitle || 'Course',
      product_category: 'Education',
      product_profile: 'general',
      cus_name: userName || userEmail,
      cus_email: userEmail,
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: phone || '01700000000'
    }

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    const apiResponse = await sslcz.init(data)

    if (!apiResponse?.GatewayPageURL) {
      return res.status(502).json({ error: 'SSLCommerz did not return a gateway URL', details: apiResponse })
    }

    return res.status(200).json({ url: apiResponse.GatewayPageURL, tran_id })
  } catch (err) {
    console.error('create-payment error:', err)
    return res.status(500).json({ error: 'Payment initialization failed' })
  }
}
