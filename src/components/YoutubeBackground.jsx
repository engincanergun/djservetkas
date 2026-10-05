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
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}

function needsTapToPlay() {
  if (typeof window === 'undefined') return true
  return window.matchMedia('(hover: none), (pointer: coarse), (max-width: 1024px)').matches
}

const YoutubeBackground = forwardRef(function YoutubeBackground(
  { youtubeId, start = 0, poster = '', videoSrc = '' },
  ref,
) {
  const id = parseYoutubeId(youtubeId)
  const stageRef = useRef(null)
  const playerRef = useRef(null)
  const videoRef = useRef(null)
  const volumeRef = useRef(0)
  const modeRef = useRef(videoSrc ? 'html5' : 'youtube')
  const { t } = useLocale()
  const tapMode = useRef(needsTapToPlay())
  const [needsPlay, setNeedsPlay] = useState(() => !videoSrc && needsTapToPlay())
  const [failed, setFailed] = useState('')
  const [iframeSrc, setIframeSrc] = useState('')
  const iframeOn = useRef(false)
  const thumb = poster || youtubeThumb(id)

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

  // Native MP4
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

  // Desktop YouTube API only. Mobile never mounts YT.Player (iframes steal taps on Android).
  useEffect(() => {
    if (videoSrc || !id || !stageRef.current) return undefined
    modeRef.current = 'youtube'
    setFailed('')

    if (tapMode.current) {
      setNeedsPlay(true)
      return undefined
    }

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
        if (!cancelled) setNeedsPlay(true)
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

    // Plain embed after an explicit tap — most stable on Android / Instagram browsers.
    iframeOn.current = true
    setIframeSrc(youtubeCoverSrc(id, start, volumeRef.current <= 0))
    setNeedsPlay(false)
    setFailed('')
  }

  if (!id && !videoSrc) return null

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#080808]">
      {thumb ? (
        <img src={thumb} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
      ) : null}

      {videoSrc ? (
        <video
          ref={videoRef}
          key={videoSrc}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={thumb || undefined}
          src={videoSrc}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : null}

      {!videoSrc ? <div ref={stageRef} className="yt-stage" /> : null}

      {!videoSrc && iframeSrc ? (
        <div className="yt-stage">
          <iframe
            title="Hero video"
            src={iframeSrc}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      ) : null}

      {failed ? (
        <div className="pointer-events-none absolute inset-0 z-[46] flex items-center justify-center px-6 text-center">
          <p className="max-w-sm text-sm text-white/70">{failed}</p>
        </div>
      ) : null}

      {needsPlay && !failed ? (
        <button
          type="button"
          onClick={playNow}
          className="pointer-events-auto fixed inset-0 z-[45] flex cursor-pointer items-center justify-center touch-manipulation"
          aria-label={t.playVideo}
        >
          <span className="rounded-full border border-white/40 bg-black/45 px-7 py-3.5 text-[11px] tracking-[0.4em] text-white uppercase backdrop-blur-[2px]">
            {t.play}
          </span>
        </button>
      ) : null}
    </div>
  )
})

export default YoutubeBackground
