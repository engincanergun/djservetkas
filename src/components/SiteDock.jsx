import { useContent } from '../cms/ContentContext'
import SocialLinks from './SocialLinks'

export default function SiteDock({ home = false }) {
  const { data } = useContent()

  return (
    <div
      className={
        home
          ? 'pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 md:px-10 md:pb-8'
          : 'pointer-events-none z-40 shrink-0 bg-[#080808] px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 md:fixed md:inset-x-0 md:bottom-0 md:bg-transparent md:px-10 md:pt-0 md:pb-8'
      }
    >
      <div className="pointer-events-auto flex items-end justify-between gap-4">
        <SocialLinks className="flex shrink-0 items-center gap-3.5 sm:gap-5" size={22} />
        <a
          href={`mailto:${data.artist.email}`}
          className="min-w-0 text-right text-[13px] leading-snug font-medium tracking-normal text-white lowercase sm:text-[15px] md:tracking-[0.08em]"
        >
          {data.artist.email}
        </a>
      </div>
    </div>
  )
}
