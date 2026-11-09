// SOLUM showcase: every frame is a pure function of t (seconds), so the
// renderer can step it frame by frame. 15 s, and t = 15 matches t = 0.
;(() => {
  const DURATION = 15
  const SMALL = 0.28 / 0.62 // intro card width (28% of the frame) over the card's base width (62%)
  const STEP = 1190 + 40 // filmstrip: card width + gap

  // ---- easing -------------------------------------------------------------
  // The brand curve, cubic-bezier(0.16, 1, 0.3, 1), solved for x.
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by
    const sx = (s) => ((ax * s + bx) * s + cx) * s
    const sy = (s) => ((ay * s + by) * s + cy) * s
    const dx = (s) => (3 * ax * s + 2 * bx) * s + cx
    return (x) => {
      if (x <= 0) return 0
      if (x >= 1) return 1
      let s = x
      for (let i = 0; i < 8; i++) {
        const e = sx(s) - x
        const d = dx(s)
        if (Math.abs(e) < 1e-7 || Math.abs(d) < 1e-7) break
        s -= e / d
      }
      let lo = 0, hi = 1
      for (let i = 0; i < 40 && Math.abs(sx(s) - x) > 1e-7; i++) {
        if (sx(s) < x) lo = s
        else hi = s
        s = (lo + hi) / 2
      }
      return sy(s)
    }
  }
  const EASE = bezier(0.16, 1, 0.3, 1)
  const inOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2)
  const clamp01 = (u) => Math.min(1, Math.max(0, u))
  const progress = (t, a, b) => clamp01((t - a) / (b - a))
  const lerp = (a, b, e) => a + (b - a) * e
  // Accelerate over the first `a` of the move, then glide at constant speed (the strip leaves the frame moving).
  function rampLinear(u, a) {
    const v = 1 / (1 - a / 2)
    return u < a ? (v * u * u) / (2 * a) : v * (a / 2 + (u - a))
  }

  // ---- cards --------------------------------------------------------------
  const params = new URLSearchParams(location.search)
  // Middle beat: orbit (the reference recording, the default), flow (cover flow), ring (3D carousel),
  // wall (tilted scrolling columns), tunnel (fly-through) or grid (grid glide).
  const MODES = ['orbit', 'flow', 'ring', 'wall', 'tunnel', 'grid']
  const MODE = MODES.includes(params.get('cluster')) ? params.get('cluster') : 'orbit'

  const STRIP = ['01-hero', '02-featured', '03-collections', '04-how', '05-trust', '06-reflections']
  const OTHERS = [
    '09-search', '06-reflections', '10-stay', '03-collections', '08-footer', '11-stay-story',
    '07-faq', '12-booking', '02-featured', '04-how', '05-trust',
  ]

  const scene = document.getElementById('scene')
  const bg = document.getElementById('bg')
  function card(name, parent = scene) {
    const el = document.createElement('div')
    el.className = 'card'
    const img = document.createElement('img')
    img.src = `shots/${name}.png`
    img.alt = ''
    el.appendChild(img)
    parent.appendChild(el)
    return el
  }
  // A 3D group for the middle beat. Opacity is only ever set on cards: on the group it would flatten the 3D.
  const group = document.createElement('div')
  group.className = 'group'
  scene.appendChild(group)

  function set(el, { x = 0, y = 0, z = 0, ry = 0, s = 1, o = 1, tf }) {
    el.style.opacity = o <= 0.001 ? '0' : String(o)
    el.style.visibility = o <= 0.001 ? 'hidden' : 'visible'
    el.style.transform =
      tf ?? `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg) scale(${s.toFixed(5)})`
  }
  const f = (n, d = 3) => n.toFixed(d)

  // ---- beats --------------------------------------------------------------
  const PAN_START = 2.4
  const PAN_END = 7.4
  // Pan until the last card has fully left the frame on the left.
  const PAN_TOTAL = (STRIP.length - 1) * STEP + 960 + 595 + 80
  const IN = 6.9 // the middle beat arrives as the strip leaves
  const COLLAPSE = [10.2, 11.4] // the middle beat hands the hero back to the main card at 11.4

  function mainCard(t) {
    // Intro: hold small, grow with the brand ease.
    if (t < PAN_START) return { s: lerp(SMALL, 1, EASE(progress(t, 0.4, 2.2))) }
    if (t < PAN_END) return { x: -PAN_TOTAL * rampLinear(progress(t, PAN_START, PAN_END), 0.3) }
    if (t < COLLAPSE[1]) return { o: 0 }
    // Outro: hold, then shrink back to the t = 0 size so the video loops.
    return { s: lerp(1, SMALL, inOut(progress(t, 13.2, 14.6))) }
  }

  const collapse = (t) => EASE(progress(t, COLLAPSE[0], COLLAPSE[1]))
  const fadeOthers = (t) => 1 - clamp01(progress(t, 10.5, 11.2))
  const arrive = (t, i) => clamp01(progress(t, IN + i * 0.03, IN + 0.5 + i * 0.03))

  // ---- option A: carousel ring ---------------------------------------------
  // Twelve screens stand evenly around a ring, facing out. It spins in fast and settles,
  // drifts, then whips round to bring the hero (card 0) to the front at full size.
  function ringBeat() {
    const names = ['01-hero', ...OTHERS]
    const N = names.length
    const S = 0.62
    const R = (N * (1190 * S + 50)) / (2 * Math.PI)
    const cards = names.map((n) => card(n, group))
    const drift = (t) => -230 * (1 - EASE(progress(t, IN, IN + 2.2))) + 14 * (t - IN)
    // At least a third of a turn, landing on the hero.
    const turnEnd = 360 * Math.ceil((drift(COLLAPSE[0]) + 120) / 360)

    return (t) => {
      if (t < IN || t >= COLLAPSE[1]) return cards.forEach((el) => set(el, { o: 0 }))
      const c = collapse(t)
      const angle = lerp(drift(t), turnEnd, c)
      const tilt = lerp(-9, 0, c)
      const push = lerp(-700, 0, c) - 2600 * (1 - EASE(progress(t, IN, IN + 1.8)))
      group.style.transform = `translateZ(${f(-R + push)}px) rotateX(${f(tilt)}deg) rotateY(${f(-angle)}deg)`
      cards.forEach((el, i) => {
        const s = i === 0 ? lerp(S, 1, c) : S
        const o = arrive(t, i) * (i === 0 ? 1 : fadeOthers(t))
        set(el, { o, tf: `rotateY(${f((360 / N) * i)}deg) translateZ(${f(R)}px) scale(${f(s, 5)})` })
      })
    }
  }

  // ---- option B: moving wall -----------------------------------------------
  // A tilted wall of five columns scrolling in alternate directions. It rushes in and slows to
  // a drift, then the camera flattens onto the hero in the centre column.
  function wallBeat() {
    const COLS = 5, ROWS = 7, S = 0.42
    const CW = 1190 * S + 90, RH = 744 * S + 90, H = ROWS * RH
    const offset = (t, c) => (c % 2 ? -1 : 1) * (90 * (t - IN) + 1400 * EASE(progress(t, IN, IN + 1.8)))
    const wrap = (y) => ((((y + H / 2) % H) + H) % H) - H / 2
    const baseY = (r) => (r - (ROWS - 1) / 2) * RH
    // The hero takes the centre-column slot closest to the middle when the collapse starts.
    const mid = Math.floor(COLS / 2)
    const distance = (r) => Math.abs(wrap(baseY(r) + offset(COLLAPSE[0], mid)))
    let heroRow = 0
    for (let r = 1; r < ROWS; r++) if (distance(r) < distance(heroRow)) heroRow = r
    const slots = []
    let k = 0
    for (let c = 0; c < COLS; c++)
      for (let r = 0; r < ROWS; r++) {
        const hero = c === mid && r === heroRow
        const name = hero ? '01-hero' : OTHERS[(k++ * 4) % OTHERS.length]
        slots.push({ col: c, r, hero, el: card(name, group) })
      }

    return (t) => {
      if (t < IN || t >= COLLAPSE[1]) return slots.forEach(({ el }) => set(el, { o: 0 }))
      const c = collapse(t)
      const dz = lerp(-600, 0, c) - 2600 * (1 - EASE(progress(t, IN, IN + 1.8)))
      group.style.transform = `translateZ(${f(dz)}px) rotateX(${f(lerp(24, 0, c))}deg) rotateZ(${f(lerp(-12, 0, c))}deg)`
      slots.forEach(({ col, r, hero, el }, i) => {
        const x = (col - mid) * CW
        const y = wrap(baseY(r) + offset(t, col))
        const o = arrive(t, i % 12) * (hero ? 1 : fadeOthers(t))
        // The hero lifts off the wall while the rest sink back as they fade, so they never cover it.
        set(el, hero
          ? { x: lerp(x, 0, c), y: lerp(y, 0, c), z: 300 * Math.sin(Math.PI * c), s: lerp(S, 1, c), o }
          : { x, y, z: -1400 * c, s: S, o })
      })
    }
  }

  // ---- option C: fly-through -----------------------------------------------
  // Screens hang along a corridor in depth, alternating left and right. The camera flies
  // forward past them and comes to rest on the hero at the end of the corridor.
  function tunnelBeat() {
    const names = ['09-search', '03-collections', '10-stay', '06-reflections', '12-booking', '05-trust', '11-stay-story', '08-footer']
    const X = [-430, 430, -330, 380, -450, 320, -380, 430]
    const Y = [-150, 120, 170, -140, 100, -170, 150, -110]
    const D = 1500
    const S = 0.72
    const cards = names.map((n) => card(n, group))
    const hero = card('01-hero', group)
    const heroZ = -names.length * D - 900 // a little room after the last screen, so it has gone before the landing
    const fly = (t) => -heroZ * inOut(progress(t, IN, COLLAPSE[1]))

    return (t) => {
      if (t < IN || t >= COLLAPSE[1]) {
        cards.forEach((el) => set(el, { o: 0 }))
        return set(hero, { o: 0 })
      }
      const cam = fly(t)
      // A slight roll that settles to level on arrival.
      const roll = 3 * Math.sin(Math.PI * progress(t, IN, COLLAPSE[1]))
      group.style.transform = `translateZ(${f(cam)}px) rotateZ(${f(roll)}deg)`
      cards.forEach((el, i) => {
        const z = -(i + 1) * D + D * 0.15
        const rel = z + cam // distance in front of the camera (negative = ahead)
        // Fade in from the far end, fade out just before passing the camera.
        const o = arrive(t, i) * clamp01(progress(-rel, 10500, 7000)) * (1 - clamp01(progress(rel, -1000, 0)))
        set(el, { x: X[i], y: Y[i], z, ry: X[i] > 0 ? -12 : 12, s: S, o })
      })
      set(hero, { z: heroZ, o: clamp01(progress(-(heroZ + cam), 10500, 7000)) })
    }
  }

  // ---- option D: cover flow ------------------------------------------------
  // An angled cover-flow row slides in from the right as the strip leaves. It flips
  // through the pages fast, slows down, and settles on the hero, which grows to full size.
  function flowBeat() {
    const names = [...OTHERS, '01-hero']
    const N = names.length
    const S = 0.68
    const cards = names.map((n) => card(n, group))
    const pose = (d) => {
      const a = Math.max(-1, Math.min(1, d))
      const m = Math.max(0, Math.abs(d) - 1)
      const side = Math.sign(d)
      return { x: a * 640 + side * m * 210, z: -Math.abs(a) * 450 - m * 40, ry: -a * 58 }
    }

    return (t) => {
      if (t < IN || t >= COLLAPSE[1]) return cards.forEach((el) => set(el, { o: 0 }))
      const p = (N - 1) * EASE(progress(t, IN + 0.2, 10.9))
      const enter = 2200 * (1 - EASE(progress(t, IN, IN + 1.4)))
      group.style.transform = `translateX(${f(enter)}px)`
      const grow = inOut(progress(t, 10.4, COLLAPSE[1]))
      cards.forEach((el, k) => {
        const hero = k === N - 1
        const { x, z, ry } = pose(k - p)
        const o = arrive(t, Math.min(k, 12)) * (hero ? 1 : fadeOthers(t))
        set(el, { x, z, ry, s: hero ? lerp(S, 1, grow) : S, o })
      })
    }
  }

  // ---- option E: grid glide ------------------------------------------------
  // The site laid out as a tilted grid. The camera swoops in, glides across it,
  // then dives onto the hero in the middle, levelling out as it lands.
  function gridBeat() {
    const COLS = 5, ROWS = 3
    const CW = 1190 + 90, RH = 744 + 90
    const slots = []
    let k = 0
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const hero = c === 2 && r === 1
        slots.push({
          x: (c - 2) * CW,
          y: (r - 1) * RH,
          // A little depth between cards, so the glide has parallax.
          z: hero ? 0 : (((c * 7 + r * 3) % 5) - 2) * 70,
          hero,
          el: card(hero ? '01-hero' : OTHERS[k++ % OTHERS.length], group),
        })
      }

    return (t) => {
      if (t < IN || t >= COLLAPSE[1]) return slots.forEach(({ el }) => set(el, { o: 0 }))
      const a = EASE(progress(t, IN, 8.8))
      const g = progress(t, 8.4, 10.6)
      const c = EASE(progress(t, COLLAPSE[0], COLLAPSE[1]))
      const camX = lerp(lerp(-2600, -900, a) + 1300 * g, 0, c)
      const camY = lerp(lerp(-1100, -420, a) + 500 * g, 0, c)
      const camZ = lerp(lerp(-11000, -4300, a) + 900 * g, 0, c)
      const rx = lerp(lerp(42, 20, a) - 4 * g, 0, c)
      const rz = lerp(lerp(-16, -7, a) + 2 * g, 0, c)
      group.style.transform = `translateZ(${f(camZ)}px) rotateX(${f(rx)}deg) rotateZ(${f(rz)}deg) translate(${f(-camX)}px, ${f(-camY)}px)`
      slots.forEach(({ x, y, z, hero, el }, i) => {
        const o = arrive(t, i % 12) * (hero ? 1 : 1 - clamp01(progress(t, 10.7, 11.3)))
        set(el, { x, y, z, o })
      })
    }
  }

  // ---- option F: orbit (as in the reference recording) ----------------------
  // Owns every card for the whole video. The filmstrip squeezes into a small stack, the stack
  // bursts into a flat ring of upright cards, the ring makes one full turn (tilting gently in
  // the 2800px perspective), pulls back into the stack, and the hero on top grows to full size.
  function orbitBeat() {
    const names = ['01-hero', '02-featured', '03-collections', '04-how', '05-trust', '06-reflections', '09-search', '10-stay', '12-booking']
    const N = names.length
    const STRIP_N = 6
    const S = 0.41 // ring card: about a quarter of the frame width, as in the recording
    // An oval with an open centre, 1400 CSS px (2800 px in 4K) across its outer edges.
    const RX = (1400 - 1190 * S) / 2
    const RY = 330
    // The hero sits on top of the stack; the rest stack beneath in order.
    const cards = names.map((n) => card(n, group))
    const order = (k) => (k === 0 ? N : N - k)
    // Each card's place in the stack: a few pixels apart, so the edges show.
    const pile = (k) => ({ x: (order(k) - N / 2) * 7, y: (N / 2 - order(k)) * 5 })

    const pan = (t) => (STRIP_N - 1) * STEP * inOut(progress(t, PAN_START, 6.4))
    const squeeze = (t) => inOut(progress(t, 6.2, 7.0))
    const radius = (t) => EASE(progress(t, 7.05, 7.75)) * (1 - inOut(progress(t, 10.2, 10.8)))
    const spin = (t) => 360 * inOut(progress(t, 7.2, 10.2))
    const grow = (t) => EASE(progress(t, 10.9, 11.8))
    const others = (t) => 1 - clamp01(progress(t, 10.85, 11.05))

    return (t) => {
      // The ring tilts a little as it turns and is level again by the time it closes.
      const q = progress(t, 7.0, 10.6)
      group.style.transform = `rotateX(${f(10 * Math.sin(Math.PI * q))}deg) rotateY(${f(-8 * Math.sin(2 * Math.PI * q))}deg)`

      cards.forEach((el, k) => {
        const z = order(k) * 0.5
        const p = pile(k)
        let x, y, s, o
        if (k < STRIP_N) {
          // Filmstrip: the hero grows in, the rest slide in from the right, then the row pans left.
          const enter = k ? 900 * (1 - EASE(progress(t, 1.4, 2.8))) : 0
          const sx = k * STEP - pan(t) + enter
          const ss = k ? 1 : lerp(SMALL, 1, EASE(progress(t, 0.4, 2.2)))
          const c = squeeze(t)
          x = lerp(sx, p.x, c)
          y = lerp(0, p.y, c)
          s = lerp(ss, S, c)
          o = k === 0 || t >= 1.4 ? 1 : 0
        } else {
          // Extra pages wait hidden under the stack and join the ring.
          x = p.x
          y = p.y
          s = S
          o = clamp01(progress(t, 6.8, 7.05))
        }
        // Ring: every card orbits on its own spoke and stays upright.
        const a = ((k * 360) / N - 90 + spin(t)) * (Math.PI / 180)
        const r = radius(t)
        x += r * RX * Math.cos(a)
        y += r * RY * Math.sin(a)

        if (k === 0) {
          // Hero: grows from the top of the stack to full size, then shrinks back to the opening size.
          const g = grow(t)
          x = lerp(x, 0, g)
          y = lerp(y, 0, g)
          s = lerp(s, 1, g)
          if (t >= 11.8) s = lerp(1, SMALL, inOut(progress(t, 13.2, 14.6)))
        } else {
          o *= others(t)
          if (t < 1.4 && k < STRIP_N) o = 0
        }
        set(el, { x, y, z, s, o })
      })
    }
  }

  const BEATS = { orbit: orbitBeat, ring: ringBeat, wall: wallBeat, tunnel: tunnelBeat, flow: flowBeat, grid: gridBeat }
  const middle = BEATS[MODE]()
  // The strip is added last, so it paints above the middle beat where depths tie.
  const strip = STRIP.map((n) => card(n))

  function renderAt(t) {
    t = ((t % DURATION) + DURATION) % DURATION
    // A slow breathing zoom on the photo; sin² returns to its start at t = 15.
    const k = Math.sin((Math.PI * t) / DURATION) ** 2
    bg.style.transform = `scale(${(1.02 + 0.04 * k).toFixed(5)})`

    // Orbit drives every card itself, the filmstrip included.
    if (MODE === 'orbit') {
      strip.forEach((el) => set(el, { o: 0 }))
      return middle(t)
    }
    set(strip[0], mainCard(t))
    for (let i = 1; i < strip.length; i++) {
      if (t < 1.4 || t >= PAN_END) {
        set(strip[i], { o: 0 })
        continue
      }
      // The rest of the strip slides in from off-screen right as the hero settles.
      const enter = 900 * (1 - EASE(progress(t, 1.4, 2.8)))
      const pan = PAN_TOTAL * rampLinear(progress(t, PAN_START, PAN_END), 0.3)
      set(strip[i], { x: i * STEP - pan + enter })
    }
    middle(t)
  }

  window.DURATION = DURATION
  window.renderAt = renderAt
  window.ready = Promise.all(
    [...document.images].map((img) => img.decode().catch(() => {})),
  )

  // Preview: ?t=8.5 freezes a moment, ?play loops in real time. Scales the stage to the window.
  if (!params.has('render')) {
    const fit = () => {
      const k = Math.min(innerWidth / 1920, innerHeight / 1080)
      document.getElementById('stage').style.transform = `scale(${k})`
    }
    fit()
    addEventListener('resize', fit)
  }
  if (params.has('play')) {
    const t0 = performance.now()
    const loop = (now) => {
      renderAt((now - t0) / 1000)
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  } else {
    renderAt(Number(params.get('t') ?? 0))
  }
})()
