import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { pathFor, useLocale } from '../i18n/LocaleContext'

export default function Navigation({ overlay }) {
  const [open, setOpen] = useState(false)
  const { locale, page, t, navItems } = useLocale()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const linkClass = ({ isActive }) =>
    `text-[10px] font-medium tracking-[0.16em] whitespace-nowrap uppercase transition-opacity duration-300 xl:tracking-[0.28em] ${
      isActive ? 'text-white' : 'text-white/70 hover:text-white'
    }`

  const langClass = (code) =>
    `text-[10px] font-medium tracking-[0.28em] ${locale === code ? 'text-white' : 'text-white/45 hover:text-white'}`

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-auto absolute top-[max(1.25rem,env(safe-area-inset-top))] left-4 z-10 flex items-center gap-2 md:top-8 md:left-8">
        <NavLink to={pathFor('tr', page)} className={langClass('tr')} aria-label="Türkçe">
          TR
        </NavLink>
        <span className="text-[10px] text-white/30">/</span>
        <NavLink to={pathFor('en', page)} className={langClass('en')} aria-label="English">
          EN
        </NavLink>
      </div>

      <div className="relative flex items-start justify-center px-14 pt-6 md:px-28 md:pt-[10vh]">
        <nav lang={locale} className="pointer-events-auto hidden max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-3 xl:gap-x-8 min-[1100px]:flex" aria-label={t.navAria}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="pointer-events-auto absolute top-[max(1.15rem,env(safe-area-inset-top))] right-4 p-1 min-[1100px]:hidden"
          aria-label={open ? t.closeMenu : t.openMenu}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} strokeWidth={1.25} /> : <Menu size={22} strokeWidth={1.25} />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="pointer-events-auto fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080808] px-6 min-[1100px]:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <button type="button" className="absolute top-[max(1.15rem,env(safe-area-inset-top))] right-4" aria-label={t.close} onClick={() => setOpen(false)}>
              <X size={22} strokeWidth={1.25} />
            </button>
            <nav lang={locale} className="flex flex-col items-center gap-7" aria-label={t.navMobileAria}>
              {navItems.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() => setOpen(false)}
                    className="text-center text-sm tracking-[0.16em] uppercase sm:tracking-[0.28em]"
                  >
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
              <div className="mt-8 flex items-center gap-3">
                <NavLink to={pathFor('tr', page)} onClick={() => setOpen(false)} className={langClass('tr')}>
                  TR
                </NavLink>
                <span className="text-white/30">/</span>
                <NavLink to={pathFor('en', page)} onClick={() => setOpen(false)} className={langClass('en')}>
                  EN
                </NavLink>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
