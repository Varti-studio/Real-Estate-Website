// Renders index.html frame by frame and pipes the PNGs into ffmpeg.
//   node render.mjs            3840×2160, 60 fps, H.264  → out/solum-showcase-4k.mp4
//   node render.mjs --draft    1920×1080, 30 fps (fast check) → out/solum-showcase-draft.mp4
//   node render.mjs --prores   writes a ProRes 422 HQ master instead → out/solum-showcase-4k.mov
//   --cluster=NAME             the middle beat: orbit (default), flow, ring, wall, tunnel or grid
//   --from=6.4 --to=11.8       render only that stretch (seconds), for comparing options
//   --name=clip                output file name (without extension)
import puppeteer from 'puppeteer-core'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const FFMPEG =
  process.env.FFMPEG ??
  'C:\\Users\\Yana\\AppData\\Local\\Programs\\Python\\Python311\\Lib\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe'

const draft = process.argv.includes('--draft')
const prores = process.argv.includes('--prores')
const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=')[1]
const cluster = arg('cluster') ?? 'orbit'
const FPS = draft ? 30 : 60
const DPR = draft ? 1 : 2
const here = (p) => fileURLToPath(new URL(p, import.meta.url))
const name = arg('name') ?? (draft ? 'solum-showcase-draft' : 'solum-showcase-4k')
const out = here(`./out/${name}.${prores ? 'mov' : 'mp4'}`)

// sRGB screenshots → BT.709 video, tagged so players show the same colours.
const color = ['-vf', 'scale=out_color_matrix=bt709:out_range=tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709']
const codec = prores
  ? ['-c:v', 'prores_ks', '-profile:v', '3', '-pix_fmt', 'yuv422p10le', ...color]
  : ['-c:v', 'libx264', '-preset', draft ? 'veryfast' : 'slow', '-crf', draft ? '20' : '14', '-profile:v', 'high', '-level', '5.2', '-pix_fmt', 'yuv420p', ...color, '-movflags', '+faststart']

await mkdir(here('./out/'), { recursive: true })
const ffmpeg = spawn(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(FPS), '-i', '-', ...codec, out], {
  stdio: ['pipe', 'inherit', 'inherit'],
})
const done = new Promise((resolve, reject) => ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)))))

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars', '--allow-file-access-from-files'] })
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: DPR })
await page.goto(pathToFileURL(here('./index.html')).href + `?render&cluster=${cluster}`, { waitUntil: 'load' })
await page.evaluate(async () => {
  await window.ready
  await document.fonts.ready
})

const from = Number(arg('from') ?? 0)
const to = Number(arg('to') ?? (await page.evaluate(() => window.DURATION)))
const total = Math.round((to - from) * FPS)
const started = Date.now()
for (let i = 0; i < total; i++) {
  await page.evaluate(
    (t) =>
      new Promise((r) => {
        window.renderAt(t)
        requestAnimationFrame(() => requestAnimationFrame(r))
      }),
    from + i / FPS,
  )
  const png = await page.screenshot({ type: 'png', optimizeForSpeed: true })
  if (!ffmpeg.stdin.write(png)) await new Promise((r) => ffmpeg.stdin.once('drain', r))
  if (i % FPS === 0 || i === total - 1) {
    const s = (Date.now() - started) / 1000
    console.log(`frame ${i + 1}/${total}  ${s.toFixed(0)}s elapsed, ~${((s / (i + 1)) * (total - i - 1)).toFixed(0)}s left`)
  }
}

ffmpeg.stdin.end()
await done
await browser.close()
console.log('wrote', out)
