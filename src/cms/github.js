import { artist } from '../data/artist'
import { idbGet, isIdbSrc } from './storage'

const REPO = 'engincanergun/djservetkas'
const CONTENT_PATH = 'src/cms/published.json'
const BRANCH = 'main'
const API = 'https://api.github.com'
const PUBLISH_URL = import.meta.env.VITE_PUBLISH_URL || 'https://cms-api-drab-ten.vercel.app/api/publish'
const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || 'https://cms-api-drab-ten.vercel.app/api/upload'

let timer = 0
let publishing = false
let pending = null
let retries = 0
let onStatus = () => {}
let onPublished = () => {}

export function watchPublishStatus(handler) {
  onStatus = handler
}

export function watchPublished(handler) {
  onPublished = handler
}

function report(status, detail = '') {
  onStatus({ status, detail })
}

function decodeText(b64) {
  const binary = atob(String(b64).replace(/\s/g, ''))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

async function readFile(path) {
  const res = await fetch(`${API}/repos/${REPO}/contents/${path}?ref=${BRANCH}`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error('İçerik okunamadı.')
  const body = await res.json()
  return { sha: body.sha, text: decodeText(body.content) }
}

export function stampContent(data) {
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

async function collectUploads(data) {
  const ids = new Set()
  walk(data, (value) => {
    if (isIdbSrc(value)) ids.add(value.slice(4))
    return value
  })
  const uploads = []
  for (const id of ids) {
    const blob = await idbGet(id)
    if (!blob) continue
    const buffer = await blob.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
    }
    uploads.push({ id, type: blob.type || 'image/jpeg', data: btoa(binary) })
  }
  return uploads
}

export async function loadRemotePublished() {
  try {
    const file = await readFile(CONTENT_PATH)
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

function publishErrorMessage(error, status) {
  const raw = String(error?.message || '')
  if (status === 413 || /too large|çok büyük|payload/i.test(raw)) {
    return 'Görsel çok büyük. Daha küçük bir fotoğraf deneyin.'
  }
  if (/failed to fetch|networkerror|load failed/i.test(raw)) {
    return 'Yayın bağlantısı kurulamadı. Birkaç saniye sonra yeniden denenecek.'
  }
  return raw || 'Yayınlanamadı.'
}

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(body.error || (res.status === 413 ? 'Görsel çok büyük.' : 'Yayınlanamadı.'))
    err.status = res.status
    throw err
  }
  return body
}

async function uploadMediaFiles(uploads) {
  const map = new Map()
  for (const file of uploads) {
    const body = await postJson(UPLOAD_URL, {
      pin: artist.cmsPin,
      id: file.id,
      type: file.type,
      data: file.data,
    })
    if (body.url) map.set(`idb:${file.id}`, body.url)
  }
  return map
}

async function flush() {
  if (publishing || !pending) return
  publishing = true
  const data = pending
  pending = null
  report('publishing')
  try {
    const content = stampContent(data)
    const uploads = await collectUploads(content)
    const uploaded = await uploadMediaFiles(uploads)
    const resolved = walk(content, (value) => uploaded.get(value) || value)
    const body = await postJson(PUBLISH_URL, {
      pin: artist.cmsPin,
      content: resolved,
      uploads: [],
    })
    const published = {
      ...resolved,
      updatedAt: body.updatedAt || resolved.updatedAt,
    }
    retries = 0
    onPublished(published)
    report('live')
  } catch (error) {
    report('error', publishErrorMessage(error, error?.status))
    if (!pending) pending = data
    retries += 1
  } finally {
    publishing = false
    if (pending && retries < 6) {
      window.clearTimeout(timer)
      timer = window.setTimeout(flush, 4000)
    } else if (pending && retries >= 6) {
      report('error', 'Yayınlanamadı. Sayfayı yenileyip tekrar kaydedin.')
    }
  }
}

export function schedulePublish(data) {
  pending = data
  retries = 0
  window.clearTimeout(timer)
  report('idle')
  timer = window.setTimeout(flush, 1200)
}
