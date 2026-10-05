import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { loadYoutubeApi, parseYoutubeId, youtubeEmbedError, youtubeThumb } from '../data/videos'
import { useLocale } from '../i18n/LocaleContext'

function applyYtVolume(player, volume) {
  if (!player) return
  const level = Math.max(0, Math.min(100, Math.round(Number(volume) || 0)))
  if (level <= 0) {
    player.setVolume?.(0)
    player.mute?.()
    return
  }
  player.unMute?.()
  player.setVolume?.(level)
}

function applyHtmlVolume(video, volume) {
  if (!video) return
  const level = Math.max(0, Math.min(100, Math.round(Number(volume) || 0)))
  video.muted = level <= 0
  video.volume = level / 100
  if (level > 0) video.play?.().catch(() => {})
}

function youtubeCoverSrc(id, start = 0, mute = true) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: mute ? '1' : '0',
    controls: '0',
    disablekb: '1',
    fs: '0',
    modestbranding: '1',
    rel: '0',
    playsinline: '1',
    iv_load_policy: '3',
    loop: '1',
    playlist: id,
    start: String(Number(start) || 0),
    enablejsapi: '1',
    origin: typeof window !== 'undefined' ? window.location.origin : 'https://djservetkas.com',
  })
  // youtube.com embeds autoplay more reliably on iOS than youtube-nocookie.
  return `https://www.youtube.com/embed/${id}?${params.toString()}`
}

function isMobileHero() {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(hover: none), (pointer: coarse), (max-width: 900px)').matches
}

const YoutubeBackground = forwardRef(function YoutubeBackground(
  { youtubeId, start = 0, poster = '', videoSrc = '', onPlayingChange },
  ref,
) {
  const id = parseYoutubeId(youtubeId)
  const stageRef = useRef(null)
  const playerRef = useRef(null)
  const videoRef = useRef(null)
  const volumeRef = useRef(0)
  const modeRef = useRef(videoSrc ? 'html5' : 'youtube')
  const mobile = useRef(isMobileHero())
  const iframeOn = useRef(false)
  const { t } = useLocale()
  const [needsPlay, setNeedsPlay] = useState(false)
  const [failed, setFailed] = useState('')
  const [iframeSrc, setIframeSrc] = useState('')
  const [posterSrc, setPosterSrc] = useState(() => poster || youtubeThumb(id, 'maxresdefault') || youtubeThumb(id))

  useEffect(() => {
    setPosterSrc(poster || youtubeThumb(id, 'maxresdefault') || youtubeThumb(id))
  }, [poster, id])

  useEffect(() => {
    // Treat muted autoplay attempt as active UI (volume control visible).
    onPlayingChange?.((!needsPlay && !failed) || Boolean(iframeSrc) || Boolean(videoSrc))
  }, [needsPlay, failed, iframeSrc, videoSrc, onPlayingChange])

  useImperativeHandle(ref, () => ({
    setVolume(volume) {
      volumeRef.current = Math.max(0, Math.min(100, Math.round(Number(volume) || 0)))
      if (modeRef.current === 'html5') {
        applyHtmlVolume(videoRef.current, volumeRef.current)
        return
      }
      if (playerRef.current) {
        applyYtVolume(playerRef.current, volumeRef.current)
        if (volumeRef.current > 0) playerRef.current.playVideo?.()
        return
      }
      if (id && iframeOn.current) {
        setIframeSrc(youtubeCoverSrc(id, start, volumeRef.current <= 0))
      }
    },
  }))

  useEffect(() => {
    if (!videoSrc) return undefined
    modeRef.current = 'html5'
    setFailed('')
    setIframeSrc('')
    const video = videoRef.current
    if (!video) return undefined

    applyHtmlVolume(video, volumeRef.current)
    video
      .play()
      .then(() => setNeedsPlay(false))
      .catch(() => setNeedsPlay(true))

    const onPlaying = () => setNeedsPlay(false)
    const onError = () => setFailed('Video dosyası oynatılamadı. MP4 bağlantısını kontrol edin.')
    video.addEventListener('playing', onPlaying)
    video.addEventListener('error', onError)
    return () => {
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('error', onError)
    }
  }, [videoSrc])

  useEffect(() => {
    if (videoSrc || !id) return undefined
    modeRef.current = 'youtube'
    setFailed('')

    // Mobile: start muted autoplay embed immediately (same intent as desktop).
    if (mobile.current) {
      iframeOn.current = true
      setIframeSrc(youtubeCoverSrc(id, start, true))
      setNeedsPlay(false)
      return undefined
    }

    if (!stageRef.current) return undefined

    setNeedsPlay(false)
    let cancelled = false
    let timer
    const mount = document.createElement('div')
    mount.style.width = '100%'
    mount.style.height = '100%'
    stageRef.current.appendChild(mount)

    const setup = async () => {
      try {
        const YT = await loadYoutubeApi()
        if (cancelled) return
        const player = new YT.Player(mount, {
          videoId: id,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            iv_load_policy: 3,
            loop: 1,
            playlist: id,
            start: Number(start) || 0,
          },
          events: {
            onReady: (event) => {
              applyYtVolume(event.target, volumeRef.current)
              event.target.playVideo()
              timer = window.setTimeout(() => {
                if (event.target.getPlayerState?.() !== 1) setNeedsPlay(true)
              }, 2500)
            },
            onStateChange: (event) => {
              if (event.data === YT.PlayerState.PLAYING) setNeedsPlay(false)
              if (event.data === YT.PlayerState.ENDED) {
                event.target.seekTo(Number(start) || 0)
                applyYtVolume(event.target, volumeRef.current)
                event.target.playVideo()
              }
            },
            onError: (event) => setFailed(youtubeEmbedError(event.data)),
          },
        })
        playerRef.current = player
      } catch {
        if (!cancelled) {
          iframeOn.current = true
          setIframeSrc(youtubeCoverSrc(id, start, true))
        }
      }
    }

    setup()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      try {
        playerRef.current?.destroy?.()
      } catch {
        /* ignore */
      }
      playerRef.current = null
      mount.remove()
    }
  }, [id, start, videoSrc])

  const playNow = (event) => {
    event?.preventDefault?.()
    event?.stopPropagation?.()

    if (videoSrc && videoRef.current) {
      applyHtmlVolume(videoRef.current, volumeRef.current)
      videoRef.current
        .play()
        .then(() => setNeedsPlay(false))
        .catch(() => setFailed('Videoyu başlatmak için tekrar deneyin.'))
      return
    }

    if (!id) return
    iframeOn.current = true
    // Reload embed with autoplay after an explicit gesture.
    setIframeSrc(youtubeCoverSrc(id, start, volumeRef.current <= 0))
    setNeedsPlay(false)
    setFailed('')
  }

  if (!id && !videoSrc) return null

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#080808]">
      {posterSrc ? (
        <img
          src={posterSrc}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
          onError={() => {
            const fallback = youtubeThumb(id, 'hqdefault')
            if (fallback && posterSrc !== fallback) setPosterSrc(fallback)
          }}
        />
      ) : null}

      {videoSrc ? (
        <video
          ref={videoRef}
          key={videoSrc}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={posterSrc || undefined}
          src={videoSrc}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : null}

      {!videoSrc ? <div ref={stageRef} className="yt-stage" aria-hidden /> : null}

      {!videoSrc && iframeSrc ? (
        <div className={`yt-stage${mobile.current ? ' yt-stage--interactive' : ''}`}>
          <iframe
            title="Hero video"
            src={iframeSrc}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            playsInline
          />
        </div>
      ) : null}

      {failed ? (
        <div className="pointer-events-none absolute inset-0 z-[70] flex items-center justify-center px-6 text-center">
          <p className="max-w-sm text-sm text-white/70">{failed}</p>
        </div>
      ) : null}

      {needsPlay && !failed ? (
        <button
          type="button"
          onClick={playNow}
          className="pointer-events-auto absolute inset-0 z-[70] flex cursor-pointer touch-manipulation items-center justify-center bg-black/25"
          aria-label={t.playVideo}
        >
          <span className="pointer-events-none rounded-full border border-white/45 bg-black/55 px-8 py-4 text-[11px] tracking-[0.4em] text-white uppercase">
            {t.play}
          </span>
        </button>
      ) : null}
    </div>
  )
})

export default YoutubeBackground
