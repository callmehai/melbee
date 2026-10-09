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
 * prices: giá theo dung tích, vd { '380ml': '250.000 ₫' }. Dung tích chưa có giá → hiện "Liên hệ".
 * group, short, taste: nhóm mật, tên ngắn, một dòng vị — cho thẻ ở trang Sản phẩm.
 *
 * highlights: viết mềm lại từ mục "Công dụng" trên nhãn — web là quảng cáo, thực phẩm thường
 *   không được nói công dụng phòng/chữa bệnh (miễn dịch, kháng khuẩn, tim mạch, giải độc gan…).
 * color: màu mật (vòng màu cạnh tên) — chưa có ảnh riêng từng loại.
 */

export const sizes = ['280ml', '380ml', '500ml', '730ml']

/** Set quà — trang /hop-qua/. Ảnh là bản thiết kế hộp (từ file in), chưa phải ảnh chụp. */
export const giftSet = {
  name: 'Set quà 2 lọ 380ml',
  description:
    'Hai lọ mật ong MelBee 380ml trong hộp cứng màu nâu trầm, chữ MELBEE nhũ vàng cùng hoa và ong vẽ nét. Mở nắp là lời gửi từ núi rừng Tây Bắc, in trên nền vàng mật hoạ tiết tổ ong.',
  contents: ['2 lọ mật ong MelBee 380ml', 'Hộp cứng in nhũ vàng', 'Lời gửi in ở mặt trong nắp hộp'],
  price: null, // vd '520.000 ₫' — null → "Liên hệ"
  photo: 'assets/images/gift/set-2-lo-380ml.jpg', // ảnh chụp thật — chưa có thì dùng ảnh thiết kế bên dưới
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
    prices: {},
    name: 'Mật ong Khoái rừng Tây Bắc',
    nameEn: 'Pure Wild Apis Dorsata Honey',
    description:
      'Thu hoạch từ tổ ong khoái tự nhiên đóng trên các cành cây cao nơi đại ngàn Tây Bắc. Mật mang hương thơm nồng nàn hoang dã, vị ngọt đậm đà đặc trưng.',
    traits: ['Hương nồng hoang dã', 'Ngọt đậm đà', 'Ong khoái tự nhiên'],
    highlights: [
      'Mật rừng nguyên bản từ tổ ong khoái tự nhiên — loài ong làm tổ trên cây cao, không nuôi được.',
      'Nguồn năng lượng tự nhiên cho ngày dài: một thìa pha nước ấm buổi sáng.',
      'Pha cùng nước ấm, chanh, gừng — thức uống ấm áp những ngày trở gió.',
    ],
    color: '#8a4f12',
  },
  {
    id: 'hang-da',
    short: 'Hang đá',
    group: 'Mật rừng',
    taste: 'Sánh đặc, hổ phách sẫm',
    image: 'assets/images/products/hang-da.jpg',
    prices: {},
    name: 'Mật ong Hang đá',
    nameEn: 'Wild Mountain Cave Honey',
    description:
      'Mật ong tự nhiên thu hoạch từ các tổ ong rừng trên vách đá và hang đá núi cao Tây Bắc. Mật sánh đặc, màu hổ phách sẫm, giàu khoáng chất tự nhiên.',
    traits: ['Sánh đặc', 'Hổ phách sẫm', 'Ong rừng vách đá'],
    highlights: [
      'Mật của ong rừng làm tổ trên vách đá, hang đá núi cao Tây Bắc.',
      'Món quà bồi bổ ý nghĩa dành tặng ông bà, cha mẹ.',
      'Mật đặc, vị đậm — ngon nhất khi dùng trực tiếp một thìa nhỏ.',
    ],
    color: '#6b3a10',
  },
  {
    id: 'hoa-ban',
    short: 'Hoa ban',
    group: 'Mật hoa',
    taste: 'Vàng sáng, ngọt thanh mát',
    image: 'assets/images/products/hoa-ban.jpg',
    prices: {},
    name: 'Mật ong Hoa ban Tây Bắc',
    nameEn: 'Northwest Bauhinia Flower Honey',
    description:
      'Chắt lọc từ những vạt hoa ban trắng nở rộ khắp núi rừng Tây Bắc vào mùa xuân. Mật màu vàng sáng, vị ngọt thanh mát, hương thơm thảo mộc dịu nhẹ.',
    traits: ['Vàng sáng', 'Ngọt thanh mát', 'Hương thảo mộc dịu'],
    highlights: [
      'Vị thanh, dễ uống — hợp với người mới làm quen với mật ong.',
      'Pha nước mát ngày hè hoặc cùng trà xanh, trà hoa.',
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
    prices: {},
    name: 'Mật ong Hoa nhãn',
    nameEn: 'Northwest Longan Flower Honey',
    description:
      'Thu hoạch từ những vùng nhãn cổ thụ tại Tây Bắc. Mật ong có màu vàng óng sóng sánh, hương thơm nồng nàn quyến rũ, vị ngọt đượm vị hoa nhãn.',
    traits: ['Vàng óng', 'Thơm hương nhãn', 'Ngọt đượm'],
    highlights: [
      'Hương hoa nhãn đặc trưng, ngọt dễ chịu — hợp khẩu vị cả nhà.',
      'Bổ sung năng lượng tự nhiên cho những ngày bận rộn.',
      'Pha trà, cà phê, làm bánh hay ướp món nướng đều ngon.',
    ],
    color: '#c27a1a',
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
