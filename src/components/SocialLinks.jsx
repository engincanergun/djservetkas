import { useContent } from '../cms/ContentContext'
import { InstagramIcon, SoundcloudIcon, SpotifyIcon, YoutubeIcon } from './SocialIcons'

const links = [
  { key: 'instagram', label: 'Instagram', icon: InstagramIcon, color: '#E4405F' },
  { key: 'youtube', label: 'YouTube', icon: YoutubeIcon, color: '#FF0000' },
  { key: 'soundcloud', label: 'SoundCloud', icon: SoundcloudIcon, color: '#FF5500' },
  { key: 'spotify', label: 'Spotify', icon: SpotifyIcon, color: '#1DB954' },
]

export default function SocialLinks({ className = '', size = 22 }) {
  const { data } = useContent()
  const { artist } = data
  const items = links.filter((item) => artist[item.key])

  return (
    <ul className={className}>
      {items.map(({ key, label, icon: Icon, color }) => (
        <li key={label}>
          <a
            href={artist[key]}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            style={{ color }}
            className="block transition-opacity hover:opacity-70"
          >
            <Icon size={size} />
          </a>
        </li>
      ))}
    </ul>
  )
}
