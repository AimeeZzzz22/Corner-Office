// Onboarding content (English), from the design files.
import { CompanyId } from './data';

export const LETTER: Record<CompanyId, { zh: string; sub: string; title: string; body: string; rows: [string, string][]; note: string; who: string; serif: boolean; prefix: string }> = {
  stitchlight: { zh: '织光杂志社', sub: 'A BRAMBLEWICK MEDIA MAGAZINE', title: 'Fashion Intern', serif: true, prefix: 'SL',
    body: 'We are delighted to offer you the position of Fashion Intern in our fashion closet, starting today.',
    rows: [['Your desk', 'A cosy corner desk in the fashion closet, between the racks'], ['Pay', 'Coins for every work order you finish'], ['Hours', 'Whenever suits you. Short breaks are part of the job.'], ['Dress code', "Chic but comfortable, you'll be on your feet"]],
    note: 'Lovely to have you.  — Margaux', who: 'Margaux Vale, Editor-in-Chief  ·  with Odette, People & Culture' },
  moonpuff: { zh: '月芙工作室', sub: 'TINY INDIE GAMES, MADE WITH SNACKS', title: 'Game Dev Intern', serif: false, prefix: 'MP',
    body: "Welcome to the team! You're our new Game Dev Intern, starting today.",
    rows: [['Your desk', 'A corner desk by the arcade cabinet, two monitors, one brave plant'], ['Pay', 'Coins for every work order you finish'], ['Hours', 'Whenever suits you. Breaks count as playtesting.'], ['Dress code', 'Wear whatever you game in']],
    note: "Can't wait to show you the build!  — Rio", who: 'Rio, Creative Director  ·  with Mei, Studio Ops' },
};
export const KIND_NOTE = 'Nobody here keeps score of anyone else, and nobody will ever be upset with you for stopping early.';

// welcome tour: zone (from the map), stop name, two lines from the host
export const TOUR: Record<CompanyId, [string, string, string][]> = {
  stitchlight: [
    ['reception', 'Reception', "Welcome to Stitchlight! I'm Odette, and I look after everyone here. Let me show you around. You can skip the tour any time."],
    ['lounge', 'Lounge', 'This is the lounge. Sit down whenever your head feels full. A break here is part of the job, never a mark against you.'],
    ['bakery', 'Bobbin Bakery', 'Bobbin Bakery, our little cafe. The Coins you earn from tasks can be spent on treats and on things for your desk.'],
    ['assistant_desk', "Priya's desk", "Priya is Margaux's assistant. She hands out the chores, the small tidy-up tasks that keep the day moving."],
    ['editor_office', "Margaux's office", 'Margaux is the Editor-in-Chief. Writing tasks come from her. She is kinder than the door suggests.'],
    ['editorial_floor', 'Editorial floor', 'Jonah does art, Camille does beauty. Each coworker owns a kind of task. Finish theirs and they warm to you, one heart at a time.'],
    ['pantry', 'Pantry', 'Coffee, tea and snacks live here. Help yourself between tasks.'],
    ['fashion_closet', 'Fashion closet: your desk', 'And this corner is yours. Theo, the other intern, sits nearby. Decorate it however you like. Now, your badge photo!'],
  ].map(([z, n, l]) => [z, n, l] as [string, string, string]),
  moonpuff: [
    ['entrance_booth', 'Entrance booth', "Welcome to Moonpuff! I'm Mei, I keep the studio running. Quick lap of the place. You can skip the tour any time."],
    ['beans_corner', "Bean's corner", 'This is Bean, our studio cat. Bean is in charge of chores. Yes, really. Do your chores and Bean will like you.'],
    ['arcade_nook', 'Arcade nook', 'Arcade cabinets and air hockey. Here a break counts as playtesting.'],
    ['game_room', 'Game room', 'The game room: big screen, beanbags, moon rug. Come and sit whenever your head feels full.'],
    ['open_desks', 'Open desks', 'Sam codes, Ada is the other intern, Kofi talks to players, Rio dreams things up. Each of them owns a kind of task.'],
    ['colab', 'Co-lab', "Builds get tested here. Finish a coworker's tasks and they warm to you, one heart at a time."],
    ['kitchen', 'Kitchen', 'Snacks, drinks and the vending machine. The Coins you earn from tasks buy treats and things for your desk.'],
    ['idea_wall', 'Idea wall', 'Any idea can go up on this wall, even the silly ones. Especially the silly ones.'],
    ['your_corner', 'Your corner', 'And this corner is yours, right by the arcade cabinets. Make it cosy. Now, your badge photo!'],
  ].map(([z, n, l]) => [z, n, l] as [string, string, string]),
};

export const BOOTH_LINE: Record<CompanyId, string> = { stitchlight: 'Chin up a little... perfect. This goes on your badge!', moonpuff: "Say 'cheese'! Bean is trying to get in the shot again." };
export const BDAY_LINE: Record<CompanyId, string> = { stitchlight: "Last thing: when's your birthday? We always do cake.", moonpuff: "When's your birthday? Bean likes parties (and cake)." };

// work vibes: purely cosmetic
export const VIBES: { id: string; name: string; quirk: string; bubble: string; colour: string }[] = [
  { id: 'snacker', name: 'The Snacker', quirk: 'Sneaks a snack from the desk drawer', bubble: '"Just one bite..."', colour: '#fadec4' },
  { id: 'napper', name: 'The Napper', quirk: 'Takes a quick nap at the desk', bubble: '"Zzz... five minutes."', colour: '#e2daf4' },
  { id: 'scroller', name: 'The Scroller', quirk: 'Scrolls their phone for a moment', bubble: '"Ooh, a cat video."', colour: '#d0e4f6' },
  { id: 'stretcher', name: 'The Stretcher', quirk: 'Stands up for a big stretch', bubble: '"Aaah, much better."', colour: '#d4eed6' },
  { id: 'spinner', name: 'The Spinner', quirk: 'Spins around in the chair', bubble: '"Wheee."', colour: '#fceeba' },
  { id: 'plant', name: 'The Plant Whisperer', quirk: 'Chats to the desk plant', bubble: '"You are doing great, leafy."', colour: '#d6e8cc' },
];

// work style quiz: every question can be skipped
export type Focus = 15 | 30 | 60 | 0;          // 0 = it changes every day
export type SoundMode = 'soft' | 'chime' | 'silent';
export type Reminders = 'nudge' | 'end' | 'none';
export const QUIZ = {
  focus: { q: 'How long can you usually focus?', line: 'Three quick questions so the work fits you. No wrong answers.',
    opts: [[15, 'About 15 minutes', 'Quick task orders'], [30, 'About 30 minutes', 'Steady orders'], [60, 'An hour or more', 'Deep focus orders'], [0, 'It changes every day', "I'll ask you each time"]] as [Focus, string, string][] },
  sound: { q: 'Do you like sound while you work?', line: 'Some people focus with sound, some need quiet. Both are fine.',
    opts: [['soft', 'Soft background sounds', 'Room sounds and gentle music'], ['chime', 'Just a chime', 'Only when time is up'], ['silent', 'Keep it silent', 'No sound at all']] as [SoundMode, string, string][] },
  reminders: { q: 'Do you want gentle reminders?', line: 'Last one. I only ever nudge kindly, never nag.',
    opts: [['nudge', 'Yes, nudge me kindly', 'A soft reminder if a work order has been waiting'], ['end', "Only when time's up", 'Tell me when the timer ends, nothing else'], ['none', 'No reminders', "I'll come back when I'm ready"]] as [Reminders, string, string][] },
};
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
