import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { loadYoutubeApi, parseYoutubeId, youtubeEmbedError, youtubeThumb } from '../data/videos'
import { useLocale } from '../i18n/LocaleContext'

function applyVolume(player, volume) {
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

const YoutubeBackground = forwardRef(function YoutubeBackground({ youtubeId, start = 0, poster = '' }, ref) {
  const id = parseYoutubeId(youtubeId)
  const stageRef = useRef(null)
  const playerRef = useRef(null)
  const volumeRef = useRef(0)
  const { t } = useLocale()
  const [blocked, setBlocked] = useState(false)
  const [failed, setFailed] = useState('')
  const thumb = poster || youtubeThumb(id)

  useImperativeHandle(ref, () => ({
    setVolume(volume) {
      volumeRef.current = Math.max(0, Math.min(100, Math.round(Number(volume) || 0)))
      applyVolume(playerRef.current, volumeRef.current)
      if (volumeRef.current > 0) playerRef.current?.playVideo?.()
    },
  }))

  useEffect(() => {
    if (!id || !stageRef.current) return undefined
    setFailed('')
    setBlocked(false)
    let cancelled = false
    let timer
    const mount = document.createElement('div')
    mount.style.width = '100%'
    mount.style.height = '100%'
    stageRef.current.appendChild(mount)

    const setup = async () => {
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
            applyVolume(event.target, volumeRef.current)
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
              applyVolume(event.target, volumeRef.current)
              event.target.playVideo()
            }
          },
          onError: (event) => setFailed(youtubeEmbedError(event.data)),
        },
      })
      playerRef.current = player
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
  }, [id, start])

  const playNow = () => {
    try {
      applyVolume(playerRef.current, volumeRef.current)
      playerRef.current?.playVideo?.()
      setBlocked(false)
    } catch {
      setFailed('Bu video sitede oynatılamıyor.')
    }
  }

  if (!id) return null

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#080808]">
      {thumb ? <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
      <div ref={stageRef} className="yt-stage" />

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
          <span className="text-[11px] tracking-[0.4em] text-white uppercase">{t.play}</span>
        </button>
      ) : null}
    </div>
  )
})

export default YoutubeBackground
