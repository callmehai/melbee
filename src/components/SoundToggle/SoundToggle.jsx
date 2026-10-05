import { useEffect, useState } from 'react'
import { Volume2, VolumeOff } from 'lucide-react'
import { audioManager } from '../../audio/AudioManager.js'
import './SoundToggle.css'

const LABEL = {
  off: 'Tắt',
  pending: 'Bật',
  loading: 'Đang tải',
  on: 'Bật',
  error: 'Lỗi',
}

/**
 * Nút nhạc nền. Mặc định BẬT: nhạc phát ở lần bấm/chạm đầu tiên trên trang
 * (trình duyệt không cho phát tiếng trước khi người xem tương tác). Bấm nút → tắt, và nhớ cho lần sau.
 */
export default function SoundToggle() {
  const [status, setStatus] = useState(audioManager.status)
  useEffect(() => audioManager.subscribe(setStatus), [])
  useEffect(() => {
    audioManager.autoStart()
    return () => audioManager.dispose()
  }, [])

  const on = status === 'on' || status === 'loading' || status === 'pending'
  const hint =
    status === 'pending'
      ? 'Nhạc nền sẽ phát khi bạn chạm vào trang — bấm để tắt'
      : on
        ? 'Tắt nhạc nền'
        : status === 'error'
          ? 'Không tải được âm thanh — bấm để thử lại'
          : 'Bật nhạc nền'

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
