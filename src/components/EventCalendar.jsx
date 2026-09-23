import { events, eventVisuals } from '../data/events'
import Reveal from './Reveal'

function isPast(iso) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${iso}T00:00:00`) < today
}

export default function EventCalendar() {
  const upcoming = events.filter((e) => !isPast(e.iso))
  const past = events.filter((e) => isPast(e.iso))
  const ordered = [...upcoming, ...past]

  return (
    <section id="events" className="bg-[#080808] px-5 py-24 md:px-10 md:py-32 lg:px-8 xl:px-12">
      <div className="mx-auto grid max-w-[1600px] gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,0.9fr)] lg:items-stretch">
        <Reveal className="min-h-[280px] overflow-hidden lg:min-h-[640px]">
          <img
            src={eventVisuals.left.src}
            alt={eventVisuals.left.alt}
            className="h-72 w-full object-cover lg:h-full"
            loading="lazy"
          />
        </Reveal>

        <div className="flex flex-col justify-center border-y border-white/10 px-1 py-10 md:px-6 lg:border-y-0 xl:px-10">
          <Reveal>
            <p className="kicker">Tarihler</p>
            <h2 className="mt-5 text-[clamp(2.2rem,4vw,3.6rem)] leading-[0.95] font-light tracking-[-0.04em]">
              Etkinlik Takvimi
            </h2>
          </Reveal>

          <div className="mt-10">
            {ordered.length === 0 ? (
              <p className="text-sm tracking-[0.18em] text-[#999] uppercase">Yaklaşan etkinlik yok</p>
            ) : (
              <ul>
                {ordered.map((event) => {
                  const pastEvent = isPast(event.iso)
                  return (
                    <li
                      key={`${event.iso}-${event.title}`}
                      className={`border-t border-white/12 py-6 last:border-b ${
                        pastEvent ? 'opacity-40' : 'opacity-100'
                      }`}
                    >
                      <p className="text-[11px] tracking-[0.28em] text-[#c9b8a4] uppercase">{event.date}</p>
                      <p className="mt-3 text-xl font-light md:text-2xl">{event.title}</p>
                      <p className="mt-1 text-sm text-[#999]">
                        {event.city} / {event.venue}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <Reveal className="min-h-[280px] overflow-hidden lg:min-h-[640px]" delay={0.1}>
          <img
            src={eventVisuals.right.src}
            alt={eventVisuals.right.alt}
            className="h-72 w-full object-cover lg:h-full"
            loading="lazy"
          />
        </Reveal>
      </div>
    </section>
  )
}
