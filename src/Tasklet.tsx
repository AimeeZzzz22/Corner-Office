import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MagnifyDock, TeamAccordion } from './ui';
import { piggyToday } from './BlindBox';
import { hhmm, officeClock, people, statusOf } from './clock';
import { COMPANIES, COWORKERS, CoworkerId, pay } from './data';
import { Save } from './state';
import { play } from './sfx';

const A = `${import.meta.env.BASE_URL}assets/`;
const tap = () => play('ui_tap', 0.4);
const Head = ({ id, size = 28 }: { id: CoworkerId; size?: number }) => <span className="head" style={{ width: size, height: size }}><img src={`${A}heads/${id}.png`} alt="" /></span>;
const when = (t: number) => {
  const d = new Date(t), now = new Date(), same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const y = new Date(now); y.setDate(now.getDate() - 1);
  const day = same(d, now) ? 'Today' : same(d, y) ? 'Yesterday' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${day} · ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

type Pick = NonNullable<Save['picked']>;
// The computer on the player's desk, seen from the chair: a desktop with the Tasklet app on it.
// Tasklet holds the new work orders and everything the character has done. Close the app to get back to the
// desktop; leave the computer to get back to the desk.
type Tab = 'new' | 'past' | 'team';
export default function Computer({ s, name, close, take, openShop }: { s: Save; name: string; close: () => void; take: (p: Pick) => void; openShop: (t: 'shop' | 'blind') => void }) {
  const [app, setApp] = useState<Tab | null>(null);
  const ready = piggyToday(s.blind).ready;
  const co = COMPANIES[s.company], os = s.company === 'stitchlight' ? 'Stitch Desk' : 'PuffOS';
  const clock = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="pc-dim">
      <div className="pc">
        <div className="pc-bezel">
          <div className="pc-screen">
            <div className="pc-top"><span className="pix">{os}</span><span>{name}'s desk · {co.name}</span><span>{clock}</span></div>
            <div className="pc-desktop">
              <button className="pc-icon" onClick={() => { tap(); setApp('new'); }}>
                <span className="pc-icon-img"><i /><i /><i /></span><span>Tasklet</span>{/* a number badge here is kept for later: messages from coworkers, not orders you haven't taken */}
              </button>
            </div>
            {app && <Tasklet key={app} s={s} name={name} tab0={app} close={() => { tap(); setApp(null); }} take={take} />}
            <MagnifyDock open={(k) => (k === 'shop' || k === 'blind' ? openShop(k) : setApp(k as Tab))} apps={[
              { key: 'new', label: 'Tasklet', icon: '📥', bg: '#f6d37a', badge: s.tray.length },
              { key: 'team', label: 'Coworkers', icon: '👥', bg: '#a7d8b8' },
              { key: 'past', label: 'Past orders', icon: '🗂', bg: '#b9c7f2' },
              { key: 'blind', label: 'Blind packs', icon: '🎁', bg: '#d9c6f4', badge: ready },
              { key: 'shop', label: 'Shop', icon: '🛍', bg: '#f6b9cb' },
            ]} />
          </div>
        </div>
        <div className="pc-stand" />
      </div>
      <button className="btn ghost pc-leave" onClick={() => { tap(); close(); }}>← Leave the computer</button>
    </div>
  );
}

function Tasklet({ s, name, close, take, tab0 }: { s: Save; name: string; close: () => void; take: (p: Pick) => void; tab0: Tab }) {
  const [tab, setTab] = useState<Tab>(tab0);
  const [own, setOwn] = useState(25);
  const [filter, setFilter] = useState<'all' | CoworkerId>('all');
  const co = COMPANIES[s.company];
  const past = useMemo(() => [...s.history].reverse().filter((h) => filter === 'all' || h.who === filter), [s.history, filter]);
  const done = s.history.filter((h) => h.finished).length, mins = s.history.reduce((a, h) => a + h.worked, 0), coins = s.history.reduce((a, h) => a + h.coins, 0);
  return (
            <div className="pc-win">
              <div className="pc-title"><i /><i /><i /><b>Tasklet</b><button className="pc-x" onClick={close} aria-label="Close Tasklet">✕</button></div>
              <div className="pc-body">
                <div className="pc-side">
                  <SideBlob tab={tab} />
                  <button data-t="new" className={tab === 'new' ? 'on' : ''} onClick={() => { tap(); setTab('new'); }}>📥 New orders <em>{s.tray.length}</em></button>
                  <button data-t="past" className={tab === 'past' ? 'on' : ''} onClick={() => { tap(); setTab('past'); }}>🗂 Past orders <em>{s.history.length}</em></button>
                  <button data-t="team" className={tab === 'team' ? 'on' : ''} onClick={() => { tap(); setTab('team'); }}>👥 Coworkers</button>
                  <div className="pc-stats">
                    <div><b>{done}</b><span>finished</span></div>
                    <div><b>{mins >= 60 ? `${Math.floor(mins / 60)} hr${mins % 60 ? ` ${mins % 60} min` : ''}` : `${mins} min`}</b><span>focused</span></div>
                    <div><b>{coins.toLocaleString()}</b><span>coins earned</span></div>
                  </div>
                </div>
                <div className="pc-main">
                  {tab === 'new' && <>
                    <div className="pc-h">New orders for {name}</div>
                    <div className="sub">Pick one and set your focus. {name} does the order while you work on your own thing.</div>
                    <div className="pc-list">
                      {s.tray.map((t) => { const c = COWORKERS[t.who]; return (
                        <div key={t.mins} className="pc-row">
                          <div className="pc-mins pix">{t.mins}<small>min</small></div>
                          <Head id={t.who} size={34} />
                          <div className="pc-what"><b>{c.jobs[t.job].title}</b><span>For {c.name} · {c.role}</span></div>
                          {s.quiz.focus === t.mins && <span className="suits static">Suits you</span>}
                          <div className="pc-pay">+{pay(t.mins)} coins<br /><span>+1/10 heart</span></div>
                          <button className="btn primary pc-take" onClick={() => { tap(); take({ mins: t.mins, who: t.who, job: t.job }); }}>Take</button>
                        </div>); })}
                      <div className="pc-row own">
                        <div className="pc-mins pix">{own}<small>min</small></div>
                        <span className="head blank" style={{ width: 34, height: 34 }}>⏱</span>
                        <div className="pc-what"><b>Set your own time</b><span>5 to 120 minutes · no coworker, so no heart</span>
                          <span className="pc-steps"><button onClick={() => { tap(); setOwn(Math.max(5, own - 5)); }}>−</button><button onClick={() => { tap(); setOwn(Math.min(120, own + 5)); }}>+</button></span></div>
                        <div className="pc-pay">+{pay(own)} coins<br /><span>no heart</span></div>
                        <button className="btn primary pc-take" onClick={() => { tap(); take({ mins: own, who: null, job: 0 }); }}>Take</button>
                      </div>
                    </div>
                    <div className="sub">New orders arrive after each one you finish.</div>
                  </>}
                  {tab === 'team' && <><div className="between"><div className="pc-h">Coworkers</div><span className="sub">Click a strip to open it</span></div><TeamAccordion s={s} /></>}
                  {tab === 'past' && <>
                    <div className="between"><div className="pc-h">Past orders</div>
                      <select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | CoworkerId)}>
                        <option value="all">Everyone</option>{co.people.map((k) => <option key={k} value={k}>{COWORKERS[k].name}</option>)}
                      </select></div>
                    {!past.length && <div className="pc-empty">Nothing here yet. Finished and stopped orders show up here.</div>}
                    <div className="pc-list">
                      {past.map((h) => (
                        <div key={h.at} className="pc-row past">
                          <div className="pc-mins pix">{h.mins}<small>min</small></div>
                          {h.who ? <Head id={h.who} size={34} /> : <span className="head blank" style={{ width: 34, height: 34 }}>⏱</span>}
                          <div className="pc-what"><b>{h.job}</b><span>{h.who ? `For ${COWORKERS[h.who].name} · ` : ''}You: {h.focus}{h.steps ? ` · ${h.stepsDone}/${h.steps} steps` : ''}</span><small>{when(h.at)}</small></div>
                          <span className={h.finished ? 'pc-res ok' : 'pc-res'}>{h.finished ? 'Finished' : `Stopped at ${h.worked} min`}</span>
                          <div className="pc-pay">+{h.coins} coins<br /><span>{h.finished && h.who ? '+1/10 heart' : 'no heart'}</span></div>
                        </div>))}
                    </div>
                  </>}
                </div>
              </div>
            </div>
  );
}

// who's where right now: at their desk working, on a break, at lunch or in a meeting, and when they'll be free
const LABEL = { working: 'Working', break: 'On a break', lunch: 'At lunch', meeting: 'In a meeting' } as const;
function Team({ s }: { s: Save }) {
  const scale = s.fast ? 60 : 1;
  const [clock, setClock] = useState(() => officeClock(scale));
  useEffect(() => { const id = setInterval(() => setClock(officeClock(scale)), 1000); return () => clearInterval(id); }, [scale]);
  return <>
    <div className="between"><div className="pc-h">Coworkers</div><span className="sub">Office time {hhmm(clock)}</span></div>
    <div className="sub">At their desk means they're working. Away from it, they're on a break, at lunch or in a meeting.</div>
    <div className="pc-list">
      {people(s.company).map((id) => { const c = COWORKERS[id], st = statusOf(id, clock); return (
        <div key={id} className="pc-row team">
          <Head id={id} size={34} />
          <div className="pc-what"><b>{c.name}</b><span>{c.role}</span></div>
          <span className={`pc-status ${st.kind}`}><i />{LABEL[st.kind]}</span>
          <div className="pc-when">
            {st.kind === 'working' ? <>At their desk<br /><span>{st.free !== null ? `Next break around ${hhmm(st.free)}` : 'Working all day'}</span></>
              : st.kind === 'meeting' ? <>At {st.where}<br /><span>Free around {hhmm(st.free!)}</span></>
              : <>At {st.where}<br /><span>Back at their desk around {hhmm(st.free!)}</span></>}
          </div>
        </div>); })}
    </div>
  </>;
}

// The chosen sidebar tab and the main panel are one shape: the tab's colour flows into the panel through two soft
// inward curves, with no seam. Its top and bottom follow the chosen tab on springs, so switching looks liquid.
function SideBlob({ tab }: { tab: Tab }) {
  const svg = useRef<SVGSVGElement>(null), path = useRef<SVGPathElement>(null);
  const st = useRef({ t: 0, b: 0, vt: 0, vb: 0, init: false }), raf = useRef(0);
  useLayoutEffect(() => {
    const side = svg.current!.parentElement!, el = side.querySelector<HTMLElement>(`[data-t="${tab}"]`); if (!el) return;
    const W = side.offsetWidth, tt = el.offsetTop, tb = el.offsetTop + el.offsetHeight, s = st.current;
    if (!s.init) { s.t = tt; s.b = tb; s.init = true; }
    const down = tt > s.t, R = 14, r = 10, x0 = 8;
    let last = performance.now();
    const draw = () => { const t = s.t, b = s.b;
      path.current!.setAttribute('d', `M${x0} ${t + r} Q${x0} ${t} ${x0 + r} ${t} L${W - R} ${t} Q${W} ${t} ${W} ${t - R} L${W + 4} ${t - R} L${W + 4} ${b + R} L${W} ${b + R} Q${W} ${b} ${W - R} ${b} L${x0 + r} ${b} Q${x0} ${b} ${x0} ${b - r} Z`); };
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000); last = now;
      const kt = down ? 170 : 460, kb = down ? 460 : 170, c = 24;
      s.vt += (-kt * (s.t - tt) - c * s.vt) * dt; s.t += s.vt * dt; s.vb += (-kb * (s.b - tb) - c * s.vb) * dt; s.b += s.vb * dt;
      draw(); if (Math.abs(s.t - tt) + Math.abs(s.b - tb) + Math.abs(s.vt) + Math.abs(s.vb) > 0.4) raf.current = requestAnimationFrame(step);
    };
    draw(); cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [tab]);
  return <svg className="pc-blob" ref={svg} aria-hidden><path ref={path} /></svg>;
}
