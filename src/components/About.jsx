import { artist } from '../data/artist'
import Reveal from './Reveal'

export default function About() {
  const { about, name, role } = artist

  return (
    <section id="about" className="relative overflow-hidden bg-[#0a0a0a] px-5 py-24 md:px-10 md:py-32 lg:px-16">
      <p className="pointer-events-none absolute top-8 left-0 text-[clamp(5rem,18vw,16rem)] leading-none font-light text-white/[0.035] select-none">
        HAKKIMDA
      </p>

      <div className="relative mx-auto grid max-w-7xl gap-16 lg:grid-cols-12 lg:gap-10">
        <Reveal className="lg:col-span-5">
          <p className="kicker">{about.kicker}</p>
          <h2 className="mt-6 text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.95] font-light tracking-[-0.04em]">
            {about.heading}
          </h2>
          <figure className="mt-10 hidden max-w-xs overflow-hidden md:block">
            <img
              src={about.portrait.src}
              alt={about.portrait.alt}
              className="aspect-[3/4] w-full object-cover"
              loading="lazy"
            />
          </figure>
        </Reveal>

        <Reveal className="space-y-6 lg:col-span-6 lg:col-start-7 lg:pt-16" delay={0.12}>
          {about.body.map((paragraph) => (
            <p key={paragraph} className="max-w-xl text-[1.05rem] leading-[1.75] text-[#c8c8c8]">
              {paragraph}
            </p>
          ))}
        </Reveal>
      </div>

      <Reveal className="relative mx-auto mt-24 max-w-7xl" delay={0.08}>
        <figure className="relative overflow-hidden">
          <img
            src={about.wide.src}
            alt={about.wide.alt}
            className="h-[52vh] min-h-[320px] w-full object-cover md:h-[68vh]"
            loading="lazy"
            sizes="100vw"
          />
          <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-4 bg-gradient-to-t from-black/80 to-transparent px-6 py-8 sm:flex-row sm:items-end sm:justify-between md:px-10">
            <div>
              <p className="text-xl font-light md:text-2xl">{name}</p>
              <p className="mt-1 text-sm text-[#bdbdbd]">{role}</p>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {about.tags.map((tag) => (
                <li key={tag} className="kicker text-white/80">
                  {tag}
                </li>
              ))}
            </ul>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  )
}
