import SSLCommerzPayment from 'sslcommerz-lts'
import { adminDb } from '../_lib/firebaseAdmin.js'

const store_id = process.env.SSLCZ_STORE_ID
const store_passwd = process.env.SSLCZ_STORE_PASSWORD
const is_live = process.env.SSLCZ_IS_LIVE === 'true'

// SSLCommerz calls this server-to-server (not the user's browser) once a payment
// completes. This is the authoritative source of truth — always validate here
// before unlocking a course, never trust the success_url redirect alone.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { tran_id, val_id, status } = req.body || {}
    if (!tran_id || !val_id) return res.status(400).json({ error: 'Missing tran_id/val_id' })

    if (status !== 'VALID' && status !== 'VALIDATED') {
      await adminDb.collection('enrollments').doc(tran_id).set({ status: 'rejected' }, { merge: true })
      return res.status(200).json({ ok: true, result: 'not-valid' })
    }

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    const validation = await sslcz.validate({ val_id })

    if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
      await adminDb.collection('enrollments').doc(tran_id).set({
        status: 'approved',
        approvedAt: new Date(),
        sslcommerzValId: val_id
      }, { merge: true })
      return res.status(200).json({ ok: true })
    }

    await adminDb.collection('enrollments').doc(tran_id).set({ status: 'rejected' }, { merge: true })
    return res.status(200).json({ ok: true, result: 'validation-failed' })
  } catch (err) {
    console.error('IPN error:', err)
    return res.status(500).json({ error: 'IPN processing failed' })
  }
}
