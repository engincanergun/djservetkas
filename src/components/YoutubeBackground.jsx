import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  isRestrictedVideoEnv,
  loadYoutubeApi,
  parseYoutubeId,
  youtubeEmbedError,
  youtubeThumb,
} from '../data/videos'
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
  })
  return `https://www.youtube.com/embed/${id}?${params.toString()}`
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
  const [blocked, setBlocked] = useState(() => !videoSrc && isRestrictedVideoEnv())
  const [failed, setFailed] = useState('')
  const [iframeSrc, setIframeSrc] = useState('')
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
      if (id) {
        setIframeSrc((current) =>
          current ? youtubeCoverSrc(id, start, volumeRef.current <= 0) : current,
        )
      }
    },
  }))

  // Native MP4 path — reliable on Android WebView.
  useEffect(() => {
    if (!videoSrc) return undefined
    modeRef.current = 'html5'
    setFailed('')
    setBlocked(false)
    setIframeSrc('')
    const video = videoRef.current
    if (!video) return undefined

    applyHtmlVolume(video, volumeRef.current)
    const tryPlay = () => {
      video.play().then(() => setBlocked(false)).catch(() => setBlocked(true))
    }
    tryPlay()
    const onPlaying = () => setBlocked(false)
    const onError = () => setFailed('Video dosyası oynatılamadı. MP4 bağlantısını kontrol edin.')
    video.addEventListener('playing', onPlaying)
    video.addEventListener('error', onError)
    return () => {
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('error', onError)
    }
  }, [videoSrc])

  // YouTube path — API on desktop; tap + iframe on restricted Android/WebView.
  useEffect(() => {
    if (videoSrc || !id || !stageRef.current) return undefined
    modeRef.current = 'youtube'
    setFailed('')

    const restricted = isRestrictedVideoEnv()
    if (restricted) {
      setBlocked(true)
      return undefined
    }

    setBlocked(false)
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
                if (event.target.getPlayerState?.() !== 1) setBlocked(true)
              }, 2500)
            },
            onStateChange: (event) => {
              const playingId = event.target.getVideoData?.()?.video_id
              if (playingId && playingId !== id) {
                event.target.loadVideoById({ videoId: id, startSeconds: Number(start) || 0 })
                return
              }
              if (event.data === YT.PlayerState.PLAYING) setBlocked(false)
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
        if (!cancelled) setBlocked(true)
      }
    }

    setup()

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      try {
        playerRef.current?.destroy?.()
      } catch {
        /* player may already be gone */
      }
      playerRef.current = null
      mount.remove()
    }
  }, [id, start, videoSrc])

  const playNow = () => {
    if (videoSrc && videoRef.current) {
      applyHtmlVolume(videoRef.current, volumeRef.current)
      videoRef.current.play().then(() => setBlocked(false)).catch(() => {
        setFailed('Video otomatik başlamadı. Tekrar deneyin.')
      })
      return
    }

    if (!id) return

    // Android WebView / in-app browsers: iframe after user gesture is more reliable than YT.Player.
    if (isRestrictedVideoEnv() || !playerRef.current) {
      setIframeSrc(youtubeCoverSrc(id, start, volumeRef.current <= 0))
      setBlocked(false)
      setFailed('')
      return
    }

    try {
      applyYtVolume(playerRef.current, volumeRef.current)
      playerRef.current.playVideo?.()
      setBlocked(false)
    } catch {
      setIframeSrc(youtubeCoverSrc(id, start, volumeRef.current <= 0))
      setBlocked(false)
    }
  }

  if (!id && !videoSrc) return null

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#080808]">
      {thumb ? <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}

      {videoSrc ? (
        <video
          ref={videoRef}
          key={videoSrc}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
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
            playsInline
          />
        </div>
      ) : null}

      {failed ? (
        <div className="absolute inset-0 z-[2] flex items-center justify-center px-6 text-center">
          <p className="max-w-sm text-sm text-white/70">{failed}</p>
        </div>
      ) : null}

      {blocked && !failed ? (
        <button
          type="button"
          onClick={playNow}
          className="absolute inset-0 z-[2] flex items-center justify-center"
          aria-label={t.playVideo}
        >
          <span className="rounded-full border border-white/35 px-6 py-3 text-[11px] tracking-[0.4em] text-white uppercase">
            {t.play}
          </span>
        </button>
      ) : null}
    </div>
  )
})

export default YoutubeBackground
