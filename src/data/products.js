/**
 * SẢN PHẨM — thêm một sản phẩm = thêm một object vào mảng.
 *
 * image: đường dẫn tính từ public/, ví dụ 'assets/images/products/honey-01.jpg'.
 *        CHỈ sản phẩm đã có file ảnh thật mới hiện trên trang — chép ảnh vào là sản phẩm tự hiện.
 * price, size: bỏ trống khi chưa có thông tin → thẻ không hiện dòng đó.
 * featured: nhãn "Nổi bật" — chỉ nên bật cho 1 sản phẩm (nhãn chỉ hiện khi trang có từ 2 sản phẩm).
 * tone:  màu mật cho hình minh hoạ: 'light' | 'amber' | 'dark' | 'comb'
 *
 * ⚠️ Đây là DỮ LIỆU MẪU — hãy thay tên, mô tả, quy cách, giá bằng thông tin thật.
 *    GIÁ HIỆN TẠI LÀ GIÁ TẠM để duyệt giao diện, chưa phải giá bán.
 *    Không viết công dụng chữa bệnh/tăng miễn dịch nếu không có căn cứ.
 */
export const products = [
  {
    id: 'honey-01',
    // sản phẩm thật — ảnh và tên theo trang Facebook MelBee
    name: 'Mật ong Tây Bắc',
    subtitle: 'Khoái rừng · Hang đá · Hoa ban · Hoa nhãn',
    description:
      '4 loại mật MelBee chọn lựa từ các trang trại ong vùng cao Tây Bắc, 100% mật ong nguyên chất, đóng trong hũ thuỷ tinh lục giác mang nhãn MelBee.',
    origin: 'Các trang trại ong vùng cao Tây Bắc.',
    flavor: ['Khoái rừng', 'Hang đá', 'Hoa ban', 'Hoa nhãn'],
    usage: ['Mỗi ngày 15g – 30g, pha cùng nước ấm', 'Dùng trực tiếp, pha trà, cà phê', 'Không dùng cho trẻ dưới 1 tuổi'],
    // trang thông tin đầy đủ (đích của mã QR trên hộp quà) — xem src/data/catalog.js
    detailsHref: 'san-pham/',
    image: 'assets/images/products/honey-01.jpg',
    tone: 'amber',
    price: '280.000 ₫', // giá tạm
    size: '280 · 380 · 500 · 730ml',
    featured: true,
    facebookMessage: true,
    zaloMessage: true,
  },
  {
    id: 'honey-02',
    name: 'Mật ong hoa ban',
    subtitle: 'Dấu ấn mùa xuân vùng cao',
    description:
      'Chắt lọc từ những vạt hoa ban trắng nở rộ khắp núi rừng Tây Bắc vào mùa xuân. Mật màu vàng sáng, vị ngọt thanh mát, hương thơm thảo mộc dịu nhẹ.',
    origin: 'Núi rừng Tây Bắc.',
    flavor: ['Vàng sáng', 'Ngọt thanh mát', 'Hương thảo mộc dịu'],
    usage: ['Pha nước ấm hoặc nước mát', 'Dùng cùng trà xanh, trà hoa'],
    detailsHref: 'san-pham/hoa-ban/',
    image: 'assets/images/products/honey-02.jpg',
    tone: 'light',
    price: '320.000 ₫', // giá tạm
    size: '500ml',
    featured: false,
    facebookMessage: true,
    zaloMessage: true,
  },
  {
    id: 'honey-03',
    name: 'Mật ong nguyên sáp',
    subtitle: 'Nguyên bản như khi rời tổ',
    description:
      'Bánh sáp ong còn nguyên mật bên trong, giữ trọn cấu trúc tổ tự nhiên. Có thể ăn cả sáp, cảm nhận rõ kết cấu và hương vị nguyên bản.',
    origin: 'Vùng núi Tây Bắc (thông tin chi tiết đang cập nhật).',
    flavor: ['Kết cấu sáp giòn mềm', 'Ngọt tự nhiên', 'Hương sáp ong'],
    usage: ['Ăn trực tiếp', 'Dùng cùng phô mai, bánh mì', 'Làm quà tặng'],
    image: 'assets/images/products/honey-03.jpg',
    tone: 'comb',
    price: '350.000 ₫', // giá tạm
    size: 'Hộp 300g',
    featured: false,
    facebookMessage: true,
    zaloMessage: true,
  },
  {
    id: 'gift-01',
    name: 'Hộp quà Tây Bắc',
    subtitle: 'Một chút núi rừng để trao tặng',
    description:
      'Bộ quà gồm các loại mật được tuyển chọn, đóng hộp chỉn chu — dành cho dịp lễ, Tết hoặc gửi tặng người thân.',
    origin: 'Tuỳ chọn theo mùa (thông tin chi tiết đang cập nhật).',
    flavor: ['Nhiều hương vị', 'Đóng gói quà tặng'],
    usage: ['Quà biếu dịp lễ, Tết', 'Quà doanh nghiệp'],
    image: 'assets/images/products/gift-01.jpg',
    tone: 'dark',
    price: '690.000 ₫', // giá tạm
    size: 'Hộp 2–3 hũ',
    featured: false,
    facebookMessage: true,
    zaloMessage: true,
  },
]
