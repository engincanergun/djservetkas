import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { youtubeEmbed } from '../data/videos'
import { useLocale } from '../i18n/LocaleContext'

export default function VideoModal({ video, onClose }) {
  const { t } = useLocale()
  const frame = useRef(null)

  const close = () => {
    if (frame.current) frame.current.src = 'about:blank'
    onClose()
  }

  useEffect(() => {
    if (!video) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [video, onClose])

  return (
    <AnimatePresence>
      {video ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/92 px-4"
          data-cursor={t.cursorClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <button
            type="button"
            className="absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#080808] shadow-[0_0_0_1px_rgb(255_255_255/0.4)] sm:h-14 sm:w-14"
            aria-label={t.close}
            onClick={close}
          >
            <X size={28} strokeWidth={2.25} />
          </button>
          <motion.div
            className="pointer-events-none aspect-video w-full max-w-[min(64rem,calc((100dvh-7rem)*16/9))] overflow-hidden bg-black"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.45 }}
          >
            <iframe
              ref={frame}
              title={video.title}
              src={youtubeEmbed(video.youtubeId)}
              className="pointer-events-none h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
