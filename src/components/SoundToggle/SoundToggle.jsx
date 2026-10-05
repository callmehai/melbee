import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeOff } from 'lucide-react'
import { createAmbientSound } from '../../lib/ambientSound.js'
import './SoundToggle.css'

/** Nút bật/tắt âm thanh núi rừng. Mặc định TẮT — không bao giờ tự phát tiếng. */
export default function SoundToggle() {
  const [on, setOn] = useState(false)
  const sound = useRef(null)

  useEffect(() => () => sound.current?.dispose(), [])

  const toggle = async () => {
    sound.current ||= createAmbientSound()
    if (on) {
      sound.current.stop()
      setOn(false)
      return
    }
    try {
      await sound.current.start()
      setOn(true)
    } catch {
      setOn(false)
    }
  }

  return (
    <button
      type="button"
      className={`sound-toggle${on ? ' is-on' : ''}`}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Tắt âm thanh núi rừng' : 'Bật âm thanh núi rừng'}
      data-cursor="cta"
    >
      {on ? <Volume2 size={16} aria-hidden="true" /> : <VolumeOff size={16} aria-hidden="true" />}
      <span className="sound-toggle__label">{on ? 'Âm thanh: bật' : 'Âm thanh: tắt'}</span>
      {on && (
        <span className="sound-toggle__bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
    </button>
  )
}
