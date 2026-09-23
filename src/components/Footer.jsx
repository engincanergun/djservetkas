import { artist } from '../data/artist'
import { InstagramIcon, SoundcloudIcon, YoutubeIcon } from './SocialIcons'

const social = [
  { href: artist.instagram, label: 'Instagram', icon: InstagramIcon },
  { href: artist.youtube, label: 'YouTube', icon: YoutubeIcon },
  { href: artist.soundcloud, label: 'SoundCloud', icon: SoundcloudIcon },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/12 bg-[#080808] px-5 py-10 md:px-10 lg:px-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm tracking-[0.22em] uppercase">{artist.name}</p>
          <p className="mt-2 text-[11px] tracking-[0.24em] text-[#888] uppercase">{artist.role}</p>
        </div>
        <ul className="flex gap-5">
          {social.map(({ href, label, icon: Icon }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="text-white/70">
                <Icon size={16} strokeWidth={1.35} />
              </a>
            </li>
          ))}
        </ul>
        <p className="text-[11px] tracking-[0.18em] text-[#777] uppercase">
          © {new Date().getFullYear()} {artist.name}
        </p>
      </div>
    </footer>
  )
}
