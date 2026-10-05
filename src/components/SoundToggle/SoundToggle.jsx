import { useEffect, useState } from 'react'
import { Volume2, VolumeOff } from 'lucide-react'
import { audioManager } from '../../audio/AudioManager.js'
import './SoundToggle.css'

const LABEL = {
  off: 'Tắt',
  loading: 'Đang tải',
  on: 'Bật',
  error: 'Lỗi',
}

/**
 * Nút âm thanh núi rừng. Mặc định TẮT — trang không bao giờ tự phát tiếng;
 * chỉ khi người xem bấm mới tải và bật âm thanh.
 */
export default function SoundToggle() {
  const [status, setStatus] = useState(audioManager.status)
  useEffect(() => audioManager.subscribe(setStatus), [])
  useEffect(() => () => audioManager.dispose(), [])

  const on = status === 'on' || status === 'loading'
  const hint = on ? 'Tắt âm thanh núi rừng' : status === 'error' ? 'Không tải được âm thanh — bấm để thử lại' : 'Bật âm thanh núi rừng (tiếng rừng, gió, suối rất nhẹ)'

  return (
    <button
      type="button"
      className={`sound-toggle is-${status}`}
      onClick={() => audioManager.toggle()}
      aria-pressed={on}
      aria-label={hint}
      title={hint}
      data-cursor="cta"
    >
      {on ? <Volume2 size={15} aria-hidden="true" /> : <VolumeOff size={15} aria-hidden="true" />}
      <span className="sound-toggle__label" aria-hidden="true">
        Âm thanh <i>·</i> {LABEL[status]}
      </span>
      {status === 'on' && (
        <span className="sound-toggle__bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
    </button>
  )
}
