/**
 * THÔNG TIN SẢN PHẨM IN TRÊN BAO BÌ — trang /san-pham/ (mã QR trên hộp quà trỏ tới đây)
 * và trang chi tiết /san-pham/<id>/ của từng loại.
 * Nguồn: "DỰ ÁN MELBEE – Nội dung nhãn in hũ mật ong".
 *
 * ⚠️ Mã QR in lên hộp → KHÔNG đổi đường dẫn /san-pham/ và các id (khoai-rung…) bên dưới:
 *    id là tên thư mục trang chi tiết (san-pham/<id>/index.html). Chữ thì sửa thoải mái.
 *
 * image: ảnh lọ, tính từ public/. Chưa có file → khung "Ảnh sắp ra mắt"; chép ảnh đúng tên vào là tự hiện
 *        (ảnh dọc 4:5, rộng ~1200px, nền sáng, thấy rõ nhãn).
 * prices: GIÁ BÁN từng quy cách đang bán (số, đồng) — theo bảng giá bán MelBee gửi 10/2026.
 *   Quy cách nào không có trong đây thì web không bán (không hiện nút chọn).
 *   ⚠️ Chỉ ghi giá bán. Giá nhập là số nội bộ, KHÔNG đưa vào code (repo + web đều công khai).
 * group, short, taste: nhóm mật, tên ngắn, một dòng vị — cho thẻ ở trang Sản phẩm.
 *
 * highlights: viết mềm lại từ mục "Công dụng" trên nhãn — web là quảng cáo, thực phẩm thường
 *   không được nói công dụng phòng/chữa bệnh (miễn dịch, kháng khuẩn, tim mạch, giải độc gan…).
 * color: màu mật (vòng màu cạnh tên) — chưa có ảnh riêng từng loại.
 */

/** Các quy cách đang bán của một sản phẩm, theo thứ tự trong bảng giá (nhỏ → lớn). */
export const sizesOf = (item) => Object.keys(item.prices || {})

/**
 * HỘP QUÀ — trang /hop-qua/ và phần Hộp quà ở trang chủ.
 * slots: quy cách từng ô của khay carton bế sẵn trong hộp (hộp 3 lọ: ô giữa to hơn → lọ 380ml).
 * preset + price: set trong bảng giá (Set 2 · Set 3 · Set 4) và giá set cố định của nó.
 * Khách đổi loại mật từng ô → giá = tổng giá các lọ + giftBoxFee (hộp cứng + túi giấy), quy tắc trong bảng giá.
 * Set nào có giá thấp hơn cách tính đó thì web hiện "tiết kiệm … so với mua lẻ" (hiện cả ba set đều bằng giá chọn lẻ).
 * Ảnh: bản dựng của bên thiết kế (đã cắt bỏ ghi chú số lượng sản xuất). Hộp 3D xoay được: src/pages/giftbox3d (layouts.js).
 */
export const giftBoxFee = 100000

export const giftBoxes = [
  {
    id: 'hop-2',
    name: 'Hộp 2 lọ',
    set: 'Set 2',
    size: '22 × 15 × 10 cm',
    slots: ['380ml', '380ml'],
    preset: ['khoai-rung', 'hoa-ban'],
    price: 465000,
    photo: 'assets/images/gift/hop-2-lo.jpg',
    photoOpen: 'assets/images/gift/hop-2-lo-mo.jpg',
  },
  {
    id: 'hop-3',
    name: 'Hộp 3 lọ',
    set: 'Set 3',
    size: '27,5 × 25 × 10 cm',
    slots: ['280ml', '380ml', '280ml'],
    preset: ['hoa-ban', 'hang-da', 'hoa-nhan'],
    price: 565000,
    photo: 'assets/images/gift/hop-3-lo.jpg',
    photoOpen: 'assets/images/gift/hop-3-lo-mo.jpg',
  },
  {
    id: 'hop-4',
    name: 'Hộp 4 lọ',
    set: 'Set 4',
    size: '25 × 25 × 9 cm',
    slots: ['280ml', '280ml', '280ml', '280ml'],
    // bốn loại mật khác nhau — cộng lẻ đúng bằng giá set 650.000 ₫
    preset: ['hang-da', 'hoa-ban', 'khoai-rung', 'hoa-nhan'],
    price: 650000,
    photo: 'assets/images/gift/hop-4-lo.jpg',
    photoOpen: 'assets/images/gift/hop-4-lo-mo.jpg',
  },
]

/** Phần chung của mọi hộp quà */
export const giftSet = {
  description:
    'Hộp cứng màu nâu trầm, chữ MELBEE nhũ vàng cùng hoạ tiết hoa và ong, thành hộp vân tổ ong. Bên trong lót vàng mật, khay định hình giữ chắc từng lọ; mở nắp là lời gửi từ núi rừng Tây Bắc. Đi kèm túi giấy MELBEE đồng bộ.',
  bag: 'assets/images/gift/tui-giay.jpg',
  designFront: 'assets/images/gift/hop-mat-truoc.jpg',
  designInside: 'assets/images/gift/hop-mat-trong.jpg',
}

/** Lời nhắn in ở mặt trong nắp hộp set quà */
export const giftMessage = [
  'Mật ong Tây Bắc là món quà vô giá được thiên nhiên ban tặng cho đại ngàn Việt Nam. Chắt lọc từ vô vàn loài hoa, mỗi giọt mật đều mang trọn hương vị thuần khiết, ngọt lành.',
  'Mỗi giọt mật trong bộ quà tặng được MELBEE cẩn trọng chọn lựa từ các trang trại ong tại vùng cao Tây Bắc. Bằng sự hợp tác tận tâm cùng người dân địa phương kết hợp với quy trình kiểm soát chất lượng và bảo quản hiện đại, MELBEE trân trọng gửi trao đến bạn sự tinh túy, nguyên bản và trọn vẹn nhất từ thiên nhiên.',
]

export const honeys = [
  {
    id: 'khoai-rung',
    short: 'Khoái rừng',
    group: 'Mật rừng',
    taste: 'Hương nồng hoang dã, ngọt đậm',
    image: 'assets/images/products/khoai-rung.jpg',
    prices: { '280ml': 130000, '380ml': 155000 },
    name: 'Mật ong Khoái rừng Tây Bắc',
    nameEn: 'Pure Wild Apis Dorsata Honey',
    description:
      'Thu hoạch từ tổ ong khoái tự nhiên đóng trên các cành cây cao nơi đại ngàn Tây Bắc. Mật mang hương thơm nồng nàn hoang dã, vị ngọt đậm đà đặc trưng.',
    traits: ['Hương nồng hoang dã', 'Ngọt đậm đà', 'Ong khoái tự nhiên'],
    highlights: [
      'Mật rừng nguyên bản từ tổ ong khoái tự nhiên — loài ong làm tổ trên những cành cây cao và không thể nuôi.',
      'Một thìa mật pha nước ấm mỗi sáng — nguồn năng lượng tự nhiên cho ngày dài.',
      'Pha cùng nước ấm, chanh, gừng — thức uống ấm áp cho những ngày trở gió.',
    ],
    color: '#8a4f12',
  },
  {
    id: 'hang-da',
    short: 'Hang đá',
    group: 'Mật rừng',
    taste: 'Sánh đặc, hổ phách sẫm',
    image: 'assets/images/products/hang-da.jpg',
    prices: { '280ml': 145000, '380ml': 190000 },
    name: 'Mật ong Hang đá',
    nameEn: 'Wild Mountain Cave Honey',
    description:
      'Mật ong tự nhiên thu hoạch từ các tổ ong rừng trên vách đá và hang đá núi cao Tây Bắc. Mật sánh đặc, màu hổ phách sẫm, giàu khoáng chất tự nhiên.',
    traits: ['Sánh đặc', 'Hổ phách sẫm', 'Ong rừng vách đá'],
    highlights: [
      'Mật của ong rừng làm tổ trên vách đá, hang đá núi cao Tây Bắc.',
      'Món quà ý nghĩa dành tặng ông bà, cha mẹ.',
      'Mật đặc, vị đậm — trọn vị nhất khi thưởng thức trực tiếp từng thìa nhỏ.',
    ],
    color: '#6b3a10',
  },
  {
    id: 'hoa-ban',
    short: 'Hoa ban',
    group: 'Mật hoa',
    taste: 'Vàng sáng, ngọt thanh mát',
    image: 'assets/images/products/hoa-ban.jpg',
    prices: { '280ml': 155000, '380ml': 210000, '730ml': 400000 },
    name: 'Mật ong Hoa ban Tây Bắc',
    nameEn: 'Northwest Bauhinia Flower Honey',
    description:
      'Chắt lọc từ những vạt hoa ban trắng nở rộ khắp núi rừng Tây Bắc vào mùa xuân. Mật màu vàng sáng, vị ngọt thanh mát, hương thơm thảo mộc dịu nhẹ.',
    traits: ['Vàng sáng', 'Ngọt thanh mát', 'Hương thảo mộc dịu'],
    highlights: [
      'Vị thanh, dễ dùng — phù hợp với người mới làm quen với mật ong.',
      'Pha nước mát ngày hè hoặc dùng cùng trà xanh, trà hoa.',
      'Một cốc nước mật ong ấm trước giờ ngủ cho buổi tối thư thái.',
    ],
    color: '#d9a531',
  },
  {
    id: 'hoa-nhan',
    short: 'Hoa nhãn',
    group: 'Mật hoa',
    taste: 'Vàng óng, thơm hương nhãn',
    image: 'assets/images/products/hoa-nhan.jpg',
    prices: { '280ml': 120000, '500ml': 200000 },
    name: 'Mật ong Hoa nhãn',
    nameEn: 'Northwest Longan Flower Honey',
    description:
      'Thu hoạch từ những vùng nhãn cổ thụ tại Tây Bắc. Mật ong có màu vàng óng sóng sánh, hương thơm nồng nàn quyến rũ, vị ngọt đượm vị hoa nhãn.',
    traits: ['Vàng óng', 'Thơm hương nhãn', 'Ngọt đượm'],
    highlights: [
      'Hương hoa nhãn đặc trưng, vị ngọt dễ chịu — hợp khẩu vị cả gia đình.',
      'Bổ sung năng lượng tự nhiên cho những ngày bận rộn.',
      'Dùng pha trà, cà phê, làm bánh hay ướp các món nướng.',
    ],
    color: '#c27a1a',
  },
  {
    // ✏️ mô tả viết tạm từ tên sản phẩm trong bảng giá — chờ MelBee gửi nội dung nhãn
    id: 'banh-to-hoa-ban',
    short: 'Bánh tổ hoa ban',
    group: 'Bánh tổ',
    taste: 'Nguyên bánh tổ, ăn cả sáp',
    image: 'assets/images/products/banh-to-hoa-ban.jpg',
    prices: { 'Hộp 500g': 275000 },
    name: 'Mật ong bánh tổ hoa ban',
    nameEn: 'Bauhinia Honeycomb',
    description:
      'Bánh tổ ong còn nguyên mật trong từng ô sáp, thu từ mùa hoa ban Tây Bắc, đóng hộp 500g — giữ trọn vẻ nguyên bản như khi vừa rời tổ.',
    traits: ['Nguyên bánh tổ', 'Ăn được cả sáp', 'Mùa hoa ban'],
    highlights: [
      'Cắt miếng nhỏ, thưởng thức trực tiếp cả mật lẫn sáp để cảm nhận vị mật nguyên bản.',
      'Dùng kèm bánh mì, sữa chua, phô mai hay trái cây.',
      'Món quà mộc mạc, độc đáo cho người yêu mật ong nguyên tổ.',
    ],
    color: '#e3b54f',
    comb: true, // bánh tổ: không có lọ để ngâm nước ấm → ẩn mục "Mật bị kết tinh?"
    usage: [
      'Cắt miếng vừa ăn, dùng cả mật lẫn sáp; phần sáp còn lại có thể bỏ đi.',
      'Dùng kèm bánh mì, sữa chua, phô mai hoặc trái cây.',
    ],
  },
]

/** Phần dùng chung cho cả 4 loại — đúng như nhãn in */
export const commonInfo = {
  ingredients: '100% mật ong nguyên chất.',
  usage: [
    'Mỗi ngày dùng 15g – 30g, pha cùng nước ấm.',
    'Dùng trực tiếp, ngâm với thảo dược hoặc pha với trà, cà phê, nước giải khát…',
    'Dùng làm nguyên liệu chế biến thực phẩm.',
  ],
  crystallize:
    'Mật ong tự nhiên có thể bị kết tinh nhưng không làm giảm chất lượng sản phẩm. Hãy sử dụng bình thường hoặc ngâm lọ vào nước ấm 60°C cho đến khi tan ra.',
  storage: 'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp. KHÔNG bảo quản trong tủ lạnh.',
  warning: 'Không sử dụng cho trẻ em dưới 1 tuổi.',
  shelfLife: 'NSX in trên nhãn lọ · HSD 24 tháng kể từ NSX',
  origin: 'Việt Nam',
}

/** Đơn vị chịu trách nhiệm — như ghi ở đáy hộp */
export const company = {
  name: 'Công ty Cổ phần MelBee',
  nameEn: 'MELBEE JSC',
  address: 'Hoà Lạc, Thành phố Hà Nội',
  email: 'melbeetaybac@gmail.com',
  hotline: '0936321902',
  hotlineDisplay: '093 632 19 02',
}
