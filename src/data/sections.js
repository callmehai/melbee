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

// Menu: mỗi mục là một trang riêng (path tính từ gốc website). Trang chủ là landing để cuộn,
// các trang còn lại nói kỹ hơn phần landing chỉ giới thiệu.
// ⚠️ 'san-pham/' là đích của mã QR in trên hộp quà — không đổi.
export const nav = [
  { id: 'home', label: 'Trang chủ', path: '' },
  { id: 'products', label: 'Sản phẩm', path: 'san-pham/' },
  { id: 'gift', label: 'Hộp quà', path: 'hop-qua/' },
  { id: 'story', label: 'Câu chuyện', path: 'cau-chuyen/' },
  { id: 'contact', label: 'Liên hệ', path: 'lien-he/' },
]

export const hero = {
  // 5 giây đầu phải nói được MelBee bán gì cho ai: mật ong Tây Bắc làm quà biếu → nút chính dẫn thẳng tới hộp quà
  eyebrow: 'Quà biếu từ mùa hoa vùng cao',
  title: 'Mật Ong Tây Bắc',
  tagline: 'Mật ngọt từ hoa, tinh hoa từ rừng.',
  subtext: 'Mật ong nguyên chất từ núi rừng Điện Biên, trong hộp quà nâu trầm nhũ vàng — món quà chỉn chu để biếu người thân, thầy cô, đối tác.',
  primaryCta: { label: 'Chọn hộp quà', href: 'hop-qua/' },
  secondaryCta: { label: 'Các loại mật', href: 'san-pham/' },
  image: 'assets/images/hero/hero.jpg',
  // Video nền (tuỳ chọn) — chỉ tải sau khi trang đã hiện xong
  video: 'assets/videos/hero.mp4',
  art: 'landscape',
}

export const intro = {
  title: ['Một giọt mật', 'mang theo cả mùa hoa'],
  paragraphs: [
    'Mật ong không chỉ là vị ngọt.',
    'Đó là dấu ấn của những mùa hoa, của núi rừng và của người nuôi ong — được gìn giữ qua cả hành trình từ vùng đất tự nhiên đến từng giọt mật.',
    'Mỗi sản phẩm MelBee gửi đến bạn đều giữ trọn vị nguyên bản cùng câu chuyện phía sau.',
  ],
  // khung vòm: ảnh lọ dòng chủ lực (cùng ảnh trang sản phẩm) — miếng bánh tổ 3D đã tắt (src/three/config.js)
  image: 'assets/images/products/hoa-ban.jpg',
  imageAlt: 'Lọ mật ong Hoa ban Tây Bắc MelBee giữa hoa trắng và thân tre',
  art: 'jar',
  caption: { id: 'hoa-ban', text: 'Mật ong Hoa ban Tây Bắc' }, // dòng chú thích dưới khung, kèm danh hiệu của loại mật đó
}

export const productsSection = {
  eyebrow: 'Sản phẩm',
  title: 'Khám phá những giọt mật từ Tây Bắc',
  subtitle:
    'Tuyển chọn từ nguồn nguyên liệu tự nhiên, chăm chút trong từng công đoạn.',
  note: 'Đặt hàng qua Zalo hoặc Facebook — MelBee tư vấn và xác nhận đơn trực tiếp.',
}

export const story = {
  title: 'Câu chuyện của chúng tôi',
  paragraphs: [
    'Giữa rất nhiều sản phẩm mật ong, điều người tiêu dùng cần là sự an tâm về nguồn gốc và hành trình tạo nên sản phẩm — nhiều hơn một lời khẳng định “nguyên chất”.',
    'MelBee được hình thành từ mong muốn mang mật ong từ vùng núi Điện Biên đến gần hơn với người tiêu dùng — giữ lại vị ngọt tự nhiên và cả câu chuyện về vùng đất, người nuôi ong phía sau mỗi giọt mật.',
    'Bên cạnh bữa sáng hằng ngày, MelBee mong mật ong trở thành một món quà gần gũi, mang đậm nét riêng của núi rừng Tây Bắc.',
  ],
  image: 'assets/images/story/story.jpg',
  imageAlt: 'Người nuôi ong bên đàn ong giữa núi rừng Tây Bắc',
  art: 'landscape',
}

/**
 * Hành trình MelBee — các mốc có thật, lấy từ bài đăng trên fanpage facebook.com/melbeetaybac (đọc 24/11/2026).
 * Thêm mốc mới vào cuối mảng. date: chữ hiện trên mốc; place: nơi diễn ra (không có thì bỏ).
 */
export const journey = {
  eyebrow: 'Hành trình',
  title: ['Từ lọ mật đầu tiên', 'đến những hộp quà'],
  milestones: [
    {
      date: '10 / 2026',
      title: 'Mật ong Hoa ban Tây Bắc ra mắt',
      text: 'Dòng mật đầu tiên — và vẫn là dòng chủ lực, đạt OCOP 3 sao — vừa kịp làm quà dịp 20/10.',
    },
    {
      date: '27 / 10',
      title: 'Gian hàng đầu tiên',
      place: 'Sảnh Beta · Đại học FPT Hà Nội',
      text: 'Lần đầu gặp khách ngoài đời: nếm thử mật tại chỗ, nghe câu chuyện phía sau từng lọ và chụp ảnh cùng chú ong MelBee.',
    },
    {
      date: '11 / 2026',
      title: 'Thêm ba vị mật mới',
      text: 'Hoa nhãn ngọt đậm, Hoa rừng Tây Bắc thanh mát từ hàng trăm loài hoa dại, và Hang đá sánh đặc — số lượng giới hạn.',
    },
    {
      date: '14 / 11',
      title: 'Bánh tổ mật ong',
      text: 'Nguyên miếng tổ ong đầy mật — sản phẩm mới được bật mí qua minigame đoán tên trên fanpage.',
    },
    {
      date: '15 / 11',
      title: 'Heritage Festival Vol.2',
      place: 'Lotte Mall Tây Hồ, Hà Nội',
      text: 'Một ngày ở Culture Avenue: khách nếm từng dòng mật, ngắm màu, cảm kết cấu và chọn set quà cho gia đình.',
    },
    {
      date: '19 / 11',
      title: 'Ba set quà tri ân 20/11',
      text: 'Hương hoa Tây Bắc, Tam Hoa và Mật ngọt bốn mùa — hộp cứng nâu trầm, khay vàng in lời gửi, kèm thìa gỗ lấy mật.',
    },
    {
      date: '24 / 11',
      title: 'Website melbeetaybac.com',
      text: 'Bảng vị các dòng mật và các set quà gom về một nơi — không lo trôi bài.',
    },
  ],
}

/** Ảnh gian hàng MelBee ở Heritage Festival Vol.2 (fanpage MelBee, 15/11/2026) — đã cắt bỏ khung logo. */
export const events = {
  eyebrow: 'MelBee ngoài đời',
  title: 'Gặp nhau ở Lotte Mall Tây Hồ',
  text: 'Ngày 15/11/2026, MelBee mang các dòng mật và set quà đến Heritage Festival Vol.2. Cảm ơn mọi người đã ghé nếm thử và trò chuyện cùng chúng mình.',
  photos: [
    { src: 'assets/images/story/su-kien-gian-hang.jpg', alt: 'Gian hàng MelBee với các lọ mật, hộp quà mở nắp và chú ong linh vật', caption: 'Gian hàng ở Culture Avenue, tầng 4' },
    { src: 'assets/images/story/su-kien-nem-thu.jpg', alt: 'Khách nếm thử mật ong tại gian hàng MelBee', caption: 'Nếm thử từng dòng mật' },
    { src: 'assets/images/story/su-kien-tu-van.jpg', alt: 'Thành viên MelBee gói mật cho khách tại gian hàng', caption: 'Tư vấn và gói quà tại chỗ' },
  ],
}

export const origin = {
  eyebrow: 'Nguồn gốc',
  title: 'Nơi những giọt mật bắt đầu',
  lead: ['Mỗi mùa hoa', 'để lại một vị mật riêng.'],
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
      art: 'line-blossom',
    },
    {
      title: 'Đàn ong',
      text: 'Đàn ong được nuôi gần vùng hoa, tự do tìm mật trong không gian tự nhiên.',
      image: 'assets/images/process/02-dan-ong.jpg',
      art: 'line-bee',
    },
    {
      title: 'Thu mật',
      text: 'Mật chỉ được thu khi đã chín trong tổ — từ những cầu ong đã được đàn ong vít nắp sáp.',
      image: 'assets/images/process/03-thu-mat.jpg',
      art: 'line-frame',
    },
    {
      title: 'Lọc và bảo quản',
      text: 'Mật được lọc sạch tạp chất và bảo quản trong điều kiện phù hợp.',
      image: 'assets/images/process/04-loc.jpg',
      art: 'line-drip',
    },
    {
      title: 'Đóng lọ',
      text: 'Mật được đóng lọ cẩn thận, sẵn sàng cho hành trình từ núi rừng đến tay bạn.',
      image: 'assets/images/process/05-dong-chai.jpg',
      art: 'line-jar',
    },
  ],
}

export const whyUs = {
  eyebrow: 'Điều MelBee giữ',
  image: 'assets/images/gift/hop-mat-truoc.jpg',
  imageAlt: 'Nắp hộp quà MelBee màu nâu trầm, chữ MELBEE và hoạ tiết hoa ép nhũ vàng',
  imageCaption: 'Nắp hộp quà MelBee — nâu trầm, ép nhũ vàng',
  title: ['Điều gì làm nên', 'một giọt mật đáng trân trọng?'],
  // Không viết công dụng chữa bệnh / tăng miễn dịch nếu không có căn cứ.
  items: [
    {
      title: 'Nguồn mật gắn với mùa hoa vùng cao',
      text: 'Từ cánh hoa đến hành trình của đàn ong — MelBee muốn bạn biết rõ mỗi giọt mật đến từ đâu.',
    },
    {
      title: 'Đồng hành cùng người nuôi ong',
      text: 'MelBee hợp tác cùng các hộ và trang trại ong tại vùng nguyên liệu, góp phần nâng tầm giá trị sản vật địa phương.',
    },
    {
      title: 'Bảo quản & thông tin rõ ràng',
      text: 'MelBee hướng đến quy trình bảo quản được kiểm soát và thông tin minh bạch, từ nguồn mật đến tay khách hàng.',
    },
    {
      title: 'Món quà mang dấu ấn Tây Bắc',
      text: 'Thiết kế hiện đại, câu chuyện vùng miền và những bộ quà chỉn chu để trao gửi trong những dịp ý nghĩa.',
    },
  ],
}

export const lifestyle = {
  eyebrow: 'Thưởng thức',
  title: ['Một chút ngọt', 'cho những ngày bận rộn'],
  items: [
    {
      title: 'Pha cùng nước ấm',
      text: 'Một cốc nước ấm pha mật ong cho buổi sáng nhẹ nhàng.',
      image: 'assets/images/lifestyle/water.jpg',
      art: 'water',
    },
    {
      title: 'Dùng cùng trà',
      text: 'Một thìa mật trong tách trà nóng cho vị ngọt dịu và hương thơm đậm đà hơn.',
      image: 'assets/images/lifestyle/tea.jpg',
      art: 'tea',
    },
    {
      title: 'Trong món ăn',
      text: 'Rưới lên bánh, sữa chua hoặc làm sốt cho các món nướng.',
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
  // MelBee định vị quà biếu → lời kết là gửi tặng, không phải "mang về nhà"
  title: ['Gửi một mùa hoa Tây Bắc', 'tới người bạn trân quý'],
  subtext: 'Nhắn MelBee qua Zalo hoặc Facebook để chọn hộp quà, loại mật hợp với người nhận.',
  image: 'assets/images/hero/cta.jpg',
  art: 'landscape-sunset',
}
