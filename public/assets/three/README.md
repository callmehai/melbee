# Asset cho lớp Three.js

Hiện **không cần file nào ở đây**: mọi hình trong lớp Three.js đều được vẽ bằng code
(phấn hoa, cánh hoa, ong, giọt mật, sương, núi xa, tia nắng). Trang không tải texture lớn nào.

Thư mục để sẵn cho sau này:

```
bees/         sprite ong (nếu muốn thay ong vẽ bằng code)
flowers/      texture cánh hoa
textures/     noise, grain, honey
environment/  ảnh môi trường (HDR/JPG) cho chế độ MeshPhysicalMaterial
```

Muốn dùng một texture: đặt file vào đây, rồi tải trong hiệu ứng tương ứng ở `src/three/effects/`
bằng `asset('assets/three/...')` (từ `src/lib/assets.js`) để đường dẫn đúng trên GitHub Pages.
Giữ mỗi file nhỏ (≤ 200KB, PNG/WebP).
