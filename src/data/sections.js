/**
 * NỘI DUNG CÁC PHẦN CỦA TRANG — sửa chữ, ảnh ở đây, không cần đụng vào component.
 * Câu chữ lấy từ các bài viết trên trang Facebook MelBee (facebook.com/melbeetaybac).
 *
 * image: đường dẫn tính từ public/ (vd 'assets/images/hero/hero.jpg').
 *        Chưa có file → tự hiện hình minh hoạ theo `art`.
 * art:   hình minh hoạ dự phòng: landscape | landscape-dusk | honeycomb | dipper | blossom | bee |
 *        hive | frame | drip | jar | tea | water | food | gift | map
 *
 * Phần nào còn nội dung giữ chỗ thì tự ẩn, có nội dung thật là tự hiện lại:
 *   - Sản phẩm: chỉ hiện sản phẩm đã có ảnh thật (src/data/products.js)
 *   - Thưởng thức (lifestyle), Hình ảnh (gallery): hiện khi đủ ảnh thật
 *   - Khách hàng: hiện khi có chia sẻ thật (bỏ `sample: true` trong src/data/testimonials.js)
 */

export const nav = [
  { label: 'Trang chủ', href: '#trang-chu' },
  { label: 'Nguồn gốc', href: '#nguon-goc' },
  { label: 'Câu chuyện', href: '#cau-chuyen' },
  { label: 'Quy trình', href: '#quy-trinh' },
  { label: 'Sản phẩm', href: '#san-pham' },
  { label: 'Hộp quà', href: '#hop-qua' },
  { label: 'Liên hệ', href: '#lien-he' },
]

export const hero = {
  eyebrow: 'MelBee · Mùa hoa vùng cao',
  title: 'Mật Ong Tây Bắc',
  tagline: 'Mật ngọt từ hoa, tinh hoa từ rừng.',
  subtext: 'Mang mật ong từ vùng núi Điện Biên đến gần hơn với bạn — rõ ràng, chỉn chu và đáng tin cậy.',
  primaryCta: { label: 'Khám phá sản phẩm', href: '#san-pham' },
  secondaryCta: { label: 'Câu chuyện của chúng tôi', href: '#cau-chuyen' },
  image: 'assets/images/hero/hero.jpg',
  // Video nền (tuỳ chọn) — chỉ tải sau khi trang đã hiện xong
  video: 'assets/videos/hero.mp4',
  art: 'landscape',
}

export const intro = {
  title: ['Một giọt mật', 'mang theo cả mùa hoa'],
  paragraphs: [
    'Mật ong không chỉ là vị ngọt.',
    'Đó là dấu vết của những mùa hoa, của núi rừng, của người nuôi ong và của hành trình từ những vùng đất tự nhiên đến từng giọt mật.',
    'Mỗi sản phẩm được giới thiệu với mong muốn giữ lại sự nguyên bản và câu chuyện phía sau nó.',
  ],
  // khung này mặc định là miếng bánh tổ 3D lắc được; ảnh / tranh dưới đây chỉ hiện khi máy không có WebGL
  image: 'assets/images/story/intro-macro.jpg',
  imageAlt: 'Miếng bánh tổ đầy mật, mật chảy thành sợi rồi nhỏ giọt',
  art: 'honeycomb',
}

export const productsSection = {
  eyebrow: 'Sản phẩm',
  title: 'Khám phá những giọt mật từ Tây Bắc',
  subtitle:
    'Những sản phẩm được tuyển chọn từ nguồn nguyên liệu tự nhiên và chăm chút trong từng công đoạn.',
  note: 'Đặt hàng bằng cách nhắn tin — chúng tôi sẽ tư vấn và xác nhận trực tiếp.',
}

export const story = {
  title: 'Câu chuyện của chúng tôi',
  paragraphs: [
    'Giữa rất nhiều sản phẩm mật ong, điều người dùng cần không chỉ là một lời khẳng định “nguyên chất”, mà là sự an tâm về nguồn gốc và hành trình tạo nên sản phẩm.',
    'MelBee được hình thành từ mong muốn mang mật ong từ vùng núi Điện Biên đến gần hơn với người tiêu dùng — giữ lại vị ngọt tự nhiên và cả câu chuyện về vùng đất, người nuôi ong phía sau mỗi giọt mật.',
    'Không dừng ở một sản phẩm dùng hằng ngày, MelBee muốn mật ong trở thành một món quà gần gũi, mang nét riêng của núi rừng Tây Bắc.',
  ],
  image: 'assets/images/story/story.jpg',
  imageAlt: 'Người nuôi ong bên đàn ong giữa núi rừng Tây Bắc',
  art: 'landscape',
}

export const origin = {
  eyebrow: 'Nguồn gốc',
  title: 'Nơi những giọt mật bắt đầu',
  lead: ['Không chỉ là nơi có mật ong.', 'Đó là vùng đất có câu chuyện để kể.'],
  text: 'Tây Bắc sở hữu hệ thực vật phong phú cùng nhiều mùa hoa đặc trưng — nền tảng tạo nên những dòng mật mang hương vị riêng, gắn với từng vùng nguyên liệu và từng thời điểm trong năm.',
  image: 'assets/images/origin/beekeeping.jpg',
  imageAlt: 'Cầu ong đầy mật trên tay người nuôi ong',
  art: 'hive',
  highlights: [
    { icon: 'mountain', title: 'Núi', text: 'Những dãy núi cao, sương phủ quanh năm.' },
    { icon: 'leaf', title: 'Rừng', text: 'Thảm rừng tự nhiên là nhà của đàn ong.' },
    { icon: 'flower', title: 'Hoa', text: 'Hoa dại nở nối tiếp nhau theo mùa.' },
    { icon: 'heart-handshake', title: 'Con người', text: 'Người nuôi ong gắn bó với núi rừng.' },
  ],
}

export const process = {
  eyebrow: 'Quy trình',
  title: ['Từ mùa hoa', 'đến từng giọt mật'],
  steps: [
    {
      title: 'Mùa hoa',
      text: 'Mỗi mùa hoa nở là một mùa mật mới. Hương vị của mật phụ thuộc vào loài hoa và thời điểm trong năm.',
      image: 'assets/images/process/01-mua-hoa.jpg',
      art: 'blossom',
    },
    {
      title: 'Đàn ong',
      text: 'Đàn ong được nuôi gần vùng hoa, tự do tìm mật trong không gian tự nhiên.',
      image: 'assets/images/process/02-dan-ong.jpg',
      art: 'bee',
    },
    {
      title: 'Thu mật',
      text: 'Mật được thu khi đủ độ chín trong tổ, từ những cầu ong đã được ong vít nắp sáp.',
      image: 'assets/images/process/03-thu-mat.jpg',
      art: 'frame',
    },
    {
      title: 'Lọc và bảo quản',
      text: 'Mật được lọc để loại bỏ tạp chất và bảo quản trong điều kiện phù hợp.',
      image: 'assets/images/process/04-loc.jpg',
      art: 'drip',
    },
    {
      title: 'Đóng chai',
      text: 'Mật được đóng chai cẩn thận, sẵn sàng cho hành trình từ núi rừng đến tay bạn.',
      image: 'assets/images/process/05-dong-chai.jpg',
      art: 'jar',
    },
  ],
}

export const whyUs = {
  title: ['Điều gì làm nên', 'một giọt mật đáng trân trọng?'],
  // Không viết công dụng chữa bệnh / tăng miễn dịch nếu không có căn cứ.
  items: [
    {
      title: 'Nguồn mật gắn với mùa hoa vùng cao',
      text: 'Từ những cánh hoa đến hành trình của đàn ong — mật đến từ đâu, MelBee muốn bạn đều được biết.',
    },
    {
      title: 'Đồng hành cùng người nuôi ong',
      text: 'MelBee hướng đến hợp tác với các hộ, trại ong tại vùng nguyên liệu, góp phần nâng giá trị sản vật địa phương.',
    },
    {
      title: 'Bảo quản & thông tin rõ ràng',
      text: 'Hướng đến quy trình kiểm soát bảo quản và truy xuất thông tin minh bạch, từ nguồn mật đến tay khách hàng.',
    },
    {
      title: 'Món quà mang dấu ấn Tây Bắc',
      text: 'Thiết kế hiện đại, câu chuyện vùng miền và những bộ quà chỉn chu để trao gửi trong dịp ý nghĩa.',
    },
  ],
}

export const lifestyle = {
  eyebrow: 'Thưởng thức',
  title: ['Một chút ngọt', 'cho những ngày bận rộn'],
  items: [
    {
      title: 'Pha cùng nước ấm',
      text: 'Một ly nước ấm với mật ong cho buổi sáng nhẹ nhàng.',
      image: 'assets/images/lifestyle/water.jpg',
      art: 'water',
    },
    {
      title: 'Dùng cùng trà',
      text: 'Thêm chút mật vào tách trà nóng, vị ngọt dịu và thơm hơn.',
      image: 'assets/images/lifestyle/tea.jpg',
      art: 'tea',
    },
    {
      title: 'Trong món ăn',
      text: 'Rưới lên bánh, sữa chua, hoặc dùng làm sốt cho món nướng.',
      image: 'assets/images/lifestyle/food.jpg',
      art: 'food',
    },
    {
      title: 'Làm quà tặng',
      text: 'Một món quà mộc mạc, mang theo hương vị núi rừng.',
      image: 'assets/images/lifestyle/gift.jpg',
      art: 'gift',
    },
  ],
}

export const gallery = {
  eyebrow: 'Hình ảnh',
  title: 'Những khoảnh khắc từ núi rừng',
  // size: 'tall' | 'wide' | 'normal' — bố cục lưới
  items: [
    { image: 'assets/images/gallery/01.jpg', alt: 'Ong trên hoa', caption: 'Ong tìm mật', art: 'bee', size: 'tall' },
    { image: 'assets/images/gallery/02.jpg', alt: 'Hoa dại Tây Bắc', caption: 'Mùa hoa', art: 'blossom', size: 'normal' },
    { image: 'assets/images/gallery/03.jpg', alt: 'Núi rừng Tây Bắc', caption: 'Núi rừng', art: 'landscape', size: 'wide' },
    { image: 'assets/images/gallery/04.jpg', alt: 'Hũ mật ong Tây Bắc MelBee', caption: 'Hũ mật MelBee', art: 'jar', size: 'normal' },
    { image: 'assets/images/gallery/05.jpg', alt: 'Bánh tổ ong', caption: 'Bánh tổ', art: 'honeycomb', size: 'normal' },
    { image: 'assets/images/gallery/06.jpg', alt: 'Người nuôi ong giữa núi rừng Tây Bắc', caption: 'Người nuôi ong', art: 'hive', size: 'tall' },
    { image: 'assets/images/gallery/07.jpg', alt: 'Hộp quà mật ong', caption: 'Đóng gói', art: 'gift', size: 'normal' },
    { image: 'assets/images/gallery/08.jpg', alt: 'Núi Tây Bắc lúc hoàng hôn', caption: 'Hoàng hôn vùng cao', art: 'landscape-dusk', size: 'wide' },
  ],
}

export const testimonialsSection = {
  eyebrow: 'Khách hàng',
  title: 'Những chia sẻ từ khách hàng',
}

export const cta = {
  title: ['Muốn thử một chút', 'hương vị Tây Bắc?'],
  subtext: 'Nhắn tin cho chúng tôi để được tư vấn sản phẩm phù hợp.',
  image: 'assets/images/hero/cta.jpg',
  art: 'landscape-sunset',
}
