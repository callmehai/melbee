/**
 * NỘI DUNG CÁC PHẦN CỦA TRANG — sửa chữ, ảnh ở đây, không cần đụng vào component.
 *
 * image: đường dẫn tính từ public/ (vd 'assets/images/hero/hero.jpg').
 *        Chưa có file → tự hiện hình minh hoạ theo `art`.
 * art:   hình minh hoạ dự phòng: landscape | landscape-dusk | honeycomb | blossom | bee |
 *        hive | frame | drip | jar | tea | water | food | gift | map
 */

export const nav = [
  { label: 'Trang chủ', href: '#trang-chu' },
  { label: 'Sản phẩm', href: '#san-pham' },
  { label: 'Câu chuyện', href: '#cau-chuyen' },
  { label: 'Nguồn gốc', href: '#nguon-goc' },
  { label: 'Quy trình', href: '#quy-trinh' },
  { label: 'Liên hệ', href: '#lien-he' },
]

export const hero = {
  eyebrow: 'Melbee · Đặc sản vùng cao',
  title: 'Mật Ong Tây Bắc',
  tagline: 'Tinh hoa từ những mùa hoa nơi núi rừng.',
  subtext: 'Giữ lại vị ngọt nguyên bản từ thiên nhiên Tây Bắc.',
  primaryCta: { label: 'Khám phá sản phẩm', href: '#san-pham' },
  secondaryCta: { label: 'Câu chuyện của chúng tôi', href: '#cau-chuyen' },
  image: 'assets/images/hero/hero.jpg',
  // Video nền (tuỳ chọn) — chỉ tải sau khi trang đã hiện xong
  video: 'assets/videos/hero.mp4',
  art: 'landscape-dusk',
}

export const intro = {
  eyebrow: 'Mật ong là gì',
  title: ['Một giọt mật', 'mang theo cả mùa hoa'],
  paragraphs: [
    'Mật ong không chỉ là vị ngọt.',
    'Đó là dấu vết của những mùa hoa, của núi rừng, của người nuôi ong và của hành trình từ những vùng đất tự nhiên đến từng giọt mật.',
    'Mỗi sản phẩm được giới thiệu với mong muốn giữ lại sự nguyên bản và câu chuyện phía sau nó.',
  ],
  image: 'assets/images/story/intro-macro.jpg',
  imageAlt: 'Cận cảnh mật ong chảy trên bánh tổ',
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
  eyebrow: 'Câu chuyện',
  title: 'Câu chuyện của chúng tôi',
  paragraphs: [
    'Giữa những dãy núi Tây Bắc, mùa hoa đến rồi đi theo từng mùa trong năm.',
    'Những đàn ong tìm mật giữa những vùng hoa tự nhiên, và từ hành trình ấy, những giọt mật mang theo hương vị đặc trưng của núi rừng được hình thành.',
    'Chúng tôi muốn đưa một phần hương vị ấy đến gần hơn với cuộc sống hiện đại — theo cách chân thành, rõ ràng và trọn vẹn nhất.',
  ],
  image: 'assets/images/story/story.jpg',
  imageAlt: 'Những dãy núi Tây Bắc trong sương sớm',
  art: 'landscape',
}

export const origin = {
  eyebrow: 'Nguồn gốc',
  title: 'Nơi những giọt mật bắt đầu',
  lead: ['Không chỉ là nơi sản xuất.', 'Đó là nơi câu chuyện bắt đầu.'],
  text: 'Tây Bắc là vùng núi cao, nơi rừng còn giữ được nhiều mảng xanh và hoa dại nở theo mùa. Những điều kiện tự nhiên ấy tạo nên hương vị riêng cho từng mùa mật.',
  image: 'assets/images/origin/map.jpg',
  imageAlt: 'Bản đồ minh hoạ vùng núi Tây Bắc',
  art: 'map',
  highlights: [
    { icon: 'mountain', title: 'Núi', text: 'Những dãy núi cao, sương phủ quanh năm.' },
    { icon: 'leaf', title: 'Rừng', text: 'Thảm rừng tự nhiên là nhà của đàn ong.' },
    { icon: 'flower', title: 'Hoa', text: 'Hoa dại nở nối tiếp nhau theo mùa.' },
    { icon: 'heart-handshake', title: 'Con người', text: 'Người nuôi ong gắn bó với núi rừng.' },
  ],
  photos: [
    { image: 'assets/images/origin/mountain.jpg', alt: 'Núi rừng Tây Bắc', art: 'landscape' },
    { image: 'assets/images/origin/flowers.jpg', alt: 'Hoa dại trên sườn núi', art: 'blossom' },
    { image: 'assets/images/origin/beekeeping.jpg', alt: 'Những thùng ong giữa vùng hoa', art: 'hive' },
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
  eyebrow: 'Giá trị',
  title: ['Điều gì làm nên', 'một giọt mật đáng trân trọng?'],
  // Không viết công dụng chữa bệnh / tăng miễn dịch nếu không có căn cứ.
  items: [
    {
      title: 'Nguồn nguyên liệu',
      text: 'Bắt đầu từ những vùng hoa tự nhiên giữa núi rừng Tây Bắc.',
    },
    {
      title: 'Hương vị tự nhiên',
      text: 'Mỗi mùa hoa cho một sắc mật, một hương vị riêng — chúng tôi giữ nguyên sự khác biệt ấy.',
    },
    {
      title: 'Chăm chút trong từng công đoạn',
      text: 'Từ lúc thu mật đến khi đóng chai, mỗi bước đều được làm cẩn thận.',
    },
    {
      title: 'Câu chuyện từ vùng đất',
      text: 'Mỗi hũ mật mang theo một phần câu chuyện của núi rừng và người nuôi ong.',
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
    { image: 'assets/images/gallery/04.jpg', alt: 'Hũ mật ong', caption: 'Những hũ mật', art: 'jar', size: 'normal' },
    { image: 'assets/images/gallery/05.jpg', alt: 'Thùng ong giữa vùng hoa', caption: 'Người nuôi ong', art: 'hive', size: 'tall' },
    { image: 'assets/images/gallery/06.jpg', alt: 'Bánh tổ ong', caption: 'Bánh tổ', art: 'honeycomb', size: 'normal' },
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
  art: 'landscape-dusk',
}
