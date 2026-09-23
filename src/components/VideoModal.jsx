import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { youtubeEmbed } from '../data/videos'
import { useLocale } from '../i18n/LocaleContext'

export default function VideoModal({ video, onClose }) {
  const { t } = useLocale()
  useEffect(() => {
    if (!video) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            type="button"
            className="absolute top-6 right-6 text-white/80"
            aria-label={t.close}
            onClick={onClose}
          >
            <X size={28} strokeWidth={1.25} />
          </button>
          <motion.div
            className="aspect-video w-full max-w-[min(64rem,calc((100dvh-7rem)*16/9))] overflow-hidden bg-black"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.45 }}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              title={video.title}
              src={youtubeEmbed(video.youtubeId)}
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
