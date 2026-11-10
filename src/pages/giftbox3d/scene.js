import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Vector2,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  Path,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Shape,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { LAYOUTS } from './layouts.js'

/**
 * Hộp quà MelBee 3D, đơn vị cm — hộp 2 · 3 · 4 lọ (kích thước, chỗ đặt lọ: layouts.js), dựng theo ảnh set:
 * mặt ngoài vân tổ ong, đáy có nhãn công ty; nắp đậy có viền (mặt trên chữ MELBEE nhũ vàng), mở dựng đứng như
 * bìa sách, mặt trong in lời gửi; khay lót vàng khoét ô đặt lọ tròn nắp đen (nhãn đúng màu từng loại mật)
 * và một khe dài đặt que múc mật bằng gỗ.
 * Ảnh bề mặt lấy từ file in hộp 2 lọ (public/assets/Set 2 lọ 380ml.pdf) rồi vẽ lại cho vừa từng cỡ hộp
 * (phủ kín / thu vào, không kéo méo) — hộp 3 và 4 lọ chưa có file in riêng.
 * Kéo để xoay (điện thoại: vuốt ngang — vuốt dọc vẫn cuộn trang), chạm / bấm để mở nắp.
 */
const T = 0.3 // độ dày bìa

const BROWN = '#2a1611'
const YELLOW = '#f5b51c'
const HONEY = '#e2a13a'

/** Lọ 280ml nhỏ hơn lọ 380ml (cùng dáng lọ tròn) */
const JAR_SCALE = { '380ml': 1, '280ml': 0.88 }

export function createGiftBox(canvas, { layout = 'hop-2', url, logo, jars = [], reducedMotion = false, onReady, onOpenChange }) {
  const L = LAYOUTS[layout] || LAYOUTS['hop-2']
  const { W, D, H } = L
  const LID_RIM = 1.4 // viền nắp phủ xuống thành hộp
  // hộp to hơn hộp 2 lọ bao nhiêu → máy quay lùi ra bấy nhiêu
  const K = Math.hypot(W, D, H) / Math.hypot(22, 15, 10)

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = NeutralToneMapping // giữ màu vàng mật / cam của lót và nắp trong như ảnh set
  renderer.toneMappingExposure = 0.95

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = env
  scene.add(new HemisphereLight('#fff4e0', '#3a291d', 0.6))
  const key = new DirectionalLight('#fff1d6', 1.6)
  key.position.set(-18, 30, 22)
  scene.add(key)

  const camera = new PerspectiveCamera(30, 1, 1, 400)
  // máy quay nhìn hơi từ trên xuống; mở nắp thì lùi ra và nhìn cao hơn (như ảnh set): thấy nhãn lọ,
  // que múc mật trong khay và trọn mặt trong nắp dựng đứng phía sau
  let baseDist = 58 * K
  const placeCamera = (o) => {
    const dist = baseDist * (1 + 0.7 * o)
    const el = 0.3 + 0.6 * o // góc nhìn xuống: ~17° → ~52° (thấy cả khe que múc mật sát thành trước)
    camera.position.set(0, Math.sin(el) * dist, Math.cos(el) * dist)
    camera.lookAt(0, 0.5 + 4.2 * o * (D / 15), -1.5 * o * (D / 15)) // nắp càng sâu, mở ra càng cao
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
  const yellow = mat({ color: YELLOW, roughness: 0.8, envMapIntensity: 0.35 })
  const yellowShade = mat({ color: '#d99a12', roughness: 0.85, envMapIntensity: 0.35 })

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

  // ---------- lọ mật tròn, nhãn quấn quanh thân (màu + tên theo loại mật) ----------
  const logoImg = new Image()
  logoImg.src = logo
  const labelJobs = []
  /** Nhãn kiểu nhãn MelBee in: nền màu, khung chỉ mảnh, MELBEE · SPECIALTY HONEY, tên mật lớn, dung tích. */
  const drawLabel = (c, { bg = '#f3ecdc', ink = '#3a291d', name = '' }, size) => {
    const x = c.getContext('2d')
    const Wl = c.width
    const Hl = c.height
    x.fillStyle = bg
    x.fillRect(0, 0, Wl, Hl)
    // mặt trước nằm giữa ảnh nhãn (u = 0.5): một khung chữ + hai dải chữ nhỏ hai bên hông
    const cx = Wl / 2
    x.strokeStyle = ink
    x.globalAlpha = 0.55
    x.lineWidth = 3
    x.strokeRect(cx - 360, 22, 720, Hl - 44)
    x.globalAlpha = 1
    x.fillStyle = ink
    x.textAlign = 'center'
    x.font = '500 34px Georgia, serif'
    x.fillText('MELBEE', cx, 92)
    x.font = '26px Georgia, serif'
    x.fillText('SPECIALTY HONEY', cx, 128)
    x.font = 'italic 600 70px Georgia, serif'
    x.fillText(`Mật ong ${name}`, cx, 232)
    x.font = 'italic 54px Georgia, serif'
    x.fillText('Tây Bắc', cx, 296)
    x.font = 'italic 28px Georgia, serif'
    x.fillText('100% Nguyên chất & Thuần khiết', cx, 352)
    x.font = '24px Georgia, serif'
    x.fillText(`Thể tích thực: ${size}`, cx, Hl - 48)
    // hai bên hông: các dòng chữ nhỏ như phần thông tin trên nhãn thật
    x.globalAlpha = 0.45
    for (const side of [-1, 1]) {
      const sx = cx + side * 560
      for (let i = 0; i < 9; i++) x.fillRect(sx - 110, 70 + i * 36, 220 - (i % 3) * 40, 6)
    }
    x.globalAlpha = 1
    if (logoImg.complete && logoImg.naturalWidth) x.drawImage(logoImg, cx + 250, Hl - 120, 80, 80)
  }
  const makeLabel = (info, size) => {
    const c = document.createElement('canvas')
    c.width = 2048
    c.height = 460
    const tex = canvasTex(c)
    const draw = () => {
      drawLabel(c, info, size)
      tex.needsUpdate = true
    }
    draw()
    labelJobs.push(draw)
    return new MeshStandardMaterial({ map: tex, roughness: 0.55, envMapIntensity: 0.5 })
  }
  logoImg.onload = () => labelJobs.forEach((d) => d())

  const honeyBase = new MeshPhysicalMaterial({ color: HONEY, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true, opacity: 0.95 })
  const cap = new MeshPhysicalMaterial({ color: '#141210', roughness: 0.32, clearcoat: 0.7 })
  // dáng lọ thuỷ tinh: đáy bo, thân thẳng, vai thu vào cổ (xoay quanh trục đứng)
  const jarGeo = new LatheGeometry(
    [
      [0, 0],
      [3.1, 0],
      [3.45, 0.35],
      [3.5, 6.4],
      [3.35, 7.1],
      [2.95, 7.55],
      [2.85, 7.9],
    ].map(([r, y]) => new Vector2(r, y)),
    48,
  )
  geometries.push(jarGeo)
  const makeJar = ({ x, z, size }, info = {}) => {
    const k = JAR_SCALE[size] || 1
    const honey = honeyBase.clone()
    if (info.color) honey.color.set(info.color)
    const jar = new Group()
    jar.position.set(x, T, z)
    jar.scale.setScalar(k)
    const glass = new Mesh(jarGeo, honey)
    jar.add(glass)
    // nhãn: thetaStart = π để giữa ảnh nhãn (u = 0.5) quay ra trước (+z)
    add(jar, new CylinderGeometry(3.53, 3.53, 4.2, 64, 1, true, Math.PI), makeLabel(info, size), 0, 4.75, 0)
    add(jar, new CylinderGeometry(3.05, 3.05, 1.5, 48), cap, 0, 8.55, 0)
    add(jar, new CylinderGeometry(2.6, 2.6, 0.04, 48), cap, 0, 9.31, 0)
    box.add(jar)
  }
  L.jars.forEach((j, i) => makeJar(j, jars[i]))

  // ---------- que múc mật bằng gỗ (như ảnh set) ----------
  // gỗ sáng màu — nổi trên lót vàng
  const wood = mat({ color: '#e4c48e', roughness: 0.55, envMapIntensity: 0.6 })
  const woodDark = mat({ color: '#a8743f', roughness: 0.6 })
  const jarR = (j) => 3.5 * (JAR_SCALE[j.size] || 1)
  /**
   * Đặt que: có khe giữa hai cột lọ đủ rộng thì nằm dọc giữa hai cột, đầu múc quay vào trong (ảnh Set 4);
   * không thì nằm ngang ngay trước hàng lọ (ảnh Set 2). Khe dài sát thành trước của khay là khe nhấc khay —
   * thành hộp che mất khi nhìn từ trên xuống nên không đặt que ở đó.
   */
  const dipperSpot = () => {
    const xs = [...new Set(L.jars.map((j) => j.x))].sort((p, q) => p - q)
    let best = null
    for (let i = 0; i + 1 < xs.length; i++) {
      const left = Math.max(...L.jars.filter((j) => j.x === xs[i]).map((j) => j.x + jarR(j)))
      const right = Math.min(...L.jars.filter((j) => j.x === xs[i + 1]).map((j) => j.x - jarR(j)))
      if (right - left >= 2.7 && (!best || right - left > best.gap)) best = { gap: right - left, x: (left + right) / 2 }
    }
    if (best) return { along: 'z', x: best.x, z: 0, len: Math.min(16, D - 3) }
    const front = Math.max(...L.jars.map((j) => j.z + jarR(j)))
    return { along: 'x', x: 0, z: front + 1.6, len: Math.min(16, W - 6) }
  }
  const makeDipper = () => {
    const { along, x, z, len } = dipperSpot()
    const d = new Group()
    const body = new Group() // trục que theo +y (đầu múc), xoay cho nằm xuống
    d.add(body)
    add(body, new CylinderGeometry(0.4, 0.46, len * 0.62, 20), wood, 0, -len * 0.19, 0)
    add(body, new CylinderGeometry(0.52, 0.4, 0.5, 20), wood, 0, -len * 0.5 + 0.25, 0)
    // đầu múc: các vòng xếp chồng, xen rãnh sẫm màu
    const head0 = len * 0.12
    for (let i = 0; i < 6; i++) {
      add(body, new CylinderGeometry(0.95, 0.95, 0.34, 28), wood, 0, head0 + i * 0.5, 0)
      add(body, new CylinderGeometry(0.68, 0.68, 0.18, 24), woodDark, 0, head0 + i * 0.5 + 0.26, 0)
    }
    add(body, new CylinderGeometry(0.55, 0.95, 0.5, 24), wood, 0, head0 + 3.1, 0)
    if (along === 'z') body.rotation.x = -Math.PI / 2 // đầu múc quay vào trong hộp
    else body.rotation.z = Math.PI / 2 // nằm ngang, đầu múc bên trái
    d.position.set(x, 0, z)
    return d
  }

  // ---------- nắp gập: bản lề ở mép trên lưng hộp ----------
  const lid = new Group()
  lid.position.set(0, H, -D / 2 - 0.3)
  box.add(lid)

  const ready = Promise.all(['lid-top.jpg', 'base-bottom.jpg', 'base-long.jpg', '../hop-mat-trong.jpg'].map(img)).then(
    ([topImg, bottomImg, sideImg, insideImg]) => {
    const m = (map, extra) => mat({ map, ...extra })
    const topM = m(fit(topImg, W + 0.7, D + 0.6), { roughness: 0.5, envMapIntensity: 0.55 })
    const longM = m(fit(sideImg, W, H))
    const shortM = m(fit(sideImg, D, H))
    const backM = m(fit(sideImg, W, H))
    const bottomM = m(fit(bottomImg, W, D, { mode: 'contain', bg: sampleColor(bottomImg, 4, 4) }))
    const insideM = m(fit(insideImg, W + 0.7, D + 0.6), { roughness: 0.8, envMapIntensity: 0.35 })
    const rimM = m(fit(topImg, W + 0.7, LID_RIM, { src: [0, topImg.height * 0.9, topImg.width, topImg.height * 0.1] }), {
      roughness: 0.5,
      envMapIntensity: 0.55,
    })

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
    const trayY = H * 0.4 // khay cao gần nửa hộp: lọ chìm trong ô, nhãn lộ trên mặt khay như ảnh set
    const trayMesh = add(box, trayGeo, [yellow, yellowShade], 0, trayY, 0)
    trayMesh.rotation.x = -Math.PI / 2
    const dipper = makeDipper()
    dipper.position.y = trayY + 0.25 + 0.8 // nằm trên mặt khay
    box.add(dipper)

    // nắp: mặt trên (ngoài MELBEE, trong là lời gửi) + viền bốn phía phủ xuống thành hộp
    const LW = W + 0.7 // nắp rộng hơn thân để viền ôm ra ngoài thành hộp
    const LD = D + 0.6
    add(lid, new BoxGeometry(LW, T, LD), [brown, brown, topM, insideM, brown, brown], 0, 0.15, LD / 2)
    add(lid, new BoxGeometry(LW, LID_RIM, T), [brown, brown, brown, brown, rimM, yellow], 0, -LID_RIM / 2 + 0.3, LD - T / 2)
    add(lid, new BoxGeometry(LW, LID_RIM, T), [brown, brown, brown, brown, yellow, rimM], 0, -LID_RIM / 2 + 0.3, T / 2)
    add(lid, new BoxGeometry(T, LID_RIM, LD - 2 * T), [yellow, rimM, brown, brown, brown, brown], -LW / 2 + T / 2, -LID_RIM / 2 + 0.3, LD / 2)
    add(lid, new BoxGeometry(T, LID_RIM, LD - 2 * T), [rimM, yellow, brown, brown, brown, brown], LW / 2 - T / 2, -LID_RIM / 2 + 0.3, LD / 2)
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
