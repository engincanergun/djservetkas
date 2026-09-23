import { Mail, Phone } from 'lucide-react'
import { useState } from 'react'
import { useContent } from '../cms/ContentContext'
import PageShell from '../components/PageShell'
import SocialLinks from '../components/SocialLinks'
import { useLocale } from '../i18n/LocaleContext'

const empty = { name: '', email: '', message: '' }

export default function ContactPage() {
  const { data } = useContent()
  const { t } = useLocale()
  const { artist } = data
  const [values, setValues] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')

  const onChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
  }

  const validate = () => {
    const next = {}
    if (!values.name.trim()) next.name = t.errName
    if (!values.email.trim()) next.email = t.errEmail
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = t.errEmailInvalid
    if (!values.message.trim() || values.message.trim().length < 8) next.message = t.errMessage
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
        if (!res.ok) throw new Error('failed')
        setStatus('sent')
        setValues(empty)
      } catch {
        setStatus('error')
      }
      return
    }
    await new Promise((r) => setTimeout(r, 400))
    setStatus('sent')
    setValues(empty)
  }

  const field =
    'w-full border-0 border-b border-white/12 bg-transparent py-3 text-sm outline-none focus:border-white/40'

  return (
    <PageShell title={t.nav.contact}>
      <div className="mx-auto grid max-w-5xl gap-16 lg:grid-cols-2">
        <div>
          <p className="max-w-sm text-[#9a9a9a]">{t.contactLead}</p>
          <div className="mt-10 space-y-4">
            <a href={`mailto:${artist.email}`} className="flex items-center gap-3 text-sm">
              <Mail size={16} strokeWidth={1.4} />
              {artist.email}
            </a>
            <a href={`tel:${(artist.phone || '').replace(/\s/g, '')}`} className="flex items-center gap-3 text-sm">
              <Phone size={16} strokeWidth={1.4} />
              {artist.phone}
            </a>
          </div>
          <SocialLinks className="mt-10 flex gap-5" />
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-8">
          <div>
            <label htmlFor="name" className="kicker">
              {t.name}
            </label>
            <input id="name" name="name" value={values.name} onChange={onChange} className={field} />
            {errors.name ? <p className="mt-2 text-xs text-[#999]">{errors.name}</p> : null}
          </div>
          <div>
            <label htmlFor="email" className="kicker">
              {t.email}
            </label>
            <input id="email" name="email" type="email" value={values.email} onChange={onChange} className={field} />
            {errors.email ? <p className="mt-2 text-xs text-[#999]">{errors.email}</p> : null}
          </div>
          <div>
            <label htmlFor="message" className="kicker">
              {t.message}
            </label>
            <textarea id="message" name="message" rows={4} value={values.message} onChange={onChange} className={`${field} resize-none`} />
            {errors.message ? <p className="mt-2 text-xs text-[#999]">{errors.message}</p> : null}
          </div>
          <button type="submit" disabled={status === 'sending'} className="text-[11px] tracking-[0.32em] uppercase">
            {status === 'sending' ? t.sending : t.send}
          </button>
          {status === 'sent' ? <p className="text-sm text-[#999]">{t.sent}</p> : null}
          {status === 'error' ? <p className="text-sm text-[#999]">{t.sendError}</p> : null}
        </form>
      </div>
    </PageShell>
  )
}
