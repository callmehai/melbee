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
// chỉ set đã có ảnh chụp cả set (bản vẽ kỹ thuật có ghi số đo, không hợp làm quảng cáo)
const sets = giftBoxes.filter((b) => b.photoSet);
const SLATS = 8; // số nan của bảng lật

/**
 * Bảng hộp quà ở trang Sản phẩm — kiểu biển quảng cáo lật nan quanh sân bóng: cứ 5 giây ảnh set mới
 * trượt lên theo từng nan dọc (so le trái → phải, phẳng — không xoay 3D nên ảnh không méo); khung đứng yên, chữ cũ mờ đi, chữ mới
 * trồi lên từng dòng. Dừng khi đang chọn bằng bàn phím / bảng ra khỏi màn hình / tab ẩn /
 * bấm nút tạm dừng; máy bật "giảm chuyển động" thì không tự chuyển, bấm thì chỉ mờ chéo.
 */
export default function GiftBand() {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState(null); // set vừa lật đi (đang chạy hiệu ứng)
  const [hover, setHover] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabShown, setTabShown] = useState(() => !document.hidden);
  const visible = inView && tabShown;
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const ref = useRef(null);
  const paused = hover || stopped || !visible || reduced || sets.length < 2;

  const go = (next) => {
    if (next === i) return;
    setPrev(i);
    setI(next);
  };

  useEffect(() => {
    const el = ref.current;
    // trong khung nhìn và tab đang hiện là hai việc riêng: mở trang ở tab nền rồi quay lại thì bảng phải tự chạy
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.4,
    });
    const onVis = () => setTabShown(!document.hidden);
    io.observe(el);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // tải sẵn ảnh các set khi bảng hiện ra → lúc lật nan không bị chớp trắng
  useEffect(() => {
    if (!visible) return;
    sets.forEach((b) => {
      const im = new Image();
      im.src = asset(b.photoSet);
    });
  }, [visible]);

  const url = (k) => `url("${asset(sets[k].photoSet)}")`;
  const flipping = prev !== null && !reduced;

  return (
    <section
      className={`giftband${paused ? " is-paused" : ""}${reduced ? " is-still" : ""}`}
      aria-roledescription="bảng quảng cáo"
      aria-label="Hộp quà MelBee"
      onFocus={(e) => e.target.matches(":focus-visible") && setHover(true)}
      onBlur={(e) =>
        !e.currentTarget.contains(e.relatedTarget) && setHover(false)
      }
    >
      <div className="giftband__panel" ref={ref}>
        <div className="giftband__img" style={{ "--n": SLATS }}>
          {flipping ? (
            <div className="giftband__slats" key={`${prev}-${i}`} aria-hidden="true">
              <img className="giftband__old" src={asset(sets[prev].photoSet)} alt="" />
              {Array.from({ length: SLATS }, (_, k) => (
                <span key={k} className="giftband__slat" style={{ "--k": k }}>
                  <i
                    style={{ backgroundImage: url(i) }}
                    onAnimationEnd={() => k === SLATS - 1 && setPrev(null)}
                  />
                </span>
              ))}
            </div>
          ) : (
            <img
              key={i}
              src={asset(sets[i].photoSet)}
              alt={`${sets[i].set} MelBee "${sets[i].title}", ${sets[i].name}`}
              decoding="async"
              onAnimationEnd={() => setPrev(null)}
            />
          )}
        </div>

        {/* chữ các set chồng trong một ô lưới → khung cao bằng set dài nhất, không nhảy khi đổi */}
        <div className="giftband__bodies">
          {sets.map((b, k) => {
            const state = k === i ? " is-on" : k === prev ? " is-off" : "";
            return (
              <div
                key={b.id}
                className={`giftband__body${state}`}
                aria-hidden={k !== i}
                inert={k !== i}
              >
                <p className="eyebrow" style={{ "--d": 0 }}>
                  {b.set} · {b.name}
                </p>
                <h2 className="giftband__title" style={{ "--d": 1 }}>
                  {b.title}
                </h2>
                <ul className="giftband__jars" style={{ "--d": 2 }}>
                  {b.preset.map((id, j) => (
                    <li key={j}>
                      {short(id)} <small>{b.slots[j]}</small>
                    </li>
                  ))}
                </ul>
                <p className="giftband__price" style={{ "--d": 3 }}>
                  <b>{vnd(b.price)}</b>
                  <span>trọn bộ, gồm hộp cứng và túi giấy</span>
                </p>
                <div style={{ "--d": 4 }}>
                  <Button href={page(`hop-qua/?set=${b.id}`)} variant="light">
                    Xem {b.set}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
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
