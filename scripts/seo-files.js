import fs from 'node:fs'
import path from 'node:path'
import { SITE, canonicalUrl, hreflangPair, seoFor, seoPages } from '../src/seo/meta.js'

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
}

function setAttr(html, tagPattern, content) {
  const re = new RegExp(`(${tagPattern})[^"]*(")`)
  if (!re.test(html)) throw new Error(`Missing tag: ${tagPattern}`)
  return html.replace(re, `$1${esc(content)}$2`)
}

function render(html, locale, page) {
  const meta = seoFor(locale, page)
  const url = canonicalUrl(meta.path)
  const alt = hreflangPair(page)
  const ogLocale = locale === 'en' ? 'en_GB' : 'tr_TR'
  let next = html.replace(/<html lang="[^"]*">/, `<html lang="${locale}">`)
  next = next.replace(/<title>[^<]*<\/title>/, `<title>${esc(meta.title)}</title>`)
  next = setAttr(next, '<meta\\s+name="description"[\\s\\S]*?content="', meta.description)
  next = setAttr(next, '<link\\s+rel="canonical"\\s+href="', url)
  next = setAttr(next, '<link\\s+rel="alternate"\\s+hreflang="tr"\\s+href="', alt.tr)
  next = setAttr(next, '<link\\s+rel="alternate"\\s+hreflang="en"\\s+href="', alt.en)
  next = setAttr(next, '<meta\\s+property="og:locale"\\s+content="', ogLocale)
  next = setAttr(next, '<meta\\s+property="og:url"\\s+content="', url)
  next = setAttr(next, '<meta\\s+property="og:title"\\s+content="', meta.title)
  next = setAttr(next, '<meta\\s+property="og:description"[\\s\\S]*?content="', meta.description)
  next = setAttr(next, '<meta\\s+name="twitter:title"\\s+content="', meta.title)
  next = setAttr(next, '<meta\\s+name="twitter:description"[\\s\\S]*?content="', meta.description)
  return next
}

function writeSitemap(dist) {
  const urls = seoPages.flatMap((page) => [page.tr.path, page.en.path])
  const body = urls
    .map((route) => {
      const loc = canonicalUrl(route)
      const priority = route === '/' ? '1.0' : '0.8'
      return `  <url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>${priority}</priority></url>`
    })
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
  fs.writeFileSync(path.join(dist, 'sitemap.xml'), xml)
}

export function writeSeoFiles(dist) {
  const indexPath = path.join(dist, 'index.html')
  if (!fs.existsSync(indexPath)) return
  const source = fs.readFileSync(indexPath, 'utf8')

  for (const page of seoPages) {
    for (const locale of ['tr', 'en']) {
      const meta = page[locale]
      const html = render(source, locale, page.id)
      if (meta.path === '/') {
        fs.writeFileSync(indexPath, html)
        continue
      }
      const dir = path.join(dist, meta.path.replace(/^\//, ''))
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(path.join(dir, 'index.html'), html)
    }
  }

  const notFound = render(source, 'tr', 'home').replace(
    '<meta name="robots" content="index, follow" />',
    '<meta name="robots" content="noindex" />',
  )
  fs.writeFileSync(path.join(dist, '404.html'), notFound)
  writeSitemap(dist)
  fs.writeFileSync(
    path.join(dist, 'robots.txt'),
    `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE}/sitemap.xml\n`,
  )
}
