import { Engine } from './core/Engine.js'
import { createAnchors } from './core/anchors.js'
import { PALETTE, THREE_CONFIG } from './config.js'
import { PollenField } from './effects/PollenField.js'
import { WindParticles } from './effects/WindParticles.js'
import { LightRays } from './effects/LightRays.js'
import { MountainAtmosphere } from './effects/MountainAtmosphere.js'
import { FlowerField } from './effects/FlowerField.js'
import { BeeSwarm } from './effects/BeeSwarm.js'
import { HoneyDrop } from './effects/HoneyDrop.js'
import { HoneyFlow } from './effects/HoneyFlow.js'
import { HoneyParticles } from './effects/HoneyParticles.js'

/**
 * Hành trình kể chuyện bằng hình: HOA → PHẤN → ONG → MẬT → SẢN PHẨM.
 *
 *   Hero          tia nắng + sương ấm + phấn hoa + giọt mật lơ lửng, đàn ong lượn quanh
 *   Mật ong       giọt mật rơi xuống cạnh khung ảnh khi cuộn tới
 *   Sản phẩm      gần như tĩnh (sản phẩm là chính) — hạt phấn khi rê chuột lên thẻ
 *   Câu chuyện    bụi nắng dày + tia sáng chậm
 *   Nguồn gốc     núi xa + sương + cánh đồng hoa lay theo gió + vệt gió + đàn ong bay tới
 *   Quy trình     dòng mật chảy dọc trục timeline qua 5 bước
 *   Lifestyle     phấn hoa lơ lửng
 *   Gallery       bụi nắng thưa
 *   CTA           hạt vàng bay lên + tia nắng ấm
 */
export function createExperience(canvas, options) {
  const engine = new Engine(canvas, options)
  const anchors = createAnchors(engine)
  const fx = THREE_CONFIG.effects
  const P = PALETTE

  // ── nền: ánh sáng & không khí ─────────────────────────────
  if (fx.lightRays) {
    engine.add(new LightRays(engine, P, { section: 'hero', strength: 0.16 }))
    engine.add(new LightRays(engine, P, { section: 'story', strength: 0.13, onLight: true, source: [1.02, 0.98], direction: [-1, -0.45] }))
    engine.add(new LightRays(engine, P, { section: 'origin', strength: 0.11 }))
    engine.add(new LightRays(engine, P, { section: 'cta', strength: 0.15, source: [0.5, 1.08], direction: [0, -1] }))
  }
  if (fx.atmosphere) {
    engine.add(
      new MountainAtmosphere(engine, P, {
        name: 'Sương · Hero',
        fogColor: '#e9c38a',
        fog: 0.22,
        strength: 0.9,
        seed: 2,
        band: () => {
          const s = anchors.section('hero')
          return s && { left: 0, top: s.top + s.height * 0.62, width: engine.W, height: s.height * 0.38, inView: s.inView }
        },
      })
    )
    engine.add(new MountainAtmosphere(engine, P, { name: 'Núi xa & sương · Nguồn gốc', ridges: true, fog: 0.14, z: -420, seed: 9, band: anchors.meadow }))
  }
  if (fx.flowers) engine.add(new FlowerField(engine, P, { band: anchors.meadow }))

  // ── hạt: phấn hoa, bụi nắng, gió ──────────────────────────
  if (fx.windStreaks) engine.add(new WindParticles(engine, P))
  if (fx.dust) engine.add(new PollenField(engine, P, 'dust'))
  if (fx.honeyFlow) engine.add(new HoneyFlow(engine, P, { timeline: anchors.timeline }))

  // ── chủ thể: giọt mật & ong ───────────────────────────────
  if (fx.honeyDrop) {
    engine.add(new HoneyDrop(engine, P, { name: 'Giọt mật · Hero', anchor: anchors.heroSubject }))
    engine.add(new HoneyDrop(engine, P, { name: 'Giọt mật · Mật ong', anchor: anchors.introDrop, mode: 'reveal' }))
  }
  if (fx.bees) {
    engine.add(
      new BeeSwarm(engine, {
        anchors: [
          {
            get: () => {
              const a = anchors.heroSubject()
              return a && { ...a, rx: Math.max(90, a.r * 3.6), ry: Math.max(60, a.r * 2.4) }
            },
          },
          {
            get: () => {
              const m = anchors.meadow()
              return m && { sx: engine.W / 2, sy: m.top + m.height * 0.3, rx: engine.W * 0.42, ry: m.height * 0.35, inView: m.inView, visibility: m.visibility }
            },
          },
        ],
      })
    )
  }
  if (fx.pollen) engine.add(new PollenField(engine, P, 'pollen'))
  if (fx.goldenParticles) engine.add(new HoneyParticles(engine, { section: 'cta' }))

  engine.start()
  return engine
}
