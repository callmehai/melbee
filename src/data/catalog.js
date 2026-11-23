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
 * prices: GIÁ BÁN từng quy cách đang bán (số, đồng) — theo bảng giá sản phẩm MELBEE gửi 18/11/2026.
 *   null = có bán nhưng chưa có giá → web ghi "Giá đang cập nhật".
 * codes: mã sản phẩm từng quy cách, theo cùng bảng giá.
 *   Quy cách nào không có trong đây thì web không bán (không hiện nút chọn).
 *   ⚠️ Chỉ ghi giá bán. Giá nhập là số nội bộ, KHÔNG đưa vào code (repo + web đều công khai).
 * group, short, taste: nhóm mật, tên ngắn, một dòng vị — cho thẻ ở trang Sản phẩm.
 *
 * highlights: viết mềm lại từ mục "Công dụng" trên nhãn — web là quảng cáo, thực phẩm thường
 *   không được nói công dụng phòng/chữa bệnh (miễn dịch, kháng khuẩn, tim mạch, giải độc gan…).
 * color: màu mật (vòng màu cạnh tên) — chưa có ảnh riêng từng loại.
 * label: màu nhãn in trên lọ { bg, ink } — theo ảnh lọ thật.
 * jar: cho lọ trong hộp quà 3D — label: khung nhãn [x0, y0, x1, y1] (px) trong ảnh `image`, từ góc trái tới góc
 *   phải của lọ lục giác (3D cắt đúng nhãn thật này dán lên 3 mặt trước); honey: màu mật nhìn qua thuỷ tinh.
 *   Đổi ảnh lọ thì đo lại khung nhãn.
 */

/** Các quy cách đang bán của một sản phẩm, theo thứ tự trong bảng giá (nhỏ → lớn). */
export const sizesOf = (item) => Object.keys(item.prices || {})

/**
 * HỘP QUÀ — trang /hop-qua/ và phần Hộp quà ở trang chủ.
 * slots: quy cách từng ô của khay carton bế sẵn trong hộp (hộp 3 lọ: ô giữa to hơn → lọ 380ml).
 * preset + price: set trong bảng giá (Set 2 · Set 3 · Set 4) — loại mật và giá cố định, khách không đổi mật từng lọ.
 * title, code: tên và mã set theo bảng giá 18/11/2026.
 * Giá set đã gồm hộp cứng + túi giấy.
 * Ảnh: bản dựng của bên thiết kế (đã cắt bỏ ghi chú số lượng sản xuất); photoSet: ảnh minh hoạ cả set (chưa có thì bỏ trống). Hộp 3D xoay được: src/pages/giftbox3d (layouts.js).
 */

export const giftBoxes = [
  {
    id: 'hop-2',
    name: 'Hộp 2 lọ',
    set: 'Set 2',
    title: 'Hương hoa Tây Bắc',
    code: 'MB-GB2-022',
    size: '22 × 15 × 10 cm',
    slots: ['380ml', '380ml'],
    // 1 hoa rừng + 1 hoa ban 380ml
    preset: ['hoa-rung', 'hoa-ban'],
    price: 569000,
    photo: 'assets/images/gift/hop-2-lo.jpg',
    photoSet: 'assets/images/gift/set-2.jpg',
  },
  {
    id: 'hop-3',
    name: 'Hộp 3 lọ',
    set: 'Set 3',
    title: 'Tam Hoa',
    code: 'MB-GB3-023',
    size: '27,5 × 25 × 10 cm',
    slots: ['280ml', '380ml', '280ml'],
    // 1 hoa ban 380ml + 1 hoa rừng 280ml + 1 hoa nhãn 280ml
    preset: ['hoa-rung', 'hoa-ban', 'hoa-nhan'],
    price: 619000,
    photo: 'assets/images/gift/hop-3-lo.jpg',
    photoSet: 'assets/images/gift/set-3.jpg',
  },
  {
    id: 'hop-4',
    name: 'Hộp 4 lọ',
    set: 'Set 4',
    title: 'Mật ngọt bốn mùa',
    code: 'MB-GB4-024',
    size: '25 × 25 × 9 cm',
    slots: ['280ml', '280ml', '280ml', '280ml'],
    // 1 nhãn + 1 ban + 1 rừng + 1 hang đá, đều 280ml
    preset: ['hoa-nhan', 'hoa-rung', 'hang-da', 'hoa-ban'],
    price: 819000,
    photo: 'assets/images/gift/hop-4-lo.jpg',
    photoSet: 'assets/images/gift/set-4.jpg',
  },
]

/** Phần chung của mọi hộp quà */
export const giftSet = {
  description:
    'Hộp cứng màu nâu trầm, chữ MELBEE nhũ vàng cùng hoạ tiết hoa và ong, thành hộp vân tổ ong. Bên trong lót vàng mật, khay định hình giữ chắc từng lọ; mở nắp là lời gửi từ núi rừng Tây Bắc. Đi kèm túi giấy MELBEE đồng bộ.',
  bag: 'assets/images/gift/tui-giay.jpg',
  designFront: 'assets/images/gift/hop-mat-truoc.jpg',
  designInside: 'assets/images/gift/hop-mat-trong.jpg',
  // cùng file in nhưng đã xoá chữ (vẽ lại lưới tổ ong) — trang Hộp quà đặt lời gửi lên bằng chữ thật
  designInsideBg: 'assets/images/gift/hop-mat-trong-nen.jpg',
  // bản dọc cho điện thoại: giữ cành hoa (trên), lá + hũ mật (dưới), kéo dài lưới tổ ong ở giữa
  designInsideTall: 'assets/images/gift/hop-mat-trong-doc.jpg',
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
    prices: { '280ml': 209000, '380ml': 289000, '500ml': 389000, '730ml': 549000 },
    codes: { '280ml': 'MB-KR-009', '380ml': 'MB-KR-010', '500ml': 'MB-KR-011', '730ml': 'MB-KR-012' },
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
    label: { bg: '#2f6b4c', ink: '#ecc977' },
    jar: { label: [291, 797, 813, 1252], honey: '#c97a08' },
  },
  {
    id: 'hang-da',
    short: 'Hang đá',
    group: 'Mật rừng',
    taste: 'Sánh đặc, hổ phách sẫm',
    image: 'assets/images/products/hang-da.jpg',
    prices: { '280ml': 269000, '380ml': 369000, '500ml': 479000, '730ml': 699000 },
    codes: { '280ml': 'MB-HD-013', '380ml': 'MB-HD-014', '500ml': 'MB-HD-015', '730ml': 'MB-HD-016' },
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
    label: { bg: '#3c4a4e', ink: '#e9d9ae' },
    jar: { label: [290, 753, 836, 1202], honey: '#cf7f06' },
  },
  {
    // ✏️ loại thứ 5 (có trong bảng giá 18/11/2026). Chưa có nội dung nhãn — mô tả viết tạm, có nhãn thì thay.
    id: 'hoa-rung',
    short: 'Hoa rừng',
    group: 'Mật rừng',
    taste: 'Đậm hương hoa núi, hổ phách',
    image: 'assets/images/products/hoa-rung.jpg',
    prices: { '280ml': 179000, '380ml': 249000, '500ml': 329000, '730ml': 479000 },
    codes: { '280ml': 'MB-HR-017', '380ml': 'MB-HR-018', '500ml': 'MB-HR-019', '730ml': 'MB-HR-020' },
    name: 'Mật ong Hoa rừng Tây Bắc',
    nameEn: 'Northwest Wild Flower Honey', // theo nhãn trong ảnh set 17/11
    description:
      'Ong lấy mật từ muôn loài hoa dại nở quanh năm trên núi rừng Tây Bắc. Mật màu hổ phách, vị ngọt đậm, hương hoa rừng hoà quyện và đổi chút theo từng mùa hoa.',
    traits: ['Hổ phách', 'Ngọt đậm', 'Trăm loài hoa dại'],
    highlights: [
      'Mật đa hoa từ núi rừng vùng cao — mỗi mùa thu hoạch mang một sắc hương riêng.',
      'Pha nước ấm cùng chanh, gừng hoặc dùng kèm trà nóng.',
      'Món quà đậm chất núi rừng cho người thân, bạn bè.',
    ],
    color: '#7a3f12',
    label: { bg: '#8f7ac9', ink: '#3b1630' },
    jar: { label: [348, 824, 792, 1166], honey: '#3d1d0c' },
  },
  {
    id: 'hoa-ban',
    short: 'Hoa ban',
    group: 'Mật hoa',
    taste: 'Vàng sáng, ngọt thanh mát',
    image: 'assets/images/products/hoa-ban.jpg',
    prices: { '280ml': 189000, '380ml': 259000, '500ml': 349000, '730ml': 489000 },
    codes: { '280ml': 'MB-HB-001', '380ml': 'MB-HB-002', '500ml': 'MB-HB-003', '730ml': 'MB-HB-004' },
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
    label: { bg: '#f3ecdc', ink: '#3a291d' },
    jar: { label: [323, 778, 805, 1183], honey: '#cc7206' },
  },
  {
    id: 'hoa-nhan',
    short: 'Hoa nhãn',
    group: 'Mật hoa',
    taste: 'Vàng óng, thơm hương nhãn',
    image: 'assets/images/products/hoa-nhan.jpg',
    prices: { '280ml': 149000, '380ml': 189000, '500ml': 269000, '730ml': 379000 },
    codes: { '280ml': 'MB-HN-005', '380ml': 'MB-HN-006', '500ml': 'MB-HN-007', '730ml': 'MB-HN-008' },
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
    label: { bg: '#f2e5b6', ink: '#3a291d' },
    jar: { label: [296, 788, 815, 1223], honey: '#cb7606' },
  },
  {
    // ✏️ mô tả viết tạm từ tên sản phẩm trong bảng giá — chờ MelBee gửi nội dung nhãn
    id: 'banh-to-hoa-ban',
    short: 'Bánh tổ hoa ban',
    group: 'Bánh tổ',
    taste: 'Nguyên bánh tổ, ăn cả sáp',
    image: 'assets/images/products/banh-to-hoa-ban.jpg',
    prices: { 'Hộp 500g': 319000 },
    codes: { 'Hộp 500g': 'MB-BT-021' },
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

/** Phần dùng chung cho các loại mật — đúng như nhãn in */
export const commonInfo = {
  ingredients: '100% mật ong nguyên chất.',
  usage: [
    'Mỗi ngày dùng 15g – 30g, pha cùng nước ấm.',
    'Dùng trực tiếp, ngâm với thảo dược hoặc pha với trà, cà phê, nước giải khát…',
    'Dùng làm nguyên liệu chế biến thực phẩm.',
  ],
  crystallize:
    'Mật ong tự nhiên có thể bị kết tinh nhưng không làm giảm chất lượng sản phẩm. Hãy sử dụng bình thường hoặc ngâm lọ vào nước ấm 60°C cho đến khi tan ra.',
  storage: 'Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp. Không bảo quản trong tủ lạnh.',
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
