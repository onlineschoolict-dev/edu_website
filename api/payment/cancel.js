export default async function handler(req, res) {
  const tran_id = req.query.tran_id || req.body?.tran_id
  const baseUrl = process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`
  res.writeHead(302, { Location: `${baseUrl}/?payment=cancel&tran_id=${tran_id}` })
  res.end()
}
