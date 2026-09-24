import { useContent } from '../cms/ContentContext'
import SocialLinks from './SocialLinks'

export default function SiteDock() {
  const { data } = useContent()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 md:px-10 md:pb-8">
      <div className="pointer-events-auto flex items-end justify-between gap-4">
        <SocialLinks className="flex items-center gap-3.5 sm:gap-5" size={22} />
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
