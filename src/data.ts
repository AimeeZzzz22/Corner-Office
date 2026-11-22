// Game data for the demo. Numbers come from the design doc.
export type CoworkerId = 'margaux' | 'priya' | 'theo' | 'camille' | 'jonah' | 'odette' | 'rio' | 'sam' | 'ada' | 'kofi' | 'mei' | 'bean';
export type CompanyId = 'stitchlight' | 'moonpuff';
export type TaskType = 'Writing' | 'Reading' | 'Studying' | 'Coding' | 'Admin' | 'Chores' | 'Creative';
export const TASK_TYPES: TaskType[] = ['Writing', 'Reading', 'Studying', 'Coding', 'Admin', 'Chores', 'Creative'];

export interface Job { title: string; doing: string }
// A coworker's day: each trip starts at minute m of the hour (or only in hour h, e.g. lunch), goes to a named place and
// lasts `stay` minutes, then they walk back to their desk. Times follow the real clock (Fast demo time runs it 60x).
export interface Trip { m: number; to: string; stay: number; h?: number }
export interface Coworker {
  id: CoworkerId; name: string; role: string; owns: TaskType[];
  spot: [number, number];        // where to click them while seated, in map pixels
  seat: [number, number, number]; // seated sprite: centre x, top y, rows shown (the rest is hidden by the desk)
  pet?: boolean;                 // Bean naps on her bed and never walks
  chat: string;                  // placeholder line for the demo
  schedule?: Trip[];             // when they get up from their desk and where they go
  jobs: Job[];                   // the character's jobs for this coworker (placeholder wording)
}

export const COWORKERS: Record<CoworkerId, Coworker> = {
  margaux: { id: 'margaux', name: 'Margaux', role: 'Editor-in-Chief', owns: ['Writing'], spot: [424, 60], seat: [424, 43, 27], schedule: [{ m: 10, to: 'pantry', stay: 5 }, { m: 40, to: 'editorial', stay: 6 }, { h: 12, m: 0, to: 'bakery', stay: 35 }],
    chat: 'Make it sharp. Then make it shorter.',
    jobs: [{ title: 'Cover story draft', doing: 'Drafting the cover story' }, { title: 'Headline options', doing: 'Writing headlines' }, { title: "Editor's letter notes", doing: "Noting ideas for the editor's letter" }] },
  priya: { id: 'priya', name: 'Priya', role: "Margaux's assistant", owns: ['Chores'], spot: [440, 172], seat: [440, 155, 27], schedule: [{ m: 5, to: 'reception', stay: 4 }, { m: 25, to: 'pantry', stay: 5 }, { m: 50, to: 'bakery', stay: 4 }],
    chat: 'If it is on the calendar, it is real.',
    jobs: [{ title: 'Tidy the calendar', doing: 'Tidying the calendar' }, { title: 'Sort the mail', doing: 'Sorting the mail' }, { title: 'Restock the supply shelf', doing: 'Restocking supplies' }] },
  theo: { id: 'theo', name: 'Theo', role: 'Fellow intern', owns: ['Studying', 'Coding'], spot: [200, 60], seat: [200, 43, 27], schedule: [{ m: 15, to: 'bakery', stay: 6 }, { m: 45, to: 'lounge', stay: 5 }, { h: 12, m: 30, to: 'pantry', stay: 30 }],
    chat: 'Wait, which tab was I on?',
    jobs: [{ title: 'Fact-check notes', doing: 'Fact-checking' }, { title: 'Research the archive', doing: 'Digging through the archive' }, { title: 'Fix the site links', doing: 'Fixing site links' }] },
  camille: { id: 'camille', name: 'Camille', role: 'Beauty editor', owns: ['Reading'], spot: [280, 60], seat: [280, 43, 27], schedule: [{ m: 0, to: 'closet', stay: 5 }, { m: 30, to: 'pantry', stay: 4 }],
    chat: 'Read it out loud. You will hear the typo.',
    jobs: [{ title: 'Proof the feature', doing: 'Proofreading the feature' }, { title: 'Read the reader mail', doing: 'Reading reader mail' }, { title: 'Review the press notes', doing: 'Reading press notes' }] },
  jonah: { id: 'jonah', name: 'Jonah', role: 'Art director', owns: ['Creative'], spot: [248, 142], seat: [248, 124, 28], schedule: [{ m: 20, to: 'lounge', stay: 6 }, { m: 52, to: 'closet', stay: 4 }, { h: 13, m: 0, to: 'bakery', stay: 30 }],
    chat: 'More white space. Always more white space.',
    jobs: [{ title: 'Mood board', doing: 'Building a mood board' }, { title: 'Layout sketches', doing: 'Sketching layouts' }, { title: 'Pick shoot props', doing: 'Picking shoot props' }] },
  odette: { id: 'odette', name: 'Odette', role: 'People & Culture', owns: ['Admin'], spot: [248, 286], seat: [248, 267, 32], schedule: [{ m: 35, to: 'lounge', stay: 4 }, { m: 56, to: 'pantry', stay: 3 }],
    chat: 'Welcome back. The kettle is on.',
    jobs: [{ title: 'File the forms', doing: 'Filing forms' }, { title: 'Update the staff list', doing: 'Updating the staff list' }, { title: 'Book the meeting room', doing: 'Booking the meeting room' }] },
  rio: { id: 'rio', name: 'Rio', role: 'Creative Director', owns: ['Creative'], spot: [360, 60], seat: [360, 43, 27], schedule: [{ m: 8, to: 'idea_wall', stay: 6 }, { m: 38, to: 'game_room', stay: 5 }, { h: 12, m: 15, to: 'kitchen', stay: 35 }],
    chat: 'New idea. Hear me out.',
    jobs: [{ title: 'Concept sketches', doing: 'Sketching concepts' }, { title: 'Pick the level palette', doing: 'Picking colours' }, { title: 'Mood board for level 4', doing: 'Building a mood board' }] },
  sam: { id: 'sam', name: 'Sam', role: 'Lead Developer', owns: ['Coding'], spot: [168, 60], seat: [168, 43, 27], schedule: [{ m: 22, to: 'kitchen', stay: 5 }, { m: 52, to: 'colab', stay: 4 }],
    chat: '(a calm thumbs-up)',
    jobs: [{ title: 'Fix a small bug', doing: 'Fixing a bug' }, { title: 'Test the save system', doing: 'Testing saves' }, { title: 'Clean up the build', doing: 'Cleaning up the build' }] },
  ada: { id: 'ada', name: 'Ada', role: 'Fellow intern', owns: ['Studying'], spot: [232, 60], seat: [232, 43, 27], schedule: [{ m: 12, to: 'arcade', stay: 5 }, { m: 42, to: 'kitchen', stay: 5 }, { h: 13, m: 0, to: 'game_room', stay: 30 }],
    chat: 'I have three tabs open too!',
    jobs: [{ title: 'Balance level 3', doing: 'Balancing level 3' }, { title: 'Read the design notes', doing: 'Reading design notes' }, { title: 'Study the playtest data', doing: 'Studying playtest data' }] },
  kofi: { id: 'kofi', name: 'Kofi', role: 'Community Manager', owns: ['Writing', 'Reading'], spot: [296, 60], seat: [296, 43, 27], schedule: [{ m: 3, to: 'colab', stay: 5 }, { m: 30, to: 'game_room', stay: 6 }],
    chat: 'A player said your patch made their day.',
    jobs: [{ title: 'Write the patch notes', doing: 'Writing patch notes' }, { title: 'Read player feedback', doing: 'Reading player feedback' }, { title: 'Draft the newsletter', doing: 'Drafting the newsletter' }] },
  mei: { id: 'mei', name: 'Mei', role: 'Studio Ops', owns: ['Admin'], spot: [328, 270], seat: [328, 251, 32], schedule: [{ m: 18, to: 'kitchen', stay: 4 }, { m: 48, to: 'idea_wall', stay: 3 }],
    chat: 'Badge working okay? Good.',
    jobs: [{ title: 'Sort the studio mail', doing: 'Sorting the studio mail' }, { title: 'Book the playtest room', doing: 'Booking the playtest room' }, { title: 'Update the asset list', doing: 'Updating the asset list' }] },
  bean: { id: 'bean', name: 'Bean', role: 'The studio cat', owns: ['Chores'], spot: [392, 326], seat: [392, 312, 20], pet: true,
    chat: 'Mrrp. (sits on your keyboard)',
    jobs: [{ title: "Refill Bean's water", doing: "Refilling Bean's water" }, { title: 'Brush Bean', doing: 'Brushing Bean' }, { title: 'Tidy the cat corner', doing: 'Tidying the cat corner' }] },
};
export const COWORKER_IDS = Object.keys(COWORKERS) as CoworkerId[];

// Order lengths and pay (set in the design doc). Custom times sit on the line between, rounded down to 5.
export const SLIP_MINS = [15, 30, 60, 90] as const;
const PAY: [number, number][] = [[0, 0], [15, 20], [30, 45], [60, 100], [90, 150], [120, 200]];
export function pay(mins: number): number {
  for (let i = 0; i < PAY.length - 1; i++) {
    const [a, pa] = PAY[i], [b, pb] = PAY[i + 1];
    if (mins >= a && mins <= b) {
      const v = pa + ((pb - pa) * (mins - a)) / (b - a);
      return (SLIP_MINS as readonly number[]).includes(mins) ? Math.round(v) : Math.floor(v / 5) * 5;
    }
  }
  return 200;
}
export const HEART_POINTS = 10;      // a heart is 10 points; a finished order adds 1 point
export const XP_TO_NEXT = 500;       // Intern I -> Intern II (starting value)

export interface GameSpot { name: string; at: [number, number]; stand: [number, number] }
export interface Company {
  id: CompanyId; name: string; role: string; people: CoworkerId[];
  host: CoworkerId;                         // who greets you and hands out the order tray
  start: [number, number];                  // player's first tile
  games: GameSpot[];                        // mini-game spots (only the marker and bubble exist in this demo)
  pc: { at: [number, number]; stand: [number, number]; desk: [number, number, number, number] };   // the computer on your corner desk; desk = clickable area (map px)
  places: Record<string, [number, number]>;   // named places coworkers walk to (map pixels)
  food: GameSpot;       // where treats are sold (Stitchlight: Bobbin Bakery; Moonpuff: the kitchen counter)
  fridge: GameSpot;     // the office fridge: now and then a free little treat turns up in it
  surprise: GameSpot;   // the welcome gift in a common area, waiting after onboarding
  giftInMap?: { x0: number; x1: number; y0: number; y1: number; src: number };   // the welcome gift is part of the map picture (map px): once opened, the table is painted over it, copying the table rows from `src`
}
export const COMPANIES: Record<CompanyId, Company> = {
  stitchlight: { id: 'stitchlight', name: 'Stitchlight', role: 'Fashion Intern', people: ['margaux', 'priya', 'theo', 'camille', 'jonah', 'odette'], host: 'odette', start: [2, 7],
    games: [{ name: 'Closet Rush', at: [96, 80], stand: [6, 6] }], pc: { at: [40, 54], stand: [4, 5], desk: [16, 40, 64, 80] },
    places: { pantry: [70, 270], lounge: [232, 236], bakery: [400, 296], reception: [190, 300], editorial: [300, 196], closet: [104, 150] },
    food: { name: 'Bobbin Bakery', at: [416, 238], stand: [25, 17] }, fridge: { name: 'The fridge', at: [136, 222], stand: [8, 16] }, surprise: { name: 'A gift for you!', at: [263, 176], stand: [17, 10] }, giftInMap: { x0: 257, x1: 268, y0: 161, y1: 175, src: 176 } },
  moonpuff: { id: 'moonpuff', name: 'Moonpuff Studio', role: 'Game Dev Intern', people: ['rio', 'sam', 'ada', 'kofi', 'mei', 'bean'], host: 'mei', start: [4, 7],
    games: [{ name: 'Bug Triage', at: [168, 80], stand: [9, 4] }], pc: { at: [48, 54], stand: [4, 5], desk: [16, 40, 64, 80] },
    places: { kitchen: [96, 304], colab: [256, 196], game_room: [440, 100], arcade: [440, 262], idea_wall: [100, 208], booth: [240, 300] },
    food: { name: 'Kitchen counter', at: [112, 274], stand: [6, 19] }, fridge: { name: 'The fridge', at: [136, 268], stand: [8, 19] }, surprise: { name: 'A gift for you!', at: [200, 254], stand: [11, 15] } },
};
