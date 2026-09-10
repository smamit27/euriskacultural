/**
 * YouTube Live Stream Scheduler
 *
 * Creates scheduled live broadcasts on YouTube at 8:00 AM and 8:00 PM IST
 * for the next N days (configurable in config.js).
 *
 * Usage:
 *   npm run schedule
 *
 * Prerequisites:
 *   - Run `npm run auth` first to authorize with your YouTube account
 *   - token.json must exist (created by auth.js)
 *   - client_secret.json must exist (from Google Cloud Console)
 */

import { google } from 'googleapis';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLIENT_SECRET_PATH = join(__dirname, 'client_secret.json');
const TOKEN_PATH = join(__dirname, 'token.json');

// ─── Validate Prerequisites ────────────────────────────────────────

function validatePrerequisites() {
  if (!existsSync(CLIENT_SECRET_PATH)) {
    console.error('\n❌ client_secret.json not found!');
    console.error('   Run: npm run auth  (after setting up Google Cloud credentials)\n');
    process.exit(1);
  }

  if (!existsSync(TOKEN_PATH)) {
    console.error('\n❌ token.json not found!');
    console.error('   Run: npm run auth  (to authorize with your YouTube account)\n');
    process.exit(1);
  }
}

// ─── Create Authenticated YouTube Client ────────────────────────────

function createYouTubeClient() {
  const credentials = JSON.parse(readFileSync(CLIENT_SECRET_PATH, 'utf8'));
  const { client_id, client_secret } = credentials.installed || credentials.web;

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    'http://localhost:3456/oauth2callback'
  );

  const tokens = JSON.parse(readFileSync(TOKEN_PATH, 'utf8'));
  oauth2Client.setCredentials(tokens);

  return google.youtube({ version: 'v3', auth: oauth2Client });
}

// ─── Generate Schedule Time Slots for Ganeshotsav 2026 ──────────────

function getSlotsForFestivalDate(targetDate) {
  const day = targetDate.getDate();
  const month = targetDate.getMonth() + 1; // 1-indexed (9 for Sep)

  // 14th Sep: Starts Evening at 5:00 PM (Aagman) & 8:00 PM (Sthapana Aarti)
  if (month === 9 && day === 14) {
    return [
      {
        session: 'aagman',
        hour: 17,
        minute: 0,
        title: 'Majestique Euriska - Ganesh Aagman Miravnuk & Sthapana Ceremony',
        description: `🥁 Ganpati Bappa Morya!
Welcome Lord Ganesha with grand Aagman Miravnuk & Dhol Tasha Pathak beats at Majestique Euriska.

Live from Society Main Gate & Club House Mandap.
🌐 Website: https://euriskacultural.web.app
👉 YouTube: https://www.youtube.com/@MajestiqueEuriskaCultural

#MajestiqueEuriska #GaneshAagman #Ganeshotsav2026 #LiveStream`,
      },
      {
        session: 'evening_aarti',
        hour: 20,
        minute: 0,
        title: 'Majestique Euriska - Shri Ganesh Pratham Maha Aarti (8:00 PM)',
        description: `🪔 Auspicious First Evening Maha Aarti & Deepotsav of Ganeshotsav 2026.
Join us live for evening prayers & Prasad distribution.

🌐 Website: https://euriskacultural.web.app
👉 YouTube: https://www.youtube.com/@MajestiqueEuriskaCultural

#MajestiqueEuriska #GaneshAarti #LiveStream`,
      },
    ];
  }

  // 25th Sep: Final Day (Visarjan starts 4:00 PM)
  if (month === 9 && day === 25) {
    return [
      {
        session: 'morning_aarti',
        hour: 8,
        minute: 0,
        title: 'Majestique Euriska - Ganesh Uttarpujana & Morning Darshan (8:00 AM)',
        description: `🌸 Sacred Uttar Pooja & final morning darshan of Lord Ganesha before Visarjan.

🌐 Website: https://euriskacultural.web.app
👉 YouTube: https://www.youtube.com/@MajestiqueEuriskaCultural

#MajestiqueEuriska #Uttarpujan #LiveStream`,
      },
      {
        session: 'visarjan',
        hour: 16,
        minute: 0,
        title: 'Majestique Euriska - Anant Chaturdashi Ganesh Visarjan Miravnuk (4:00 PM)',
        description: `🌊 Ganpati Bappa Morya, Pudhchya Varshi Lavkar Ya!
Emotional farewell procession & eco-friendly Visarjan immersion ceremony from Majestique Euriska.

🌐 Website: https://euriskacultural.web.app
👉 YouTube: https://www.youtube.com/@MajestiqueEuriskaCultural

#MajestiqueEuriska #GaneshVisarjan #AnantChaturdashi #LiveStream`,
      },
    ];
  }

  // 15th to 24th Sep (or default): Morning 8:00 AM & Evening 8:00 PM
  let eveningTitle = 'Majestique Euriska Cultural - Evening Maha Aarti (8:00 PM)';
  if (month === 9 && day === 19) {
    eveningTitle = 'Majestique Euriska - Society Carnival, Radio City 91.1 FM & 8 PM Aarti';
  } else if (month === 9 && day === 20) {
    eveningTitle = 'Majestique Euriska - Kalakriti Talent Show Gala & 8 PM Aarti';
  } else if (month === 9 && day === 24) {
    eveningTitle = 'Majestique Euriska - Satyanarayan Katha & Mahaprasad Feast (8:00 PM)';
  }

  return [
    {
      session: 'morning',
      hour: 8,
      minute: 0,
      title: 'Majestique Euriska Cultural - Morning Aarti & Darshan (8:00 AM)',
      description: `🌅 Daily Morning Pooja, Aarti & Darshan from Majestique Euriska Club House.

🌐 Website: https://euriskacultural.web.app
👉 YouTube: https://www.youtube.com/@MajestiqueEuriskaCultural

#MajestiqueEuriska #MorningAarti #LiveStream`,
    },
    {
      session: 'evening',
      hour: 20,
      minute: 0,
      title: eveningTitle,
      description: `🌆 Grand Evening Maha Aarti with Dhol Tasha beats & cultural stage performances from Majestique Euriska Club House.

🌐 Website: https://euriskacultural.web.app
👉 YouTube: https://www.youtube.com/@MajestiqueEuriskaCultural

#MajestiqueEuriska #EveningAarti #LiveStream`,
    },
  ];
}

function generateTimeSlots() {
  const slots = [];
  const now = new Date();

  // Get current time in IST for comparison
  const istNow = new Date(
    now.toLocaleString('en-US', { timeZone: config.timezone })
  );

  const daysToSchedule = Math.max(config.daysAhead || 16, 16);

  for (let day = 0; day < daysToSchedule; day++) {
    const slotDate = new Date(istNow);
    slotDate.setDate(slotDate.getDate() + day);

    const daySlots = getSlotsForFestivalDate(slotDate);

    for (const sessionConfig of daySlots) {
      slotDate.setHours(sessionConfig.hour, sessionConfig.minute, 0, 0);

      // Skip slots that are in the past
      if (slotDate <= istNow) continue;

      const year = slotDate.getFullYear();
      const month = String(slotDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(slotDate.getDate()).padStart(2, '0');
      const hour = String(sessionConfig.hour).padStart(2, '0');
      const minute = String(sessionConfig.minute).padStart(2, '0');
      // IST is +05:30
      const isoString = `${year}-${month}-${dayStr}T${hour}:${minute}:00+05:30`;

      slots.push({
        session: sessionConfig.session,
        title: sessionConfig.title,
        description: sessionConfig.description,
        scheduledStartTime: isoString,
        displayTime: `${dayStr}/${month}/${year} ${hour}:${minute} IST`,
      });
    }
  }

  return slots;
}

// ─── Fetch Existing Scheduled Broadcasts ────────────────────────────

async function getExistingBroadcasts(youtube) {
  const existing = [];
  let pageToken = undefined;

  do {
    const response = await youtube.liveBroadcasts.list({
      part: ['snippet', 'status'],
      broadcastStatus: 'upcoming',
      maxResults: 50,
      pageToken,
    });

    if (response.data.items) {
      existing.push(...response.data.items);
    }
    pageToken = response.data.nextPageToken;
  } while (pageToken);

  return existing;
}

// ─── Check for Duplicate Broadcast ──────────────────────────────────

function isDuplicate(slot, existingBroadcasts) {
  return existingBroadcasts.some((broadcast) => {
    const existingTime = new Date(broadcast.snippet.scheduledStartTime).getTime();
    const slotTime = new Date(slot.scheduledStartTime).getTime();
    // Consider it a duplicate if same time (within 5 minutes) and similar title
    const timeDiff = Math.abs(existingTime - slotTime);
    const sameTitle = broadcast.snippet.title === slot.title;
    return timeDiff < 5 * 60 * 1000 && sameTitle;
  });
}

// ─── Create a Live Broadcast ────────────────────────────────────────

async function createBroadcast(youtube, slot) {
  // 1. Create the broadcast
  const broadcastResponse = await youtube.liveBroadcasts.insert({
    part: ['snippet', 'contentDetails', 'status'],
    requestBody: {
      snippet: {
        title: slot.title,
        description: slot.description,
        scheduledStartTime: slot.scheduledStartTime,
        defaultLanguage: config.defaultLanguage,
      },
      contentDetails: {
        enableAutoStart: config.enableAutoStart,
        enableAutoStop: config.enableAutoStop,
        enableDvr: config.enableDvr,
        enableEmbed: config.enableEmbed,
        recordFromStart: config.recordFromStart,
        enableClosedCaptions: config.enableClosedCaptions,
      },
      status: {
        privacyStatus: config.privacyStatus,
        selfDeclaredMadeForKids: false,
      },
    },
  });

  const broadcast = broadcastResponse.data;

  // 2. Create a live stream to bind to the broadcast
  const streamResponse = await youtube.liveStreams.insert({
    part: ['snippet', 'cdn'],
    requestBody: {
      snippet: {
        title: `${slot.title} - Stream`,
        description: `Stream for ${slot.title}`,
      },
      cdn: {
        frameRate: config.frameRate,
        ingestionType: config.ingestionType,
        resolution: config.streamResolution,
      },
    },
  });

  const stream = streamResponse.data;

  // 3. Bind the stream to the broadcast
  await youtube.liveBroadcasts.bind({
    part: ['id', 'contentDetails'],
    id: broadcast.id,
    streamId: stream.id,
  });

  return {
    broadcastId: broadcast.id,
    streamId: stream.id,
    streamKey: stream.cdn?.ingestionInfo?.streamName,
    ingestionAddress: stream.cdn?.ingestionInfo?.ingestionAddress,
    watchUrl: `https://youtube.com/watch?v=${broadcast.id}`,
  };
}

// ─── Main ───────────────────────────────────────────────────────────

async function main() {
  validatePrerequisites();

  console.log('\n📺 YouTube Live Stream Scheduler');
  console.log('━'.repeat(50));
  console.log(`   Timezone: ${config.timezone}`);
  console.log(`   Days ahead: ${config.daysAhead}`);
  console.log(`   Morning: ${config.morning.hour}:${String(config.morning.minute).padStart(2, '0')} — "${config.morning.title}"`);
  console.log(`   Evening: ${config.evening.hour}:${String(config.evening.minute).padStart(2, '0')} — "${config.evening.title}"`);
  console.log(`   Privacy: ${config.privacyStatus}`);
  console.log('━'.repeat(50));

  const youtube = createYouTubeClient();

  // Generate time slots
  const slots = generateTimeSlots();
  console.log(`\n📅 Generated ${slots.length} time slots for the next ${config.daysAhead} days\n`);

  if (slots.length === 0) {
    console.log('   No future slots to schedule. Try increasing daysAhead in config.js\n');
    return;
  }

  // Fetch existing broadcasts to avoid duplicates
  console.log('🔍 Checking for existing scheduled broadcasts...');
  const existingBroadcasts = await getExistingBroadcasts(youtube);
  console.log(`   Found ${existingBroadcasts.length} existing upcoming broadcasts\n`);

  // Create broadcasts
  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const slot of slots) {
    const icon = slot.session === 'morning' ? '🌅' : '🌆';

    // Check for duplicates
    if (isDuplicate(slot, existingBroadcasts)) {
      console.log(`   ⏭️  ${icon} ${slot.displayTime} — "${slot.title}" (already exists, skipped)`);
      skipped++;
      continue;
    }

    try {
      const result = await createBroadcast(youtube, slot);
      console.log(`   ✅ ${icon} ${slot.displayTime} — "${slot.title}"`);
      console.log(`      Watch: ${result.watchUrl}`);
      if (result.streamKey) {
        console.log(`      Stream Key: ${result.streamKey}`);
      }
      created++;

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message;
      console.error(`   ❌ ${icon} ${slot.displayTime} — "${slot.title}"`);
      console.error(`      Error: ${errorMessage}`);
      failed++;
    }
  }

  // Summary
  console.log('\n' + '━'.repeat(50));
  console.log('📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped (duplicates): ${skipped}`);
  if (failed > 0) {
    console.log(`   ❌ Failed: ${failed}`);
  }
  console.log('━'.repeat(50));
  console.log('\n🎬 View your scheduled streams at:');
  console.log('   https://studio.youtube.com/channel/UC/livestreaming/manage\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err.message);
  if (err.response?.data) {
    console.error('   API Response:', JSON.stringify(err.response.data, null, 2));
  }
  process.exit(1);
});
