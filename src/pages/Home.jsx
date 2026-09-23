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
    <main className="relative h-svh overflow-hidden bg-[#080808]">
      <YoutubeBackground ref={player} youtubeId={youtubeId} start={hero.start} poster={poster} />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[#080808]/25" />

      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 md:px-10 md:pb-10">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-x-3 gap-y-5 min-[540px]:grid-cols-[auto_auto_minmax(0,1fr)] min-[540px]:gap-x-5 md:gap-x-8">
          <div className="col-span-2 flex flex-col items-center gap-2 min-[540px]:col-span-1 min-[540px]:col-start-2 min-[540px]:row-start-1">
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
          <SocialLinks className="col-start-1 row-start-2 flex gap-4 min-[540px]:row-start-1 sm:gap-5" size={16} />
          <a
            href={`mailto:${data.artist.email}`}
            className="col-start-2 row-start-2 min-w-0 text-right text-[11px] leading-snug tracking-normal text-white/70 lowercase min-[540px]:col-start-3 min-[540px]:row-start-1 min-[540px]:text-[10px] md:tracking-[0.12em] xl:tracking-[0.22em]"
          >
            {data.artist.email}
          </a>
        </div>
      </div>
    </main>
  )
}
