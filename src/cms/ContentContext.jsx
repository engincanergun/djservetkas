import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { lockContentYoutubeIds } from '../data/videos'
import { getDefaults } from './defaults'
import published from './published.json'
import { idbGet, idbId, isIdbSrc, loadSnapshot, saveSnapshot, storeFile } from './storage'

const ContentContext = createContext(null)

function mergeDefaults(saved) {
  const defaults = getDefaults()
  if (!saved) return lockContentYoutubeIds(defaults)
  const merged = {
    artist: { ...defaults.artist, ...saved.artist, hero: { ...defaults.artist.hero, ...saved.artist?.hero }, about: { ...defaults.artist.about, ...saved.artist?.about, portrait: { ...defaults.artist.about.portrait, ...saved.artist?.about?.portrait }, wide: { ...defaults.artist.about.wide, ...saved.artist?.about?.wide } } },
    videos: Array.isArray(saved.videos) ? saved.videos : defaults.videos,
    gallery: Array.isArray(saved.gallery) ? saved.gallery : defaults.gallery,
    events: Array.isArray(saved.events) ? saved.events : defaults.events,
    eventVisuals: {
      left: { ...defaults.eventVisuals.left, ...saved.eventVisuals?.left },
      right: { ...defaults.eventVisuals.right, ...saved.eventVisuals?.right },
    },
  }
  return lockContentYoutubeIds(merged)
}

export function ContentProvider({ children }) {
  const [data, setData] = useState(() => mergeDefaults(loadSnapshot() ?? published))
  const [urlMap, setUrlMap] = useState({})

  const persist = useCallback((next) => {
    const locked = lockContentYoutubeIds(next)
    setData(locked)
    saveSnapshot(locked)
  }, [])

  const collectIdb = useCallback((snapshot) => {
    const ids = []
    const visit = (value) => {
      if (typeof value === 'string' && isIdbSrc(value)) ids.push(idbId(value))
      else if (Array.isArray(value)) value.forEach(visit)
      else if (value && typeof value === 'object') Object.values(value).forEach(visit)
    }
    visit(snapshot)
    return [...new Set(ids)]
  }, [])

  useEffect(() => {
    let cancelled = false
    const ids = collectIdb(data)
    ;(async () => {
      const next = {}
      for (const id of ids) {
        const blob = await idbGet(id)
        if (blob) next[id] = URL.createObjectURL(blob)
      }
      if (cancelled) {
        Object.values(next).forEach((url) => URL.revokeObjectURL(url))
        return
      }
      setUrlMap((prev) => {
        Object.entries(prev).forEach(([id, url]) => {
          if (!next[id]) URL.revokeObjectURL(url)
        })
        return next
      })
    })()
    return () => {
      cancelled = true
    }
  }, [collectIdb, data])

  const mediaUrl = useCallback(
    (src) => {
      if (!src) return ''
      if (isIdbSrc(src)) return urlMap[idbId(src)] || ''
      return src
    },
    [urlMap],
  )

  const upload = useCallback(async (file) => storeFile(file), [])

  const value = useMemo(
    () => ({ data, persist, mediaUrl, upload }),
    [data, persist, mediaUrl, upload],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside ContentProvider')
  return ctx
}
