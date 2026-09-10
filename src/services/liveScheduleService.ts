/**
 * Service for Majestique Euriska Ganeshotsav 2026 Festival Schedule:
 * - Day 1 (14 Sep): Starts Evening at 5:00 PM (Aagman Miravnuk) & 8:00 PM (Pratham Maha Aarti)
 * - Days 2 to 11 (15 - 24 Sep): Daily Morning 8:00 AM & Evening 8:00 PM
 * - Day 12 (25 Sep): Starts Afternoon at 4:00 PM (Anant Chaturdashi Visarjan Miravnuk)
 */

export interface DailyScheduleSlot {
  id: string;
  type: 'morning' | 'evening' | 'special';
  title: string;
  subtitle: string;
  timeDisplay: string; // e.g., "5:00 PM - 7:30 PM IST"
  hour: number; // 24-hr format
  minute: number;
  durationMinutes: number;
  description: string;
  icon: string;
  gradient: string;
  accentColor: string;
  category: 'Aarti' | 'Darshan' | 'Cultural' | 'Visarjan';
  youtubeVideoId?: string;
  youtubeUrl?: string;
}

export interface ScheduledDayInfo {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayLabel: string; // "14 Sep (Mon)", "15 Sep (Tue)", etc.
  dayShort: string; // "14 Sep"
  formattedDate: string; // "14 Sep 2026"
  isToday: boolean;
  isPast: boolean;
  dayNumber: number; // 1 to 12
  festivalDayName: string; // "Day 1: Ganesh Aagman (5 PM)", etc.
  slots: {
    slot: DailyScheduleSlot;
    startTime: Date;
    endTime: Date;
    status: 'live' | 'upcoming' | 'completed';
    timeRemainingMs: number;
  }[];
}

export const OFFICIAL_YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw';
export const OFFICIAL_YOUTUBE_LIVE_URL = 'https://www.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw/live';

/**
 * 12 Days Fixed Ganeshotsav Festival Definition (14th Sep to 25th Sep 2026)
 * All 24 live streams scheduled on YouTube Studio for channel @MajestiqueEuriskaCultural
 */
export const FESTIVAL_DAYS_CONFIG = [
  {
    dayNumber: 1,
    day: 14,
    month: 9,
    year: 2026,
    festivalDayName: 'Day 1: Ganesh Aagman & Sthapana',
    slots: [
      {
        id: 'sep14_aagman',
        type: 'special' as const,
        title: '🐘 Ganesh Aagman Miravnuk & Sthapana Ceremony',
        subtitle: 'Grand Welcome with Dhol Tasha Pathak beats',
        timeDisplay: '5:00 PM - 7:30 PM IST',
        hour: 17,
        minute: 0,
        durationMinutes: 150,
        description: 'Grand welcoming procession of Lord Ganesha from Society Main Gate followed by Vedic Ganesh Sthapana & Abhishek at Mandap.',
        icon: '🥁',
        gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
        accentColor: '#ea580c',
        category: 'Cultural' as const,
        youtubeVideoId: 'oU9IsBtGAJ4',
        youtubeUrl: 'https://www.youtube.com/watch?v=oU9IsBtGAJ4',
      },
      {
        id: 'sep14_aarti',
        type: 'evening' as const,
        title: '🪔 Shri Ganesh Pratham Maha Aarti (8:00 PM)',
        subtitle: 'First Evening Deepotsav & Prasad Distribution',
        timeDisplay: '8:00 PM - 9:00 PM IST',
        hour: 20,
        minute: 0,
        durationMinutes: 60,
        description: 'Auspicious First Evening Maha Aarti with community singing, lighting of 101 diyas & Modak Prasad distribution.',
        icon: '🪔',
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #31104b 100%)',
        accentColor: '#ef4444',
        category: 'Aarti' as const,
        youtubeVideoId: 'Aecjq7F8aJE',
        youtubeUrl: 'https://www.youtube.com/watch?v=Aecjq7F8aJE',
      },
    ],
  },
  {
    dayNumber: 2,
    day: 15,
    month: 9,
    year: 2026,
    festivalDayName: 'Day 2: Daily Darshan & Evening Aarti',
    slots: createDaily8Am8PmSlots(
      15,
      'Daily Evening Maha Aarti & Devotional Bhajans',
      'Evening Aarti & Community Bhajans',
      '9PNxuSaC2qY',
      '6N62O9WVZb8'
    ),
  },
  {
    dayNumber: 3,
    day: 16,
    month: 9,
    year: 2026,
    festivalDayName: 'Day 3: Daily Darshan & Evening Aarti',
    slots: createDaily8Am8PmSlots(
      16,
      'Daily Evening Maha Aarti & Cultural Darshan',
      'Society Devotional Chanting',
      'w7dPeNYy5_E',
      'pUb2gP3NRRs'
    ),
  },
  {
    dayNumber: 4,
    day: 17,
    month: 9,
    year: 2026,
    festivalDayName: 'Day 4: Daily Darshan & Evening Aarti',
    slots: createDaily8Am8PmSlots(
      17,
      'Daily Evening Maha Aarti & Musical Night',
      'Evening Devotional Sangeet',
      'VMQWo_CKnE4',
      'oiJ1Hd3A8as'
    ),
  },
  {
    dayNumber: 5,
    day: 18,
    month: 9,
    year: 2026,
    festivalDayName: 'Day 5: Daily Darshan & Evening Aarti',
    slots: createDaily8Am8PmSlots(
      18,
      'Daily Evening Maha Aarti & Bhajan Sandhya',
      'Devotional Bhajan Sandhya',
      'GHjFHw39iwk',
      'dSOOdWiY8og'
    ),
  },
  {
    dayNumber: 6,
    day: 19,
    month: 9,
    year: 2026,
    festivalDayName: 'Day 6: Carnival, Radio City 91.1 FM & Food Festival',
    slots: [
      {
        id: 'sep19_morning',
        type: 'morning' as const,
        title: 'Daily Morning Aarti & Pooja Darshan',
        subtitle: 'Nitya Pooja, Ganesh Stotra & Morning Darshan',
        timeDisplay: '8:00 AM - 9:00 AM IST',
        hour: 8,
        minute: 0,
        durationMinutes: 60,
        description: 'Morning Pooja & Archana from Majestique Euriska Mandap.',
        icon: '🌅',
        gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        accentColor: '#ea580c',
        category: 'Aarti' as const,
        youtubeVideoId: '8ISxFk91qnQ',
        youtubeUrl: 'https://www.youtube.com/watch?v=8ISxFk91qnQ',
      },
      {
        id: 'sep19_evening',
        type: 'special' as const,
        title: '🎪 Society Carnival, Radio City 91.1 FM RJ & 8 PM Aarti',
        subtitle: 'Live RJ Interaction, Games, Food Stalls & Maha Aarti',
        timeDisplay: '6:00 PM - 9:30 PM IST',
        hour: 18,
        minute: 0,
        durationMinutes: 210,
        description: 'Grand Society Carnival, Radio City 91.1 FM Live RJ interaction, Drawing Competition, Food Stalls & 8 PM Evening Aarti.',
        icon: '🎪',
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #31104b 100%)',
        accentColor: '#f59e0b',
        category: 'Cultural' as const,
        youtubeVideoId: '0TsnJ-hD1n8',
        youtubeUrl: 'https://www.youtube.com/watch?v=0TsnJ-hD1n8',
      },
    ],
  },
  {
    dayNumber: 7,
    day: 20,
    month: 9,
    year: 2026,
    festivalDayName: 'Day 7: Kalakriti Talent Show & Stage Gala',
    slots: [
      {
        id: 'sep20_morning',
        type: 'morning' as const,
        title: 'Daily Morning Aarti & Pooja Darshan',
        subtitle: 'Nitya Pooja, Ganesh Stotra & Morning Darshan',
        timeDisplay: '8:00 AM - 9:00 AM IST',
        hour: 8,
        minute: 0,
        durationMinutes: 60,
        description: 'Morning Pooja & floral darshan at Mandap.',
        icon: '🌅',
        gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        accentColor: '#ea580c',
        category: 'Aarti' as const,
        youtubeVideoId: 'vfk34rdMUBo',
        youtubeUrl: 'https://www.youtube.com/watch?v=vfk34rdMUBo',
      },
      {
        id: 'sep20_evening',
        type: 'special' as const,
        title: '🎭 Kalakriti Talent Show Gala & 8 PM Maha Aarti',
        subtitle: 'Dance, Singing, Drama & Fashion Show by Residents',
        timeDisplay: '6:00 PM - 10:00 PM IST',
        hour: 18,
        minute: 0,
        durationMinutes: 240,
        description: 'Grand cultural talent show showcase by society children & residents, followed by 8:00 PM Maha Aarti.',
        icon: '🎭',
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #450a0a 100%)',
        accentColor: '#ef4444',
        category: 'Cultural' as const,
        youtubeVideoId: '6EYWQd9gDiw',
        youtubeUrl: 'https://www.youtube.com/watch?v=6EYWQd9gDiw',
      },
    ],
  },
  {
    dayNumber: 8,
    day: 21,
    month: 9,
    year: 2026,
    festivalDayName: 'Day 8: Daily Darshan & Evening Aarti',
    slots: createDaily8Am8PmSlots(
      21,
      'Daily Evening Maha Aarti & Cultural Stage',
      'Society Stage Performances',
      't--8RMjTHBU',
      'AsWGil6_DZE'
    ),
  },
  {
    dayNumber: 9,
    day: 22,
    month: 9,
    year: 2026,
    festivalDayName: 'Day 9: Daily Darshan & Evening Aarti',
    slots: createDaily8Am8PmSlots(
      22,
      'Daily Evening Maha Aarti & Musical Showcase',
      'Devotional Performances',
      'WWoP95gLWp8',
      'kOQs8iyXpsM'
    ),
  },
  {
    dayNumber: 10,
    day: 23,
    month: 9,
    year: 2026,
    festivalDayName: 'Day 10: Daily Darshan & Evening Aarti',
    slots: createDaily8Am8PmSlots(
      23,
      'Daily Evening Maha Aarti & Devotional Sangeet',
      'Classical Devotional Night',
      'z3pruW1ZZaA',
      'QQ8kj8eXd4U'
    ),
  },
  {
    dayNumber: 11,
    day: 24,
    month: 9,
    year: 2026,
    festivalDayName: 'Day 11: Satyanarayan Katha (4 PM) & Mahaprasad (8 PM)',
    slots: [
      {
        id: 'sep24_morning',
        type: 'morning' as const,
        title: 'Daily Morning Aarti & Pooja Darshan',
        subtitle: 'Nitya Pooja, Ganesh Stotra & Morning Darshan',
        timeDisplay: '8:00 AM - 9:00 AM IST',
        hour: 8,
        minute: 0,
        durationMinutes: 60,
        description: 'Morning Pooja & divine darshan at Mandap.',
        icon: '🌅',
        gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        accentColor: '#ea580c',
        category: 'Aarti' as const,
        youtubeVideoId: '9yo4_x38C0U',
        youtubeUrl: 'https://www.youtube.com/watch?v=9yo4_x38C0U',
      },
      {
        id: 'sep24_evening',
        type: 'special' as const,
        title: '🍲 Satyanarayan Katha (4 PM) & Mahaprasad Feast (8 PM)',
        subtitle: 'Sacred Maha Pooja followed by grand community dinner',
        timeDisplay: '4:00 PM - 10:00 PM IST',
        hour: 16,
        minute: 0,
        durationMinutes: 360,
        description: 'Sacred Shri Satyanarayan Katha at 4 PM, Evening Aarti at 8 PM, and Grand Society Community Mahaprasad Feast.',
        icon: '🍲',
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #31104b 100%)',
        accentColor: '#f59e0b',
        category: 'Aarti' as const,
        youtubeVideoId: '2uhngMubFFc',
        youtubeUrl: 'https://www.youtube.com/watch?v=2uhngMubFFc',
      },
    ],
  },
  {
    dayNumber: 12,
    day: 25,
    month: 9,
    year: 2026,
    festivalDayName: 'Day 12: Anant Chaturdashi Ganesh Visarjan',
    slots: [
      {
        id: 'sep25_morning_aarti',
        type: 'morning' as const,
        title: '🌸 Ganesh Uttarpujana & Morning Darshan (8:00 AM)',
        subtitle: 'Final Morning Prayers & Pushpanjali',
        timeDisplay: '8:00 AM - 9:00 AM IST',
        hour: 8,
        minute: 0,
        durationMinutes: 60,
        description: 'Sacred Uttar Pooja, farewell stotra chants, and final morning darshan of Lord Ganesha before the Visarjan procession.',
        icon: '🌸',
        gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
        accentColor: '#ea580c',
        category: 'Aarti' as const,
        youtubeVideoId: 'eJqDBVUyi7Y',
        youtubeUrl: 'https://www.youtube.com/watch?v=eJqDBVUyi7Y',
      },
      {
        id: 'sep25_visarjan',
        type: 'special' as const,
        title: '🌊 Anant Chaturdashi Ganesh Visarjan Miravnuk (4:00 PM)',
        subtitle: 'Grand Farewell Procession & Eco Immersion',
        timeDisplay: '4:00 PM - 8:30 PM IST',
        hour: 16,
        minute: 0,
        durationMinutes: 270,
        description: 'Emotional grand farewell procession with traditional Gulal, Dhol Tasha beats & Eco-friendly Visarjan immersion ceremony.',
        icon: '🌊',
        gradient: 'linear-gradient(135deg, #1e1b4b 0%, #0c4a6e 100%)',
        accentColor: '#0284c7',
        category: 'Visarjan' as const,
        youtubeVideoId: 'a3zpCLnjHyY',
        youtubeUrl: 'https://www.youtube.com/watch?v=a3zpCLnjHyY',
      },
    ],
  },
];

function createDaily8Am8PmSlots(
  day: number,
  eveningTitle: string,
  eveningSubtitle: string,
  morningVideoId?: string,
  eveningVideoId?: string
): DailyScheduleSlot[] {
  return [
    {
      id: `sep${day}_morning`,
      type: 'morning',
      title: 'Daily Morning Aarti & Pooja Darshan (8:00 AM)',
      subtitle: 'Nitya Pooja, Ganesh Stotra & Morning Darshan',
      timeDisplay: '8:00 AM - 9:00 AM IST',
      hour: 8,
      minute: 0,
      durationMinutes: 60,
      description: 'Start your morning with auspicious Pooja, Vedic chants, floral archana & live darshan from Majestique Euriska Club House.',
      icon: '🌅',
      gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
      accentColor: '#ea580c',
      category: 'Aarti',
      youtubeVideoId: morningVideoId,
      youtubeUrl: morningVideoId ? `https://www.youtube.com/watch?v=${morningVideoId}` : undefined,
    },
    {
      id: `sep${day}_evening`,
      type: 'evening',
      title: `${eveningTitle} (8:00 PM)`,
      subtitle: eveningSubtitle,
      timeDisplay: '8:00 PM - 9:00 PM IST',
      hour: 20,
      minute: 0,
      durationMinutes: 60,
      description: 'Grand Evening Maha Aarti with Dhol Tasha beats, devotional bhajan recitals, and cultural performances by society talents.',
      icon: '🌆',
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #31104b 100%)',
      accentColor: '#ef4444',
      category: 'Aarti',
      youtubeVideoId: eveningVideoId,
      youtubeUrl: eveningVideoId ? `https://www.youtube.com/watch?v=${eveningVideoId}` : undefined,
    },
  ];
}

export const liveScheduleService = {
  getNowInIST(): Date {
    return new Date();
  },

  /**
   * Returns all 12 Festival Days (14th Sep to 25th Sep 2026)
   */
  getFestivalSchedule(): ScheduledDayInfo[] {
    const now = this.getNowInIST();
    const currentYear = now.getFullYear();

    return FESTIVAL_DAYS_CONFIG.map((dayConfig) => {
      const targetDate = new Date(currentYear, dayConfig.month - 1, dayConfig.day);

      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const dayShort = `${targetDate.getDate()} Sep`;
      const dayLabel = targetDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
      const formattedDate = targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

      // Check if targetDate is today
      const isToday =
        now.getDate() === targetDate.getDate() &&
        now.getMonth() === targetDate.getMonth() &&
        now.getFullYear() === targetDate.getFullYear();

      const isPast = now.getTime() > targetDate.getTime() + 24 * 60 * 60 * 1000;

      const slots = dayConfig.slots.map((slot) => {
        const startTime = new Date(targetDate);
        startTime.setHours(slot.hour, slot.minute, 0, 0);

        const endTime = new Date(startTime.getTime() + slot.durationMinutes * 60 * 1000);

        let status: 'live' | 'upcoming' | 'completed' = 'upcoming';
        const nowMs = now.getTime();
        const startMs = startTime.getTime();
        const endMs = endTime.getTime();

        if (nowMs >= startMs && nowMs <= endMs) {
          status = 'live';
        } else if (nowMs > endMs) {
          status = 'completed';
        } else {
          status = 'upcoming';
        }

        const timeRemainingMs = Math.max(0, startMs - nowMs);

        return {
          slot,
          startTime,
          endTime,
          status,
          timeRemainingMs,
        };
      });

      return {
        date: targetDate,
        dateString,
        dayLabel,
        dayShort,
        formattedDate,
        isToday,
        isPast,
        dayNumber: dayConfig.dayNumber,
        festivalDayName: dayConfig.festivalDayName,
        slots,
      };
    });
  },

  /**
   * Get the current active live slot or the immediate next upcoming slot
   */
  getCurrentOrNextSlot(): {
    isLiveNow: boolean;
    slot: DailyScheduleSlot;
    startTime: Date;
    endTime: Date;
    timeRemainingMs: number;
    dayLabel: string;
    festivalDayName?: string;
  } {
    const festivalDays = this.getFestivalSchedule();

    // 1. Check if any slot is live right now
    for (const day of festivalDays) {
      for (const item of day.slots) {
        if (item.status === 'live') {
          return {
            isLiveNow: true,
            slot: item.slot,
            startTime: item.startTime,
            endTime: item.endTime,
            timeRemainingMs: 0,
            dayLabel: day.dayLabel,
            festivalDayName: day.festivalDayName,
          };
        }
      }
    }

    // 2. Find the earliest upcoming slot
    for (const day of festivalDays) {
      for (const item of day.slots) {
        if (item.status === 'upcoming') {
          return {
            isLiveNow: false,
            slot: item.slot,
            startTime: item.startTime,
            endTime: item.endTime,
            timeRemainingMs: item.timeRemainingMs,
            dayLabel: day.dayLabel,
            festivalDayName: day.festivalDayName,
          };
        }
      }
    }

    // Default fallback to Day 1 (14 Sep 5:00 PM)
    const day1 = festivalDays[0];
    const slot1 = day1.slots[0];
    return {
      isLiveNow: false,
      slot: slot1.slot,
      startTime: slot1.startTime,
      endTime: slot1.endTime,
      timeRemainingMs: slot1.timeRemainingMs,
      dayLabel: day1.dayLabel,
      festivalDayName: day1.festivalDayName,
    };
  },

  formatCountdown(ms: number): string {
    if (ms <= 0) return '00s';
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${String(minutes).padStart(2, '0')}m`;
    }
    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  },

  generateGoogleCalendarUrl(slot: DailyScheduleSlot, startTime: Date): string {
    const endTime = new Date(startTime.getTime() + slot.durationMinutes * 60 * 1000);

    const toUtcString = (d: Date) =>
      d
        .toISOString()
        .replace(/-|:|\.\d\d\d/g, '')
        .slice(0, 15) + 'Z';

    const startIso = toUtcString(startTime);
    const endIso = toUtcString(endTime);

    const streamUrl = slot.youtubeUrl || OFFICIAL_YOUTUBE_LIVE_URL;

    const title = encodeURIComponent(`🔴 ${slot.title} - Majestique Euriska Cultural`);
    const details = encodeURIComponent(
      `${slot.description}\n\n👉 Watch Live: ${streamUrl}\n🌐 Web Portal: https://euriskacultural.web.app`
    );
    const location = encodeURIComponent('Majestique Euriska Club House / YouTube Live');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  },
};
