import { useLocale } from '../i18n/LocaleContext'

export default function SiteCredit() {
  const { t } = useLocale()

  return (
    <p className="inline-flex max-w-full flex-wrap items-baseline justify-center gap-x-2.5 text-center [text-shadow:0_1px_10px_rgb(0_0_0/0.85)]">
      <span className="text-[10px] tracking-[0.22em] text-white/70 uppercase">{t.credit}</span>
      <a
        href="https://engincanergun.com"
        target="_blank"
        rel="noreferrer"
        className="pointer-events-auto text-[13px] tracking-[0.04em] text-white"
      >
        Engin Can Ergün
      </a>
    </p>
  )
}
