import { createContext, useContext, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { aboutEn, messages, routes } from './messages'

const LocaleContext = createContext(null)

const pages = ['home', 'about', 'videos', 'events', 'gallery', 'contact']

export function localeFromPath(pathname) {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'tr'
}

export function pageFromPath(pathname) {
  const locale = localeFromPath(pathname)
  const table = routes[locale]
  const match = pages.find((page) => table[page] === pathname)
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
    document.documentElement.lang = locale
    document.title = t.seoTitle
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', t.seoDescription)
  }, [locale, t])

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
