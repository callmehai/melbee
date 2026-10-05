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
 *    Không viết công dụng chữa bệnh/tăng miễn dịch nếu không có căn cứ.
 */
export const products = [
  {
    id: 'honey-01',
    // sản phẩm thật — ảnh và tên theo trang Facebook MelBee
    name: 'Mật ong Tây Bắc',
    subtitle: 'Mật ngọt từ hoa · Tinh hoa từ rừng',
    description:
      'Mật ong từ những mùa hoa nơi núi rừng Điện Biên, đóng trong hũ thuỷ tinh lục giác mang nhãn MelBee. Thông tin chi tiết về quy cách và giá sẽ được cập nhật khi sản phẩm ra mắt.',
    origin: 'Vùng núi Điện Biên, Tây Bắc.',
    flavor: ['Hương hoa rừng', 'Ngọt đậm', 'Hậu vị dịu'],
    usage: ['Pha cùng nước ấm', 'Dùng cùng trà', 'Rưới lên bánh, sữa chua'],
    image: 'assets/images/products/honey-01.jpg',
    tone: 'amber',
    featured: true,
    facebookMessage: true,
    zaloMessage: true,
  },
  {
    id: 'honey-02',
    name: 'Mật ong hoa ban',
    subtitle: 'Dấu ấn mùa xuân vùng cao',
    description:
      'Gắn với mùa hoa ban trắng nở khắp núi rừng Tây Bắc. Màu mật sáng, hương thanh, vị ngọt nhẹ — hợp với những ai thích vị dịu.',
    origin: 'Vùng núi Tây Bắc (thông tin chi tiết đang cập nhật).',
    flavor: ['Hương thanh', 'Ngọt nhẹ', 'Màu vàng sáng'],
    usage: ['Pha nước ấm buổi sáng', 'Dùng cùng chanh, gừng', 'Làm sốt trộn salad'],
    image: 'assets/images/products/honey-02.jpg',
    tone: 'light',
    price: 'Liên hệ',
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
    price: 'Liên hệ',
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
    price: 'Liên hệ',
    size: 'Hộp 2–3 hũ',
    featured: false,
    facebookMessage: true,
    zaloMessage: true,
  },
]
