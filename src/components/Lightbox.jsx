import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useLocale } from '../i18n/LocaleContext'

export default function Lightbox({ images, index, onClose, onPrev, onNext }) {
  const touch = useRef(null)
  const open = index !== null
  const { t } = useLocale()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, onPrev, onNext])

  const onTouchStart = (e) => {
    touch.current = e.changedTouches[0].clientX
  }
  const onTouchEnd = (e) => {
    if (touch.current == null) return
    const dx = e.changedTouches[0].clientX - touch.current
    if (dx > 50) onPrev()
    if (dx < -50) onNext()
    touch.current = null
  }

  const image = open ? images[index] : null

  return (
    <AnimatePresence>
      {open && image ? (
        <motion.div
          className="fixed inset-0 z-[90] bg-black/92"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            className="absolute top-6 right-6 z-10 text-white/85"
            aria-label={t.close}
            onClick={onClose}
          >
            <X size={28} strokeWidth={1.25} />
          </button>
          <button
            type="button"
            className="absolute top-1/2 left-3 z-10 -translate-y-1/2 p-2 text-white/80 md:left-6"
            aria-label={t.previous}
            onClick={onPrev}
          >
            <ChevronLeft size={32} strokeWidth={1.2} />
          </button>
          <button
            type="button"
            className="absolute top-1/2 right-3 z-10 -translate-y-1/2 p-2 text-white/80 md:right-6"
            aria-label={t.next}
            onClick={onNext}
          >
            <ChevronRight size={32} strokeWidth={1.2} />
          </button>
          <div className="flex h-full items-center justify-center px-4 py-16 sm:px-14">
            <motion.img
              key={image.src}
              src={image.src}
              alt={image.alt}
              className="h-auto w-auto max-h-full max-w-full object-contain"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
