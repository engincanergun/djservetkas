import { useContent } from '../cms/ContentContext'
import { InstagramIcon, SoundcloudIcon, YoutubeIcon } from './SocialIcons'

export default function SocialLinks({ className = '', size = 18 }) {
  const { data } = useContent()
  const { artist } = data
  const items = [
    { href: artist.instagram, label: 'Instagram', icon: InstagramIcon },
    { href: artist.youtube, label: 'YouTube', icon: YoutubeIcon },
    { href: artist.soundcloud, label: 'SoundCloud', icon: SoundcloudIcon },
  ].filter((item) => item.href)

  return (
    <ul className={className}>
      {items.map(({ href, label, icon: Icon }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noreferrer" aria-label={label} className="text-white/80 transition-opacity hover:opacity-50">
            <Icon size={size} />
          </a>
        </li>
      ))}
    </ul>
  )
}
