import { useCallback, useEffect, useRef, useState } from 'react'
import { useContent } from '../cms/ContentContext'
import YoutubeBackground from '../components/YoutubeBackground'
import { useLocale } from '../i18n/LocaleContext'
import { parseYoutubeId, youtubeThumb } from '../data/videos'

export default function Home() {
  const { data, mediaUrl } = useContent()
  const { locale, t } = useLocale()
  const { hero } = data.artist
  const youtubeId = parseYoutubeId(hero.youtubeId)
  const poster = mediaUrl(hero.poster) || youtubeThumb(youtubeId, 'maxresdefault') || youtubeThumb(youtubeId)
  const player = useRef(null)
  const remembered = useRef(40)
  const [volume, setVolume] = useState(0)
  const [videoSrc, setVideoSrc] = useState('')
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const desktop = mediaUrl(hero.videoDesktop) || hero.videoDesktop || ''
    const mobile = mediaUrl(hero.videoMobile) || hero.videoMobile || desktop
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => setVideoSrc(mq.matches ? mobile : desktop || mobile)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [hero.videoDesktop, hero.videoMobile, mediaUrl])

  const onPlayingChange = useCallback((isPlaying) => {
    setPlaying(Boolean(isPlaying))
  }, [])

  const changeVolume = (next) => {
    const level = Math.max(0, Math.min(100, Math.round(Number(next) || 0)))
    if (level > 0) remembered.current = level
    setVolume(level)
    player.current?.setVolume(level)
  }

  const toggleSound = () => {
    changeVolume(volume > 0 ? 0 : remembered.current)
  }

  const soundLabel = volume === 0 ? t.soundOff : t.soundOn

  return (
    <main className="relative h-dvh min-h-[100svh] overflow-hidden bg-[#080808]">
      <YoutubeBackground
        ref={player}
        youtubeId={youtubeId}
        start={hero.start}
        poster={poster}
        videoSrc={videoSrc}
        onPlayingChange={onPlayingChange}
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[#080808]/20" />

      {playing ? (
        <div className="pointer-events-auto fixed top-1/2 right-[max(1rem,env(safe-area-inset-right),3vw)] z-[48] flex w-24 -translate-y-1/2 flex-col items-center gap-3">
          <label className="sound-rail">
            <input
              type="range"
              className="crossfader is-vertical"
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
          <button
            type="button"
            lang={locale}
            className="text-center text-[10px] tracking-[0.22em] text-white/80 uppercase"
            onClick={toggleSound}
          >
            {soundLabel}
          </button>
        </div>
      ) : null}
    </main>
  )
}
