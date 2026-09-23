import { Mail, Phone } from 'lucide-react'
import { useState } from 'react'
import { artist } from '../data/artist'
import Reveal from './Reveal'
import { InstagramIcon, SoundcloudIcon, YoutubeIcon } from './SocialIcons'

const social = [
  { href: artist.instagram, label: 'Instagram', icon: InstagramIcon },
  { href: artist.youtube, label: 'YouTube', icon: YoutubeIcon },
  { href: artist.soundcloud, label: 'SoundCloud', icon: SoundcloudIcon },
]

const empty = { name: '', email: '', message: '' }

export default function Contact() {
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  const onChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }

  const validate = () => {
    const next = {}
    if (!values.name.trim()) next.name = 'Ad soyad gerekli.'
    if (!values.email.trim()) next.email = 'E-posta gerekli.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Geçerli bir e-posta girin.'
    if (!values.message.trim() || values.message.trim().length < 8) {
      next.message = 'Mesaj biraz daha uzun olsun.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('sending')

    if (artist.formEndpoint) {
      try {
        const res = await fetch(artist.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            message: values.message,
            _replyto: values.email,
            _subject: 'DJ Servet Kaş sitesinden mesaj',
            _template: 'box',
            _captcha: 'false',
          }),
        })
        if (!res.ok) throw new Error('request failed')
        setStatus('sent')
        setValues(empty)
      } catch {
        setStatus('error')
      }
      return
    }

    await new Promise((r) => setTimeout(r, 500))
    setStatus('sent')
    setValues(empty)
  }

  const field =
    'w-full border-0 border-b border-white/12 bg-transparent py-3 text-sm text-[#f5f5f5] outline-none transition-colors placeholder:text-[#666] focus:border-white/40'

  return (
    <section id="contact" className="bg-[#0a0a0a] px-5 py-24 md:px-10 md:py-32 lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <p className="kicker">İletişim</p>
          <h2 className="mt-6 max-w-[10ch] text-[clamp(2.8rem,7vw,6.2rem)] leading-[0.9] font-light tracking-[-0.045em]">
            Birlikte çalışalım
          </h2>
          <p className="mt-8 max-w-md text-[#9a9a9a]">
            Rezervasyon, özel etkinlikler, kulüp geceleri. Formu doldurun veya doğrudan yazın.
          </p>

          <div className="mt-12 space-y-4">
            <a href={`mailto:${artist.email}`} className="flex items-center gap-3 text-sm text-[#ddd] lowercase">
              <Mail size={16} strokeWidth={1.4} />
              {artist.email}
            </a>
            <a href={`tel:${artist.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-sm text-[#ddd]">
              <Phone size={16} strokeWidth={1.4} />
              {artist.phone}
            </a>
          </div>

          <ul className="mt-10 flex gap-5">
            {social.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="text-white/75 transition-opacity hover:opacity-50"
                >
                  <Icon size={18} strokeWidth={1.35} />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="lg:col-span-5 lg:pt-10" delay={0.1}>
          <form onSubmit={onSubmit} noValidate className="space-y-8">
            <div>
              <label htmlFor="name" className="kicker">
                Ad soyad
              </label>
              <input
                id="name"
                name="name"
                value={values.name}
                onChange={onChange}
                className={field}
                autoComplete="name"
              />
              {errors.name ? <p className="mt-2 text-xs text-[#b8b8b8]">{errors.name}</p> : null}
            </div>
            <div>
              <label htmlFor="email" className="kicker">
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={values.email}
                onChange={onChange}
                className={field}
                autoComplete="email"
              />
              {errors.email ? <p className="mt-2 text-xs text-[#b8b8b8]">{errors.email}</p> : null}
            </div>
            <div>
              <label htmlFor="message" className="kicker">
                Mesaj
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={values.message}
                onChange={onChange}
                className={`${field} resize-none`}
              />
              {errors.message ? <p className="mt-2 text-xs text-[#b8b8b8]">{errors.message}</p> : null}
            </div>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="text-[11px] tracking-[0.32em] uppercase transition-opacity hover:opacity-60 disabled:opacity-40"
            >
              {status === 'sending' ? 'Gönderiliyor' : 'Mesaj gönder'}
            </button>
            {status === 'sent' ? (
              <p className="text-sm text-[#999]">Mesajınız alındı. En kısa sürede dönüş yapacağım.</p>
            ) : null}
            {status === 'error' ? (
              <p className="text-sm text-[#999]">Bir sorun oluştu. Lütfen doğrudan e-posta gönderin.</p>
            ) : null}
          </form>
        </Reveal>
      </div>
    </section>
  )
}
