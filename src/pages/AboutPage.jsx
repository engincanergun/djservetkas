import { useContent } from '../cms/ContentContext'
import MediaImg from '../components/MediaImg'
import PageShell from '../components/PageShell'
import { useLocale } from '../i18n/LocaleContext'

export default function AboutPage() {
  const { data } = useContent()
  const { locale, t, aboutEn } = useLocale()
  const { artist } = data
  const { about } = artist
  const body = locale === 'en' ? aboutEn : about?.body
  const role = locale === 'en' ? t.role : artist.role

  return (
    <PageShell title={t.nav.about}>
      <div className="mx-auto max-w-2xl space-y-7 text-center">
        {Array.isArray(body)
          ? body.map((paragraph) => (
              <p key={paragraph} className="text-[1.05rem] leading-[1.8] text-[#c8c8c8]">
                {paragraph}
              </p>
            ))
          : null}
        <p className="px-2 pt-4 text-[11px] tracking-[0.16em] text-balance text-[#999] uppercase sm:tracking-[0.32em]">
          {artist.name} · {role}
        </p>
      </div>

      <figure className="mt-16 overflow-hidden">
        <MediaImg
          src={about.wide.src}
          alt={about.wide.alt}
          className="h-[48vh] min-h-[280px] w-full object-cover md:h-[62vh]"
          loading="lazy"
        />
      </figure>
    </PageShell>
  )
}
