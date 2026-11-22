import { useEffect, useState } from 'react';
import { COMPANIES } from './data';
import { Save } from './state';
import { play } from './sfx';
import { Item, ItemPic, loadItems } from './BlindBox';
import { BAKERY, FORTUNES, treat, treatsToday } from './treats';

const tap = () => play('ui_tap', 0.4);
const COIN = `${import.meta.env.BASE_URL}assets/coin.png`;
function usePics() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => { loadItems().then((d) => setItems(d.items)).catch(() => {}); }, []);
  return (id: string) => items.find((i) => i.id === id);
}

// ---------------- the treat counter: Bobbin Bakery at Stitchlight, the kitchen counter at Moonpuff ----------------
export function Bakery({ s, up, close }: { s: Save; up: (p: Partial<Save>) => void; close: () => void }) {
  const pic = usePics(), t = treatsToday(s.treats), where = COMPANIES[s.company].food.name;
  const buy = (key: string, price: number) => {
    if (s.coins < price || t.have.includes(key)) return;
    play('purchase', 0.5); up({ coins: s.coins - price, treats: { ...t, have: [...t.have, key] } });
  };
  return (
    <div className="dim"><div className="card bakery">
      <div className="between"><div className="pix h1">{where}</div><button className="bb-x" onClick={() => { tap(); close(); }} aria-label="Close">✕</button></div>
      <div className="sub">A treat lasts for today. It sits on your desk, and its bonus works until the day ends.</div>
      <div className="bakery-list">
        {BAKERY.map((b) => { const it = pic(b.id), got = t.have.includes(b.key), used = t.used.includes(b.key); return (
          <div key={b.key} className={got ? 'bakery-item got' : 'bakery-item'}>
            <div className="bakery-pic">{it && <ItemPic it={it} size={64} />}</div>
            <div className="bakery-what"><b>{b.name}</b><span className="sub">{b.line}</span><span className="bakery-bonus">✦ {b.bonus}</span></div>
            {got ? <span className="pc-res ok">{used ? 'Enjoyed today' : 'On your desk today'}</span>
              : <button className="btn primary shop-buy" disabled={s.coins < b.price!} onClick={() => buy(b.key, b.price!)}><img src={COIN} alt="" /> {b.price}</button>}
          </div>); })}
      </div>
      <div className="note">One of each a day. Tomorrow the cups are empty, and nothing is lost.</div>
    </div></div>
  );
}

// ---------------- the fridge: on some days there's a little free treat in it ----------------
export function Fridge({ s, up, close }: { s: Save; up: (p: Partial<Save>) => void; close: () => void }) {
  const pic = usePics(), key = s.fridge.item, tr = key ? treat(key) : null, it = tr ? pic(tr.id) : undefined;
  if (!tr) return null;
  const line = tr.key === 'fortune_cookie' ? `It says: "${FORTUNES[s.fridge.fortune % FORTUNES.length]}"` : tr.line;
  const take = () => { play('heart_pop', 0.5); const t = treatsToday(s.treats); up({ treats: { ...t, have: t.have.includes(tr.key) ? t.have : [...t.have, tr.key] }, fridge: { ...s.fridge, item: null } }); close(); };
  return (
    <div className="dim"><div className="card fridge-card">
      <div className="pix h1">Something in the fridge!</div>
      <div className="fridge-pic">{it && <ItemPic it={it} size={110} />}<div className="bb-orbit">{Array.from({ length: 6 }, (_, k) => <i key={k} style={{ ['--a' as string]: `${k * 60}deg` }} />)}</div></div>
      <b className="fridge-name">{tr.name}</b>
      <div className="sub">{line}</div>
      <div className="note">A little surprise. It's on the house, and it'll sit on your desk today.</div>
      <div className="row bb-btns"><button className="btn ghost" onClick={() => { tap(); close(); }}>Leave it for now</button><button className="btn primary" onClick={take}>Take it</button></div>
    </div></div>
  );
}
