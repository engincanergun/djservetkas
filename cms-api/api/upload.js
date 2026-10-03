const REPO = 'engincanergun/djservetkas'
const BRANCH = 'main'
const API = 'https://api.github.com'

const ALLOWED = new Set([
  'https://djservetkas.com',
  'https://www.djservetkas.com',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
])

function cors(req, res) {
  const origin = req.headers.origin || ''
  if (ALLOWED.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function authHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function readFile(path, token) {
  const res = await fetch(`${API}/repos/${REPO}/contents/${path}?ref=${BRANCH}`, {
    headers: authHeaders(token),
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GitHub okunamadı (${res.status}): ${body.slice(0, 160)}`)
  }
  return res.json()
}

async function writeFile(path, contentBase64, token, message) {
  const current = await readFile(path, token)
  const payload = {
    message,
    content: contentBase64,
    branch: BRANCH,
    ...(current?.sha ? { sha: current.sha } : {}),
  }
  let res = await fetch(`${API}/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (res.status === 409 && current?.sha) {
    const again = await readFile(path, token)
    res = await fetch(`${API}/repos/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, sha: again?.sha }),
    })
  }
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GitHub yazılamadı (${res.status}): ${body.slice(0, 160)}`)
  }
}

export default async function handler(req, res) {
  cors(req, res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const token = process.env.GITHUB_TOKEN
  const pin = process.env.CMS_PIN
  if (!token || !pin) {
    res.status(500).json({ error: 'Sunucu yapılandırması eksik.' })
    return
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  if (!body.pin || body.pin !== pin) {
    res.status(401).json({ error: 'Yetkisiz.' })
    return
  }
  if (!body.id || !body.data) {
    res.status(400).json({ error: 'Dosya gerekli.' })
    return
  }

  // Keep single-file payloads under Vercel’s ~4.5MB limit.
  if (typeof body.data === 'string' && body.data.length > 3_200_000) {
    res.status(413).json({ error: 'Görsel çok büyük. Daha küçük bir fotoğraf deneyin.' })
    return
  }

  try {
    const ext = body.type?.includes('png') ? 'png' : body.type?.includes('webp') ? 'webp' : 'jpg'
    const path = `public/media/uploads/${body.id}.${ext}`
    await writeFile(path, body.data, token, 'Add media from the admin panel.')
    const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`
    res.status(200).json({ ok: true, url })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Yüklenemedi.' })
  }
}
