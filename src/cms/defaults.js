import { artist } from '../data/artist'
import { events, eventVisuals } from '../data/events'
import { gallery } from '../data/gallery'
import { videos } from '../data/videos'

export function getDefaults() {
  return structuredClone({
    artist,
    videos,
    gallery,
    events,
    eventVisuals,
  })
}

export function formatEventDate(iso, locale = 'tr') {
  if (!iso) return ''
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  const tag = locale === 'en' ? 'en-GB' : 'tr-TR'
  return date.toLocaleDateString(tag, { day: '2-digit', month: 'short', year: 'numeric' }).toLocaleUpperCase(tag)
}
