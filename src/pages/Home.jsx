import { useRef, useState } from 'react'
import { useContent } from '../cms/ContentContext'
import SocialLinks from '../components/SocialLinks'
import YoutubeBackground from '../components/YoutubeBackground'
import { useLocale } from '../i18n/LocaleContext'
import { parseYoutubeId, youtubeThumb } from '../data/videos'

export default function Home() {
  const { data, mediaUrl } = useContent()
  const { locale, t } = useLocale()
  const { hero } = data.artist
  const youtubeId = parseYoutubeId(hero.youtubeId)
  const poster = mediaUrl(hero.poster) || youtubeThumb(youtubeId)
  const player = useRef(null)
  const [volume, setVolume] = useState(0)

  const changeVolume = (next) => {
    const level = Math.max(0, Math.min(100, Math.round(Number(next) || 0)))
    setVolume(level)
    player.current?.setVolume(level)
  }

  const soundLabel = volume === 0 ? t.soundOff : t.soundOn

  return (
    <main className="relative h-svh min-h-[560px] overflow-hidden bg-[#080808]">
      <YoutubeBackground ref={player} youtubeId={youtubeId} start={hero.start} poster={poster} />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[#080808]/25" />

      <div className="absolute right-6 bottom-8 left-6 z-10 flex items-end justify-between gap-4 md:right-10 md:bottom-10 md:left-10">
        <SocialLinks className="flex gap-5" size={16} />
        <div className="flex flex-col items-center gap-2">
          <p lang={locale} className="text-[10px] tracking-[0.22em] text-white/70 uppercase">
            {soundLabel}
          </p>
          <label className="crossfader-wrap">
            <input
              type="range"
              className="crossfader"
              min="0"
              max="100"
              step="1"
              value={volume}
              onChange={(e) => changeVolume(e.target.value)}
              aria-label={soundLabel}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={volume}
              aria-valuetext={t.volume(volume)}
            />
          </label>
        </div>
        <a
          href={`mailto:${data.artist.email}`}
          className="text-[10px] tracking-[0.22em] text-white/70 uppercase"
        >
          {data.artist.email}
        </a>
      </div>
    </main>
  )
}
