/**
 * Configuration for YouTube Live Stream Scheduler
 * Channel: Majestique Euriska Cultural (@MajestiqueEuriskaCultural)
 * https://www.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw
 *
 * Customize stream titles, descriptions, and scheduling preferences here.
 */

export const config = {
  // ─── Stream Schedule ──────────────────────────────────────────────
  timezone: 'Asia/Kolkata',
  daysAhead: 7, // How many days ahead to schedule streams

  // Morning stream (8:00 AM IST)
  morning: {
    hour: 8,
    minute: 0,
    title: 'Majestique Euriska Cultural - Morning Live',
    description: `🌅 Good Morning! Welcome to Majestique Euriska Cultural's Morning Live Session.

Join us for an enriching cultural experience every morning at 8:00 AM IST.

🏛️ Majestique Euriska Cultural brings you the best of art, culture, and community engagement.

🔔 Subscribe and hit the bell icon to never miss a live session!
👉 Channel: https://www.youtube.com/@MajestiqueEuriskaCultural
🌐 Website: https://euriskacultural.web.app

#MajestiqueEuriskaCultural #MorningLive #Culture #LiveStream #Community`,
  },

  // Evening stream (8:00 PM IST)
  evening: {
    hour: 20,
    minute: 0,
    title: 'Majestique Euriska Cultural - Evening Live',
    description: `🌆 Good Evening! Welcome to Majestique Euriska Cultural's Evening Live Session.

Join us for an engaging cultural experience every evening at 8:00 PM IST.

🏛️ Majestique Euriska Cultural brings you the best of art, culture, and community engagement.

🔔 Subscribe and hit the bell icon to never miss a live session!
👉 Channel: https://www.youtube.com/@MajestiqueEuriskaCultural
🌐 Website: https://euriskacultural.web.app

#MajestiqueEuriskaCultural #EveningLive #Culture #LiveStream #Community`,
  },

  // ─── Stream Settings ──────────────────────────────────────────────
  privacyStatus: 'public',    // 'public', 'unlisted', or 'private'
  categoryId: '27',           // 27 = Education (https://gist.github.com/dgp/1b24bf2961b6022a0c6b)
  defaultLanguage: 'en',
  enableAutoStart: false,     // Auto-start when encoder connects
  enableAutoStop: true,       // Auto-stop when encoder disconnects
  enableDvr: true,            // Allow viewers to rewind during live
  enableEmbed: true,          // Allow embedding on other sites
  recordFromStart: true,      // Record the broadcast from the start
  enableClosedCaptions: false,

  // ─── Stream Resolution ────────────────────────────────────────────
  streamResolution: '1080p',  // '1080p', '720p', '480p', '360p', '240p'
  frameRate: '30fps',         // '30fps' or '60fps'
  ingestionType: 'rtmp',      // 'rtmp' or 'dash'
};
