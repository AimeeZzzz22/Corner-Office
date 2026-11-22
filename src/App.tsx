import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Office from './Office';
import { COMPANIES, COWORKERS, CompanyId, CoworkerId, HEART_POINTS, TASK_TYPES, TaskType, XP_TO_NEXT, pay } from './data';
import { Order, Result, Save, fresh, load, newTray, store, wipe } from './state';
import { play, setSound } from './sfx';
import { Badge, Booth, Offer, Quiz, TourCard, Vibe } from './Onboarding';
import DeskView, { WorkScene } from './Desk';
import { DEFAULT_LOOK, Parts, compose, loadParts } from './look';
import { TOUR } from './obdata';
import Computer from './Tasklet';
import Shop, { BOX_DAY_MAX, addMinutes, piggyToday } from './BlindBox';
import VibeGallery from './VibeGallery';
import { AvatarStack, MailLetter, PullSummary, WeekRecap, thisWeek, weekKey } from './ui';
import type { Note } from './state';
import { Bakery, Fridge } from './Bakery';
import { FORTUNES, FRIDGE, fridgeToday, treat, treatsToday } from './treats';
import { Unwrap } from './Desk';
import { freeSlot } from './deskSlots';
import type { Tile } from './Office';

const A = `${import.meta.env.BASE_URL}assets/`;
const mmss = (ms: number) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
const Head = ({ id, size = 56 }: { id: CoworkerId; size?: number }) => <span className="head" style={{ width: size, height: size }}><img src={`${A}heads/${id}.png`} alt="" /></span>;
const Coin = () => <img className="coin" src={`${A}coin.png`} alt="" />;

function Hearts({ points }: { points: number }) {
  const full = Math.floor(points / HEART_POINTS);
  return <span className="hearts">{Array.from({ length: 10 }, (_, i) => <img key={i} src={`${A}${i < full ? 'heart' : 'heart_empty'}.png`} alt="" />)}</span>;
}

export default function App() {
  const [s, setS] = useState<Save>(load);
  const [now, setNow] = useState(Date.now());
  const [menu, setMenu] = useState<CoworkerId | null>(null);
  const [chat, setChat] = useState(false);
  const [settings, setSettings] = useState(false);
  const [pcOpen, setPcOpen] = useState(false);      // the computer, opened from the desk view
  const [fromDesk, setFromDesk] = useState(false);  // the current order was taken at the desk (so it goes back there after)
  const [backAt, setBackAt] = useState<Tile | undefined>(undefined);   // back from the desk: the player stands beside it
  const [goDesk, setGoDesk] = useState(0);
  const [shop, setShop] = useState<null | 'shop' | 'blind'>(() => (typeof location !== 'undefined' && location.hash === '#blindbox' ? 'blind' : null));   // the shop (and its blind boxes)
  const [spot, setSpot] = useState<null | 'food' | 'fridge' | 'surprise'>(null);   // the bakery menu, the fridge, or the welcome gift
  // the fridge gets a fresh roll each day: on some days there's a little treat in it
  useEffect(() => { if (s.fridge.day !== new Date().toDateString()) up({ fridge: fridgeToday(s.fridge) }); }, [s.phase]);
  const [vibes, setVibes] = useState(() => typeof location !== 'undefined' && location.hash === '#vibes');   // the work vibe gallery
  const [mail, setMail] = useState(false);       // reading the letter on top of the mail pile
  const [week, setWeek] = useState(false);       // the weekly recap
  const [tray, setTray] = useState(false);       // the result screen's peek tray
  // payday: from Friday on, an envelope with a little extra (10% of the week's coins) arrives once a week
  const payday = (force = false) => setS((o) => {
    const wk = weekKey(), day = new Date().getDay();
    if (!force && (o.payWeek === wk || !(day === 5 || day === 6 || day === 0) || o.notes.some((n) => n.kind === 'payday'))) return o;
    const earned = thisWeek(o.history).reduce((a, h) => a + h.coins, 0); if (!force && !earned) return o;
    return { ...o, payWeek: wk, notes: [...o.notes, { id: Date.now(), kind: 'payday', from: null, level: 0, coins: Math.max(10, Math.round(earned * 0.1 / 5) * 5), week: wk }] };
  });
  useEffect(() => { if (s.phase === 'free') payday(); }, [s.phase]);
  const thanks = (who: CoworkerId, before: number, after: number): Note[] => Math.floor(after / HEART_POINTS) > Math.floor(before / HEART_POINTS)
    ? [{ id: Date.now(), kind: 'thanks', from: who, level: Math.floor(after / HEART_POINTS), coins: 0, week: weekKey() }] : [];
  const [tourReady, setTourReady] = useState(-1);   // the tour stop both have walked to; the dialog shows only then
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('left');
  const up = useCallback((p: Partial<Save>) => setS((o) => ({ ...o, ...p })), []);
  const co = COMPANIES[s.company], host = COWORKERS[co.host], myLabels = s.labelsBy[s.company] ?? null;
  const onLabels = useCallback((rows: string[], d: string[]) => { setCopied(false); setS((o) => ({ ...o, labelsBy: { ...o.labelsBy, [o.company]: rows.join() === d.join() ? undefined : rows } })); }, []);
  const setLabels = (rows: string[] | undefined) => setS((o) => ({ ...o, labelsBy: { ...o.labelsBy, [o.company]: rows } }));
  useEffect(() => { store(s); setSound(s.sound, s.quiz.sound === 'chime'); }, [s]);
  // the player's own look, built from character parts in the browser
  const [parts, setParts] = useState<Parts | null>(null);
  useEffect(() => { loadParts().then(setParts).catch(() => setParts(null)); }, []);
  const sheet = useMemo(() => (parts ? compose(parts, s.look) : null), [parts, s.look]);
  // tour stops are zones drawn on the Tiled maps
  const [zones, setZones] = useState<Record<string, Record<string, [number, number, number, number]>> | null>(null);
  useEffect(() => { fetch(`${A}ob/zones.json`).then((r) => r.json()).then(setZones).catch(() => {}); }, []);
  const stopZone = s.phase === 'tour' && zones ? zones[s.company][TOUR[s.company][s.tourStop][0]] : null;
  const onboarding = s.phase === 'offer' || s.phase === 'tour' || s.phase === 'booth' || s.phase === 'badge' || s.phase === 'vibe' || s.phase === 'quiz' || s.phase === 'gifts';

  // fit the 1280x720 stage to the window
  const stage = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const fit = () => { const k = Math.min(window.innerWidth / 1280, window.innerHeight / 720); if (stage.current) stage.current.style.transform = `translate(-50%,-50%) scale(${k})`; };
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, []);

  // the timer runs on timestamps: it keeps counting through reloads and background tabs
  useEffect(() => {
    if (s.phase !== 'work') { document.title = 'Corner Office'; return; }
    const id = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(id);
  }, [s.phase]);
  const left = s.order ? s.order.endsAt - now : 0;
  useEffect(() => {
    if (s.phase !== 'work' || !s.order) return;
    const speed = s.fast ? 60 : 1;
    document.title = `${mmss(left * speed)} · Corner Office`;
    if (left <= 0) { play('times_up', 0.5); up({ phase: 'timesup' }); }
  }, [left, s.phase, s.order, s.fast, up]);

  const tap = () => play('ui_tap', 0.4);
  const openTray = () => { tap(); setMenu(null); setFromDesk(false); up({ phase: 'tray', picked: s.picked ?? { mins: s.tray[1].mins, who: s.tray[1].who, job: s.tray[1].job } }); };

  const start = (focus: string, type: TaskType, steps: string[]) => {
    const p = s.picked!; const job = p.who ? COWORKERS[p.who].jobs[p.job] : null;
    const startedAt = Date.now(), ms = (p.mins * 60000) / (s.fast ? 60 : 1);
    const order: Order = { mins: p.mins, who: p.who, jobTitle: job?.title ?? 'Custom time', doing: job ? `${job.doing} for ${COWORKERS[p.who!].name}...` : 'Working...',
      focus: focus.trim() || 'Focus time', type, steps: steps.filter((t) => t.trim()).map((text) => ({ text, done: false })), startedAt, endsAt: startedAt + ms };
    play('order_start'); setNow(startedAt); up({ order, phase: 'work', firstOrder: false });
  };

  // Finished: coins, XP and 1 point (1/10 heart). Stopping: coins and XP for the time worked, no heart.
  const end = (finished: boolean) => {
    const o = s.order!; const total = o.endsAt - o.startedAt;
    const worked = Math.min(o.mins, Math.floor((Math.min(Date.now(), o.endsAt) - o.startedAt) / total * o.mins));
    const reward = finished ? pay(o.mins) : worked >= o.mins ? pay(o.mins) : Math.floor(pay(o.mins) * (worked / o.mins) / 5) * 5;
    const before = o.who ? s.hearts[o.who] : 0, after = finished && o.who ? before + 1 : before;
    // today's treats: iced coffee +50% coins on the first finished order, strawberry milk +10% XP, matcha +10 piggy minutes
    const tt = treatsToday(s.treats), bonus: string[] = []; let coins = reward, xp = reward, extraMins = 0; const used = [...tt.used];
    if (finished && tt.have.includes('iced_coffee') && !used.includes('iced_coffee')) { coins = Math.round(reward * 1.5); used.push('iced_coffee'); bonus.push(`Iced coffee: +${coins - reward} coins`); }
    if (finished && tt.have.includes('strawberry_milk')) { xp = Math.round(reward * 1.1); bonus.push(`Strawberry milk: +${xp - reward} XP`); }
    if (finished && tt.have.includes('matcha_latte')) { extraMins = 10; bonus.push('Matcha latte: +10 piggy bank minutes'); }
    const result: Result = { finished, coins, xp, who: o.who, heartBefore: before, heartAfter: after, minutes: worked, bonus };
    play(finished ? 'order_finished' : 'stopping_here'); if (finished && reward) setTimeout(() => play('coins_many', 0.5), 350);
    if (after > before) setTimeout(() => play(Math.floor(after / HEART_POINTS) > Math.floor(before / HEART_POINTS) ? 'heart_level' : 'heart_pop', 0.5), 800);
    const past = { at: Date.now(), mins: o.mins, worked, who: o.who, job: o.jobTitle, focus: o.focus, type: o.type, finished, coins, xp, steps: o.steps.length, stepsDone: o.steps.filter((x) => x.done).length };
    setTray(false); up({ phase: 'result', result, order: null, notes: o.who ? [...s.notes, ...thanks(o.who, before, after)] : s.notes, blind: finished ? addMinutes(s.blind, o.mins + extraMins) : s.blind, treats: { ...tt, used }, history: [...s.history, past].slice(-200), coins: s.coins + coins, xp: s.xp + xp, tray: newTray(s.company), picked: null,
      hearts: o.who ? { ...s.hearts, [o.who]: after } : s.hearts, ordersDone: finished && o.who ? { ...s.ordersDone, [o.who]: s.ordersDone[o.who] + 1 } : s.ordersDone });
  };

  const [menuX, setMenuX] = useState(0);
  const onCoworker = useCallback((id: CoworkerId | null, x?: number) => { setMenu(id); setChat(false); if (id) { setMenuX(x ?? 0); play('ui_tap', 0.4); } }, []);
  const name = s.name || 'Juniper';
  const inOffice = s.phase === 'free' || s.phase === 'tray' || (s.phase === 'focus' && !fromDesk) || s.phase === 'tour';

  return (
    <div className={`stage co-${s.company}`} ref={stage}>
      {inOffice && <Office key={s.company} co={co} onCoworker={onCoworker} frozen={s.phase !== 'free' || !!spot || !!shop} menu={menu} startAt={backAt} goDesk={goDesk} extras={{ fridge: !!s.fridge.item && s.fridge.day === new Date().toDateString(), surprise: s.surprise === 'waiting' }} onSpot={(k) => { play('ui_tap', 0.5); setMenu(null); setSpot(k); }} onPc={() => { play('ui_tap', 0.5); setMenu(null); up({ phase: 'desk' }); }} editing={editing} labels={myLabels} onLabels={onLabels} playerSheet={sheet} tour={stopZone ? { zone: stopZone, stop: s.tourStop } : null} onTourArrive={setTourReady} clockScale={s.fast ? 60 : 1} />}
      {(s.phase === 'work' || s.phase === 'timesup' || s.phase === 'result') && <WorkScene sheet={sheet} pet={s.pet} place={s.place} />}
      {s.phase === 'desk' && <DeskView s={s} sheet={sheet} up={up} mode="desk" openPc={() => setPcOpen(true)} leave={() => { setPcOpen(false); setBackAt([...co.pc.stand] as Tile); up({ phase: 'free' }); }} />}
      {s.phase === 'focus' && fromDesk && <DeskView s={s} sheet={sheet} up={up} mode="still" />}

      {!onboarding && !editing && (
        <div className="hud">
          <div className="hud-l"><div className="card hud-left"><div className="pix title">{co.name}</div><div className="sub">{co.role} I</div>
            <div className="xp"><span style={{ width: `${Math.min(100, (s.xp / XP_TO_NEXT) * 100)}%` }} /></div><div className="sub">{Math.min(s.xp, XP_TO_NEXT)} / {XP_TO_NEXT} XP to Intern II</div></div>
            <AvatarStack s={s} /></div>
          <div className="hud-r">
            {s.notes.length > 0 && <button className="card hud-mail" onClick={() => { tap(); setMenu(null); setMail(true); }} title="You have mail"><span className="hud-env" />{s.notes.length > 1 && <em>{s.notes.length}</em>}</button>}
            {treatsToday(s.treats).have.length > 0 && <div className="card hud-treats">{treatsToday(s.treats).have.map((k) => { const t = treat(k); return (
              <span key={k} className={treatsToday(s.treats).used.includes(k) ? 'used' : ''} title={`${t.name}${t.bonus ? `: ${t.bonus}` : ''}${treatsToday(s.treats).used.includes(k) ? ' (used today)' : ''}`}><img src={`${A}ob/treats/${k}.png`} alt={t.name} /></span>); })}</div>}
            <div className="card hud-right"><Coin /><b>{s.coins.toLocaleString()}</b></div>
            <button className="btn primary shop-btn" onClick={() => { tap(); setMenu(null); setShop('shop'); }}>🛍 Shop</button>
          </div>
        </div>
      )}
      {!onboarding && !editing && <button className="btn ghost settings-btn" onClick={() => { tap(); setSettings(!settings); }}>Settings</button>}
      {settings && (
        <div className="card settings">
          <label><input type="checkbox" checked={s.fast} disabled={s.phase === 'work'} onChange={(e) => up({ fast: e.target.checked })} /> Fast demo time (1 minute = 1 second)</label>
          <label><input type="checkbox" checked={s.sound} onChange={(e) => up({ sound: e.target.checked })} /> Sound</label>
          {s.phase === 'free' && <button className="btn ghost" onClick={() => { tap(); setEditing(true); setSettings(false); setMenu(null); }}>Edit walk labels</button>}
          {s.phase === 'free' && (() => { const other: CompanyId = s.company === 'stitchlight' ? 'moonpuff' : 'stitchlight'; return (
            <button className="btn ghost" onClick={() => { tap(); setMenu(null); setSettings(false); up({ company: other, tray: newTray(other), picked: null }); }}>Switch to {COMPANIES[other].name}</button>); })()}
          <button className="btn ghost" onClick={() => { tap(); setSettings(false); setMenu(null); setShop('blind'); }}>Blind pack test page</button>
          <button className="btn ghost" onClick={() => { tap(); setSettings(false); setVibes(true); }}>Work vibe gallery</button>
          <button className="btn ghost" onClick={() => { tap(); setSettings(false); payday(true); }}>Payday envelope (test)</button>
          <button className="btn ghost" onClick={() => { tap(); setSettings(false); const id = co.people[Math.floor(Math.random() * co.people.length)]; up({ notes: [...s.notes, { id: Date.now(), kind: 'thanks', from: id, level: Math.max(1, Math.floor(s.hearts[id] / HEART_POINTS)), coins: 0, week: weekKey() }] }); }}>Thank-you note (test)</button>
          <button className="btn ghost" onClick={() => { tap(); setSettings(false); up({ fridge: { day: new Date().toDateString(), item: FRIDGE[Math.floor(Math.random() * FRIDGE.length)].key, fortune: Math.floor(Math.random() * FORTUNES.length) } }); }}>Put a treat in the fridge (test)</button>
          {s.phase === 'free' && <button className="btn ghost" onClick={() => { tap(); setSettings(false); setMenu(null); up({ phase: 'offer', tourStop: 0, lookDone: false, desk: [], place: {}, look: { ...DEFAULT_LOOK }, pet: 'orange_cat', birthday: null, vibe: null, vibeDraws: 0, quiz: { focus: null, sound: null, reminders: null } }); }}>Replay onboarding</button>}
          <button className="btn ghost" onClick={() => { wipe(); setS(fresh()); setSettings(false); setMenu(null); }}>Reset the demo</button>
        </div>
      )}

      {s.phase === 'offer' && <Offer co={s.company} onDone={(n) => up({ name: n || 'Juniper', phase: 'booth', lookDone: false })} />}
      {s.phase === 'tour' && <TourCard ready={tourReady === s.tourStop} top={!!stopZone && stopZone[1] + stopZone[3] / 2 > 190} co={s.company} stop={s.tourStop} go={(i) => { setTourReady(-1); up({ tourStop: i }); }} skip={() => up({ phase: 'badge' })} done={() => up({ phase: 'badge' })} />}
      {s.phase === 'booth' && <Booth s={s} parts={parts} up={up} first={!s.lookDone} done={() => up(s.lookDone ? { phase: 'badge' } : { phase: 'tour', tourStop: 0, lookDone: true })} />}
      {s.phase === 'badge' && <Badge s={s} sheet={sheet} retake={() => up({ phase: 'booth' })} next={() => up({ phase: 'vibe' })} />}
      {s.phase === 'vibe' && <Vibe s={s} sheet={sheet} up={up} next={() => up({ phase: 'quiz' })} />}
      {s.phase === 'quiz' && <Quiz s={s} up={up} finish={() => {
        up({ phase: 'gifts', firstOrder: true, sound: s.quiz.sound !== 'silent' });
      }} />}

      {shop && <Shop s={s} up={up} tab={shop} close={() => setShop(null)} />}
      {spot === 'food' && s.phase === 'free' && <Bakery s={s} up={up} close={() => setSpot(null)} />}
      {spot === 'fridge' && s.phase === 'free' && <Fridge s={s} up={up} close={() => setSpot(null)} />}
      {spot === 'surprise' && s.phase === 'free' && <Unwrap id="smile_mug" close={() => setSpot(null)} done={(toDesk) => { play('coin', 0.5); setSpot(null);
        up({ surprise: 'opened', desk: s.desk.includes('smile_mug') ? s.desk : [...s.desk, 'smile_mug'], place: { ...s.place, smile_mug: toDesk ? freeSlot('smile_mug', s.place) : null } }); }} />}
      {s.phase === 'gifts' && <DeskView s={s} sheet={sheet} up={up} mode="gifts" />}
      {editing && s.phase === 'free' && (
        <div className={`card editor ${side}`}>
          <div className="between"><b>Walk labels</b><button className="chip" onClick={() => setSide(side === 'left' ? 'right' : 'left')}>Move panel ⇄</button></div>
          <div className="sub">Click a tile to change it. It cycles free → solid → tall.</div>
          <div className="key"><i style={{ background: '#5fc878' }} /> Free floor</div>
          <div className="key"><i style={{ background: '#e85a5a' }} /> Solid: can't walk here</div>
          <div className="key"><i style={{ background: '#ffd200' }} /> Tall: walk behind it</div>
          <div className="key"><i style={{ background: '#4a3c4a' }} /> Wall (fixed)</div>
          <div className="key"><i style={{ background: '#2a1f2a', width: 6 }} /> Thin wall: blocks only that edge</div>
          <div className="sub">{myLabels ? 'You have changed the labels. They are saved in this browser.' : "These are the map's own labels."}</div>
          <button className="btn ghost" disabled={!myLabels} onClick={() => { tap(); setLabels(undefined); setCopied(false); }}>Reset to the map's labels</button>
          <button className="btn ghost" disabled={!myLabels} onClick={() => { tap(); navigator.clipboard?.writeText(myLabels!.join('\n')).then(() => setCopied(true)).catch(() => setCopied(false)); }}>{copied ? 'Copied!' : 'Copy labels'}</button>
          {myLabels && <textarea readOnly value={myLabels.join('\n')} onFocus={(e) => e.currentTarget.select()} />}
          <button className="btn primary" onClick={() => { tap(); setEditing(false); }}>Done, try walking</button>
        </div>
      )}
      {s.phase === 'free' && !editing && (
        <>
          <PullSummary s={s} ready={piggyToday(s.blind).ready} earned={piggyToday(s.blind).earned} dayMax={BOX_DAY_MAX} treats={treatsToday(s.treats).have.map((k) => treat(k).name)} onWeek={() => setWeek(true)} />
          {!s.history.length && <div className="walk-hint">Click to walk · walk up to a coworker to talk · walk to your desk for orders</div>}
          <button className="btn primary new-order" onClick={() => { tap(); setGoDesk((n) => n + 1); }}>My desk</button>
          {menu && (
            <div className={menuX > 256 ? 'card menu left' : 'card menu'}>
              <div className="row"><Head id={menu} /><div><b>{COWORKERS[menu].name}</b><div className="sub">{COWORKERS[menu].role}</div><Hearts points={s.hearts[menu]} /></div></div>
              <div className="sub">{s.hearts[menu] % HEART_POINTS} / {HEART_POINTS} to the next heart · {name} finished {s.ordersDone[menu]} of their orders</div>
              {chat ? <div className="chat">“{COWORKERS[menu].chat}”</div> : <button className="opt" onClick={() => { tap(); setChat(true); }}><b>Chat</b><span>Say hi</span></button>}
              {(() => { const t = treatsToday(s.treats); return t.have.includes('macaron_tower') && !t.used.includes('macaron_tower')
                ? <button className="opt" onClick={() => { play('heart_pop', 0.5); up({ hearts: { ...s.hearts, [menu]: s.hearts[menu] + 2 }, treats: { ...t, used: [...t.used, 'macaron_tower'] }, notes: [...s.notes, ...thanks(menu, s.hearts[menu], s.hearts[menu] + 2)] }); }}><b>Share your macarons</b><span>+2 friendship points</span></button>
                : <button className="opt" disabled><b>Give a gift</b><span>No gifts in the pack yet</span></button>; })()}
              <button className="opt" onClick={openTray}><b>Take an order</b><span>Opens {name}'s order tray</span></button>
            </div>
          )}
        </>
      )}

      {pcOpen && s.phase === 'desk' && <Computer s={s} name={name} openShop={(t) => { setShop(t); }} close={() => setPcOpen(false)} take={(p) => { setPcOpen(false); setFromDesk(true); up({ phase: 'focus', picked: p }); }} />}
      {s.phase === 'tray' && <Tray s={s} name={name} pick={(p) => { tap(); up({ picked: p }); }} back={() => { tap(); up({ phase: 'free' }); }} next={() => { tap(); up({ phase: 'focus' }); }} />}
      {s.phase === 'focus' && s.picked && <Focus s={s} name={name} back={() => { tap(); if (fromDesk) { setPcOpen(true); up({ phase: 'desk' }); } else up({ phase: 'tray' }); }} start={start} />}

      {s.phase === 'work' && s.order && (
        <>
          <div className="doodle"><span>{s.order.doing}</span></div>
          <div className="card focus-card">
            <div className="label">Your focus</div><div className="big">{s.order.focus}</div>
            <div className="fill-row time" style={{ ['--pct' as string]: `${Math.min(100, ((now - s.order.startedAt) / (s.order.endsAt - s.order.startedAt)) * 100)}%` }}><b className="pix">{mmss(left * (s.fast ? 60 : 1))}</b><span>left of {s.order.mins} min</span></div>
            {s.order.steps.length > 0 && (() => { const n = s.order.steps.length, d = s.order.steps.filter((x) => x.done).length; return (
              <div key={d === n ? 'all' : 'some'} className={`fill-steps${d === n ? ' all' : ''}`} style={{ ['--pct' as string]: `${(d / n) * 100}%` }}>
                <div className="fill-head"><b>Small steps</b><span>{d === n ? 'All done ✦' : `${d} of ${n}`}</span></div>
                {s.order.steps.map((st, i) => (
                  <label key={i} className={st.done ? 'step done' : 'step'}><input type="checkbox" checked={st.done} onChange={() => { tap(); up({ order: { ...s.order!, steps: s.order!.steps.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) } }); }} /> {st.text}</label>
                ))}
              </div>); })()}
            <button className="btn ghost" onClick={() => { tap(); up({ phase: 'timesup' }); }}>Stop early</button>
          </div>
          <div className="card caption">{name} works on the order at the desk while you focus on your own task.</div>
        </>
      )}

      {s.phase === 'timesup' && s.order && (
        <div className="card side">
          <div className="pix h1">{left <= 0 ? "Time's up!" : 'Stopping early?'}</div>
          <div className="sub">How did “{s.order.focus}” go?</div>
          {left <= 0 ? (
            <><button className="btn primary" onClick={() => end(true)}>Finished!</button>
              <div className="reward"><Coin /> +{pay(s.order.mins)} coins · +{pay(s.order.mins)} XP{s.order.who ? ' · +1/10 heart' : ''}</div></>
          ) : <button className="btn primary" onClick={() => { tap(); up({ phase: 'work' }); }}>Keep going</button>}
          <button className="btn ghost" onClick={() => end(false)}>Stopping here</button>
          <div className="sub">You keep the coins and XP for the time worked.</div><div className="note">No heart this time. Nothing else is lost.</div>
        </div>
      )}

      {s.phase === 'result' && s.result && (
        <div className="result-wrap"><div className="card side">
          <div className="pix h1">{s.result.finished ? 'Nice work!' : 'Good stopping point'}</div>
          <div className="sub">{s.result.finished ? `${name} finished the order.` : `${name} wrapped up after ${s.result.minutes} min.`}</div>
          <div className="gain"><Coin /><span className="pix">+{s.result.coins}</span><span className="pix xpgain">+{s.result.xp} XP</span></div>
          {!!s.result.bonus?.length && <div className="bonus-list">{s.result.bonus.map((b) => <span key={b}>✦ {b}</span>)}</div>}
          {s.result.who && s.result.heartAfter > s.result.heartBefore && (
            <div className="pill"><Head id={s.result.who} size={40} /><div><b>{COWORKERS[s.result.who].name}</b> <em>+1</em>
              <div className="bar pink"><span style={{ width: `${((s.result.heartAfter % HEART_POINTS) / HEART_POINTS) * 100 || 100}%` }} /></div></div>
              <span className="sub">{s.result.heartAfter % HEART_POINTS || HEART_POINTS}/{HEART_POINTS}</span></div>
          )}
          <button className="btn primary" onClick={() => { tap(); up({ phase: fromDesk ? 'desk' : 'free', result: null }); }}>{fromDesk ? 'Back to my desk' : 'Back to the office'}</button>
        </div>
        {(() => { const b = piggyToday(s.blind), tt = treatsToday(s.treats), today = s.history.filter((h) => new Date(h.at).toDateString() === new Date().toDateString()); return (
          <div className={`peek${tray ? ' open' : ''}`}>
            <button className="peek-line" onClick={() => { tap(); setTray(!tray); }}><span>🐷 Piggy bank: {b.ready ? `${b.ready} pack${b.ready > 1 ? 's' : ''} ready` : `${Math.floor(b.mins)} / 60 min to the next pack`}</span><i>{tray ? '▴' : '▾'}</i></button>
            <div className="peek-body"><div>
              <div className="fill-pill small" style={{ ['--pct' as string]: `${(b.mins / 60) * 100}%` }}><span className="pix">{Math.floor(b.mins)} / 60 min</span><small>{b.earned} of {BOX_DAY_MAX} packs today</small></div>
              <div className="peek-row"><b>Today</b><span>{(() => { const n = today.filter((h) => h.finished).length; return `${n} order${n === 1 ? '' : 's'}`; })()} · {today.reduce((a, h) => a + h.worked, 0)} min · {today.reduce((a, h) => a + h.coins, 0)} coins</span></div>
              <div className="peek-row"><b>Treats</b><span>{tt.have.length ? tt.have.map((k) => `${treat(k).name}${tt.used.includes(k) ? ' (used)' : ''}`).join(', ') : 'None today'}</span></div>
              {b.ready > 0 && <button className="btn ghost" onClick={() => { tap(); setShop('blind'); }}>Open a pack</button>}
            </div></div>
          </div>); })()}
        </div>
      )}
      {mail && s.notes[0] && <MailLetter key={s.notes[0].id} note={s.notes[0]} name={name} s={s} keep={(n, wk) => {
        play(n.kind === 'payday' ? 'coins_many' : 'heart_pop', 0.5);
        const rest = s.notes.filter((x) => x.id !== n.id); up({ notes: rest, coins: s.coins + (n.kind === 'payday' ? n.coins : 0) });
        if (wk) { setMail(false); setWeek(true); } else if (!rest.length) setMail(false); }} />}
      {vibes && <VibeGallery sheet={sheet} who={name} close={() => setVibes(false)} />}
      {week && <WeekRecap s={s} name={name} close={() => setWeek(false)} />}
    </div>
  );
}

function Tray({ s, name, pick, back, next }: { s: Save; name: string; pick: (p: NonNullable<Save['picked']>) => void; back: () => void; next: () => void }) {
  const p = s.picked!; const custom = p.who === null;
  const [mins, setMins] = useState(custom ? p.mins : 45);
  const setCustom = (m: number) => { const v = Math.max(5, Math.min(120, m)); setMins(v); pick({ mins: v, who: null, job: 0 }); };
  return (
    <div className="dim"><div className="card panel">
      <div className="row"><Head id={COMPANIES[s.company].host} size={76} /><div><b>{COWORKERS[COMPANIES[s.company].host].name}</b> <span className="sub">{COWORKERS[COMPANIES[s.company].host].role}</span>
        <div>{s.firstOrder ? `${name}'s first work order is waiting.` : `Fresh orders for ${name}.`} {name} does the order while you focus on your own work.</div></div></div>
      <div className="between"><div className="pix h1">Pick {name}'s work order</div><div className="sub">The length is your focus time. The task is {name}'s job.</div></div>
      <div className="slips">
        {s.tray.map((t) => { const c = COWORKERS[t.who], on = !custom && p.mins === t.mins; return (
          <button key={t.mins} className={on ? 'slip on' : 'slip'} onClick={() => pick({ mins: t.mins, who: t.who, job: t.job })}>
            {s.quiz.focus === t.mins && <span className="suits">Suits you</span>}
            <div className="mins"><span className="pix">{t.mins}</span> min</div>
            <div className="for"><Head id={t.who} size={30} /><b>For {c.name}</b></div>
            <div className="job">{c.jobs[t.job].title}</div>
            <div className="reward"><Coin /> +{pay(t.mins)} coins · +{pay(t.mins)} XP</div>
          </button>); })}
      </div>
      <div className={custom ? 'custom on' : 'custom'}>
        <div><b>Or set your own time</b><div className="sub">5 to 120 minutes · no coworker, so no heart</div></div>
        <button className="sq" onClick={() => setCustom(mins - 5)}>−</button><div className="val">{mins} min</div><button className="sq" onClick={() => setCustom(mins + 5)}>+</button>
        {[10, 20, 45].map((q) => <button key={q} className={custom && mins === q ? 'chip on' : 'chip'} onClick={() => setCustom(q)}>{q} min</button>)}
        {custom && <div className="reward"><Coin /> +{pay(mins)} coins · +{pay(mins)} XP</div>}
      </div>
      <div className="between foot"><div><div className="note">Longer orders pay a little extra.</div><div className="sub">Stopping early still pays for the time worked, but adds no heart.</div></div>
        <div className="row"><button className="btn ghost" onClick={back}>Back to the office</button><button className="btn primary" onClick={next}>Take this order</button></div></div>
    </div></div>
  );
}

function Focus({ s, name, back, start }: { s: Save; name: string; back: () => void; start: (focus: string, type: TaskType, steps: string[]) => void }) {
  const p = s.picked!; const c = p.who ? COWORKERS[p.who] : null;
  const [focus, setFocus] = useState(''); const [type, setType] = useState<TaskType>('Reading'); const [steps, setSteps] = useState(['', '', '']);
  return (
    <div className="dim"><div className="card panel">
      <div className="row"><Head id={COMPANIES[s.company].host} size={76} /><div><b>{COWORKERS[COMPANIES[s.company].host].name}</b> <span className="sub">{COWORKERS[COMPANIES[s.company].host].role}</span><div>Nice pick. {name} handles the order. What will you focus on meanwhile?</div></div></div>
      <div className="pix h1">Set your focus</div>
      <div className="cols">
        <div className="slip on fixed"><div className="mins"><span className="pix">{p.mins}</span> min</div>
          {c ? <><div className="for"><Head id={c.id} size={30} /><b>For {c.name}</b></div><div className="job">{c.jobs[p.job].title}</div></> : <div className="job">Custom time</div>}
          <div className="reward"><Coin /> +{pay(p.mins)} coins · +{pay(p.mins)} XP</div></div>
        <div className="form">
          <b>What will you focus on in real life?</b>
          <input className="field" autoFocus maxLength={60} placeholder="Read chapter 3" value={focus} onChange={(e) => setFocus(e.target.value)} />
          <b>What kind of task is it?</b>
          <div className="chips">{TASK_TYPES.map((t) => <button key={t} className={t === type ? 'chip on' : 'chip'} onClick={() => setType(t)}>{t}</button>)}</div>
          <div className="info">{c ? <><Head id={c.id} size={32} /> {name} does this order for {c.name} while you focus. Finishing adds 1/10 heart.</> : <>A custom-time order has no coworker, so it adds no heart.</>}</div>
          <b>Small steps <span className="sub">optional</span></b>
          {steps.map((st, i) => <input key={i} className="field small" maxLength={50} placeholder="Add a step" value={st} onChange={(e) => setSteps(steps.map((x, j) => (j === i ? e.target.value : x)))} />)}
        </div>
      </div>
      <div className="between foot"><button className="btn ghost" onClick={back}>Back to orders</button><button className="btn primary" onClick={() => start(focus, type, steps)}>Start focusing</button></div>
    </div></div>
  );
}
