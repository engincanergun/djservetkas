import { createContext, useContext, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { aboutEn, messages, routes } from './messages'
import { canonicalUrl, hreflangPair, seoFor } from '../seo/meta'

const LocaleContext = createContext(null)

const pages = ['home', 'about', 'videos', 'gallery', 'events', 'contact']

function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1)
  return pathname
}

export function localeFromPath(pathname) {
  const path = normalizePath(pathname)
  return path === '/en' || path.startsWith('/en/') ? 'en' : 'tr'
}

export function pageFromPath(pathname) {
  const path = normalizePath(pathname)
  const locale = localeFromPath(path)
  const table = routes[locale]
  const match = pages.find((page) => table[page] === path)
  return match || 'home'
}

export function pathFor(locale, page) {
  return routes[locale][page] || routes[locale].home
}

export function LocaleProvider({ children }) {
  const { pathname } = useLocation()
  const locale = localeFromPath(pathname)
  const page = pageFromPath(pathname)
  const t = messages[locale]

  useEffect(() => {
    if (pathname === '/admin') return
    const meta = seoFor(locale, page)
    const url = canonicalUrl(meta.path)
    const alt = hreflangPair(page)
    document.documentElement.lang = locale
    document.title = meta.title
    const setMeta = (attr, key, content) => {
      const el = document.head.querySelector(`meta[${attr}="${key}"]`)
      if (el) el.setAttribute('content', content)
    }
    const setLink = (selector, href) => {
      const el = document.head.querySelector(selector)
      if (el) el.setAttribute('href', href)
    }
    setMeta('name', 'description', meta.description)
    setMeta('name', 'robots', 'index, follow')
    setMeta('property', 'og:title', meta.title)
    setMeta('property', 'og:description', meta.description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:locale', locale === 'en' ? 'en_GB' : 'tr_TR')
    setMeta('name', 'twitter:title', meta.title)
    setMeta('name', 'twitter:description', meta.description)
    setLink('link[rel="canonical"]', url)
    setLink('link[rel="alternate"][hreflang="tr"]', alt.tr)
    setLink('link[rel="alternate"][hreflang="en"]', alt.en)
  }, [locale, page, pathname])

  const value = useMemo(
    () => ({
      locale,
      page,
      t,
      path: (key) => pathFor(locale, key),
      otherPath: pathFor(locale === 'en' ? 'tr' : 'en', page),
      navItems: pages.map((key) => ({
        to: pathFor(locale, key),
        label: t.nav[key],
        end: key === 'home',
      })),
      aboutEn,
    }),
    [locale, page, t],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside LocaleProvider')
  return ctx
}
