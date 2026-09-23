import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const publishedFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/cms/published.json')

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export function cmsPersistPlugin() {
  return {
    name: 'cms-persist',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url !== '/__cms/content') return next()

        res.setHeader('Content-Type', 'application/json')
        if (req.method === 'GET') {
          try {
            res.end(fs.readFileSync(publishedFile, 'utf8'))
          } catch {
            res.end('null')
          }
          return
        }

        if (req.method === 'POST') {
          try {
            const body = await readBody(req)
            const parsed = JSON.parse(body)
            if (!parsed || typeof parsed !== 'object') throw new Error('invalid')
            fs.mkdirSync(path.dirname(publishedFile), { recursive: true })
            fs.writeFileSync(publishedFile, `${JSON.stringify(parsed, null, 2)}\n`)
            res.end(JSON.stringify({ ok: true }))
          } catch {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false }))
          }
          return
        }

        next()
      })
    },
  }
}
