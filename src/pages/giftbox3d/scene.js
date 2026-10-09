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
  TextureLoader,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * Hộp quà set 2 lọ 380ml dựng lại từ file in (public/assets/Set 2 lọ 380ml.pdf), đơn vị cm:
 * hộp đáy 22 × 15, cao 10, mặt ngoài hoa văn tổ ong, đáy có nhãn công ty; nắp gập liền tấm (mặt sau trơn
 * dán vào lưng hộp, mặt trên chữ MELBEE nhũ vàng, vạt trước bo tròn có logo), mặt trong nắp in lời gửi;
 * lót vàng khoét 2 ô đặt lọ + một khe dài.
 * Kéo để xoay (điện thoại: vuốt ngang — vuốt dọc vẫn cuộn trang), chạm / bấm để mở nắp.
 */
const W = 22
const D = 15
const H = 10
const T = 0.3 // độ dày bìa
const FLAP = 7.8 // vạt trước của nắp

const BROWN = '#2a1611'
const YELLOW = '#f5b51c'
const HONEY = '#e2a13a'

export function createGiftBox(canvas, { url, logo, jarColors = [], reducedMotion = false, onReady, onOpenChange }) {
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
  let baseDist = 58
  const placeCamera = (o) => {
    const dist = baseDist * (1 + 0.6 * o)
    camera.position.set(0, camDir.y * dist + 3 * o, camDir.z * dist)
    camera.lookAt(0, 0.5 + 4.6 * o, 0)
  }

  // ---------- vật liệu ----------
  const loader = new TextureLoader()
  const maxAniso = renderer.capabilities.getMaxAnisotropy()
  const textures = []
  const tex = (path, setup) =>
    new Promise((resolve, reject) =>
      loader.load(
        url(path),
        (t) => {
          t.colorSpace = SRGBColorSpace
          t.anisotropy = maxAniso
          setup?.(t)
          textures.push(t)
          resolve(t)
        },
        undefined,
        reject
      )
    )
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
  const labelCanvas = document.createElement('canvas')
  labelCanvas.width = 1800
  labelCanvas.height = 420
  const labelTex = new CanvasTexture(labelCanvas)
  labelTex.colorSpace = SRGBColorSpace
  textures.push(labelTex)
  const drawLabel = (img) => {
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
        c.fillText('380ml', x + 150, 370)
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
  drawLabel(null)
  const logoImg = new Image()
  logoImg.onload = () => drawLabel(logoImg)
  logoImg.src = logo

  const honeyBase = new MeshPhysicalMaterial({ color: HONEY, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true, opacity: 0.94 })
  const cap = new MeshPhysicalMaterial({ color: '#141210', roughness: 0.3, clearcoat: 0.6 })
  const label = new MeshStandardMaterial({ map: labelTex, roughness: 0.6 })
  const jarMats = []
  const makeJar = (x, z, color) => {
    const honey = honeyBase.clone()
    if (color) honey.color.set(color)
    jarMats.push(honey)
    const jar = new Group()
    jar.position.set(x, T, z)
    jar.rotation.y = Math.PI / 6 // mặt phẳng lục giác quay ra trước
    add(jar, new CylinderGeometry(3.5, 3.5, 7.2, 6), honey, 0, 3.6, 0)
    add(jar, new CylinderGeometry(3.53, 3.53, 3.8, 6, 1, true), label, 0, 3.4, 0)
    add(jar, new CylinderGeometry(2.7, 3.1, 0.6, 24), honey, 0, 7.5, 0)
    add(jar, new CylinderGeometry(3.0, 3.0, 1.4, 32), cap, 0, 8.5, 0)
    box.add(jar)
  }
  // tâm 2 ô lọ trên tấm lót (theo file in)
  makeJar(-4.9, -1.3, jarColors[0])
  makeJar(4.9, -1.3, jarColors[1])

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

  const ready = Promise.all([
    tex('lid-top.jpg'),
    tex('lid-flap.jpg', (t) => {
      // UV của ShapeGeometry là toạ độ cm → đưa về 0..1
      // co vào một chút: mép ảnh vạt (từ file in) còn sót nền trắng
      t.repeat.set(0.98 / (W + 0.4), 0.95 / FLAP)
      t.offset.set(0.5, 0.99)
    }),
    tex('lid-back.jpg'),
    tex('base-bottom.jpg'),
    tex('base-long.jpg'),
    tex('base-short.jpg', (t) => {
      t.center.set(0.5, 0.5)
      t.rotation = Math.PI / 2
    }),
    tex('../hop-mat-trong.jpg'),
  ]).then(([top, flap, back, bottom, long, short, inside]) => {
    const m = (map, extra) => mat({ map, ...extra })
    const topM = m(top, { roughness: 0.5, envMapIntensity: 0.55 })
    const longM = m(long)
    const shortM = m(short)
    const backM = m(back)
    const bottomM = m(bottom)
    const insideM = m(inside, { roughness: 0.7 })
    const flapM = m(flap, { roughness: 0.5, envMapIntensity: 0.55 })

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
    tray.holes.push(rect(-9.4, -4.1, -0.4, 6.7), rect(0.4, -4.1, 9.4, 6.7), rect(-7.8, -6.6, 7.8, -4.9))
    const trayGeo = new ExtrudeGeometry(tray, { depth: 0.25, bevelEnabled: false })
    // lót đặt thấp để thấy nhãn lọ khi mở nắp
    const trayMesh = add(box, trayGeo, [yellow, yellowShade], 0, 2.95, 0)
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
  const shadow = add(scene, new PlaneGeometry(44, 30), shadowMat, 0, -H / 2 - 0.6, 0)
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
    baseDist = 58 / Math.min(1, camera.aspect)
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
    /** đổi màu mật trong 2 lọ theo loại khách chọn */
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
