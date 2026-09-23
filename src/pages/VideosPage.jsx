import { useMemo, useState } from 'react'
import { useContent } from '../cms/ContentContext'
import PageShell from '../components/PageShell'
import VideoModal from '../components/VideoModal'
import { useLocale } from '../i18n/LocaleContext'
import { videoCategories, youtubeThumb } from '../data/videos'

export default function VideosPage() {
  const { data, mediaUrl } = useContent()
  const { locale, t } = useLocale()
  const [filter, setFilter] = useState('all')
  const [active, setActive] = useState(null)
  const videos = Array.isArray(data.videos) ? data.videos : []

  const list = useMemo(
    () => (filter === 'all' ? videos : videos.filter((v) => v.category === filter)),
    [filter, videos],
  )

  const titleOf = (video) => (locale === 'en' && video.titleEn ? video.titleEn : video.title)

  return (
    <PageShell title={t.nav.videos}>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
        {videoCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilter(cat.id)}
            className={`text-[10px] tracking-[0.28em] uppercase ${
              filter === cat.id ? 'text-white' : 'text-[#888] hover:text-white/80'
            }`}
          >
            {t.categories[cat.id] || cat.label}
          </button>
        ))}
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((video) => {
          const thumb = video.thumbnail ? mediaUrl(video.thumbnail) : youtubeThumb(video.youtubeId)
          const title = titleOf(video)
          const category = t.categories[video.category] || videoCategories.find((c) => c.id === video.category)?.label
          return (
            <button
              key={`${video.youtubeId}-${video.title}`}
              type="button"
              data-cursor={t.cursorPlay}
              onClick={() => setActive({ ...video, title })}
              className="group relative block w-full overflow-hidden text-left"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#111]">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <p className="kicker text-white/80">{category}</p>
                  <p className="mt-2 text-lg font-light">{title}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <VideoModal video={active} onClose={() => setActive(null)} />
    </PageShell>
  )
}
