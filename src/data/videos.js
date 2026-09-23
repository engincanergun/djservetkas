export const videoCategories = [
  { id: 'all', label: 'Tümü' },
  { id: 'live', label: 'Canlı Set' },
  { id: 'sunset', label: 'Gün Batımı' },
  { id: 'club', label: 'Kulüp Seti' },
  { id: 'event', label: 'Etkinlik Seti' },
  { id: 'night', label: 'Gece Seti' },
  { id: 'backstage', label: 'Sahne Arkası' },
]

export const videos = [
  {
    title: 'Gün Batımı Seansı — Antalya',
    titleEn: 'Sunset Session — Antalya',
    category: 'sunset',
    youtubeId: 'ifJQQkbuijQ',
    thumbnail: '',
  },
  {
    title: 'Gece Frekansı',
    titleEn: 'Night Frequency',
    category: 'night',
    youtubeId: 'GJkuTx1DQzg',
    thumbnail: '',
  },
  {
    title: 'Kulüp Arşivi 04',
    titleEn: 'Club Archive 04',
    category: 'club',
    youtubeId: 'q5Oz6Ja8iZs',
    thumbnail: '',
  },
  {
    title: 'Teras Canlı Set',
    titleEn: 'Terrace Live Set',
    category: 'live',
    youtubeId: 'C6hkU_1ahP8',
    thumbnail: '',
  },
  {
    title: 'Özel Etkinlik — İstanbul',
    titleEn: 'Private Event — Istanbul',
    category: 'event',
    youtubeId: 'JdKZCXf4G8U',
    thumbnail: '',
  },
  {
    title: 'Gece Saatleri',
    titleEn: 'Night Hours',
    category: 'night',
    youtubeId: 'Fcf_PG1rcR4',
    thumbnail: '',
  },
  {
    title: 'Sahne Arkası Notları',
    titleEn: 'Backstage Notes',
    category: 'backstage',
    youtubeId: 'mzo3C7cu0pw',
    thumbnail: '',
  },
]

export function parseYoutubeId(input) {
  if (!input) return ''
  const trimmed = String(input).trim()
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed
  try {
    const url = new URL(trimmed)
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.replace(/^\//, '').split(/[/?#]/)[0]
      return /^[\w-]{11}$/.test(id) ? id : ''
    }
    const fromQuery = url.searchParams.get('v')
    if (/^[\w-]{11}$/.test(fromQuery || '')) return fromQuery
    const path = url.pathname.match(/\/(embed|shorts|live|v)\/([\w-]{11})/)
    if (path) return path[2]
  } catch {
    return ''
  }
  return ''
}

export function lockYoutubeId(input) {
  return parseYoutubeId(input) || ''
}

export function lockContentYoutubeIds(data) {
  const next = structuredClone(data)
  if (next?.artist?.hero) {
    const id = lockYoutubeId(next.artist.hero.youtubeId)
    if (id) next.artist.hero.youtubeId = id
  }
  if (Array.isArray(next?.videos)) {
    next.videos = next.videos.map((video) => {
      const id = lockYoutubeId(video.youtubeId)
      return id ? { ...video, youtubeId: id } : video
    })
  }
  return next
}

export function youtubeThumb(youtubeId) {
  const id = parseYoutubeId(youtubeId)
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''
}

export function youtubeEmbed(youtubeId) {
  const id = parseYoutubeId(youtubeId)
  if (!id) return ''
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    loop: '1',
    playlist: id,
    playsinline: '1',
  })
  return `https://www.youtube.com/embed/${id}?${params.toString()}`
}

export function youtubeEmbedError(code) {
  if (code === 101 || code === 150) {
    return 'Bu videonun sahibi sitede oynatmayı kapatmış. Kendi kanalınıza yüklediğiniz videolar çalışır; başkasının klibi / festival kaydı genelde çalışmaz.'
  }
  if (code === 100) {
    return 'Video bulunamadı veya gizli. Herkese açık ya da listede görünmeyen olsun.'
  }
  if (code === 153) {
    return 'YouTube bu tarayıcıda gömmeyi engelledi. Başka bir video deneyin veya kendi yüklemenizi kullanın.'
  }
  return 'Bu video sitede oynatılamıyor. Kendi YouTube kanalınıza yükleyip “Ekleme izni” açık olsun.'
}

let apiReady = null

export function loadYoutubeApi() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiReady) return apiReady

  apiReady = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(window.YT)
    }
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  })

  return apiReady
}
