import { useMemo, useState } from 'react'
import { videoCategories, videos, youtubeThumb } from '../data/videos'
import Reveal from './Reveal'
import VideoModal from './VideoModal'

export default function VideoGallery() {
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState(null)

  const list = useMemo(
    () => (filter === 'all' ? videos : videos.filter((v) => v.category === filter)),
    [filter],
  )

  return (
    <section id="videos" className="bg-[#080808] px-5 py-24 md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="kicker">Arşiv</p>
          <h2 className="mt-5 max-w-xl text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.95] font-light tracking-[-0.04em]">
            Canlı Set Videoları
          </h2>
        </Reveal>

        <Reveal className="mt-12 flex flex-wrap gap-x-6 gap-y-3" delay={0.08}>
          {videoCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              className={`text-[10px] tracking-[0.28em] uppercase transition-opacity ${
                filter === cat.id ? 'text-white' : 'text-[#888] hover:text-white/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((video, i) => {
            const thumb = video.thumbnail || youtubeThumb(video.youtubeId)
            const category = videoCategories.find((c) => c.id === video.category)?.label
            return (
              <Reveal key={`${video.youtubeId}-${video.title}`} delay={Math.min(i * 0.05, 0.25)}>
                <button
                  type="button"
                  data-cursor="OYNAT"
                  onClick={() => setActive(video)}
                  className="group relative block w-full overflow-hidden text-left"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#111]">
                    <img
                      src={thumb}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-100 transition-opacity duration-500 md:bg-black/0 md:from-transparent md:opacity-0 md:group-hover:bg-black/35 md:group-hover:opacity-100" />
                    <div className="absolute inset-0 flex flex-col justify-end p-5">
                      <p className="kicker text-white/80">{category}</p>
                      <p className="mt-2 text-lg font-light">{video.title}</p>
                    </div>
                  </div>
                </button>
              </Reveal>
            )
          })}
        </div>
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
    </section>
  )
}
