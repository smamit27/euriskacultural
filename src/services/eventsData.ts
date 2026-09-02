import type { CulturalEvent } from '../types';
import ganeshImg from '/ganesh_bhagwan.jpg';

// Compute status based on today's date
function computeStatus(date: string, endDate?: string): CulturalEvent['status'] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = endDate ? new Date(endDate) : new Date(date);
  end.setHours(23, 59, 59, 999);

  if (today > end) return 'COMPLETED';
  if (today >= start && today <= end) return 'ONGOING';
  return 'UPCOMING';
}

export const CULTURAL_EVENTS: CulturalEvent[] = [
  {
    id: 'evt-ganesh-2026',
    name: 'Ganesh Chaturthi',
    month: 'SEP',
    monthFull: 'September 2026',
    date: '2026-09-14',
    endDate: '2026-09-25',
    tagline: 'Celebrate new beginnings with blessings & joy.',
    emoji: '🙏',
    imageUrl: ganeshImg,
    gradient: 'linear-gradient(135deg, #c2410c, #ea580c)',
    cardBg: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
    accentColor: '#c2410c',
    status: computeStatus('2026-09-14', '2026-09-25'),
    scheduleItems: [
      {
        icon: '🚩',
        date: 'Mon, 14 Sep',
        time: '5:00 PM',
        title: 'Ganesh Aagman & Sthapana Ceremony',
        desc: 'Grand Dhol Tasha Aagman Procession & Sthapana followed by 8 PM Welcome Aarti.',
        badge: 'Aagman @ 5 PM',
      },
      {
        icon: '🪔',
        date: '14 Sep – 25 Sep',
        time: '8:00 PM Daily',
        title: 'Daily Evening Maha Aarti & Modak Prasad',
        desc: 'Daily society aarti & distribution of fresh Modak Prasad.',
        badge: 'Daily 8 PM Aarti',
      },
      {
        icon: '🎨',
        date: 'Sat, 19 Sep',
        time: '6:00 PM',
        title: 'Kalakriti Cultural Activities (Night 1)',
        desc: 'Kids Drawing Competition, funny society comedy skits & mimicry acts.',
        badge: 'Activity Night 1',
      },
      {
        icon: '🎭',
        date: 'Sun, 20 Sep',
        time: '6:30 PM',
        title: 'Cultural Stage Extravaganza (Night 2)',
        desc: 'Classical folk dance, Lavani, vocal singing & family fashion showcase.',
        badge: 'Activity Night 2',
      },
      {
        icon: '🍽️',
        date: 'Thu, 24 Sep',
        time: '8:30 PM',
        title: 'Community Grand Maha Prasad Dinner',
        desc: 'Special Pre-Visarjan Aarti @ 8:00 PM followed by Grand Feast starting ~8:30 PM.',
        badge: 'Feast @ 8:30 PM',
      },
      {
        icon: '🌊',
        date: 'Fri, 25 Sep',
        time: '4:00 PM',
        title: 'Ganesh Visarjan Procession & Final Farewell',
        desc: 'Anant Chaturdashi Visarjan procession with Gulal, Lezim, Dhol Tasha & final Aarti.',
        badge: 'Visarjan @ 4 PM',
      },
    ],
  },
  {
    id: 'evt-navratri-2026',
    name: 'Navratri',
    month: 'OCT',
    monthFull: 'October 2026',
    date: '2026-10-11',
    endDate: '2026-10-20',
    tagline: 'Nine nights of devotion, dance & celebration.',
    emoji: '💃',
    gradient: 'linear-gradient(135deg, #b45309, #d97706)',
    cardBg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
    accentColor: '#b45309',
    status: computeStatus('2026-10-11', '2026-10-20'),
    scheduleItems: [
      {
        icon: '🥁',
        date: 'Sun, 11 Oct',
        time: '7:00 PM',
        title: 'Ghatasthapana & Dandiya Raas Begins',
        desc: 'Maa Durga sthapana and opening night of traditional Garba.',
        badge: 'Opening Night',
      },
      {
        icon: '🏆',
        date: 'Tue, 20 Oct',
        time: '7:00 PM',
        title: 'Vijayadashami (Dussehra) & Best Costume Awards',
        desc: 'Grand finale Dandiya night, Ravan Dahan symbolic ceremony & prizes.',
        badge: 'Grand Finale',
      },
    ],
  },
  {
    id: 'evt-diwali-2026',
    name: 'Diwali',
    month: 'NOV',
    monthFull: 'November 2026',
    date: '2026-11-08',
    tagline: "Let's celebrate the festival of lights & togetherness.",
    emoji: '🪔',
    gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
    cardBg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
    accentColor: '#7c3aed',
    status: computeStatus('2026-11-08'),
    scheduleItems: [
      {
        icon: '🪔',
        date: 'Sun, 08 Nov',
        time: '6:00 PM',
        title: 'Lakshmi Pujan, Diya Lighting & Community Feast',
        desc: 'Grand society illumination, eco-friendly sparklers & community dinner.',
        badge: 'Diwali Celebration',
      },
    ],
  },
  {
    id: 'evt-christmas-2026',
    name: 'Christmas',
    month: 'DEC',
    monthFull: 'December 2026',
    date: '2026-12-25',
    tagline: 'Celebrate the spirit of love, peace & happiness.',
    emoji: '🎄',
    gradient: 'linear-gradient(135deg, #065f46, #047857)',
    cardBg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
    accentColor: '#065f46',
    status: computeStatus('2026-12-25'),
    scheduleItems: [
      {
        icon: '🎅',
        date: 'Fri, 25 Dec',
        time: '6:00 PM',
        title: 'Christmas Carols, Secret Santa & Feast',
        desc: 'Tree lighting, Santa gift distribution for children & cake cutting.',
        badge: 'Christmas Evening',
      },
    ],
  },
  {
    id: 'evt-eid-2027',
    name: 'Eid',
    month: 'MAR',
    monthFull: 'March 2027',
    date: '2027-03-10',
    tagline: 'A time for gratitude, sharing & togetherness.',
    emoji: '🌙',
    gradient: 'linear-gradient(135deg, #0e7490, #0891b2)',
    cardBg: 'linear-gradient(135deg, #ecfeff, #cffafe)',
    accentColor: '#0e7490',
    status: computeStatus('2027-03-10'),
    scheduleItems: [
      {
        icon: '🍮',
        date: 'Wed, 10 Mar 2027',
        time: '10:00 AM',
        title: 'Eid al-Fitr Sevaiyaan & Community Greet',
        desc: 'Society morning greetings, traditional sheer khurma & unity gathering.',
        badge: 'Eid Gathering',
      },
    ],
  },
  {
    id: 'evt-holi-2027',
    name: 'Holi',
    month: 'MAR',
    monthFull: 'March 2027',
    date: '2027-03-21',
    endDate: '2027-03-22',
    tagline: "Let's play with colors and strengthen our bond.",
    emoji: '🎨',
    gradient: 'linear-gradient(135deg, #0369a1, #0284c7)',
    cardBg: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    accentColor: '#0369a1',
    status: computeStatus('2027-03-21', '2027-03-22'),
    scheduleItems: [
      {
        icon: '🔥',
        date: 'Sun, 21 Mar 2027',
        time: '7:00 PM',
        title: 'Holika Dahan Bonfire & Puran Poli Feast',
        desc: 'Traditional sacred bonfire ritual, sweet Puran Poli & evening prayers.',
        badge: 'Holika Dahan',
      },
      {
        icon: '🎨',
        date: 'Mon, 22 Mar 2027',
        time: '10:00 AM',
        title: 'Dhulivandan Organic Colors & Rain Dance',
        desc: 'Organic herbal colors, thandai, live music & festive celebrations.',
        badge: 'Dhulivandan',
      },
    ],
  },
];

/** Returns the nearest upcoming (or ongoing) event */
export function getNextEvent(): CulturalEvent | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const active = CULTURAL_EVENTS.filter((e) => e.status !== 'COMPLETED');
  if (active.length === 0) return null;
  return active.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
}

/** Returns days until an event's start date (negative if past) */
export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
