/**
 * Kích thước (cm) + chỗ đặt lọ + ô khoét trên khay carton của từng hộp quà, theo bản vẽ bên thiết kế gửi.
 * Toạ độ nhìn từ trên xuống: x sang phải, z về phía trước (vạt logo của nắp ở phía +z).
 * holes: [x0, z0, x1, z1] — ô đặt lọ + khe dài phía trước để nhấc khay.
 * Khoá trùng id hộp trong src/data/catalog.js (giftBoxes).
 */
export const LAYOUTS = {
  // từ file in "Set 2 lọ 380ml"
  'hop-2': {
    W: 22,
    D: 15,
    H: 10,
    jars: [
      { x: -4.9, z: -1.3, size: '380ml' },
      { x: 4.9, z: -1.3, size: '380ml' },
    ],
    holes: [
      [-9.4, -6.7, -0.4, 4.1],
      [0.4, -6.7, 9.4, 4.1],
      [-7.8, 4.9, 7.8, 6.6],
    ],
  },
  // ô giữa to hơn (lọ 380ml), hai bên lọ 280ml
  'hop-3': {
    W: 27.5,
    D: 25,
    H: 10,
    jars: [
      { x: -9.1, z: -1.5, size: '280ml' },
      { x: 0, z: -1.5, size: '380ml' },
      { x: 9.1, z: -1.5, size: '280ml' },
    ],
    holes: [
      [-12.8, -6, -5.4, 3],
      [-4.6, -6.5, 4.6, 3.5],
      [5.4, -6, 12.8, 3],
      [-6.5, 7, 6.5, 8.6],
    ],
  },
  // 4 lọ 280ml xếp 2 × 2
  'hop-4': {
    W: 25,
    D: 25,
    H: 9,
    jars: [
      { x: -6.1, z: -7.1, size: '280ml' },
      { x: 6.1, z: -7.1, size: '280ml' },
      { x: -6.1, z: 2.9, size: '280ml' },
      { x: 6.1, z: 2.9, size: '280ml' },
    ],
    holes: [
      [-11.2, -11.6, -1, -2.6],
      [1, -11.6, 11.2, -2.6],
      [-11.2, -1.6, -1, 7.4],
      [1, -1.6, 11.2, 7.4],
      [-8, 9.2, 8, 10.8],
    ],
  },
}
