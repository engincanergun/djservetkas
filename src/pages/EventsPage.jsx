import { useContent } from '../cms/ContentContext'
import { formatEventDate } from '../cms/defaults'
import MediaImg from '../components/MediaImg'
import PageShell from '../components/PageShell'
import { useLocale } from '../i18n/LocaleContext'

function isPast(iso) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${iso}T00:00:00`) < today
}

export default function EventsPage() {
  const { data } = useContent()
  const { locale, t } = useLocale()
  const upcoming = data.events.filter((e) => !isPast(e.iso))
  const past = data.events.filter((e) => isPast(e.iso))
  const ordered = [...upcoming, ...past]

  return (
    <PageShell title={t.nav.events}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,0.9fr)] lg:items-stretch">
        <div className="min-h-[240px] overflow-hidden lg:min-h-[560px]">
          <MediaImg
            src={data.eventVisuals.left.src}
            alt={locale === 'en' && data.eventVisuals.left.altEn ? data.eventVisuals.left.altEn : data.eventVisuals.left.alt}
            className="h-64 w-full object-cover lg:h-full"
            loading="lazy"
          />
        </div>

        <div className="flex flex-col justify-center px-1 py-4 md:px-6">
          {ordered.length === 0 ? (
            <p className="text-center text-sm tracking-[0.18em] text-[#999] uppercase">{t.noEvents}</p>
          ) : (
            <ul>
              {ordered.map((event) => (
                <li
                  key={`${event.iso}-${event.title}`}
                  className={`border-t border-white/12 py-6 last:border-b ${isPast(event.iso) ? 'opacity-40' : ''}`}
                >
                  <p className="text-[11px] tracking-[0.16em] text-[#c9b8a4] uppercase sm:tracking-[0.28em]">
                    {locale === 'en' ? formatEventDate(event.iso, 'en') : event.date || formatEventDate(event.iso, 'tr')}
                  </p>
                  <p className="mt-3 text-xl font-light md:text-2xl">
                    {locale === 'en' && event.titleEn ? event.titleEn : event.title}
                  </p>
                  <p className="mt-1 text-sm text-[#999]">
                    {event.city} / {locale === 'en' && event.venueEn ? event.venueEn : event.venue}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="min-h-[240px] overflow-hidden lg:min-h-[560px]">
          <MediaImg
            src={data.eventVisuals.right.src}
            alt={locale === 'en' && data.eventVisuals.right.altEn ? data.eventVisuals.right.altEn : data.eventVisuals.right.alt}
            className="h-64 w-full object-cover lg:h-full"
            loading="lazy"
          />
        </div>
      </div>
    </PageShell>
  )
}
