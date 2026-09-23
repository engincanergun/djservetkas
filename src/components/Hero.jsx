import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { artist } from '../data/artist'

export default function Hero() {
  const { hero, name, role } = artist
  const [src, setSrc] = useState(hero.videoDesktop)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => setSrc(mq.matches ? hero.videoMobile : hero.videoDesktop)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [hero.videoDesktop, hero.videoMobile])

  return (
    <section id="home" className="relative h-svh min-h-[640px] overflow-hidden bg-[#080808]">
      <video
        key={src}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={hero.poster}
        preload="metadata"
        src={src}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/35 to-[#080808]/25" />
      <div className="absolute inset-0 bg-[#080808]/20" />

      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-16 md:px-10 lg:px-16 lg:pb-20">
        <motion.h1
          className="max-w-[16ch] text-[clamp(3.1rem,11vw,8.4rem)] leading-[0.88] font-light tracking-[-0.045em]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.05, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {name}
        </motion.h1>
        <motion.p
          className="mt-6 text-[11px] tracking-[0.42em] text-[#e8e8e8] uppercase md:text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.6 }}
        >
          {role}
        </motion.p>
      </div>

      <a
        href="#about"
        className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 text-[9px] tracking-[0.4em] text-white/70 uppercase md:block"
      >
        {hero.scrollHint}
      </a>
    </section>
  )
}
