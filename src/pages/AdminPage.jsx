import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../cms/ContentContext'
import { formatEventDate, getDefaults } from '../cms/defaults'
import { clearSnapshot, isAuthed, isIdbSrc, setAuthed } from '../cms/storage'
import { artist } from '../data/artist'
import { parseYoutubeId, videoCategories } from '../data/videos'

const tabs = [
  { id: 'genel', label: 'Ana sayfa' },
  { id: 'about', label: 'Hakkımda' },
  { id: 'videos', label: 'Videolar' },
  { id: 'events', label: 'Etkinlikler' },
  { id: 'gallery', label: 'Görseller' },
  { id: 'contact', label: 'İletişim' },
]

const input = 'w-full border border-white/12 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/30'
const label = 'mb-1 block text-[10px] tracking-[0.22em] text-[#999] uppercase'

function FileField({ caption, accept, value, onChange, hint }) {
  const { mediaUrl, upload } = useContent()
  const preview = value ? mediaUrl(value) : ''
  const isVideo = accept?.includes('video')

  return (
    <div className="space-y-2">
      <p className={label}>{caption}</p>
      {preview && !isVideo ? <img src={preview} alt="" className="h-28 w-full object-cover" /> : null}
      {preview && isVideo ? (
        <video src={preview} className="h-28 w-full object-cover" muted />
      ) : null}
      <input
        type="file"
        accept={accept}
        className="block w-full text-xs text-[#aaa]"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return
          onChange(await upload(file))
          e.target.value = ''
        }}
      />
      <input
        className={input}
        placeholder="veya bağlantı yapıştır (https://...)"
        value={isIdbSrc(value) ? '' : value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <p className="text-xs text-[#777]">{hint}</p> : null}
    </div>
  )
}

export default function AdminPage() {
  const { data, persist, upload } = useContent()
  const [ok, setOk] = useState(isAuthed())
  const [pin, setPin] = useState('')
  const [tab, setTab] = useState('genel')
  const [saved, setSaved] = useState(false)

  const patch = (next) => {
    persist(next)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1200)
  }

  const login = (e) => {
    e.preventDefault()
    if (pin.trim() === artist.cmsPin) {
      setAuthed(true)
      setOk(true)
    }
  }

  if (!ok) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-[#080808] px-6">
        <form onSubmit={login} className="w-full max-w-xs space-y-6">
          <p className="text-center text-[11px] tracking-[0.4em] uppercase">Yönetim</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className={input}
            placeholder="Şifre"
            autoFocus
          />
          <button type="submit" className="w-full text-[11px] tracking-[0.3em] uppercase">
            Giriş
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-svh bg-[#0a0a0a] text-[#f5f5f5]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <p className="text-[11px] tracking-[0.28em] uppercase">İçerik paneli</p>
        <div className="flex items-center gap-5 text-[10px] tracking-[0.2em] uppercase">
          {saved ? <span className="text-[#c9b8a4]">Kaydedildi</span> : null}
          <Link to="/">Siteye dön</Link>
          <button
            type="button"
            onClick={() => {
              setAuthed(false)
              setOk(false)
            }}
          >
            Çıkış
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-4 border-b border-white/10 px-5 py-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`text-[10px] tracking-[0.22em] uppercase ${tab === item.id ? 'text-white' : 'text-[#888]'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-5 py-10">
        {tab === 'genel' ? (
          <section className="space-y-6">
            <p className="text-sm leading-relaxed text-[#999]">
              YouTube linkini yapıştırın; kayıt 11 karakterlik video ID olarak kilitlenir. Video bitince aynı kayıt başa sarar, YouTube önerisi açılmaz. Sadece kendi kanalınıza yüklediğiniz videolar sitede oynar.
            </p>
            <div>
              <label className={label}>YouTube adresi</label>
              <input
                className={input}
                placeholder="https://www.youtube.com/watch?v=..."
                value={data.artist.hero.youtubeId || ''}
                onChange={(e) => {
                  const raw = e.target.value.trim()
                  const locked = parseYoutubeId(raw) || raw
                  patch({
                    ...data,
                    artist: { ...data.artist, hero: { ...data.artist.hero, youtubeId: locked } },
                  })
                }}
              />
              {parseYoutubeId(data.artist.hero.youtubeId) ? (
                <p className="mt-2 text-xs text-[#777]">
                  Kilitli video ID: {parseYoutubeId(data.artist.hero.youtubeId)} — bu ID kod veya panelden değişmeden aynı kalır.
                </p>
              ) : null}
            </div>
            {parseYoutubeId(data.artist.hero.youtubeId) ? (
              <div className="space-y-3">
                <p className="text-xs text-[#777]">
                  ID: {parseYoutubeId(data.artist.hero.youtubeId)} — önizleme (ses açık olabilir)
                </p>
                <div className="aspect-video overflow-hidden bg-black">
                  <iframe
                    title="Önizleme"
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${parseYoutubeId(data.artist.hero.youtubeId)}?rel=0&modestbranding=1&loop=1&playlist=${parseYoutubeId(data.artist.hero.youtubeId)}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#888]">Geçerli bir YouTube linki yapıştırın.</p>
            )}
            <div>
              <label className={label}>Kaçıncı saniyeden başlasın</label>
              <input
                type="number"
                min="0"
                className={input}
                value={data.artist.hero.start || 0}
                onChange={(e) =>
                  patch({
                    ...data,
                    artist: { ...data.artist, hero: { ...data.artist.hero, start: Number(e.target.value) || 0 } },
                  })
                }
              />
            </div>
          </section>
        ) : null}

        {tab === 'about' ? (
          <section className="space-y-6">
            <div>
              <label className={label}>Hakkımda metni</label>
              <textarea
                rows={10}
                className={input}
                value={data.artist.about.body.join('\n\n')}
                onChange={(e) =>
                  patch({
                    ...data,
                    artist: {
                      ...data.artist,
                      about: {
                        ...data.artist.about,
                        body: e.target.value.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
                      },
                    },
                  })
                }
              />
              <p className="mt-2 text-xs text-[#777]">Paragrafları boş satırla ayırın.</p>
            </div>
            <FileField
              caption="Sayfa görseli"
              accept="image/*"
              value={data.artist.about.wide.src}
              onChange={(src) =>
                patch({
                  ...data,
                  artist: { ...data.artist, about: { ...data.artist.about, wide: { ...data.artist.about.wide, src } } },
                })
              }
            />
          </section>
        ) : null}

        {tab === 'videos' ? (
          <section className="space-y-8">
            <p className="text-sm text-[#999]">
              YouTube’da videoyu açın, adresteki ID’yi kopyalayın. Örnek: youtube.com/watch?v=<strong>ABC123</strong>
            </p>
            {data.videos.map((video, i) => (
              <div key={i} className="space-y-3 border border-white/10 p-4">
                <input
                  className={input}
                  value={video.title}
                  placeholder="Başlık"
                  onChange={(e) => {
                    const videos = data.videos.map((v, idx) => (idx === i ? { ...v, title: e.target.value } : v))
                    patch({ ...data, videos })
                  }}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    className={input}
                    value={video.category}
                    onChange={(e) => {
                      const videos = data.videos.map((v, idx) => (idx === i ? { ...v, category: e.target.value } : v))
                      patch({ ...data, videos })
                    }}
                  >
                    {videoCategories.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#111]">
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    className={input}
                    value={video.youtubeId}
                    placeholder="YouTube ID veya link"
                    onChange={(e) => {
                      const raw = e.target.value.trim()
                      const locked = parseYoutubeId(raw) || raw
                      const videos = data.videos.map((v, idx) => (idx === i ? { ...v, youtubeId: locked } : v))
                      patch({ ...data, videos })
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="text-[10px] tracking-[0.2em] text-[#888] uppercase"
                  onClick={() => patch({ ...data, videos: data.videos.filter((_, idx) => idx !== i) })}
                >
                  Sil
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-[11px] tracking-[0.28em] uppercase"
              onClick={() =>
                patch({
                  ...data,
                  videos: [...data.videos, { title: 'Yeni set', category: 'live', youtubeId: '', thumbnail: '' }],
                })
              }
            >
              + Video ekle
            </button>
          </section>
        ) : null}

        {tab === 'gallery' ? (
          <section className="space-y-6">
            <p className="text-sm text-[#999]">Fotoğrafları telefondan veya bilgisayardan yükleyin. Sıra sitedeki sıradır.</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {data.gallery.map((image, i) => (
                <div key={i} className="space-y-2">
                  <FileField
                    caption={`Görsel ${i + 1}`}
                    accept="image/*"
                    value={image.src}
                    onChange={(src) => {
                      const gallery = data.gallery.map((g, idx) => (idx === i ? { ...g, src } : g))
                      patch({ ...data, gallery })
                    }}
                  />
                  <button
                    type="button"
                    className="text-[10px] tracking-[0.2em] text-[#888] uppercase"
                    onClick={() => patch({ ...data, gallery: data.gallery.filter((_, idx) => idx !== i) })}
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>
            <label className="inline-block text-[11px] tracking-[0.28em] uppercase">
              + Fotoğraf ekle
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = [...(e.target.files || [])]
                  const added = []
                  for (const file of files) {
                    const src = await upload(file)
                    added.push({ src, alt: file.name, span: 'square' })
                  }
                  patch({ ...data, gallery: [...data.gallery, ...added] })
                  e.target.value = ''
                }}
              />
            </label>
          </section>
        ) : null}

        {tab === 'events' ? (
          <section className="space-y-8">
            {data.events.map((event, i) => (
              <div key={i} className="grid gap-3 border border-white/10 p-4 sm:grid-cols-2">
                <input
                  type="date"
                  className={input}
                  value={event.iso}
                  onChange={(e) => {
                    const iso = e.target.value
                    const events = data.events.map((item, idx) =>
                      idx === i ? { ...item, iso, date: formatEventDate(iso) } : item,
                    )
                    patch({ ...data, events })
                  }}
                />
                <input
                  className={input}
                  placeholder="Etkinlik adı"
                  value={event.title}
                  onChange={(e) => {
                    const events = data.events.map((item, idx) => (idx === i ? { ...item, title: e.target.value } : item))
                    patch({ ...data, events })
                  }}
                />
                <input
                  className={input}
                  placeholder="Şehir"
                  value={event.city}
                  onChange={(e) => {
                    const events = data.events.map((item, idx) => (idx === i ? { ...item, city: e.target.value } : item))
                    patch({ ...data, events })
                  }}
                />
                <input
                  className={input}
                  placeholder="Mekan"
                  value={event.venue}
                  onChange={(e) => {
                    const events = data.events.map((item, idx) => (idx === i ? { ...item, venue: e.target.value } : item))
                    patch({ ...data, events })
                  }}
                />
                <button
                  type="button"
                  className="text-left text-[10px] tracking-[0.2em] text-[#888] uppercase"
                  onClick={() => patch({ ...data, events: data.events.filter((_, idx) => idx !== i) })}
                >
                  Sil
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-[11px] tracking-[0.28em] uppercase"
              onClick={() =>
                patch({
                  ...data,
                  events: [...data.events, { iso: '', date: '', city: '', venue: '', title: 'Yeni etkinlik' }],
                })
              }
            >
              + Etkinlik ekle
            </button>
            <div className="grid gap-6 md:grid-cols-2">
              <FileField
                caption="Sol görsel"
                accept="image/*"
                value={data.eventVisuals.left.src}
                onChange={(src) =>
                  patch({ ...data, eventVisuals: { ...data.eventVisuals, left: { ...data.eventVisuals.left, src } } })
                }
              />
              <FileField
                caption="Sağ görsel"
                accept="image/*"
                value={data.eventVisuals.right.src}
                onChange={(src) =>
                  patch({ ...data, eventVisuals: { ...data.eventVisuals, right: { ...data.eventVisuals.right, src } } })
                }
              />
            </div>
          </section>
        ) : null}

        {tab === 'contact' ? (
          <section className="space-y-4">
            {[
              ['email', 'E-posta'],
              ['phone', 'Telefon'],
              ['instagram', 'Instagram'],
              ['youtube', 'YouTube'],
              ['soundcloud', 'SoundCloud'],
            ].map(([key, caption]) => (
              <div key={key}>
                <label className={label}>{caption}</label>
                <input
                  className={input}
                  value={data.artist[key]}
                  onChange={(e) => patch({ ...data, artist: { ...data.artist, [key]: e.target.value } })}
                />
              </div>
            ))}
          </section>
        ) : null}

        <button
          type="button"
          className="text-[10px] tracking-[0.22em] text-[#666] uppercase"
          onClick={() => {
            if (window.confirm('Tüm panel değişiklikleri silinsin ve varsayılan içerik gelsin mi?')) {
              clearSnapshot()
              persist(getDefaults())
            }
          }}
        >
          Varsayılana sıfırla
        </button>
      </div>
    </main>
  )
}
