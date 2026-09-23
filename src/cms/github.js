import { idbGet, isIdbSrc } from './storage'

const REPO = 'engincanergun/djservetkas'
const CONTENT_PATH = 'src/cms/published.json'
const BRANCH = 'main'
const TOKEN_KEY = 'servetkas-publish-token'
const API = 'https://api.github.com'

let timer = 0
let publishing = false
let pending = null
let onStatus = () => {}

export function getPublishToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function setPublishToken(token) {
  const value = token.trim()
  if (value) localStorage.setItem(TOKEN_KEY, value)
  else localStorage.removeItem(TOKEN_KEY)
}

export function watchPublishStatus(handler) {
  onStatus = handler
}

function report(status, detail = '') {
  onStatus({ status, detail })
}

function authHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

function encodeText(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  }
  return btoa(binary)
}

function decodeText(b64) {
  const binary = atob(String(b64).replace(/\s/g, ''))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

async function readFile(path, token) {
  const res = await fetch(`${API}/repos/${REPO}/contents/${path}?ref=${BRANCH}`, {
    headers: authHeaders(token),
  })
  if (res.status === 404) return null
  if (res.status === 401 || res.status === 403) {
    const error = new Error('Yayın anahtarı kabul edilmedi.')
    error.code = 'token'
    throw error
  }
  if (!res.ok) throw new Error('İçerik okunamadı.')
  const body = await res.json()
  return { sha: body.sha, text: decodeText(body.content) }
}

async function writeFile(path, content, token, message) {
  const current = await readFile(path, token)
  const res = await fetch(`${API}/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content,
      branch: BRANCH,
      ...(current?.sha ? { sha: current.sha } : {}),
    }),
  })
  if (res.status === 409 && current?.sha) {
    const again = await readFile(path, token)
    const retry = await fetch(`${API}/repos/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        content,
        branch: BRANCH,
        sha: again?.sha,
      }),
    })
    if (!retry.ok) throw new Error('Yayın çakıştı, yeniden deneyin.')
    return
  }
  if (res.status === 401 || res.status === 403) {
    const error = new Error('Yayın anahtarı kabul edilmedi.')
    error.code = 'token'
    throw error
  }
  if (!res.ok) throw new Error('Yayınlanamadı.')
}

function publicCopy(data) {
  const copy = structuredClone(data)
  if (copy.artist) delete copy.artist.cmsPin
  copy.updatedAt = new Date().toISOString()
  return copy
}

function walk(value, visit) {
  if (typeof value === 'string') return visit(value)
  if (Array.isArray(value)) return value.map((item) => walk(item, visit))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, walk(item, visit)]))
  }
  return value
}

async function replaceUploads(data, token) {
  const pending = new Map()
  walk(data, (value) => {
    if (isIdbSrc(value)) pending.set(value, value)
    return value
  })
  for (const src of pending.keys()) {
    const blob = await idbGet(src.slice(4))
    if (!blob) continue
    const ext = blob.type?.includes('png') ? 'png' : blob.type?.includes('webp') ? 'webp' : 'jpg'
    const path = `public/media/uploads/${src.slice(4)}.${ext}`
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let binary = ''
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
    }
    await writeFile(path, btoa(binary), token, 'Add media from the admin panel.')
    pending.set(src, `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`)
  }
  return walk(data, (value) => pending.get(value) || value)
}

export async function loadRemotePublished() {
  try {
    const file = await readFile(CONTENT_PATH, getPublishToken())
    if (!file?.text) return null
    return JSON.parse(file.text)
  } catch {
    return null
  }
}

export function contentTime(data) {
  const time = Date.parse(data?.updatedAt || '')
  return Number.isFinite(time) ? time : 0
}

async function flush() {
  if (publishing || !pending) return
  const token = getPublishToken()
  if (!token) {
    pending = null
    report('needs-token')
    return
  }
  publishing = true
  const data = pending
  pending = null
  report('publishing')
  try {
    const payload = await replaceUploads(publicCopy(data), token)
    await writeFile(
      CONTENT_PATH,
      encodeText(`${JSON.stringify(payload, null, 2)}\n`),
      token,
      'Update site content from the admin panel.',
    )
    report('live')
  } catch (error) {
    report(error.code === 'token' ? 'needs-token' : 'error', error.message || 'Yayınlanamadı.')
  } finally {
    publishing = false
    if (pending) flush()
  }
}

export function schedulePublish(data) {
  pending = data
  window.clearTimeout(timer)
  if (!getPublishToken()) {
    report('needs-token')
    return
  }
  timer = window.setTimeout(flush, 1200)
}

export async function savePublishToken(token) {
  const value = token.trim()
  if (!value) {
    setPublishToken('')
    report('needs-token')
    return
  }
  const res = await fetch(`${API}/repos/${REPO}`, { headers: authHeaders(value) })
  if (!res.ok) throw new Error('Anahtar kabul edilmedi.')
  const repo = await res.json()
  if (repo.permissions && repo.permissions.push === false) {
    throw new Error('Bu anahtarın yazma izni yok.')
  }
  setPublishToken(value)
  report('idle')
  if (pending) flush()
}
