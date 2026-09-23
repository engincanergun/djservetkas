export const SITE = 'https://djservetkas.com'
export const OG_IMAGE = `${SITE}/media/hero-poster.jpg`

export const seoPages = [
  {
    id: 'home',
    tr: {
      path: '/',
      title: 'DJ Servet Kaş | Etkinlik ve Kulüp DJ’i',
      description:
        'DJ Servet Kaş, etkinlik ve kulüp DJ’i. Afro House, Organic House, Indie Dance ve Melodic House & Techno. Canlı setler, etkinlik takvimi ve rezervasyon.',
    },
    en: {
      path: '/en',
      title: 'DJ Servet Kaş | Event & Club DJ',
      description:
        'DJ Servet Kaş is an event and club DJ. Afro House, Organic House, Indie Dance and Melodic House & Techno. Live sets, event calendar and bookings.',
    },
  },
  {
    id: 'about',
    tr: {
      path: '/hakkimda',
      title: 'Hakkımda | DJ Servet Kaş',
      description:
        'DJ Servet Kaş hakkında. 2003’ten beri süren sahne yaklaşımı; Afro House, Organic House, Indie Dance ve Melodic House & Techno.',
    },
    en: {
      path: '/en/about',
      title: 'About | DJ Servet Kaş',
      description:
        'About DJ Servet Kaş. A stage approach shaped since 2003, centred on Afro House, Organic House, Indie Dance and Melodic House & Techno.',
    },
  },
  {
    id: 'videos',
    tr: {
      path: '/videos',
      title: 'Canlı Set Videoları | DJ Servet Kaş',
      description:
        'DJ Servet Kaş canlı set videoları. Kulüp, gün batımı, etkinlik ve gece performansları.',
    },
    en: {
      path: '/en/videos',
      title: 'Live Set Videos | DJ Servet Kaş',
      description: 'DJ Servet Kaş live set videos. Club, sunset, event and night performances.',
    },
  },
  {
    id: 'events',
    tr: {
      path: '/etkinlikler',
      title: 'Etkinlik Takvimi | DJ Servet Kaş',
      description:
        'DJ Servet Kaş etkinlik takvimi. Antalya, İstanbul, Bodrum, İzmir ve Ankara performansları.',
    },
    en: {
      path: '/en/events',
      title: 'Event Calendar | DJ Servet Kaş',
      description:
        'DJ Servet Kaş event calendar. Performances in Antalya, Istanbul, Bodrum, Izmir and Ankara.',
    },
  },
  {
    id: 'gallery',
    tr: {
      path: '/gorseller',
      title: 'Görseller | DJ Servet Kaş',
      description: 'DJ Servet Kaş sahne ve performans görselleri.',
    },
    en: {
      path: '/en/gallery',
      title: 'Gallery | DJ Servet Kaş',
      description: 'DJ Servet Kaş stage and performance photos.',
    },
  },
  {
    id: 'contact',
    tr: {
      path: '/iletisim',
      title: 'İletişim | DJ Servet Kaş',
      description:
        'DJ Servet Kaş rezervasyon ve iletişim. Özel etkinlikler ve kulüp geceleri için djservetkas@gmail.com.',
    },
    en: {
      path: '/en/contact',
      title: 'Contact | DJ Servet Kaş',
      description:
        'Book DJ Servet Kaş for private events and club nights. Email djservetkas@gmail.com.',
    },
  },
]

export function seoFor(locale, page) {
  const entry = seoPages.find((item) => item.id === page) || seoPages[0]
  return entry[locale] || entry.tr
}

export function canonicalUrl(path) {
  if (!path || path === '/') return `${SITE}/`
  const clean = path.endsWith('/') ? path : `${path}/`
  return `${SITE}${clean}`
}

export function hreflangPair(page) {
  const entry = seoPages.find((item) => item.id === page) || seoPages[0]
  return {
    tr: canonicalUrl(entry.tr.path),
    en: canonicalUrl(entry.en.path),
  }
}
