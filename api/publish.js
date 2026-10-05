const REPO = 'engincanergun/djservetkas'
const BRANCH = 'main'
const CONTENT_PATH = 'src/cms/published.json'
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

function encodeText(text) {
  return Buffer.from(text, 'utf8').toString('base64')
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

function walk(value, visit) {
  if (typeof value === 'string') return visit(value)
  if (Array.isArray(value)) return value.map((item) => walk(item, visit))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, walk(item, visit)]))
  }
  return value
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
  if (!body.content || typeof body.content !== 'object') {
    res.status(400).json({ error: 'İçerik gerekli.' })
    return
  }

  try {
    const uploads = Array.isArray(body.uploads) ? body.uploads : []
    const uploaded = new Map()
    for (const file of uploads) {
      if (!file?.id || !file?.data) continue
      const ext = file.type?.includes('png') ? 'png' : file.type?.includes('webp') ? 'webp' : 'jpg'
      const path = `public/media/uploads/${file.id}.${ext}`
      await writeFile(path, file.data, token, 'Add media from the admin panel.')
      uploaded.set(`idb:${file.id}`, `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`)
    }

    const content = walk(body.content, (value) => uploaded.get(value) || value)
    content.updatedAt = new Date().toISOString()
    if (content.artist) delete content.artist.cmsPin

    await writeFile(
      CONTENT_PATH,
      encodeText(`${JSON.stringify(content, null, 2)}\n`),
      token,
      'Update site content from the admin panel.',
    )

    res.status(200).json({ ok: true, updatedAt: content.updatedAt })
  } catch (error) {
    res.status(500).json({ error: error.message || 'Yayınlanamadı.' })
  }
}
