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

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export function validateImageFile(file) {
  if (!file) throw new Error('Dosya seçilmedi.')
  const type = file.type || ''
  const name = file.name || ''

  if (/heic|heif/i.test(type) || /\.heic$|\.heif$/i.test(name)) {
    throw new Error('HEIC formatı desteklenmiyor. Lütfen JPEG (JPG) veya PNG olarak yükleyin.')
  }
  if (type && !type.startsWith('image/')) {
    throw new Error('Yalnızca görsel dosyaları yüklenebilir (JPEG, PNG, WebP).')
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1)
    throw new Error(`Dosya ${mb} MB. 10 MB üzerindeki görseller yüklenemez. Daha küçük bir JPEG deneyin.`)
  }
}

export async function compressImage(file, max = 2560) {
  validateImageFile(file)

  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('Görsel okunamadı. JPEG veya PNG yükleyin.')
  }

  // Keep near-original resolution; only downscale very large camera files.
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()

  // High-quality JPEG. Soft size cap only to stay under Vercel’s ~4.5MB upload limit.
  let quality = 0.92
  let blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  while (blob && blob.size > 2_800_000 && quality > 0.78) {
    quality -= 0.04
    blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  }
  if (!blob) throw new Error('Görsel işlenemedi.')
  return blob
}

export async function storeFile(file) {
  validateImageFile(file)
  const prepared = await compressImage(file)
  const id = crypto.randomUUID()
  await idbPut(id, prepared)
  return `idb:${id}`
}

export const IMAGE_UPLOAD_HINT = 'JPEG veya PNG yükleyin. En fazla 10 MB. HEIC desteklenmez.'
