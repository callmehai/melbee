import { asset, hasAsset } from './assets.js'

// Có file thật thì phát file đó; chưa có thì tổng hợp tiếng gió núi bằng Web Audio.
const AMBIENT_FILE = 'assets/audio/ambient.mp3'
const VOLUME = 0.16

/**
 * Âm thanh núi rừng — KHÔNG tự phát, chỉ bật khi người xem bấm nút.
 * Gió mạnh lên một chút khi cuộn nhanh (cùng ý với lớp Three.js).
 */
export function createAmbientSound() {
  let ctx = null
  let master = null
  let audio = null
  let lastY = 0
  let lastT = 0

  const onScroll = () => {
    if (!master) return
    const now = performance.now()
    const v = Math.abs(window.scrollY - lastY) / Math.max(16, now - lastT) // px/ms
    lastY = window.scrollY
    lastT = now
    const target = VOLUME * (1 + Math.min(v, 3) * 0.35)
    master.gain.setTargetAtTime(target, ctx.currentTime, 0.25)
    master.gain.setTargetAtTime(VOLUME, ctx.currentTime + 0.6, 0.8)
  }

  function buildWind() {
    // nhiễu hồng ~ tiếng gió
    const len = ctx.sampleRate * 3
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    let b0 = 0
    let b1 = 0
    let b2 = 0
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1
      b0 = 0.997 * b0 + w * 0.029
      b1 = 0.985 * b1 + w * 0.032
      b2 = 0.95 * b2 + w * 0.048
      d[i] = (b0 + b1 + b2) * 0.9
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = 520
    band.Q.value = 0.6
    // gió lên xuống chậm
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.07
    lfoGain.gain.value = 260
    lfo.connect(lfoGain).connect(band.frequency)
    const low = ctx.createBiquadFilter()
    low.type = 'lowpass'
    low.frequency.value = 160
    const lowGain = ctx.createGain()
    lowGain.gain.value = 0.5
    src.connect(band).connect(master)
    src.connect(low).connect(lowGain).connect(master)
    src.start()
    lfo.start()
  }

  return {
    async start() {
      if (hasAsset(AMBIENT_FILE)) {
        audio ||= Object.assign(new Audio(asset(AMBIENT_FILE)), { loop: true, volume: 0.35 })
        await audio.play()
        return
      }
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)()
        master = ctx.createGain()
        master.gain.value = 0
        master.connect(ctx.destination)
        buildWind()
        window.addEventListener('scroll', onScroll, { passive: true })
      }
      await ctx.resume()
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(VOLUME, ctx.currentTime, 0.6)
    },

    stop() {
      if (audio) audio.pause()
      if (ctx && master) {
        master.gain.cancelScheduledValues(ctx.currentTime)
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.3)
        setTimeout(() => ctx?.state === 'running' && master.gain.value < 0.01 && ctx.suspend(), 1500)
      }
    },

    dispose() {
      window.removeEventListener('scroll', onScroll)
      audio?.pause()
      ctx?.close()
      ctx = null
      master = null
      audio = null
    },
  }
}
