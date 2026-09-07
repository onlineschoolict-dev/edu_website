// SSLCommerz redirects the user's browser here after payment. The IPN webhook
// (ipn.js) is the one that actually verifies and unlocks the course — this
// route just sends the student back to the course page with a friendly status.
export default async function handler(req, res) {
  const tran_id = req.query.tran_id || req.body?.tran_id
  const baseUrl = process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`
  res.writeHead(302, { Location: `${baseUrl}/?payment=success&tran_id=${tran_id}` })
  res.end()
}
