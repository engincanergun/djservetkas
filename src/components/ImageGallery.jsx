import { useCallback, useState } from 'react'
import { gallery } from '../data/gallery'
import Lightbox from './Lightbox'
import Reveal from './Reveal'

const spanClass = {
  wide: 'span-wide min-h-[280px] md:min-h-[420px]',
  tall: 'span-tall min-h-[380px] md:min-h-[640px]',
  square: 'span-square min-h-[280px] md:min-h-[380px]',
}

export default function ImageGallery() {
  const [index, setIndex] = useState(null)

  const close = useCallback(() => setIndex(null), [])
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i + gallery.length - 1) % gallery.length)),
    [],
  )
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % gallery.length)),
    [],
  )

  return (
    <section id="gallery" className="bg-[#0a0a0a] px-5 py-24 md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="kicker">Kareler</p>
          <h2 className="mt-5 text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.95] font-light tracking-[-0.04em]">
            Görseller
          </h2>
        </Reveal>

        <div className="editorial-grid mt-14">
          {gallery.map((image, i) => (
            <Reveal key={image.src} className={spanClass[image.span] || spanClass.square} delay={i * 0.04}>
              <button
                type="button"
                data-cursor="BAK"
                onClick={() => setIndex(i)}
                className="group relative block h-full w-full overflow-hidden"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                  loading="lazy"
                  sizes="(min-width: 1100px) 50vw, 100vw"
                />
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <Lightbox images={gallery} index={index} onClose={close} onPrev={prev} onNext={next} />
    </section>
  )
}
