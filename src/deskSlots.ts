// ---------------- where things can go on the player's desk ----------------
// All numbers are in the desk picture's own pixels (1280 x 832, public/assets/ob/starter/back.png).
// A slot's [x, y] is where the bottom-middle of an item stands. Each slot has a kind: what sort of place it is.
// Each item lists the kinds of slot it may go in, so a mug can be kept off the wall shelves, say.
// To add a slot or let an item go somewhere new, edit the lists below.

export type SlotKind = 'desk' | 'shelf';

export interface Slot { id: string; kind: SlotKind; at: [number, number] }
export const SLOTS: Slot[] = [
  // desk top, left arm (front to back), then the right arm. Spots are evenly spaced along each arm, halfway between the front edge and the raised back shelf.
  { id: 'desk-l1', kind: 'desk', at: [388, 528] },
  { id: 'desk-l2', kind: 'desk', at: [454, 495] },
  { id: 'desk-l3', kind: 'desk', at: [524, 464] },
  { id: 'desk-r1', kind: 'desk', at: [772, 460] },
  { id: 'desk-r2', kind: 'desk', at: [832, 498] },
  { id: 'desk-r3', kind: 'desk', at: [904, 528] },
  // the four wall shelves, two spots each
  { id: 'shelf-lt1', kind: 'shelf', at: [288, 268] },
  { id: 'shelf-lt2', kind: 'shelf', at: [384, 220] },
  { id: 'shelf-lb1', kind: 'shelf', at: [288, 348] },
  { id: 'shelf-lb2', kind: 'shelf', at: [384, 300] },
  { id: 'shelf-rt1', kind: 'shelf', at: [896, 220] },
  { id: 'shelf-rt2', kind: 'shelf', at: [992, 268] },
  { id: 'shelf-rb1', kind: 'shelf', at: [896, 300] },
  { id: 'shelf-rb2', kind: 'shelf', at: [992, 348] },
];

export interface DeskItem {
  id: string; name: string; line: string;
  box: [number, number, number, number];   // where the item sits in its own picture (ob/starter/<id>.png)
  fits: SlotKind[];                         // the kinds of slot it may go in
  home: string;                             // the slot it starts in when unwrapped
  starter?: boolean;                        // one of the first-day gifts on the desk (default yes)
}
export const ITEMS: DeskItem[] = [
  { id: 'lamp', name: 'Desk lamp', line: 'A warm little lamp for late study sessions.', box: [356, 456, 64, 72], fits: ['desk'], home: 'desk-l1' },
  { id: 'clipboard', name: 'Clipboard', line: 'For your plans and tiny to-do lists.', box: [492, 428, 64, 36], fits: ['desk', 'shelf'], home: 'desk-l3' },
  { id: 'piggy', name: 'Glass piggy bank', line: 'It fills up with coins as you finish work orders.', box: [742, 412, 60, 48], fits: ['desk', 'shelf'], home: 'desk-r1' },
  { id: 'phone', name: 'Desk phone', line: 'A classic desk phone. Very good for looking busy.', box: [878, 496, 52, 32], fits: ['desk'], home: 'desk-r3' },
  // the welcome surprise found in the office after onboarding
  { id: 'smile_mug', name: 'Smiley mug', line: 'A coffee mug that is always happy to see you.', box: [432, 455, 44, 40], fits: ['desk', 'shelf'], home: 'desk-l2', starter: false },
];

export const STARTER = ITEMS.filter((i) => i.starter !== false);
export const item = (id: string) => ITEMS.find((i) => i.id === id)!;
export const slot = (id: string) => SLOTS.find((s) => s.id === id)!;
export const fits = (itemId: string, slotId: string) => item(itemId).fits.includes(slot(slotId).kind);
// a free slot for an item: its home if that's free, otherwise the first free slot it fits in
export function freeSlot(itemId: string, place: Record<string, string | null>): string | null {
  const used = new Set(Object.values(place).filter(Boolean));
  const it = item(itemId);
  if (!used.has(it.home)) return it.home;
  return SLOTS.find((s) => it.fits.includes(s.kind) && !used.has(s.id))?.id ?? null;
}
