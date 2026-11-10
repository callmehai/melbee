import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import Button from "../common/Button.jsx";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { giftBoxes, honeys } from "../../data/catalog.js";
import { asset } from "../../lib/assets.js";
import { page } from "../../lib/site.js";
import "./GiftBand.css";

const vnd = (n) => `${n.toLocaleString("vi-VN")} ₫`;
const short = (id) => honeys.find((h) => h.id === id).short;
// chỉ set đã có ảnh chụp cả set (bản vẽ kỹ thuật có ghi số đo, không hợp làm quảng cáo); có ảnh Set 3 là tự vào bảng
const sets = giftBoxes.filter((b) => b.photoSet);

/**
 * Bảng hộp quà ở trang Sản phẩm — kiểu biển quảng cáo quanh sân bóng: cứ 5 giây cả tấm bảng lật lên
 * (xoay như khối hộp), mặt mới là set khác: ảnh, các lọ, giá trọn bộ, nút mở đúng set ở trang Hộp quà.
 * Dừng khi rê chuột / đang chọn bằng bàn phím / bảng ra khỏi màn hình / tab ẩn / bấm nút tạm dừng;
 * máy bật "giảm chuyển động" thì không tự chuyển, chỉ đổi khi bấm.
 */
export default function GiftBand() {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState(null); // mặt đang lật đi
  const [hover, setHover] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const ref = useRef(null);
  const paused = hover || stopped || !visible || reduced || sets.length < 2;

  const go = (next) => {
    if (next === i) return;
    setPrev(i);
    setI(next);
  };

  // khối hộp xoay quanh tâm nằm sau mặt bảng nửa chiều cao → cần chiều cao thật
  useEffect(() => {
    const el = ref.current;
    const ro = new ResizeObserver(([e]) =>
      el.style.setProperty("--h", `${e.contentRect.height}px`),
    );
    const io = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting && !document.hidden),
      { threshold: 0.4 },
    );
    const onVis = () => setVisible((v) => v && !document.hidden);
    ro.observe(el);
    io.observe(el);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <section
      className={`giftband${paused ? " is-paused" : ""}${reduced ? " is-still" : ""}`}
      aria-roledescription="bảng quảng cáo"
      aria-label="Hộp quà MelBee"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={(e) => e.target.matches(":focus-visible") && setHover(true)}
      onBlur={(e) =>
        !e.currentTarget.contains(e.relatedTarget) && setHover(false)
      }
    >
      <div className="giftband__deck" ref={ref}>
        {sets.map((b, k) => {
          const img = b.photoSet;
          const state = k === i ? " is-on" : k === prev ? " is-off" : "";
          return (
            <article
              key={b.id}
              className={`giftband__slide${state}`}
              aria-hidden={k !== i}
              inert={k !== i}
              onAnimationEnd={() => k === prev && setPrev(null)}
            >
              <div
                className="giftband__img"
                style={{ "--bg": `url("${asset(img)}")` }}
              >
                <img
                  src={asset(img)}
                  alt={`${b.set} MelBee, ${b.name}`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="giftband__body">
                <p className="eyebrow">Hộp quà · {b.set}</p>
                <h2 className="giftband__title">{b.name}</h2>
                <ul className="giftband__jars">
                  {b.preset.map((id, j) => (
                    <li key={j}>
                      {short(id)} <small>{b.slots[j]}</small>
                    </li>
                  ))}
                </ul>
                <p className="giftband__price">
                  <b>{vnd(b.price)}</b>
                  <span>trọn bộ, gồm hộp cứng và túi giấy</span>
                </p>
                <Button href={page(`hop-qua/?set=${b.id}`)} variant="light">
                  Xem {b.set}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {sets.length > 1 && (
        <div className="giftband__ctrl">
          <div className="giftband__dots" role="group" aria-label="Chọn set">
            {sets.map((b, k) => (
              <button
                key={b.id}
                type="button"
                aria-pressed={k === i}
                onClick={() => go(k)}
              >
                <span>{b.set}</span>
                {/* vạch chạy 5 giây (CSS) của set đang hiện — chạy hết thì lật sang set sau; tạm dừng = dừng vạch */}
                <i aria-hidden="true">
                  <b
                    key={k === i ? `on-${i}` : "off"}
                    onAnimationEnd={() => k === i && go((i + 1) % sets.length)}
                  />
                </i>
              </button>
            ))}
          </div>
          {!reduced && (
            <button
              type="button"
              className="giftband__pause"
              onClick={() => setStopped((s) => !s)}
              aria-label={stopped ? "Tự chuyển set" : "Tạm dừng tự chuyển"}
            >
              {stopped ? <Play size={15} /> : <Pause size={15} />}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
