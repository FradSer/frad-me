const { createServer } = require('https')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Generate self-signed certificates for development
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certificates/localhost-key.pem'), 'utf8'),
  cert: fs.readFileSync(path.join(__dirname, 'certificates/localhost.pem'), 'utf8'),
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3000')
    console.log('> WebXR requires HTTPS - using self-signed certificates')
  })
})