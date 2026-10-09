import { Engine } from './core/Engine.js'
import { createAnchors } from './core/anchors.js'
import { PALETTE, THREE_CONFIG } from './config.js'
import { PollenField } from './effects/PollenField.js'
import { LightRays } from './effects/LightRays.js'
import { MountainAtmosphere } from './effects/MountainAtmosphere.js'
import { FlowerField } from './effects/FlowerField.js'
import { BeeSwarm } from './effects/BeeSwarm.js'
import { Honeycomb } from './effects/Honeycomb.js'
import { HoneyParticles } from './effects/HoneyParticles.js'
import { GiftBox } from './effects/GiftBox.js'
import { GuideBee } from './effects/GuideBee.js'

/**
 * Một ngày xuân ở Điện Biên, kể bằng không khí: HOA → PHẤN → ONG → MẬT.
 * Three.js chủ yếu làm nắng, sương, phấn, ong, hoa; vật thể chỉ có miếng bánh tổ lắc được ở "Giọt mật" và hộp quà ở "Hộp quà".
 * Một mặt trời, một hướng sáng (thấp bên phải): sáng sớm ở Hero, chiều tà ở CTA.
 *
 *   Hero          tia nắng sớm toả từ mặt trời trong tranh + sương trôi ở chân núi + vài con ong ghé cành hoa ban
 *   Nguồn gốc     núi xa xanh lam + sương + đồng hoa lay theo gió + đàn ong đi kiếm mật
 *   Giọt mật      miếng bánh tổ 3D: nghiêng theo chuột, kéo/chạm để lắc; sợi mật đung đưa, giọt to dần rồi rơi
 *   Sản phẩm      gần như tĩnh — vài hạt phấn khi rê chuột lên thẻ
 *   Ong dẫn đường một con ong theo suốt trang, đậu lên thứ chính của từng phần (data-bee-perch), để lại vệt phấn
 *   Hộp quà       hộp lục giác 3D: kéo để xoay, bấm để mở nắp — hũ mật nhô lên, thiệp ở mặt trong nắp
 *   CTA           tia nắng chiều cùng hướng + bụi nắng bay lên
 *   Phấn hoa      một lớp mỏng, một màu, chạy xuyên trang — dày ở Hero/Nguồn gốc, thưa ở phần nội dung
 */
export function createExperience(canvas, options) {
  const engine = new Engine(canvas, options)
  const anchors = createAnchors(engine)
  // chế độ nhẹ (điện thoại): chỉ miếng bánh tổ 3D — không hoa cỏ, ong, sương, phấn hoa
  const fx = options.lite ? { honeycomb: THREE_CONFIG.effects.honeycomb } : THREE_CONFIG.effects
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

  // ── chủ thể: bánh tổ & ong ────────────────────────────────
  if (fx.honeycomb) engine.add(new Honeycomb(engine, P, { anchor: anchors.combStage }))
  if (fx.giftBox) engine.add(new GiftBox(engine, P, { anchor: anchors.giftStage }))
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
  if (fx.guideBee) engine.add(new GuideBee(engine))
  if (fx.pollen) engine.add(new PollenField(engine, P))
  if (fx.goldenParticles) engine.add(new HoneyParticles(engine, { section: 'cta' }))

  engine.start()
  return engine
}
