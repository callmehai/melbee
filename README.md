# Melbee — Mật Ong Tây Bắc

Website thương hiệu + giới thiệu sản phẩm + kể chuyện cho mật ong Tây Bắc.
**Không phải web bán hàng**: không giỏ hàng, không thanh toán, không đăng nhập.
Mọi đơn hàng đi qua tin nhắn **Facebook** hoặc **Zalo**.

- React + Vite, không backend, không database
- Framer Motion (hiệu ứng), Lucide React (icon)
- Font tự host, đủ dấu tiếng Việt: Cormorant Garamond (tiêu đề) + Be Vietnam Pro (nội dung)
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
| Chia sẻ khách hàng | `src/data/testimonials.js` |
| Chữ & ảnh của mọi phần còn lại (hero, câu chuyện, nguồn gốc, quy trình, lifestyle, gallery, CTA, menu) | `src/data/sections.js` |
| Màu, font, khoảng cách | `src/styles/variables.css` |
| Thứ tự các phần trên trang | `src/App.jsx` |

### Logo & tên thương hiệu
`src/config/brand.js` → `name`, `shortName`, `tagline`.
Logo ảnh: chép file vào `public/assets/icons/logo.svg` rồi đặt `logo: 'assets/icons/logo.svg'`
(để `null` thì dùng logo chữ có sẵn). Favicon: thay `public/favicon.svg`.

### Facebook
`src/config/brand.js` → `facebook: 'https://www.facebook.com/melbeetaybac'`.
Mọi nút "Nhắn tin qua Facebook" trên trang đều lấy link từ đây.
Mẹo: dùng `https://m.me/melbeetaybac` để mở thẳng khung chat Messenger.

### Zalo — ⚠️ CẦN THAY
Hiện đang là placeholder `https://zalo.me/PLACEHOLDER` (bấm vào sẽ không tới đâu).
Đổi trong `src/config/brand.js`:

```js
zalo: 'https://zalo.me/0912345678', // số điện thoại Zalo hoặc link Zalo OA
```

### Thông tin liên hệ
`brand.contact` trong `src/config/brand.js`. Để `null` → footer hiện "Đang cập nhật".
Không điền thông tin giả.

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
| Nguồn gốc (bản đồ, núi, hoa, nuôi ong) | `public/assets/images/origin/` | `map.jpg`, `mountain.jpg`, `flowers.jpg`, `beekeeping.jpg` |
| Quy trình | `public/assets/images/process/` | `01-mua-hoa.jpg` … `05-dong-chai.jpg` |
| Lifestyle | `public/assets/images/lifestyle/` | `water.jpg`, `tea.jpg`, `food.jpg`, `gift.jpg` |
| Gallery | `public/assets/images/gallery/` | `01.jpg` … `08.jpg` |
| Logo, icon | `public/assets/icons/` | — |

Ảnh `.jpg`, `.jpeg`, `.png`, `.webp`, `.svg` đều dùng được. Nên nén ảnh (≤ 400KB/ảnh) trước khi đưa lên.
Ảnh mạng xã hội khi chia sẻ link: `public/og-image.jpg` (1200×630).

### Gallery
`gallery.items` trong `src/data/sections.js`. Mỗi ảnh có `size`: `normal`, `tall` (cao gấp đôi) hoặc
`wide` (rộng gấp đôi) để tạo bố cục kiểu tạp chí. Bấm ảnh mở lightbox (← → Esc, vuốt trên điện thoại).

### Câu chuyện, nguồn gốc, quy trình, lifestyle
Đều nằm trong `src/data/sections.js` (`story`, `origin`, `process.steps`, `whyUs`, `lifestyle`).
Quy trình thêm/bớt bước: thêm/xoá object trong `process.steps`.

### Chia sẻ khách hàng
`src/data/testimonials.js`. Hiện là **nội dung giữ chỗ** ("Khách hàng 01"…). Chỉ thay bằng chia sẻ thật,
có sự đồng ý của khách — không bịa tên hay nhận xét.

---

## Đổi màu & font

`src/styles/variables.css`:

```css
--honey:  #c88a24;  /* vàng mật ong — nút, điểm nhấn */
--forest: #24352a;  /* xanh rừng — khối "Nguồn gốc" */
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
  ở `Hero.css` (`slow-zoom`), số hạt phấn hoa `<Pollen count={40} />`.
- Con trỏ con ong: `src/components/Cursor/` — ong vỗ cánh, quay đầu theo hướng chuột; lướt qua ảnh hiện
  nhãn "VIEW" (gắn `data-cursor="view"` lên phần tử bất kỳ), lướt qua nút thì ong to lên.
  Chỉ bật trên máy có chuột, tự tắt trên điện thoại. Không muốn dùng: xoá `<Cursor />` trong `src/App.jsx`.
- Người dùng bật *Reduce motion* trong hệ điều hành → hiệu ứng phức tạp tự tắt.

---

## Cấu trúc

```
src/
├── config/brand.js          tên, logo, Facebook, Zalo, liên hệ
├── data/
│   ├── products.js          sản phẩm
│   ├── testimonials.js      chia sẻ khách hàng
│   └── sections.js          chữ & ảnh của từng phần, menu
├── components/
│   ├── Navbar/  Hero/  Intro/  ProductShowcase/  ProductCard/  ProductModal/
│   ├── BrandStory/  OriginSection/  ProcessTimeline/  WhyUs/  Lifestyle/
│   ├── Gallery/  Lightbox/  Testimonials/  CTA/  Footer/  Cursor/
│   ├── Art/                 hình minh hoạ SVG (dùng khi chưa có ảnh thật)
│   └── common/              nút, ảnh, menu đặt hàng, tiêu đề section…
├── hooks/                   useScrollReveal, useMediaQuery, useLockBody
├── styles/                  variables.css (màu, font) + globals.css
├── App.jsx                  thứ tự các phần
└── main.jsx
```
