import { artist } from '../data/artist'
import { idbGet, isIdbSrc } from './storage'

const REPO = 'engincanergun/djservetkas'
const CONTENT_PATH = 'src/cms/published.json'
const BRANCH = 'main'
const API = 'https://api.github.com'
const PUBLISH_URL = import.meta.env.VITE_PUBLISH_URL || 'https://cms-api-drab-ten.vercel.app/api/publish'

let timer = 0
let publishing = false
let pending = null
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

async function flush() {
  if (publishing || !pending) return
  publishing = true
  const data = pending
  pending = null
  report('publishing')
  try {
    const content = stampContent(data)
    const uploads = await collectUploads(content)
    const res = await fetch(PUBLISH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        pin: artist.cmsPin,
        content,
        uploads,
      }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body.error || 'Yayınlanamadı.')
    const published = {
      ...content,
      updatedAt: body.updatedAt || content.updatedAt,
    }
    onPublished(published)
    report('live')
  } catch (error) {
    report('error', error.message || 'Yayınlanamadı.')
    // Keep the latest edit queued; retry shortly so a temporary outage does not drop it.
    if (!pending) pending = data
  } finally {
    publishing = false
    if (pending) {
      window.clearTimeout(timer)
      timer = window.setTimeout(flush, 4000)
    }
  }
}

export function schedulePublish(data) {
  pending = data
  window.clearTimeout(timer)
  timer = window.setTimeout(flush, 1200)
}
