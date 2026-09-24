import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
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

    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
      setVisible(true)
      const target = e.target instanceof Element ? e.target.closest('[data-cursor]') : null
      setLabel(target?.getAttribute('data-cursor') || '')
    }
    const hide = () => setVisible(false)

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', hide)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', hide)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[100]"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      <div
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full ${
          label
            ? 'flex h-[4.5rem] w-[4.5rem] items-center justify-center border-[3px] border-white bg-[#080808] shadow-[0_0_0_2px_#fff]'
            : 'h-4 w-4 border-2 border-[#080808] bg-white shadow-[0_0_0_2px_#fff]'
        }`}
        style={{ transition: 'width 0.35s ease, height 0.35s ease' }}
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
