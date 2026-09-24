export function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="ig-brand" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fccc63" />
          <stop offset="0.35" stopColor="#f77737" />
          <stop offset="0.62" stopColor="#e1306c" />
          <stop offset="1" stopColor="#833ab4" />
        </linearGradient>
      </defs>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="url(#ig-brand)" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.6" stroke="url(#ig-brand)" strokeWidth="1.6" />
      <circle cx="16.7" cy="7.3" r="0.9" fill="url(#ig-brand)" />
    </svg>
  )
}

export function YoutubeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2.5" y="6" width="19" height="12" rx="3.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.4 9.4v5.2L15.2 12 10.4 9.4Z" fill="currentColor" />
    </svg>
  )
}

export function SpotifyIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 10.2c2.4-1 5.6-.8 7.8.6M8.4 12.8c1.9-.8 4.4-.6 6.2.5M8.8 15.2c1.4-.5 3.2-.4 4.6.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function SoundcloudIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 15.5V12M8.1 16V10.5M10.2 16V9.2M12.2 16V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14 15.8a3.3 3.3 0 1 0-1.4-6.3 4.2 4.2 0 0 0-7.4 2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
