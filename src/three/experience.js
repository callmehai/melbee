import { Engine } from './core/Engine.js'
import { createAnchors } from './core/anchors.js'
import { PALETTE, THREE_CONFIG } from './config.js'
import { PollenField } from './effects/PollenField.js'
import { LightRays } from './effects/LightRays.js'
import { MountainAtmosphere } from './effects/MountainAtmosphere.js'
import { FlowerField } from './effects/FlowerField.js'
import { BeeSwarm } from './effects/BeeSwarm.js'
import { HoneyDrop } from './effects/HoneyDrop.js'
import { HoneyParticles } from './effects/HoneyParticles.js'

/**
 * Một ngày xuân ở Điện Biên, kể bằng không khí: HOA → PHẤN → ONG → MẬT.
 * Three.js chỉ làm nắng, sương, phấn, ong, hoa — không làm vật thể trình diễn.
 * Một mặt trời, một hướng sáng (thấp bên phải): sáng sớm ở Hero, chiều tà ở CTA.
 *
 *   Hero          tia nắng sớm toả từ mặt trời trong tranh + sương trôi ở chân núi + vài con ong ghé cành hoa ban
 *   Nguồn gốc     núi xa xanh lam + sương + đồng hoa lay theo gió + đàn ong đi kiếm mật
 *   Giọt mật      giọt mật hình thành ở đầu dòng mật trong tranh gáo mật rồi nhỏ xuống
 *   Sản phẩm      gần như tĩnh — vài hạt phấn khi rê chuột lên thẻ
 *   CTA           tia nắng chiều cùng hướng + bụi nắng bay lên
 *   Phấn hoa      một lớp mỏng, một màu, chạy xuyên trang — dày ở Hero/Nguồn gốc, thưa ở phần nội dung
 */
export function createExperience(canvas, options) {
  const engine = new Engine(canvas, options)
  const anchors = createAnchors(engine)
  const fx = THREE_CONFIG.effects
  const P = PALETTE

  // ── nền: ánh sáng & không khí ─────────────────────────────
  if (fx.lightRays) {
    engine.add(new LightRays(engine, P, { section: 'hero', strength: 0.2, color: P.rayMorning, sun: anchors.sun('hero'), direction: [-1, 0.3] }))
    engine.add(new LightRays(engine, P, { section: 'cta', strength: 0.18, color: P.rayWarm, sun: anchors.sun('cta'), direction: [-1, 0.35] }))
  }
  if (fx.atmosphere) {
    engine.add(
      new MountainAtmosphere(engine, P, {
        name: 'Sương sớm · Hero',
        fog: 0.3,
        strength: 0.9,
        seed: 2,
        band: () => {
          const s = anchors.section('hero')
          return s && { left: 0, top: s.top + s.height * 0.6, width: engine.W, height: s.height * 0.4, inView: s.inView }
        },
      })
    )
    engine.add(new MountainAtmosphere(engine, P, { name: 'Núi xa & sương · Nguồn gốc', ridges: true, fog: 0.22, z: -420, seed: 9, band: anchors.meadow }))
  }
  const flowers = fx.flowers ? engine.add(new FlowerField(engine, P, { band: anchors.meadow })) : null

  // ── chủ thể: giọt mật & ong ───────────────────────────────
  if (fx.honeyDrop) {
    // màu theo dòng mật trong tranh gáo mật (#A86D1C → #E9B24F → #C88A24)
    const tone = { deep: '#a86d1c', mid: '#d9a443', light: '#f5d185', glow: 0.45 }
    engine.add(new HoneyDrop(engine, P, { name: 'Giọt mật', anchor: anchors.introDrip, tone }))
  }
  if (fx.bees) {
    engine.add(
      new BeeSwarm(engine, {
        anchors: [
          { get: () => anchors.heroBlooms() && { ...anchors.heroBlooms(), max: 3 } },
          {
            get: () => {
              const m = anchors.meadow()
              if (!m || !flowers) return null
              return { sx: 0, sy: m.top, targets: flowers.heads(), inView: m.inView, visibility: m.visibility }
            },
          },
        ],
      })
    )
  }
  if (fx.pollen) engine.add(new PollenField(engine, P))
  if (fx.goldenParticles) engine.add(new HoneyParticles(engine, { section: 'cta' }))

  engine.start()
  return engine
}
