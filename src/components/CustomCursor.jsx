import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const root = useRef(null)
  const labelRef = useRef('')
  const shown = useRef(false)
  const point = useRef({ x: 0, y: 0 })
  const [label, setLabel] = useState('')
  const [visible, setVisible] = useState(false)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine) and (hover: hover)')
    const update = () => {
      const on = mq.matches
      setEnabled(on)
      document.body.classList.toggle('has-custom-cursor', on)
    }
    update()
    mq.addEventListener('change', update)
    return () => {
      mq.removeEventListener('change', update)
      document.body.classList.remove('has-custom-cursor')
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const place = (x, y) => {
      point.current.x = x
      point.current.y = y
      const el = root.current
      if (!el) return
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      el.style.opacity = '1'
    }

    const readLabel = (x, y) => {
      const hit = document.elementFromPoint(x, y)
      if (!(hit instanceof Element) || hit.closest('iframe')) return ''
      return hit.closest('[data-cursor]')?.getAttribute('data-cursor') || ''
    }

    const applyLabel = (next) => {
      if (next === labelRef.current) return
      labelRef.current = next
      setLabel(next)
    }

    const onMove = (e) => {
      place(e.clientX, e.clientY)
      if (!shown.current) {
        shown.current = true
        setVisible(true)
      }
      applyLabel(readLabel(e.clientX, e.clientY))
    }

    const onScroll = () => {
      applyLabel(readLabel(point.current.x, point.current.y))
    }

    const onOut = (e) => {
      if (e.relatedTarget) return
      const hit = document.elementFromPoint(point.current.x, point.current.y)
      if (hit instanceof HTMLIFrameElement) {
        if (root.current) root.current.style.opacity = '0'
        return
      }
      shown.current = false
      setVisible(false)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('scroll', onScroll, true)
    document.addEventListener('mouseout', onOut)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onScroll, true)
      document.removeEventListener('mouseout', onOut)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100] will-change-transform"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full ${
          label
            ? 'flex h-[4.5rem] w-[4.5rem] items-center justify-center border-[3px] border-white bg-[#080808] shadow-[0_0_0_2px_#fff]'
            : 'h-4 w-4 border-2 border-[#080808] bg-white shadow-[0_0_0_2px_#fff]'
        }`}
      >
        {label ? (
          <span className="text-[9px] font-medium tracking-[0.22em] text-white uppercase">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  )
}
