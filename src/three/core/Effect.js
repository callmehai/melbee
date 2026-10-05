import { Group } from 'three'

/**
 * Lớp cơ sở cho mọi hiệu ứng: có group riêng trong scene chung, tự dọn khi dispose.
 * Hiệu ứng con ghi đè update / setQuality / resize và đặt this.count, this.intensity.
 */
export class Effect {
  constructor(engine, name) {
    this.engine = engine
    this.name = name
    this.group = new Group()
    this.group.name = name
    this.intensity = 0
    this.count = 0
    engine.scene.add(this.group)
  }

  get active() {
    return this.group.visible && this.intensity > 0.002
  }

  setQuality() {}

  resize() {}

  update() {}

  dispose() {
    this.engine.scene.remove(this.group)
    this.group.traverse((obj) => {
      obj.geometry?.dispose()
      const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : []
      for (const m of mats) {
        for (const v of Object.values(m.uniforms || {})) {
          // texture dùng chung của engine (uBg) do engine tự dọn
          if (v?.value?.isTexture && !v.shared) v.value.dispose()
        }
        m.map?.dispose()
        m.dispose()
      }
    })
  }
}
