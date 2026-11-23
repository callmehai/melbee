import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  ShapeGeometry,
  Group,
  LatheGeometry,
  Vector2,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NeutralToneMapping,
  NoColorSpace,
  PCFSoftShadowMap,
  Path,
  PerspectiveCamera,
  PlaneGeometry,
  RingGeometry,
  PMREMGenerator,
  Scene,
  Shape,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { LAYOUTS } from './layouts.js'

/**
 * Hộp quà MelBee 3D, đơn vị cm — hộp 2 · 3 · 4 lọ (kích thước, chỗ đặt lọ: layouts.js), dựng theo ảnh set
 * và bản thiết kế hộp (11/2026): HỘP NAM CHÂM — thành hộp nâu sẫm vân tổ ong, đáy đen trơn; bìa nắp liền lưng hộp,
 * mặt nắp chữ MELBEE + hoa, ong, sóng nhũ vàng, vạt trước có logo Melbee úp xuống mặt trước; mở dựng đứng như bìa
 * sách, mặt trong in lời gửi; khay lót vàng khoét ô đặt lọ lục giác nắp vặn đen (nhãn cắt từ ảnh lọ thật của
 * từng loại mật) và que múc mật bằng gỗ.
 * Vào trang là hộp đã MỞ, nhìn từ trên xuống như ảnh set — hộp đóng kín màu sẫm nhìn như cái hòm (góp ý 23/11).
 * Lúc không ai đụng: lắc nhẹ quanh góc nhìn chính diện, không xoay tròn (xoay tròn nửa thời gian chỉ thấy lưng nắp).
 * Mặt nắp lấy từ file in hộp 2 lọ rồi vẽ lại cho vừa từng cỡ hộp (phủ kín, không kéo méo); vân tổ ong
 * vẽ bằng canvas theo cm nên ô đều nhau ở mọi cỡ hộp.
 * Kéo để xoay (điện thoại: vuốt ngang — vuốt dọc vẫn cuộn trang), chạm / bấm để mở nắp. Nút ngoài khung: xoay
 * từng phần tư vòng, kéo mức mở nắp, nhấc lọ lên xem nhãn, nhìn từ trên (học từ trang thiết kế hộp quà A Sỉn).
 */
const T = 0.3 // độ dày bìa

const BROWN = '#2a1611'
const YELLOW = '#f5b51c'
const HONEY = '#e2a13a'

/** Lọ 280ml nhỏ hơn lọ 380ml (cùng dáng lọ tròn) */
const JAR_SCALE = { '380ml': 1, '280ml': 0.88 }

export function createGiftBox(canvas, { layout = 'hop-2', url, jars = [], reducedMotion = false, startOpen = true, onReady, onOpenChange, onLiftChange }) {
  const L = LAYOUTS[layout] || LAYOUTS['hop-2']
  const { W, D, H } = L
  // hộp to hơn hộp 2 lọ bao nhiêu → máy quay lùi ra bấy nhiêu
  const K = Math.hypot(W, D, H) / Math.hypot(22, 15, 10)

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = NeutralToneMapping // giữ màu vàng mật / cam của lót và nắp trong như ảnh set
  renderer.toneMappingExposure = 0.95
  renderer.shadowMap.enabled = true // lọ đổ bóng xuống khay, nắp đổ bóng vào lòng hộp
  renderer.shadowMap.type = PCFSoftShadowMap

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = env
  scene.add(new HemisphereLight('#fff4e0', '#3a291d', 0.6))
  const key = new DirectionalLight('#fff1d6', 1.6)
  key.position.set(-18, 30, 22)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.03
  key.shadow.radius = 4
  const shadowCam = key.shadow.camera
  shadowCam.left = shadowCam.bottom = -30 * K
  shadowCam.right = shadowCam.top = 30 * K
  shadowCam.near = 1
  shadowCam.far = 120
  scene.add(key)
  // đèn viền ấm phía sau bên phải: mép hộp, nắp lọ và chữ nhũ có điểm sáng
  const rim = new DirectionalLight('#ffe0ad', 0.8)
  rim.position.set(22, 16, -24)
  scene.add(rim)

  const camera = new PerspectiveCamera(30, 1, 1, 400)
  // máy quay nhìn hơi từ trên xuống; mở nắp thì lùi ra và nhìn cao hơn (như ảnh set): thấy nhãn lọ,
  // que múc mật trong khay và trọn mặt trong nắp dựng đứng phía sau
  let baseDist = 58 * K
  const placeCamera = (o, top = 0, up = 0) => {
    // nắp mở dựng đứng cao bằng chiều sâu hộp (D) → hộp càng sâu càng lùi ra và nhìn lên cao hơn, nắp không bị cắt
    // nhìn từ trên: lùi xa hơn vì nắp mở nằm ngửa phía sau hộp, xoay hộp nào cũng không bị cắt
    const dist = baseDist * (1 + o * (0.14 + 0.024 * D) * (1 - top) + top * (0.1 + 0.42 * o))
    // góc nhìn xuống: ~17° → ~43° như ảnh set (thấy nhãn lọ, que múc mật, lời gửi); nhìn từ trên: ~83°
    const el = (0.3 + 0.72 * o - 0.32 * up) * (1 - top) + 1.45 * top // mở nắp: ~58° — nhìn qua thành trước thấy trọn nhãn lọ
    // nhấc lọ lên (up): lùi ra một chút cho lọ nổi lên vẫn nằm trọn trong khung
    camera.position.set(0, Math.sin(el) * dist * (1 + 0.12 * up), Math.cos(el) * dist * (1 + 0.12 * up))
    camera.lookAt(0, (0.5 + o * D * 0.5) * (1 - top), o * D * 0.2 * (1 - top)) // hộp đã dời lên trước khi mở (xem root.rotation) → nhìn theo cho cân khung
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
  /**
   * Vẽ ảnh lên một mặt w × h cm mà không kéo méo: 'cover' phủ kín (cắt bớt mép), 'contain' thu vào
   * (phần thừa tô màu nền ảnh). src: vùng ảnh nguồn [sx, sy, sw, sh] nếu chỉ lấy một phần.
   */
  const fit = (im, w, h, { mode = 'cover', bg, src, data = false } = {}) => {
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
    const t = canvasTex(c)
    if (data) t.colorSpace = NoColorSpace // bản đồ kim loại / nhám: số liệu, không phải màu
    return t
  }
  const mat = (opts) => new MeshStandardMaterial({ roughness: 0.55, envMapIntensity: 0.7, ...opts })
  const brown = mat({ color: BROWN })
  const yellow = mat({ color: YELLOW, roughness: 0.8, envMapIntensity: 0.35 })
  const yellowShade = mat({ color: '#d99a12', roughness: 0.85, envMapIntensity: 0.35 })
  /**
   * Thành hộp theo bản thiết kế (góp ý 23/11): nâu sẫm vân tổ ong chìm, vẽ theo cm nên ô tổ ong đều nhau ở mọi
   * mặt, mọi cỡ hộp.
   */
  const honeycomb = (w, h) => {
    const ppc = 1024 / Math.max(w, h) // điểm ảnh / cm
    const make = () => {
      const c = document.createElement('canvas')
      c.width = Math.round(w * ppc)
      c.height = Math.round(h * ppc)
      return [c, c.getContext('2d')]
    }
    const [c, x] = make()
    const [bc, bx] = make() // bản đồ nổi (bump): vân tổ ong chìm + thớ giấy mỹ thuật
    const r = 0.62 * ppc // bán kính ô
    const dx = Math.sqrt(3) * r
    const dy = 1.5 * r
    const hexes = (ctx) => {
      ctx.beginPath()
      for (let row = -1; row * dy < c.height + r; row++) {
        for (let col = -1; col * dx < c.width + dx; col++) {
          const cx = col * dx + (row % 2 ? dx / 2 : 0)
          const cy = row * dy
          for (let k = 0; k <= 6; k++) {
            const a = Math.PI / 6 + (k * Math.PI) / 3
            const px = cx + r * 0.9 * Math.cos(a)
            const py = cy + r * 0.9 * Math.sin(a)
            k ? ctx.lineTo(px, py) : ctx.moveTo(px, py)
          }
        }
      }
      ctx.stroke()
    }
    x.fillStyle = '#2c130b'
    x.fillRect(0, 0, c.width, c.height)
    x.strokeStyle = '#1c0a05'
    x.lineWidth = Math.max(1.5, 0.09 * ppc)
    hexes(x)
    // bump: nền xám + hạt giấy, đường tổ ong chìm xuống
    const img = bx.createImageData(bc.width, bc.height)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 150 + (Math.random() - 0.5) * 26
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    bx.putImageData(img, 0, 0)
    bx.strokeStyle = '#3c3c3c'
    bx.lineWidth = Math.max(1.5, 0.1 * ppc)
    hexes(bx)
    const bump = canvasTex(bc)
    bump.colorSpace = NoColorSpace
    return { map: canvasTex(c), bump }
  }
  /**
   * Nhũ vàng thật trên nắp: điểm ảnh vàng (chữ MELBEE, hoa, ong, sóng) thành kim loại bóng, nền nâu giữ giấy nhám.
   * Ra một ảnh dùng làm cả metalnessMap (kênh B) lẫn roughnessMap (kênh G) — cắt / co giãn đúng như ảnh màu.
   */
  const foil = (im) => {
    const c = document.createElement('canvas')
    c.width = im.width
    c.height = im.height
    const x = c.getContext('2d', { willReadFrequently: true })
    x.drawImage(im, 0, 0)
    const d = x.getImageData(0, 0, c.width, c.height)
    const px = d.data
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2]
      const k = Math.min(1, Math.max(0, (r - b - 45) / 60)) * Math.min(1, Math.max(0, (r - 100) / 60)) * (g > 60 ? 1 : 0)
      px[i] = 0
      px[i + 1] = 255 * (0.8 - 0.55 * k) // nhám: giấy 0.8, nhũ 0.25
      px[i + 2] = 255 * k // kim loại
    }
    x.putImageData(d, 0, 0)
    return c
  }
  const bottomBlack = mat({ color: '#141010', roughness: 0.7, envMapIntensity: 0.4 })

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

  // ---------- lọ mật: lọ thuỷ tinh LỤC GIÁC nắp vặn đen như ảnh lọ thật; nhãn quấn 3 mặt trước ----------
  // đơn vị cm, lọ 380ml (lọ 280ml thu nhỏ theo JAR_SCALE). Mặt phẳng của lục giác quay ra trước (+z).
  // tỉ lệ đo từ ảnh lọ thật (ảnh sản phẩm): ngang qua hai góc 2R; thành thẳng cao ~1,03 × 2R; vai ngắn;
  // nắp vặn rộng 0,8 × 2R, cao 0,145 × 2R; nhãn từ ~0,1 × 2R trên đáy tới gần hết thành thẳng
  const JR = 3.6 // bán kính tới góc lục giác: ngang qua hai góc 7,2 cm
  const WALL = 7.4 // chiều cao thành thẳng
  const JAR_H = 9.35 // cao cả nắp (lọ 380ml)
  const LABEL_Y0 = 0.7
  const LABEL_Y1 = 7.3
  /** Vẽ nhãn kiểu nhãn MELBEE thật: 3 mặt liền nhau — hai mặt bên chữ nhỏ (thành phần, cách dùng), mặt
   * giữa: MELBEE / SPECIALTY HONEY, cành hoa nhũ vàng, tên mật lớn, tên tiếng Anh, 100% Nguyên Chất…, dung tích, hình lọ mật. */
  const drawLabel = (c, { bg = '#f3ecdc', ink = '#3a291d', name = '', nameEn = '' }, size) => {
    const x = c.getContext('2d')
    const Wl = c.width
    const Hl = c.height
    const fw = Wl / 3 // một mặt lục giác
    const gold = '#b98b3c'
    x.fillStyle = bg
    x.fillRect(0, 0, Wl, Hl)
    x.textBaseline = 'alphabetic'

    // hai mặt bên: khung chỉ mảnh + các dòng chữ nhỏ
    const sides = [
      ['Thành phần: 100% mật ong nguyên chất.', 'Thông tin sản phẩm: Mật ong được khai thác', 'từ đàn ong nuôi trên núi rừng Tây Bắc,', 'không pha trộn, không chất bảo quản.', '', 'Hướng dẫn sử dụng: Dùng trực tiếp', 'hoặc pha với nước ấm dưới 40°C.', '', 'Bảo quản: Nơi khô ráo, thoáng mát,', 'tránh ánh nắng trực tiếp.', '', 'Không dùng cho trẻ dưới 1 tuổi.'],
      ['MÔ TẢ SẢN PHẨM', 'Mật sánh, màu hổ phách, hương hoa', 'rừng đặc trưng của vùng cao.', '', 'CÔNG DỤNG', 'Bồi bổ sức khoẻ, làm ấm cổ họng,', 'dùng trong pha chế và nấu ăn.', '', 'Đơn vị chịu trách nhiệm:', 'CÔNG TY CỔ PHẦN MELBEE', 'Hoà Lạc, Hà Nội', 'Hotline: 0936 321 902'],
    ]
    sides.forEach((lines, k) => {
      const x0 = k === 0 ? 0 : fw * 2
      x.globalAlpha = 0.6
      x.strokeStyle = ink
      x.lineWidth = 2
      x.strokeRect(x0 + 34, 40, fw - 68, Hl - 80)
      x.globalAlpha = 0.75
      x.fillStyle = ink
      x.textAlign = 'left'
      lines.forEach((t, i) => {
        x.font = (k === 1 && /^[A-ZĐ ]+$/.test(t)) || t.endsWith(':') ? 'bold 25px Georgia, serif' : '25px Georgia, serif'
        x.fillText(t, x0 + 56, 100 + i * 52, fw - 112)
      })
    })
    x.globalAlpha = 1

    const f0 = fw
    const cx = f0 + fw / 2
    // MELBEE / SPECIALTY HONEY góc trên trái
    x.fillStyle = ink
    x.textAlign = 'left'
    x.font = '38px Georgia, serif'
    x.fillText('MELBEE®', f0 + 44, 112)
    x.fillText('SPECIALTY HONEY', f0 + 44, 160)
    // cành hoa nhũ vàng góc trên phải
    x.strokeStyle = gold
    x.lineWidth = 3
    x.lineCap = 'round'
    x.beginPath()
    x.moveTo(f0 + 380, 70)
    x.bezierCurveTo(f0 + 470, 120, f0 + 560, 110, f0 + 660, 210)
    x.stroke()
    for (const [px, py, a] of [[f0 + 450, 103, -0.9], [f0 + 520, 118, 0.5], [f0 + 590, 140, -0.6], [f0 + 620, 170, 0.7]]) {
      x.save()
      x.translate(px, py)
      x.rotate(a)
      x.beginPath()
      x.ellipse(0, -22, 9, 22, 0, 0, Math.PI * 2)
      x.stroke()
      x.restore()
    }
    x.beginPath()
    x.arc(f0 + 655, 214, 13, 0, Math.PI * 2)
    x.stroke()

    // tên mật: chữ lớn, tự thu nhỏ / xuống dòng cho vừa mặt nhãn
    const title = `Mật Ong ${name.replace(/(^|\s)\S/g, (m) => m.toUpperCase())}`
    x.textAlign = 'center'
    let fs = 100
    const fit = () => {
      x.font = `italic bold ${fs}px Georgia, serif`
      return x.measureText(title).width
    }
    while (fit() > fw - 60 && fs > 78) fs -= 2
    if (fit() > fw - 60) {
      const words = title.split(' ')
      const cut = Math.ceil(words.length / 2)
      x.fillText(words.slice(0, cut).join(' '), cx, 330)
      x.fillText(words.slice(cut).join(' '), cx, 330 + fs * 1.05)
    } else x.fillText(title, cx, 380)
    x.font = '30px Georgia, serif'
    x.globalAlpha = 0.85
    if (nameEn) x.fillText(nameEn, cx, 470, fw - 60)
    x.globalAlpha = 1
    x.font = 'italic 36px Georgia, serif'
    x.fillText('100% Nguyên Chất & Thuần Khiết', cx, 580, fw - 60)
    // dung tích góc dưới trái, hình lọ mật nhũ vàng góc dưới phải
    x.textAlign = 'left'
    x.font = 'italic 32px Georgia, serif'
    x.fillText(`Thể tích thực: ${size}`, f0 + 44, Hl - 70)
    x.strokeStyle = gold
    x.lineWidth = 3
    const jx = f0 + 540
    const jy = Hl - 70
    x.beginPath()
    x.moveTo(jx - 42, jy - 120)
    x.lineTo(jx + 42, jy - 120)
    x.moveTo(jx - 34, jy - 112)
    x.quadraticCurveTo(jx - 70, jy - 90, jx - 64, jy - 40)
    x.quadraticCurveTo(jx - 60, jy, jx, jy)
    x.quadraticCurveTo(jx + 60, jy, jx + 64, jy - 40)
    x.quadraticCurveTo(jx + 70, jy - 90, jx + 34, jy - 112)
    x.moveTo(jx - 50, jy - 60)
    x.quadraticCurveTo(jx, jy - 40, jx + 52, jy - 62)
    x.moveTo(jx + 20, jy - 150)
    x.lineTo(jx + 95, jy - 205)
    x.stroke()
    // tổ ong nhỏ cạnh lọ
    for (const [hx, hy] of [[jx + 82, jy - 22], [jx + 108, jy - 37], [jx + 108, jy - 7]]) {
      x.beginPath()
      for (let k = 0; k <= 6; k++) {
        const a = (k * Math.PI) / 3
        k ? x.lineTo(hx + 14 * Math.cos(a), hy + 14 * Math.sin(a)) : x.moveTo(hx + 14, hy)
      }
      x.stroke()
    }
  }
  const labelMat = (c) => new MeshStandardMaterial({ map: canvasTex(c), roughness: 0.6, envMapIntensity: 0.45, side: DoubleSide })
  /** Nhãn vẽ (dự phòng khi chưa có ảnh lọ): cao LABEL_Y0 → LABEL_Y1 */
  const makeLabel = (info, size) => {
    const c = document.createElement('canvas')
    c.width = 2048
    c.height = Math.round((2048 * (LABEL_Y1 - LABEL_Y0)) / (3 * JR))
    drawLabel(c, info, size)
    return { mat: labelMat(c), h: LABEL_Y1 - LABEL_Y0 }
  }
  const labelJobs = []
  /**
   * Nhãn THẬT cắt từ ảnh lọ: khung nhãn trong ảnh chạy từ góc trái tới góc phải lọ — nhìn thẳng thì mặt trước
   * chiếm nửa giữa, hai mặt bên mỗi mặt một phần tư (nghiêng 60° nên co lại một nửa). Kéo giãn từng phần
   * về đúng bề rộng một mặt rồi dán lên 3 mặt trước của lọ lục giác. Chiều cao nhãn theo đúng tỉ lệ ảnh.
   */
  const photoLabel = (src, [x0, y0, x1, y1]) => {
    const w = x1 - x0
    const hh = y1 - y0
    const h = Math.min(WALL - 0.1 - LABEL_Y0, (JR * hh) / (w / 2))
    const c = document.createElement('canvas')
    c.width = 2048
    c.height = Math.round((2048 * h) / (3 * JR))
    const m = labelMat(c)
    const tex = m.map
    labelJobs.push(
      new Promise((resolve) => {
        const im = new Image()
        im.onload = () => {
          const x = c.getContext('2d')
          const fw = c.width / 3
          ;[
            [0, 0.25],
            [0.25, 0.75],
            [0.75, 1],
          ].forEach(([a, b], i) => x.drawImage(im, x0 + a * w, y0, (b - a) * w, hh, i * fw, 0, fw, c.height))
          tex.needsUpdate = true
          resolve()
        }
        im.onerror = () => resolve() // ảnh lỗi: nhãn trơn, vẫn dựng hộp
        im.src = src
      }),
    )
    return { mat: m, h }
  }

  // mật trong lọ thuỷ tinh: màu mật thật đo từ ảnh lọ, bóng như thuỷ tinh; mặt lục giác phẳng (flatShading)
  const honeyBase = new MeshPhysicalMaterial({ color: HONEY, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04, flatShading: true, transparent: true, opacity: 0.97 })
  const neckGlass = new MeshPhysicalMaterial({ color: '#efe3c8', roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.5 })
  const cap = new MeshPhysicalMaterial({ color: '#0e0d0c', roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3, envMapIntensity: 0.7 })
  const capRidge = new MeshStandardMaterial({ color: '#1a1816', roughness: 0.55 })
  const PHI0 = -Math.PI / 6 // góc lục giác ở ±30° → một mặt phẳng quay ra +z
  // thân lục giác: đáy dày bo nhẹ, thành thẳng cao, vai ngắn vát vào cổ tròn
  const bodyGeo = new LatheGeometry(
    [
      [0, 0],
      [JR - 0.22, 0],
      [JR, 0.18],
      [JR, WALL],
      [JR - 0.3, WALL + 0.32],
      [3.0, WALL + 0.62],
      [0, WALL + 0.62],
    ].map(([r, y]) => new Vector2(r, y)),
    6,
    PHI0,
  )
  const neckGeo = new CylinderGeometry(2.75, 2.85, 0.5, 40)
  const capGeo = new CylinderGeometry(2.89, 2.89, 1.0, 48)
  const capTopGeo = new CylinderGeometry(2.7, 2.89, 0.1, 48)
  const ridgeGeo = new CylinderGeometry(2.93, 2.93, 0.16, 48, 1, true)
  geometries.push(bodyGeo, neckGeo, capGeo, capTopGeo, ridgeGeo)
  const CAP_Y = WALL + 0.85 // tâm nắp
  const makeJar = ({ x, z, size }, info = {}) => {
    const k = JAR_SCALE[size] || 1
    const honey = honeyBase.clone()
    const honeyColor = info.jar?.honey || info.color
    if (honeyColor) honey.color.set(honeyColor)
    const jar = new Group()
    // kê lọ cho nắp lọ thấp hơn mép hộp một chút như ảnh set (lọ 280ml thấp hơn → kê cao hơn)
    jar.userData.y0 = Math.max(T, H - JAR_H * k - 0.4)
    jar.position.set(x, jar.userData.y0, z)
    jar.scale.setScalar(k)
    const add2 = (geo, m, y = 0) => {
      const mesh = new Mesh(geo, m)
      mesh.position.y = y
      jar.add(mesh)
      return mesh
    }
    add2(bodyGeo, honey)
    const label = info.image && info.jar?.label ? photoLabel(info.image, info.jar.label) : makeLabel(info, size)
    const labelGeo = new LatheGeometry([new Vector2(JR + 0.03, LABEL_Y0), new Vector2(JR + 0.03, LABEL_Y0 + label.h)], 3, -Math.PI / 2, Math.PI)
    geometries.push(labelGeo)
    add2(labelGeo, label.mat)
    add2(neckGeo, neckGlass, WALL + 0.7)
    add2(capGeo, cap, CAP_Y + 0.15)
    add2(capTopGeo, cap, CAP_Y + 0.7)
    add2(ridgeGeo, capRidge, CAP_Y - 0.3) // gờ dưới của nắp vặn
    box.add(jar)
    jarGroups.push(jar)
  }
  const jarGroups = []
  L.jars.forEach((j, i) => makeJar(j, jars[i]))

  // ---------- que múc mật bằng gỗ (như ảnh set) ----------
  // gỗ sáng màu — nổi trên lót vàng
  const wood = mat({ color: '#e4c48e', roughness: 0.55, envMapIntensity: 0.6 })
  const woodDark = mat({ color: '#a8743f', roughness: 0.6 })
  const jarR = (j) => JR * (JAR_SCALE[j.size] || 1)
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
  // bản lề ở MÉP NGOÀI trên-sau (gáy bìa): nắp ngả ra sau vẫn liền với tấm bìa bọc lưng hộp, không hở khe
  lid.position.set(0, H + T, -D / 2 - T)
  box.add(lid)

  const ready = Promise.all([img('lid-top.jpg'), img('../hop-mat-trong.jpg'), img('../hop-mat-truoc.jpg'), ...labelJobs]).then(
    ([topImg, insideImg, coverImg]) => {
    const m = (map, extra) => mat({ map, ...extra })
    const foilImg = foil(topImg)
    const foilFit = (w, h, opts) => {
      const t = fit(foilImg, w, h, { ...opts, data: true })
      return { metalnessMap: t, roughnessMap: t, metalness: 1, roughness: 1, envMapIntensity: 1 }
    }
    const topM = m(fit(topImg, W + 0.7, D + 0.6), foilFit(W + 0.7, D + 0.6))
    const wallM = ({ map, bump }) => mat({ map, bumpMap: bump, bumpScale: 1.6, roughness: 0.82, envMapIntensity: 0.35 })
    const longM = wallM(honeycomb(W, H))
    const shortM = wallM(honeycomb(D, H))
    const coverM = mat({ color: '#2e1612', roughness: 0.72, envMapIntensity: 0.4 }) // bìa nắp bọc kín lưng hộp (phần trơn của file in)
    const backM = coverM
    const bottomM = bottomBlack // đáy đen trơn (góp ý 23/11)
    const insideM = m(fit(insideImg, W + 0.7, D + 0.6), { roughness: 0.8, envMapIntensity: 0.35 })

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
    // khay ngang mép dưới nhãn lọ như ảnh set: đáy lọ chìm trong ô, cả nhãn lộ trên mặt khay
    const trayY = Math.min(...jarGroups.map((j) => j.userData.y0 + LABEL_Y0 * j.scale.x)) - 0.3
    const trayMesh = add(box, trayGeo, [yellow, yellowShade], 0, trayY, 0)
    trayMesh.rotation.x = -Math.PI / 2
    const dipper = makeDipper()
    dipper.position.y = trayY + 0.25 + 0.8 // nằm trên mặt khay
    box.add(dipper)

    // nắp HỘP NAM CHÂM (góp ý 23/11 — "của mình nam châm mà"): một tấm bìa liền lưng hộp → mặt nắp → vạt trước
    // úp xuống che gần hết mặt trước, góc dưới bo tròn, logo Melbee in trên vạt (theo file in bìa hop-mat-truoc.jpg:
    // lưng trơn ~10 cm, mặt nắp ~15 cm, vạt ~9 cm cho hộp cao 10 cm). Đóng thì vạt hít nam châm vào mặt trước.
    const LW = W + 0.4 // bìa nắp nhỉnh hơn thân hộp một chút
    const LD = D + 0.6
    add(lid, new BoxGeometry(LW, T, LD), [coverM, coverM, topM, insideM, coverM, coverM], 0, -T / 2, LD / 2)
    // tấm bìa bọc lưng hộp, liền gáy với nắp (đáy hộp → mép trên nắp đóng)
    add(box, new BoxGeometry(LW, H + T, T), coverM, 0, (H + T) / 2, -D / 2 - T / 2)
    const F = H * 0.88 // vạt trước
    const RC = Math.min(1.9, F * 0.25) // bo góc dưới vạt
    const flap = new Shape()
    flap.moveTo(-LW / 2, 0.3)
    flap.lineTo(LW / 2, 0.3)
    flap.lineTo(LW / 2, -F + RC)
    flap.quadraticCurveTo(LW / 2, -F, LW / 2 - RC, -F)
    flap.lineTo(-LW / 2 + RC, -F)
    flap.quadraticCurveTo(-LW / 2, -F, -LW / 2, -F + RC)
    flap.closePath()
    // thân vạt (dày như bìa, mặt trong vàng như lòng nắp) + mặt in phía ngoài
    const flapBody = add(lid, new ExtrudeGeometry(flap, { depth: T, bevelEnabled: false, curveSegments: 10 }), [yellow, coverM], 0, -T, LD - T)
    flapBody.renderOrder = 0
    // mặt in: phần vạt của file in (dưới mép mặt nắp, trên chỗ bo góc), đặt sát mép trên, phần dư tô màu bìa;
    // UV của ShapeGeometry là toạ độ cm → co về 0..1 bằng repeat / offset
    const flapSrc = { mode: 'top', bg: '#2e1612', src: [0, coverImg.height * 0.757, coverImg.width, coverImg.height * 0.175] }
    const uv01 = (t) => {
      t.repeat.set(1 / LW, 1 / (F + 0.3))
      t.offset.set(0.5, F / (F + 0.3))
      return t
    }
    const flapM = mat({ map: uv01(fit(coverImg, LW, F + 0.3, flapSrc)), roughness: 0.6, envMapIntensity: 0.5 })
    add(lid, new ShapeGeometry(flap, 10), flapM, 0, -T, LD + 0.01)
    // bóng đổ thật: mọi mặt hộp, khay, lọ đều đổ và nhận bóng
    root.traverse((o) => {
      if (o.isMesh) o.castShadow = o.receiveShadow = true
    })
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
  // vòng sàn mảnh màu nhũ vàng quanh hộp — như bục trưng bày
  const ringMat = new MeshBasicMaterial({ color: '#b98a3a', transparent: true, opacity: 0.55, depthWrite: false, side: DoubleSide })
  const ringR = Math.hypot(W, D) * 0.52
  const ring = add(scene, new RingGeometry(ringR, ringR + 0.09 * K, 160), ringMat, 0, -H / 2 - 0.55, 0)
  ring.rotation.x = -Math.PI / 2

  // ---------- tương tác ----------
  const YAW_REST = -0.32 // góc nhìn chính diện hơi chếch như ảnh set
  let yaw = YAW_REST
  let pitch = 0.12
  let vYaw = 0
  let vPitch = 0
  let open = startOpen ? 1 : 0
  let openTarget = open
  let rest = YAW_REST // góc lắc quanh khi không ai đụng: kéo / bấm nút xoay xong thì lắc quanh góc mới
  let spin = 0 // phần xoay còn lại của nút xoay trái / phải
  let lift = 0 // nhấc lọ lên khỏi khay (0 → 1)
  let liftTarget = 0
  let top = 0 // nhìn từ trên xuống (0 → 1)
  let topTarget = 0
  let lastUser = -1e9
  let drag = null

  /** v: true / false hoặc mức mở 0 → 1 (thanh kéo). Đóng nắp thì lọ về khay. */
  const setOpen = (v) => {
    openTarget = typeof v === 'number' ? Math.min(1, Math.max(0, v)) : v ? 1 : 0
    if (openTarget < 0.6 && liftTarget) setLift(false)
    onOpenChange?.(openTarget)
  }
  const setLift = (v) => {
    liftTarget = v ? 1 : 0
    if (v && openTarget < 1) setOpen(1)
    onLiftChange?.(!!v)
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
    if (moved < 6 && performance.now() - drag.t < 450) setOpen(openTarget < 0.5)
    else rest = yaw
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
      if (idle) {
        // về góc đã chọn (theo đường ngắn nhất dù đã xoay mấy vòng) rồi lắc nhẹ ±18°; nhìn từ trên thì đứng yên
        const target = rest + (reducedMotion || topTarget ? 0 : 0.32 * Math.sin(now * 0.00042))
        let diff = (target - yaw) % (Math.PI * 2)
        if (diff > Math.PI) diff -= Math.PI * 2
        if (diff < -Math.PI) diff += Math.PI * 2
        vYaw += (diff * 0.03 - vYaw) * 0.08
        pitch += ((topTarget ? 0 : 0.12) - pitch) * 0.02 // tự nghiêng về góc nhìn đẹp
      } else vYaw *= 0.92 // thả tay: trôi nhẹ rồi dừng
      yaw += vYaw
      if (spin) {
        // nút xoay: quay dần một phần tư vòng
        const step = Math.abs(spin) < 0.002 ? spin : spin * Math.min(1, dt * 6)
        spin -= step
        yaw += step
        rest += step
      }
      vPitch *= 0.9
      pitch += vPitch
    }
    open += (openTarget - open) * Math.min(1, dt * 5)
    lift += (liftTarget - lift) * Math.min(1, dt * 3.5)
    top += (topTarget - top) * Math.min(1, dt * 4)
    // mở nắp thì nắp ngả ra sau xa → dời hộp lên trước để tâm xoay nằm giữa cả cụm hộp + nắp: xoay ngang không lòi nắp ra khỏi khung
    box.position.z = open * D * 0.36
    root.rotation.set(pitch, yaw, 0, 'XYZ')
    lid.rotation.x = -open * 2.3 // hộp nam châm: ngả ra sau ~130° để vạt trước dựng lên, không che lời gửi trong nắp
    // lọ nhấc lên lần lượt (lọ sau chậm hơn một nhịp), nổi nhẹ lên xuống
    jarGroups.forEach((j, i) => {
      const t = Math.min(1, Math.max(0, lift * (1 + 0.15 * jarGroups.length) - 0.15 * i))
      const e = t * t * (3 - 2 * t)
      const bob = reducedMotion ? 0 : 0.22 * Math.sin(now * 0.0021 + i * 1.3) * e
      j.position.y = j.userData.y0 + e * H * 0.8 + bob
    })
    placeCamera(open, top, lift)
    shadowMat.opacity = Math.max(0, 1 - Math.abs(pitch) * 0.7)
    ringMat.opacity = 0.55 * shadowMat.opacity
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
    placeCamera(open, top, lift)
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
    toggle: () => setOpen(openTarget < 0.5),
    setOpen,
    setLift,
    setTop: (v) => (topTarget = v ? 1 : 0),
    /** dir: -1 trái · 1 phải — một phần tư vòng */
    rotate: (dir) => {
      spin += dir * (Math.PI / 2)
      lastUser = performance.now()
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
