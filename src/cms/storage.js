const SNAP_KEY = 'servetkas-cms-v4'
const SNAP_KEYS = ['servetkas-cms-v4', 'servetkas-cms-v3', 'servetkas-cms-v2', 'servetkas-cms-v1']
const AUTH_KEY = 'servetkas-cms-auth'
const DB_NAME = 'servetkas-media'
const STORE = 'files'

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function idbPut(id, blob) {
  const db = await openDb()
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(blob, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function idbGet(id) {
  const db = await openDb()
  const value = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(id)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return value
}

export async function idbDelete(id) {
  const db = await openDb()
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export function loadSnapshot() {
  try {
    for (const key of SNAP_KEYS) {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const parsed = JSON.parse(raw)
      if (key !== SNAP_KEY) localStorage.setItem(SNAP_KEY, raw)
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function saveSnapshot(data) {
  const copy = structuredClone(data)
  if (copy.artist) delete copy.artist.cmsPin
  localStorage.setItem(SNAP_KEY, JSON.stringify(copy))
  queuePublish(copy)
}

let publishTimer = 0
function queuePublish(copy) {
  window.clearTimeout(publishTimer)
  publishTimer = window.setTimeout(() => {
    fetch('/__cms/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(copy),
    }).catch(() => {
      /* production has no write endpoint; localStorage still holds the snapshot */
    })
  }, 400)
}

export function clearSnapshot() {
  localStorage.removeItem(SNAP_KEY)
}

export function isAuthed() {
  return sessionStorage.getItem(AUTH_KEY) === '1'
}

export function setAuthed(on) {
  if (on) sessionStorage.setItem(AUTH_KEY, '1')
  else sessionStorage.removeItem(AUTH_KEY)
}

export function isIdbSrc(src) {
  return typeof src === 'string' && src.startsWith('idb:')
}

export function idbId(src) {
  return src.slice(4)
}

export async function compressImage(file, max = 1920) {
  if (!file.type.startsWith('image/')) return file
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  if (scale >= 1) return file
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86))
  return blob || file
}

export async function storeFile(file) {
  const prepared = await compressImage(file)
  const id = crypto.randomUUID()
  await idbPut(id, prepared)
  return `idb:${id}`
}
