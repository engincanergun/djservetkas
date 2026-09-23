import { useCallback, useState } from 'react'
import { useContent } from '../cms/ContentContext'
import Lightbox from '../components/Lightbox'
import MediaImg from '../components/MediaImg'
import PageShell from '../components/PageShell'
import { useLocale } from '../i18n/LocaleContext'

export default function GalleryPage() {
  const { data, mediaUrl } = useContent()
  const { t } = useLocale()
  const gallery = data.gallery
  const [index, setIndex] = useState(null)

  const resolved = gallery.map((image) => ({ ...image, src: mediaUrl(image.src) || image.src }))

  const close = useCallback(() => setIndex(null), [])
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i + gallery.length - 1) % gallery.length)),
    [gallery.length],
  )
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % gallery.length)),
    [gallery.length],
  )

  return (
    <PageShell title={t.nav.gallery} wide>
      <div className="gallery-grid">
        {gallery.map((image, i) => (
          <button
            key={`${image.src}-${i}`}
            type="button"
            data-cursor={t.cursorView}
            onClick={() => setIndex(i)}
            className="gallery-tile group relative aspect-square w-full overflow-hidden"
          >
            <MediaImg
              src={image.src}
              alt={image.alt}
              className="absolute inset-0 size-full max-h-none max-w-none object-cover object-center transition-transform duration-700 group-hover:scale-[1.035]"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <Lightbox images={resolved} index={index} onClose={close} onPrev={prev} onNext={next} />
    </PageShell>
  )
}
