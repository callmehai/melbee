# MelBee — Mật Ong Tây Bắc

Website thương hiệu + giới thiệu sản phẩm + kể chuyện cho mật ong Tây Bắc.
**Không phải web bán hàng**: không giỏ hàng, không thanh toán, không đăng nhập.
Mọi đơn hàng đi qua tin nhắn **Facebook** hoặc **Zalo**.

- React + Vite, không backend, không database
- Framer Motion (hiệu ứng), Lucide React (icon)
- Font tự host, đủ dấu tiếng Việt: Noto Serif Display (tiêu đề — dấu mũ xếp gọn, không lơ lửng) + Be Vietnam Pro (nội dung)
- Chưa có ảnh thật thì trang tự dùng **hình minh hoạ vẽ bằng SVG** — không bao giờ có ảnh vỡ

---

## 1–3. Chạy, build

Cần Node.js ≥ 20.19.

```bash
npm install      # cài thư viện (một lần)
npm run dev      # chạy thử: http://localhost:5173
npm run build    # bản production → thư mục dist/
npm run preview  # xem thử bản build
```

**Deploy**: đã cấu hình GitHub Pages — mỗi lần `git push` lên nhánh `main`, GitHub Actions tự build
và đăng lại (~30 giây). Muốn dùng Vercel/Netlify: import repo, build `npm run build`, output `dist`.

---

## Thay nội dung — chỉ sửa dữ liệu, không sửa component

| Muốn đổi | Sửa file |
|---|---|
| Tên thương hiệu, logo, Facebook, Zalo, điện thoại, email, địa chỉ | `src/config/brand.js` |
| Sản phẩm | `src/data/products.js` |
| Hộp quà: kiểu hộp, màu, phí hộp, loại mật đặt vào hộp | `src/data/giftbox.js` |
| Trợ lý hỏi nhanh (nút chat góc phải): câu hỏi gợi ý, câu trả lời soạn sẵn theo từ khoá — không phải AI | `src/data/chatbot.js` |
| Chia sẻ khách hàng | `src/data/testimonials.js` |
| Chữ & ảnh của mọi phần còn lại (hero, câu chuyện, nguồn gốc, quy trình, lifestyle, gallery, CTA, menu) | `src/data/sections.js` |
| Màu, font, khoảng cách | `src/styles/variables.css` |
| Thứ tự các phần trên trang | `src/App.jsx` |

### Logo & tên thương hiệu
`src/config/brand.js` → `name`, `shortName`, `tagline`, `about`. Thông tin lấy từ trang Facebook MelBee.
Logo: `public/assets/icons/logo.jpg` (huy hiệu tròn cạnh chữ; `logo: null` → biểu tượng vẽ sẵn).
Favicon: `public/favicon.png`, `public/apple-touch-icon.png`. Ảnh chia sẻ mạng xã hội: `public/og-image.jpg` (từ ảnh bìa Facebook).

### Facebook
`src/config/brand.js` → `facebook: 'https://www.facebook.com/melbeetaybac'`.
Mọi nút "Nhắn tin qua Facebook" trên trang đều lấy link từ đây.
Mẹo: dùng `https://m.me/melbeetaybac` để mở thẳng khung chat Messenger.

### Zalo, TikTok
`src/config/brand.js` → `zalo: 'https://zalo.me/0936321902'` (theo hotline), `tiktok` (để `null` thì ẩn link TikTok ở footer).

### Thông tin liên hệ
`brand.contact` trong `src/config/brand.js` (đang là hotline, email, Hà Nội theo trang Facebook).
Để `null` → footer hiện "Đang cập nhật". Không điền thông tin giả.

---

## Tôi muốn thêm một sản phẩm

1. Chép ảnh sản phẩm vào `public/assets/images/products/`, ví dụ `mat-ong-bac-ha.jpg`
   (ảnh dọc tỉ lệ 4:5, rộng ~1200px là đẹp).
2. Mở `src/data/products.js`, thêm một object vào mảng `products`:

```js
{
  id: 'honey-05',                       // mã riêng, không trùng
  name: 'Mật ong bạc hà',
  subtitle: 'Một dòng mô tả ngắn',
  description: 'Mô tả chi tiết hiện trong cửa sổ "Xem chi tiết".',
  origin: 'Nguồn gốc của sản phẩm.',
  flavor: ['Hương thơm nhẹ', 'Vị ngọt thanh'],          // hương vị / đặc điểm
  usage: ['Pha cùng nước ấm', 'Dùng cùng trà'],         // cách dùng
  image: 'assets/images/products/mat-ong-bac-ha.jpg',
  tone: 'light',            // màu hũ minh hoạ khi CHƯA có ảnh: light | amber | dark | comb
  price: 'Liên hệ',         // hoặc '250.000đ'
  size: '500ml',
  featured: false,          // true → gắn nhãn "Nổi bật"
  facebookMessage: true,    // hiện nút nhắn Facebook
  zaloMessage: true,        // hiện nút nhắn Zalo
},
```

3. Lưu lại — sản phẩm tự xuất hiện ở lưới sản phẩm và có cửa sổ chi tiết riêng.
   Xoá sản phẩm: xoá object đó. Đổi thứ tự: đổi thứ tự trong mảng.

> Dữ liệu 4 sản phẩm hiện có là **mẫu** — hãy thay bằng thông tin thật.
> Không viết công dụng chữa bệnh, "tăng miễn dịch"… nếu không có căn cứ.

---

## Thay ảnh

Đường dẫn ảnh trong file dữ liệu luôn **tính từ thư mục `public/`**.
Chép ảnh vào đúng chỗ và đặt **đúng tên như trong file dữ liệu** là ảnh thật tự thay hình minh hoạ —
không phải sửa code. Muốn dùng tên khác thì sửa đường dẫn trong file dữ liệu.

| Ảnh | Thư mục | Tên file đang chờ (xem `src/data/sections.js`) |
|---|---|---|
| Hero (nền đầu trang) | `public/assets/images/hero/` | `hero.jpg` (ngang, ≥ 2000px) |
| Video nền hero (tuỳ chọn) | `public/assets/videos/` | `hero.mp4` (H.264, < 15MB) |
| Nền khối CTA cuối trang | `public/assets/images/hero/` | `cta.jpg` |
| Sản phẩm | `public/assets/images/products/` | `honey-01.jpg`, `honey-02.jpg`, … |
| Giới thiệu & câu chuyện | `public/assets/images/story/` | `intro-macro.jpg`, `story.jpg` |
| Nguồn gốc | `public/assets/images/origin/` | `beekeeping.jpg` |
| Lifestyle | `public/assets/images/lifestyle/` | `water.jpg`, `tea.jpg`, `food.jpg`, `gift.jpg` |
| Gallery | `public/assets/images/gallery/` | `01.jpg` … `08.jpg` |
| Logo, icon | `public/assets/icons/` | — |

Ảnh `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg` đều dùng được. Nên nén ảnh (≤ 400KB/ảnh) trước khi đưa lên.
Ảnh mạng xã hội khi chia sẻ link: `public/og-image.jpg` (1200×630).

### Phần tự ẩn khi chưa có nội dung thật
Trang không hiện hình minh hoạ thay ảnh thật ở những chỗ cần ảnh thật:
- **Sản phẩm**: chỉ sản phẩm đã có file ảnh mới hiện. Chép `honey-02.jpg`… vào là sản phẩm tự hiện.
  Một sản phẩm → thẻ lớn nằm ngang; từ 2 sản phẩm → lưới. Nên chụp cùng kiểu ánh sáng với `honey-01.jpg`.
- **Thưởng thức (lifestyle)**: hiện khi có từ 2 ảnh thật.
- **Hình ảnh (gallery)**: hiện khi có từ 4 ảnh thật (hiện có 2: `04.jpg`, `06.jpg`).
- **Khách hàng**: hiện khi có chia sẻ thật (xem bên dưới).

### Gallery
`gallery.items` trong `src/data/sections.js`. Mỗi ảnh có `size`: `normal`, `tall` (cao gấp đôi) hoặc
`wide` (rộng gấp đôi) để tạo bố cục kiểu tạp chí. Bấm ảnh mở lightbox (← → Esc, vuốt trên điện thoại).

### Câu chuyện, nguồn gốc, quy trình, lifestyle
Đều nằm trong `src/data/sections.js` (`story`, `origin`, `process.steps`, `whyUs`, `lifestyle`).
Quy trình thêm/bớt bước: thêm/xoá object trong `process.steps` (các bước so le hai bên một dòng mật chảy dọc, đầy dần theo cuộn; mỗi bước có ảnh `image`, chưa có ảnh thì dùng tranh `art`).

### Chia sẻ khách hàng
`src/data/testimonials.js`. Hiện là **nội dung mẫu** (`sample: true`) nên **không hiện** trên trang — MelBee
chưa mở bán. Khi có chia sẻ thật, được khách đồng ý: thay chữ và xoá `sample: true` → section tự hiện.

---

## Đổi màu & font

`src/styles/variables.css`:

```css
--honey:  #c88a24;  /* vàng mật ong — nút, điểm nhấn */
--forest: #24352a;  /* xanh rừng — điểm nhấn */
--brown:  #3a291d;  /* nâu gỗ — chữ chính */
--cream:  #f5ebdd;  /* nền kem */
--ivory:  #faf7f0;  /* nền chính */
--charcoal: #1e1c18;/* footer */
```

Font: cài font khác từ [Fontsource](https://fontsource.org) (chọn font có `vietnamese`), ví dụ
`npm install @fontsource/lora`, import trong `src/main.jsx`, rồi đổi `--font-serif` / `--font-sans`.

## Đổi hiệu ứng

- Hiệu ứng hiện khi cuộn: component `<Reveal effect="fade-up | fade | slide-left | slide-right | scale" delay={0.1}>`
  (`src/components/common/Reveal.jsx`) — chỉnh `VARIANTS` để đổi khoảng trượt/thời gian.
- Hero: thứ tự xuất hiện chữ ở `src/components/Hero/Hero.jsx` (hàm `item(delay)`), tốc độ zoom nền
  ở `Hero.css` (`slow-zoom`), cành hoa ban tiền cảnh: `BanBranch` trong `src/components/Art/Art.jsx`.
- Con trỏ con ong: `src/components/Cursor/` — ong vỗ cánh, quay đầu theo hướng chuột; lướt qua ảnh hiện
  nhãn "XEM" (gắn `data-cursor="view"` lên phần tử bất kỳ), lướt qua nút thì ong to lên.
  Chỉ bật trên máy có chuột, tự tắt trên điện thoại. Không muốn dùng: xoá `<Cursor />` trong `src/App.jsx`.
- Người dùng bật *Reduce motion* trong hệ điều hành → hiệu ứng phức tạp tự tắt.
- Tiêu đề tab (ngắn, vừa khung tab): `src/main.jsx`. Tiêu đề đầy đủ cho Google / mạng xã hội: `<title>` và `og:title` trong `index.html`.
- Nút âm thanh là **một bông hoa** trên thanh điều hướng: tắt tiếng thì hoa xám, cánh khép; bật thì hoa nở đủ màu,
  xoay chậm, sóng + phấn toả ra. Bấm vào hoa: con ong (con trỏ) chúc đầu hút mật (tắt) / nhả mật (bật), giọt mật bay
  giữa hoa và ong. Xem thêm mục **Âm thanh nền** bên dưới.
  Bỏ nút: xoá `<SoundToggle />` trong `src/components/Navbar/Navbar.jsx`.

---

## Âm thanh nền

Nhạc nền `public/assets/audio/music.mp3` — Mixkit "Wedding 01" (#657, giấy phép miễn phí, dùng thương mại được,
không cần ghi nguồn), đã cắt khoảng lặng đầu/cuối, chuẩn hoá độ to, nén 128kbps (~2,2MB, 2 phút 23 giây, lặp lại).
**Mặc định bật**: trình duyệt không cho trang tự phát tiếng trước khi người xem tương tác, nên nhạc chạy
ở lần bấm / chạm / gõ phím đầu tiên trên trang. Người xem bấm nút để tắt → trang nhớ, lần sau vẫn tắt.
Muốn mặc định tắt: `autoplay: false` trong `src/audio/config.js`.

- Âm lượng, mức theo từng section: `src/audio/config.js` (`AUDIO_LAYERS`, `AUDIO_SCENES`). Đổi section → tự chuyển ~1,5 giây.
- Đổi bài: chép file MP3 mới đè lên `music.mp3` (hoặc đổi đường dẫn trong `config.js`).
- Tiếng rừng / gió / suối (Mixkit) vẫn còn trong `public/assets/audio/` — cách bật lại ghi ở đầu `config.js`;
  không dùng nữa thì xoá 3 file `ambient-forest.mp3`, `wind.mp3`, `river.mp3`.
- Thiếu file → nút báo lỗi, trang vẫn chạy bình thường.
- Mã: `src/audio/AudioManager.js`, nút: `src/components/SoundToggle/`.


---

## Lớp Three.js — một ngày xuân ở Điện Biên

Một canvas WebGL **duy nhất** phủ cả trang (trong suốt, không chặn chuột, nằm dưới navbar và cửa sổ
sản phẩm). Mỗi hiệu ứng tự bám vào section của nó qua thuộc tính `data-scene` trên thẻ `<section>`.
Three.js chủ yếu làm **không khí** — nắng, sương, phấn hoa, ong, hoa. Vật thể chỉ có hai, đều cầm nắm được:
miếng bánh tổ ở "Giọt mật" và hộp quà ở "Hộp quà".
Một mặt trời, một hướng sáng (thấp bên phải): sáng sớm ở Hero, chiều tà ở CTA.

| Section | Hiệu ứng |
|---|---|
| Hero | tia nắng sớm toả từ mặt trời trong tranh, sương trôi ở chân núi, 1–3 con ong ghé cành hoa ban |
| Nguồn gốc | núi xa xanh lam + sương, đồng hoa (cải vàng, tam giác mạch, hoa trắng) lay theo gió, đàn ong đi kiếm mật |
| Giọt mật | miếng bánh tổ 3D (vách sáp, ô vít nắp, ô mật bóng): rê chuột → nghiêng theo; kéo hoặc chạm → lắc, rung rinh rồi về chỗ; giọt mật ở mép dưới to dần thấy rõ rồi rơi (2–3,5 giây một giọt), đung đưa theo khi lắc, lắc mạnh thì giọt văng sớm. Máy không có WebGL → hiện ảnh `story/intro-macro.jpg` hoặc tranh tổ ong |
| Sản phẩm | gần như tĩnh; rê chuột lên thẻ → vài hạt phấn bay lên |
| Cả trang | **ong dẫn đường**: một con ong luôn bay (không đậu) theo người xem — cuộn tới phần nào thì bay tới lượn hình số 8 cạnh thứ chính của phần đó (nút chính, miếng tổ, ảnh, bước quy trình…), nút được chỉ sáng viền mật; người xem dừng đọc thì ong bay một vòng quanh, chuột sà tới thì né; bay sang chỗ mới để lại vệt phấn mờ dần. Đánh dấu chỗ lượn bằng `data-bee-perch` (xem `three/effects/GuideBee.js`) |
| Hộp quà | hộp lục giác 3D (như một ô tổ ong) in nhũ dãy núi, thắt nơ satin, khay tổ ong màu mật: kéo/vuốt → xoay mọi hướng (ngang quanh hộp, dọc lật lên xuống); bấm/chạm → mở nắp, các hũ mật nhô lên khỏi khay, bụi vàng bay lên, thiệp nằm ở mặt trong nắp (in tổ ong). Đổi kiểu hộp, màu, hũ, lời nhắn ở bảng bên cạnh → hộp đổi theo ngay. Bước cuối chép sẵn lời nhắn mô tả hộp để dán vào Facebook / Zalo (không có giỏ hàng). Không có WebGL → tranh hộp quà |
| CTA | tia nắng chiều cùng hướng, bụi nắng bay lên |
| Cả trang | một lớp phấn hoa mỏng, một màu vàng ấm — dày ở Hero / Nguồn gốc, thưa ở phần nội dung |

Ong bay kiểu đi kiếm mật: lao tới một bông → lơ lửng → đậu, khép cánh vài giây → sang bông gần đó.
Ong chỉ ở nơi có hoa, cỡ ong nhỏ lại theo bề rộng màn hình.

**Chỉnh ở `src/three/config.js`:**
- `THREE_CONFIG.effects` — bật/tắt từng hiệu ứng; `enabled: false` tắt cả lớp Three.js.
- Số lượng theo cấp chất lượng: `pollen`, `bees`, `flowers`, `grass`, `goldenParticles`.
- `bloom`, `mouseParallax`, `maxParallaxRotation`, `wind`, `honeyShader`, `beeInteraction`, `autoQuality`, `maxPixelRatio`.
- `SCENES` — "tâm trạng" từng section (mật độ phấn, gió).
- `PALETTE` — màu phấn, mật, hoa, núi, sương.

**Chất lượng:** tự chọn high / medium / low theo máy (CPU, RAM, cỡ màn hình), tự hạ cấp khi FPS thấp.
Thử một cấp: thêm `?quality=low` vào URL. Bảng debug (chỉ khi chạy `npm run dev`): `?debug=true`.

**An toàn:** không có WebGL / lỗi → lớp Three.js tự ẩn, trang chạy như cũ (Hero dùng lại phấn hoa 2D).
Three.js nằm ở file riêng, chỉ tải sau khi trang đã hiện xong.

---

## Cấu trúc

```
src/
├── config/brand.js          tên, logo, Facebook, Zalo, liên hệ
├── data/
│   ├── products.js          sản phẩm
│   ├── giftbox.js           hộp quà (kiểu, màu, phí hộp, loại mật)
│   ├── chatbot.js           trợ lý hỏi nhanh: câu trả lời soạn sẵn + từ khoá
│   ├── testimonials.js      chia sẻ khách hàng
│   └── sections.js          chữ & ảnh của từng phần, menu
├── components/
│   ├── Navbar/  Hero/  Intro/  ProductShowcase/  ProductCard/  ProductModal/  GiftBuilder/
│   ├── BrandStory/  OriginSection/  ProcessTimeline/  WhyUs/  Lifestyle/
│   ├── Gallery/  Lightbox/  Testimonials/  CTA/  Footer/  Cursor/  SoundToggle/
│   ├── SupportWidget/       nút Zalo + trợ lý hỏi nhanh ở góc phải dưới
│   ├── Art/                 hình minh hoạ SVG (dùng khi chưa có ảnh thật)
│   └── common/              nút, ảnh, menu đặt hàng, tiêu đề section…
├── audio/                   âm thanh nền: AudioManager + config
├── three/                   lớp Three.js (xem mục "Lớp Three.js")
│   ├── config.js            bật/tắt hiệu ứng, số lượng, màu, tâm trạng section
│   ├── ThreeCanvas.jsx      điểm vào: kiểm tra WebGL, tải lazy
│   ├── ThreeScene.jsx       canvas dùng chung + vòng đời engine
│   ├── experience.js        ghép các hiệu ứng vào từng section
│   ├── core/                Engine (renderer, camera, gió, cuộn, chuột), ScrollTracker, anchors
│   ├── effects/             PollenField, LightRays, MountainAtmosphere, FlowerField,
│   │                        BeeSwarm, Honeycomb, GiftBox, HoneyParticles, honey (vật liệu mật dùng chung)
│   ├── shaders/             honey, pollen, distortion, noise, space (.glsl)
│   ├── utils/               noise, random, performance
│   └── debug/               bảng debug (chỉ bản dev)
├── hooks/                   useScrollReveal, useMediaQuery, useLockBody
├── styles/                  variables.css (màu, font) + globals.css
├── App.jsx                  thứ tự các phần
└── main.jsx
```
