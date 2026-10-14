import {
  ACESFilmicToneMapping,
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Path,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { LAYOUTS } from './layouts.js'

/**
 * Hộp quà MelBee 3D, đơn vị cm — hộp 2 · 3 · 4 lọ (kích thước, chỗ đặt lọ: layouts.js).
 * Mặt ngoài vân tổ ong, đáy có nhãn công ty; nắp gập liền tấm (mặt trên chữ MELBEE nhũ vàng, vạt trước bo tròn
 * có logo), mặt trong nắp in lời gửi; khay lót vàng khoét ô đặt lọ + một khe dài.
 * Ảnh bề mặt lấy từ file in hộp 2 lọ (public/assets/Set 2 lọ 380ml.pdf) rồi vẽ lại cho vừa từng cỡ hộp
 * (phủ kín / thu vào, không kéo méo) — hộp 3 và 4 lọ chưa có file in riêng.
 * Kéo để xoay (điện thoại: vuốt ngang — vuốt dọc vẫn cuộn trang), chạm / bấm để mở nắp.
 */
const T = 0.3 // độ dày bìa

const BROWN = '#2a1611'
const YELLOW = '#f5b51c'
const HONEY = '#e2a13a'

/** Lọ 280ml nhỏ hơn lọ 380ml (cùng dáng lục giác) */
const JAR_SCALE = { '380ml': 1, '280ml': 0.88 }

export function createGiftBox(canvas, { layout = 'hop-2', url, logo, jarColors = [], reducedMotion = false, onReady, onOpenChange }) {
  const L = LAYOUTS[layout] || LAYOUTS['hop-2']
  const { W, D, H } = L
  const FLAP = H * 0.78 // vạt trước của nắp
  // hộp to hơn hộp 2 lọ bao nhiêu → máy quay lùi ra bấy nhiêu
  const K = Math.hypot(W, D, H) / Math.hypot(22, 15, 10)

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = env
  scene.add(new HemisphereLight('#fff4e0', '#3a291d', 0.6))
  const key = new DirectionalLight('#fff1d6', 1.6)
  key.position.set(-18, 30, 22)
  scene.add(key)

  const camera = new PerspectiveCamera(30, 1, 1, 400)
  // máy quay nhìn hơi từ trên xuống; mở nắp thì lùi ra + ngẩng lên để thấy trọn nắp
  const camDir = { y: 18 / 60.7, z: 58 / 60.7 }
  let baseDist = 58 * K
  const placeCamera = (o) => {
    const dist = baseDist * (1 + 0.6 * o)
    camera.position.set(0, camDir.y * dist + 3 * o * K, camDir.z * dist)
    camera.lookAt(0, 0.5 + 4.6 * o * (D / 15), 0) // nắp càng sâu, mở ra càng cao
  }

  // ---------- vật liệu ----------
  const maxAniso = renderer.capabilities.getMaxAnisotropy()
  const textures = []
  const img = (path) =>
    new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = url(path)
    })
  const canvasTex = (c) => {
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    t.anisotropy = maxAniso
    textures.push(t)
    return t
  }
  /** Màu nền của ảnh (lấy một điểm) — để phần thêm vào quanh ảnh liền màu với ảnh */
  const sampleColor = (im, x, y) => {
    const c = document.createElement('canvas')
    c.width = c.height = 1
    const ctx = c.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(im, x, y, 1, 1, 0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return `rgb(${r},${g},${b})`
  }
  /**
   * Vẽ ảnh lên một mặt w × h cm mà không kéo méo: 'cover' phủ kín (cắt bớt mép), 'contain' thu vào
   * (phần thừa tô màu nền ảnh). src: vùng ảnh nguồn [sx, sy, sw, sh] nếu chỉ lấy một phần.
   */
  const fit = (im, w, h, { mode = 'cover', bg, src } = {}) => {
    const c = document.createElement('canvas')
    const a = w / h
    c.width = a >= 1 ? 1024 : Math.round(1024 * a)
    c.height = a >= 1 ? Math.round(1024 / a) : 1024
    const ctx = c.getContext('2d')
    if (bg) {
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, c.width, c.height)
    }
    const [sx, sy, sw, sh] = src || [0, 0, im.width, im.height]
    const k = (mode === 'cover' ? Math.max : Math.min)(c.width / sw, c.height / sh)
    const dw = sw * k
    const dh = sh * k
    ctx.drawImage(im, sx, sy, sw, sh, (c.width - dw) / 2, mode === 'top' ? 0 : (c.height - dh) / 2, dw, dh)
    return canvasTex(c)
  }
  const mat = (opts) => new MeshStandardMaterial({ roughness: 0.55, envMapIntensity: 0.7, ...opts })
  const brown = mat({ color: BROWN })
  const yellow = mat({ color: YELLOW, roughness: 0.75 })
  const yellowShade = mat({ color: '#d99a12', roughness: 0.8 })

  // ---------- hộp ----------
  const root = new Group() // xoay theo tay
  const box = new Group()
  box.position.y = -H / 2
  root.add(box)
  scene.add(root)

  const geometries = []
  const add = (parent, geo, mats, x, y, z) => {
    geometries.push(geo)
    const m = new Mesh(geo, mats)
    m.position.set(x, y, z)
    parent.add(m)
    return m
  }

  // ---------- lọ mật lục giác ----------
  const labels = {} // một nhãn cho mỗi dung tích
  const drawLabel = ({ canvas: labelCanvas, tex: labelTex, size }, img) => {
    const c = labelCanvas.getContext('2d')
    c.fillStyle = '#f6eedb'
    c.fillRect(0, 0, 1800, 420)
    for (let i = 0; i < 6; i++) {
      const x = i * 300
      c.strokeStyle = '#c9a052'
      c.lineWidth = 4
      c.strokeRect(x + 14, 16, 272, 388)
      c.fillStyle = '#3a291d'
      c.textAlign = 'center'
      if (i % 3 === 1) {
        if (img) c.drawImage(img, x + 70, 40, 160, 160)
        c.font = '600 44px Georgia, serif'
        c.fillText('Mật ong', x + 150, 268)
        c.fillText('Tây Bắc', x + 150, 318)
        c.font = '26px system-ui, sans-serif'
        c.fillStyle = '#9a6514'
        c.fillText(size, x + 150, 370)
      } else {
        c.font = '600 40px Georgia, serif'
        c.fillText('MELBEE', x + 150, 200)
        c.font = '24px system-ui, sans-serif'
        c.fillStyle = '#9a6514'
        c.fillText('100% nguyên chất', x + 150, 250)
      }
    }
    labelTex.needsUpdate = true
  }
  const logoImg = new Image()
  const labelFor = (size) => {
    if (!labels[size]) {
      const lc = document.createElement('canvas')
      lc.width = 1800
      lc.height = 420
      labels[size] = { canvas: lc, tex: canvasTex(lc), size }
      labels[size].mat = new MeshStandardMaterial({ map: labels[size].tex, roughness: 0.6 })
      drawLabel(labels[size], logoImg.complete && logoImg.naturalWidth ? logoImg : null)
    }
    return labels[size].mat
  }
  logoImg.onload = () => Object.values(labels).forEach((l) => drawLabel(l, logoImg))
  logoImg.src = logo

  const honeyBase = new MeshPhysicalMaterial({ color: HONEY, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true, opacity: 0.94 })
  const cap = new MeshPhysicalMaterial({ color: '#141210', roughness: 0.3, clearcoat: 0.6 })
  const jarMats = []
  const makeJar = ({ x, z, size }, color) => {
    const k = JAR_SCALE[size] || 1
    const honey = honeyBase.clone()
    if (color) honey.color.set(color)
    jarMats.push(honey)
    const jar = new Group()
    jar.position.set(x, T, z)
    jar.rotation.y = Math.PI / 6 // mặt phẳng lục giác quay ra trước
    jar.scale.setScalar(k)
    add(jar, new CylinderGeometry(3.5, 3.5, 7.2, 6), honey, 0, 3.6, 0)
    add(jar, new CylinderGeometry(3.53, 3.53, 3.8, 6, 1, true), labelFor(size), 0, 3.4, 0)
    add(jar, new CylinderGeometry(2.7, 3.1, 0.6, 24), honey, 0, 7.5, 0)
    add(jar, new CylinderGeometry(3.0, 3.0, 1.4, 32), cap, 0, 8.5, 0)
    box.add(jar)
  }
  L.jars.forEach((j, i) => makeJar(j, jarColors[i]))

  // ---------- nắp gập: bản lề ở mép trên lưng hộp ----------
  const lid = new Group()
  lid.position.set(0, H, -D / 2 - 0.15)
  box.add(lid)
  const flapPivot = new Group()
  flapPivot.position.set(0, 0.15, D + 0.3)
  lid.add(flapPivot)

  // vạt trước bo tròn hai góc dưới
  const flapShape = (() => {
    const w = W + 0.4
    const r = 2.4
    const s = new Shape()
    s.moveTo(-w / 2, 0)
    s.lineTo(w / 2, 0)
    s.lineTo(w / 2, -FLAP + r)
    s.quadraticCurveTo(w / 2, -FLAP, w / 2 - r, -FLAP)
    s.lineTo(-w / 2 + r, -FLAP)
    s.quadraticCurveTo(-w / 2, -FLAP, -w / 2, -FLAP + r)
    s.closePath()
    return s
  })()

  const ready = Promise.all(['lid-top.jpg', 'lid-flap.jpg', 'base-bottom.jpg', 'base-long.jpg', '../hop-mat-trong.jpg'].map(img)).then(
    ([topImg, flapImg, bottomImg, sideImg, insideImg]) => {
    const m = (map, extra) => mat({ map, ...extra })
    const lidBrown = sampleColor(topImg, topImg.width / 2, 4)
    const topM = m(fit(topImg, W + 0.4, D + 0.3), { roughness: 0.5, envMapIntensity: 0.55 })
    const longM = m(fit(sideImg, W, H))
    const shortM = m(fit(sideImg, D, H))
    const backM = m(fit(sideImg, W, H))
    const bottomM = m(fit(bottomImg, W, D, { mode: 'contain', bg: sampleColor(bottomImg, 4, 4) }))
    const insideM = m(fit(insideImg, W + 0.4, D + 0.3), { roughness: 0.7 })
    // vạt: chỉ lấy logo ở giữa ảnh vạt (bỏ góc bo trắng của file in), đặt lên nền nâu vừa bề ngang hộp
    const flapTex = fit(flapImg, W + 0.4, FLAP, {
      mode: 'top',
      bg: lidBrown,
      src: [flapImg.width * 0.3, 0, flapImg.width * 0.4, flapImg.height * 0.85],
    })
    // UV của ShapeGeometry là toạ độ cm → đưa về 0..1
    flapTex.repeat.set(1 / (W + 0.4), 1 / FLAP)
    flapTex.offset.set(0.5, 1)
    const flapM = m(flapTex, { roughness: 0.5, envMapIntensity: 0.55 })

    // thứ tự mặt BoxGeometry: +x, -x, +y, -y, +z, -z
    add(box, new BoxGeometry(W, H, T), [brown, brown, brown, brown, longM, yellow], 0, H / 2, D / 2 - T / 2)
    add(box, new BoxGeometry(W, H, T), [brown, brown, brown, brown, yellow, backM], 0, H / 2, -D / 2 + T / 2)
    add(box, new BoxGeometry(T, H, D - 2 * T), [yellow, shortM, brown, brown, brown, brown], -W / 2 + T / 2, H / 2, 0)
    add(box, new BoxGeometry(T, H, D - 2 * T), [shortM, yellow, brown, brown, brown, brown], W / 2 - T / 2, H / 2, 0)
    add(box, new BoxGeometry(W, T, D), [brown, brown, yellow, bottomM, brown, brown], 0, T / 2, 0)

    // tấm lót: khoét 2 ô lọ + khe dài (shape nằm trong mặt XY, xoay nằm ngang; y của shape = -z)
    const iw = W / 2 - T
    const id = D / 2 - T
    const tray = new Shape()
    tray.moveTo(-iw, -id)
    tray.lineTo(iw, -id)
    tray.lineTo(iw, id)
    tray.lineTo(-iw, id)
    tray.closePath()
    const rect = (x0, y0, x1, y1) => {
      const p = new Path()
      p.moveTo(x0, y0)
      p.lineTo(x0, y1)
      p.lineTo(x1, y1)
      p.lineTo(x1, y0)
      p.closePath()
      return p
    }
    // shape nằm ngang sau khi xoay: y của shape = -z
    for (const [x0, z0, x1, z1] of L.holes) tray.holes.push(rect(x0, -z1, x1, -z0))
    const trayGeo = new ExtrudeGeometry(tray, { depth: 0.25, bevelEnabled: false })
    // lót đặt thấp để thấy nhãn lọ khi mở nắp
    const trayMesh = add(box, trayGeo, [yellow, yellowShade], 0, H * 0.295, 0)
    trayMesh.rotation.x = -Math.PI / 2

    // nắp: mặt trên (ngoài MELBEE, trong là lời gửi) + vạt trước
    add(lid, new BoxGeometry(W + 0.4, T, D + 0.3), [brown, brown, topM, insideM, brown, brown], 0, 0.15, (D + 0.3) / 2)
    const flapGeo = new ShapeGeometry(flapShape, 12)
    add(flapPivot, flapGeo, flapM, 0, 0, 0.01)
    const flapBack = add(flapPivot, flapGeo, brown, 0, 0, -0.01)
    flapBack.rotation.y = Math.PI // vạt đối xứng trái phải → lật ra sau là khít
  })

  // bóng mềm dưới hộp
  const shadowCanvas = document.createElement('canvas')
  shadowCanvas.width = shadowCanvas.height = 128
  const sc = shadowCanvas.getContext('2d')
  const g = sc.createRadialGradient(64, 64, 4, 64, 64, 64)
  g.addColorStop(0, 'rgba(40,24,12,0.42)')
  g.addColorStop(1, 'rgba(40,24,12,0)')
  sc.fillStyle = g
  sc.fillRect(0, 0, 128, 128)
  const shadowTex = new CanvasTexture(shadowCanvas)
  textures.push(shadowTex)
  const shadowMat = new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, side: DoubleSide })
  const shadow = add(scene, new PlaneGeometry(W * 2, D * 2), shadowMat, 0, -H / 2 - 0.6, 0)
  shadow.rotation.x = -Math.PI / 2

  // ---------- tương tác ----------
  let yaw = -0.55
  let pitch = 0.12
  let vYaw = reducedMotion ? 0 : 0.0018
  let vPitch = 0
  let open = 0
  let openTarget = 0
  let lastUser = -1e9
  let drag = null

  const setOpen = (v) => {
    openTarget = v ? 1 : 0
    onOpenChange?.(!!v)
  }
  const onDown = (e) => {
    drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), touch: e.pointerType === 'touch' }
    canvas.setPointerCapture?.(e.pointerId)
  }
  const onMove = (e) => {
    if (!drag) return
    const dx = e.clientX - drag.x
    const dy = e.clientY - drag.y
    drag.x = e.clientX
    drag.y = e.clientY
    yaw += dx * 0.009
    vYaw = dx * 0.009
    if (!drag.touch) {
      pitch = Math.min(1.3, Math.max(-2.3, pitch + dy * 0.009)) // kéo lên/xuống để xem cả đáy hộp
      vPitch = dy * 0.009
    }
    lastUser = performance.now()
  }
  const onUp = (e) => {
    if (!drag) return
    const moved = Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy)
    if (moved < 6 && performance.now() - drag.t < 450) setOpen(!openTarget)
    drag = null
  }
  const onCancel = () => (drag = null)
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('pointercancel', onCancel)

  // ---------- vòng vẽ: chỉ chạy khi khung đang hiện trên màn hình ----------
  let raf = 0
  let visible = true
  let last = performance.now()
  const frame = (now) => {
    raf = 0
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!drag) {
      const idle = now - lastUser > 2500
      const spin = reducedMotion ? 0 : 0.0028
      vYaw += ((idle ? spin : 0) - vYaw) * (idle ? 0.02 : 0.08)
      yaw += vYaw
      vPitch *= 0.9
      pitch += vPitch
      if (idle) pitch += (0.12 - pitch) * 0.02 // tự nghiêng về góc nhìn đẹp
    }
    open += (openTarget - open) * Math.min(1, dt * 5)
    root.rotation.set(pitch, yaw, 0, 'XYZ')
    lid.rotation.x = -open * 1.78
    placeCamera(open)
    flapPivot.rotation.x = -open * 1.35
    shadowMat.opacity = Math.max(0, 1 - Math.abs(pitch) * 0.7)
    renderer.render(scene, camera)
    if (visible) raf = requestAnimationFrame(frame)
  }
  const start = () => {
    if (!raf && visible && !document.hidden) {
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
  }
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    start()
  })
  io.observe(canvas)
  const onVis = () => (document.hidden ? (cancelAnimationFrame(raf), (raf = 0)) : start())
  document.addEventListener('visibilitychange', onVis)

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // khung hẹp: lùi máy ảnh để hộp không bị cắt
    baseDist = (58 * K) / Math.min(1, camera.aspect)
    camera.updateProjectionMatrix()
    placeCamera(open)
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  resize()

  ready
    .then(() => {
      start()
      onReady?.()
    })
    .catch((err) => onReady?.(err))

  return {
    toggle: () => setOpen(!openTarget),
    setOpen,
    /** đổi màu mật trong các lọ theo loại khách chọn */
    setJarColors(colors) {
      colors.forEach((c, i) => c && jarMats[i]?.color.set(c))
    },
    dispose() {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onCancel)
      for (const g of geometries) g.dispose()
      honeyBase.dispose()
      for (const t of textures) t.dispose()
      scene.traverse((o) => {
        if (!o.material) return
        for (const m of [].concat(o.material)) m.dispose()
      })
      env.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.forceContextLoss() // trả ngữ cảnh WebGL ngay khi rời trang (đổi trang tại chỗ)
    },
  }
}
