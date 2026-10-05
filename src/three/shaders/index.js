import { Color, LinearSRGBColorSpace } from 'three'
import NOISE from './noise.glsl?raw'
import SPACE from './space.glsl?raw'
import POLLEN_FRAG from './pollen.glsl?raw'
import DISTORTION from './distortion.glsl?raw'
import HONEY_FRAG from './honey.glsl?raw'

export { NOISE, SPACE, POLLEN_FRAG, DISTORTION, HONEY_FRAG }

/**
 * Màu dùng thẳng trong ShaderMaterial (shader tự viết không chuyển không gian màu),
 * nên giữ nguyên giá trị hex để màu hiện ra đúng như trong bảng màu thương hiệu.
 */
export const rawColor = (hex) => new Color().setHex(parseInt(hex.slice(1), 16), LinearSRGBColorSpace)
