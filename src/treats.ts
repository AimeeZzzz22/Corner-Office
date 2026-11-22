import { Save } from './state';

// ---------------- food and drink ----------------
// Treats last for today only: they sit on the desk, and their bonus (if any) works until the day ends.
// Only the four with a bonus are sold, at the bakery (Moonpuff: the kitchen counter). Four cheap ones turn up now
// and then in the office fridge as a free surprise; they're just for fun.
export interface Treat { id: string; key: string; name: string; price?: number; bonus?: string; line: string }
export const BAKERY: Treat[] = [
  { id: 'small:iced_coffee', key: 'iced_coffee', name: 'Iced coffee', price: 40, bonus: 'The next order you finish today pays +50% coins (once a day).', line: 'Cold, strong, and gone too fast.' },
  { id: 'small:matcha_latte', key: 'matcha_latte', name: 'Matcha latte', price: 40, bonus: 'Every order you finish today adds +10 minutes to your piggy bank.', line: 'Calm and green.' },
  { id: 'small:strawberry_milk', key: 'strawberry_milk', name: 'Strawberry milk', price: 30, bonus: '+10% XP on every order you finish today.', line: 'Pink, sweet, a little bit nostalgic.' },
  { id: 'small:macaron_tower', key: 'macaron_tower', name: 'Macarons', price: 35, bonus: 'Share them with a coworker today for +2 friendship points.', line: 'Too pretty to eat. Almost.' },
];
export const FRIDGE: Treat[] = [
  { id: 'small:donut_plate', key: 'donut_plate', name: 'Donut', line: 'Someone left a donut with your name on it.' },
  { id: 'small:fortune_cookie', key: 'fortune_cookie', name: 'Fortune cookie', line: '' },
  { id: 'small:gummy_jar', key: 'gummy_jar', name: 'Gummies', line: 'A little jar of gummies. Sweet!' },
  { id: 'small:cocoa', key: 'cocoa', name: 'Cocoa', line: 'A warm cocoa, still steaming.' },
];
export const FORTUNES = ['A small step today is still a step.', 'Your next idea will be a good one.', 'Someone here is glad you joined.', 'Rest is part of the work.', 'Today you will finish something.', 'Good things are already on their way.'];
export const ALL_TREATS = [...BAKERY, ...FRIDGE];
export const treat = (key: string) => ALL_TREATS.find((t) => t.key === key)!;
export const FRIDGE_CHANCE = 0.4;      // on about 2 days in 5 there's something in the fridge

const today = () => new Date().toDateString();
export const treatsToday = (t: Save['treats']): Save['treats'] => (t.day === today() ? t : { day: today(), have: [], used: [] });
export function fridgeToday(f: Save['fridge']): Save['fridge'] {
  if (f.day === today()) return f;
  const item = Math.random() < FRIDGE_CHANCE ? FRIDGE[Math.floor(Math.random() * FRIDGE.length)].key : null;
  return { day: today(), item, fortune: Math.floor(Math.random() * FORTUNES.length) };
}
