import { writeFileSync } from 'node:fs';

const STREAMS_TO_SCHEDULE = [
  {
    day: '20',
    time: '18:00',
    title: 'Majestique Euriska - Kalakriti Talent Show Gala & 8 PM Aarti (20 Sep) 🎭',
    description: `🎭 Grand Kalakriti Cultural Talent Show Gala, Resident Performances & 8 PM Maha Aarti live from Majestique Euriska Club House!

📅 Date: 20 September 2026 (Day 7)
⏰ Time: 6:00 PM IST onwards
📍 Venue: Main Stage & Club House Mandap, Majestique Euriska, Pune

✨ Gala Highlights:
• Kids Dance, Solo & Group Singing Performances
• Drama, Skits & Poetry Recitation by Residents
• Traditional Attire Fashion Show
• 8:00 PM Grand Evening Maha Aarti & Modak Prasad

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST
• Satyanarayan Katha & Mahaprasad (24 Sep)
• Anant Chaturdashi Visarjan (25 Sep)

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for all live celebrations!

#MajestiqueEuriska #Kalakriti #TalentShow #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    day: '21',
    time: '08:00',
    title: 'Majestique Euriska - Daily Morning Aarti & Darshan (21 Sep, 8 AM) 🌅',
    description: `🌅 Auspicious Morning Aarti & Divine Darshan from Majestique Euriska Club House Mandap.
Start Day 8 with Ganesh Atharvashirsha recitation, morning pooja and heartfelt prayers.

📅 Date: 21 September 2026 (Day 8)
⏰ Time: 8:00 AM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST
• Satyanarayan Katha & Mahaprasad (24 Sep)
• Anant Chaturdashi Visarjan (25 Sep)

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for daily live aartis!

#MajestiqueEuriska #MorningAarti #GaneshDarshan #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    day: '21',
    time: '20:00',
    title: 'Majestique Euriska - Daily Evening Maha Aarti & Cultural Stage (21 Sep, 8 PM) 🪔',
    description: `🪔 Divine Evening Maha Aarti & Society Stage Performances from Majestique Euriska.
Join residents and devotees for sacred mantras, traditional dholak beats, and Prasad seva.

📅 Date: 21 September 2026 (Day 8)
⏰ Time: 8:00 PM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST
• Satyanarayan Katha & Mahaprasad (24 Sep)
• Anant Chaturdashi Visarjan (25 Sep)

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for live broadcasts!

#MajestiqueEuriska #EveningAarti #MahaAarti #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    day: '22',
    time: '08:00',
    title: 'Majestique Euriska - Daily Morning Aarti & Darshan (22 Sep, 8 AM) 🌅',
    description: `🌅 Peaceful Morning Aarti, Archana & Darshan from Majestique Euriska Mandap.
Connect with the divine presence of Ganpati Bappa through sacred chants and morning rituals.

📅 Date: 22 September 2026 (Day 9)
⏰ Time: 8:00 AM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST
• Satyanarayan Katha & Mahaprasad (24 Sep)
• Anant Chaturdashi Visarjan (25 Sep)

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for daily morning prayers!

#MajestiqueEuriska #MorningAarti #Ganeshotsav2026 #Pune #LiveStream`
  },
  {
    day: '22',
    time: '20:00',
    title: 'Majestique Euriska - Daily Evening Maha Aarti & Musical Showcase (22 Sep, 8 PM) 🪔',
    description: `🪔 Grand Evening Maha Aarti & Devotional Musical Showcase from Majestique Euriska Club House.
Celebrate the festive spirit with instrumental melodies, group bhajans and evening pooja.

📅 Date: 22 September 2026 (Day 9)
⏰ Time: 8:00 PM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST
• Satyanarayan Katha & Mahaprasad (24 Sep)
• Anant Chaturdashi Visarjan (25 Sep)

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for live stream notifications!

#MajestiqueEuriska #EveningAarti #DevotionalMusic #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    day: '23',
    time: '08:00',
    title: 'Majestique Euriska - Daily Morning Aarti & Darshan (23 Sep, 8 AM) 🌅',
    description: `🌅 Auspicious Morning Aarti & Darshan from Majestique Euriska Mandap.
Experience the serene vibration of Vedic hymns, Ganpati Atharvashirsha & floral offerings.

📅 Date: 23 September 2026 (Day 10)
⏰ Time: 8:00 AM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST
• Satyanarayan Katha & Mahaprasad (24 Sep)
• Anant Chaturdashi Visarjan (25 Sep)

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for live pooja updates!

#MajestiqueEuriska #MorningAarti #BappaBlessings #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    day: '23',
    time: '20:00',
    title: 'Majestique Euriska - Daily Evening Maha Aarti & Devotional Sangeet (23 Sep, 8 PM) 🪔',
    description: `🪔 Classical Devotional Night & 8 PM Maha Aarti from Majestique Euriska Club House.
Join society families for an uplifting evening of abhangs, classical singing, and divine blessings.

📅 Date: 23 September 2026 (Day 10)
⏰ Time: 8:00 PM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST
• Satyanarayan Katha & Mahaprasad (24 Sep)
• Anant Chaturdashi Visarjan (25 Sep)

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for live broadcasts!

#MajestiqueEuriska #DevotionalSangeet #MahaAarti #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    day: '24',
    time: '08:00',
    title: 'Majestique Euriska - Daily Morning Aarti & Darshan (24 Sep, 8 AM) 🌅',
    description: `🌅 Sacred Morning Aarti & Darshan from Majestique Euriska Mandap.
Offer your morning prayers on this auspicious Day 11, preceding the sacred Satyanarayan Pooja.

📅 Date: 24 September 2026 (Day 11)
⏰ Time: 8:00 AM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Today's Special Schedule:
• 8:00 AM: Morning Aarti & Darshan
• 4:00 PM: Sacred Shri Satyanarayan Katha & Pooja
• 8:00 PM: Evening Maha Aarti & Grand Community Mahaprasad Feast

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for all live events!

#MajestiqueEuriska #MorningAarti #SatyanarayanKatha #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    day: '24',
    time: '16:00',
    title: 'Majestique Euriska - Satyanarayan Katha & Mahaprasad Feast (24 Sep, 4 PM) 🍲',
    description: `🍲 Sacred Shri Satyanarayan Katha (4 PM), Evening Maha Aarti (8 PM) & Grand Community Mahaprasad Feast live from Majestique Euriska Club House!

📅 Date: 24 September 2026 (Day 11)
⏰ Time: 4:00 PM IST onwards
📍 Venue: Club House Mandap & Dining Hall, Majestique Euriska, Pune

✨ Program Highlights:
• 4:00 PM: Shri Satyanarayan Maha Pooja & Katha recitation
• 7:30 PM: Bhajan Sandhya
• 8:00 PM: Grand Evening Maha Aarti with 108 diyas
• 8:30 PM onwards: Society Community Mahaprasad Feast

✨ Ganeshotsav 2026 Schedule:
• Final Day: Ganesh Uttarpujana (25 Sep, 8 AM) & Visarjan Miravnuk (25 Sep, 4 PM)

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for all live broadcasts!

#MajestiqueEuriska #SatyanarayanKatha #Mahaprasad #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    day: '25',
    time: '08:00',
    title: 'Majestique Euriska - Ganesh Uttarpujana & Morning Darshan (25 Sep, 8 AM) 🌸',
    description: `🌸 Auspicious Ganesh Uttarpujana & Final Morning Darshan on Anant Chaturdashi.
Join us for the farewell stotra recitation, pushpanjali, and morning blessings before the grand Visarjan procession.

📅 Date: 25 September 2026 (Day 12 - Anant Chaturdashi)
⏰ Time: 8:00 AM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Anant Chaturdashi Schedule:
• 8:00 AM: Sacred Uttar Pooja & Morning Darshan
• 4:00 PM: Grand Anant Chaturdashi Visarjan Miravnuk & Eco Immersion

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for the farewell procession!

#MajestiqueEuriska #UttarPooja #AnantChaturdashi #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    day: '25',
    time: '16:00',
    title: 'Majestique Euriska - Anant Chaturdashi Ganesh Visarjan Miravnuk (25 Sep, 4 PM) 🌊',
    description: `🌊 Grand Anant Chaturdashi Ganesh Visarjan Miravnuk & Farewell Procession live from Majestique Euriska!
With heavy hearts and loud chants of "Pudhchya Varshi Lavkar Ya", bid farewell to our beloved Bappa.

📅 Date: 25 September 2026 (Day 12 - Anant Chaturdashi)
⏰ Time: 4:00 PM IST onwards
📍 Venue: Club House to Society Main Gate & Eco-Immersion Tank, Majestique Euriska, Pune

✨ Miravnuk Highlights:
• Grand Visarjan Procession with Dhol Tasha Pathak beats
• Traditional Lezim & Gulal celebrations by residents
• Farewell Aarti & Eco-friendly Visarjan Immersion Ceremony
• "Ganpati Bappa Morya, Pudhchya Varshi Lavkar Ya!"

🌐 Official Website: https://euriskacultural.web.app
🔔 Thank you for celebrating Ganeshotsav 2026 with @MajestiqueEuriskaCultural!

#MajestiqueEuriska #GaneshVisarjan #AnantChaturdashi #DholTasha #Ganeshotsav2026 #LiveStream #Pune`
  }
];

async function scheduleOne(ws, send, stream, index, total) {
  console.log(`\n------------------------------------------------------------`);
  console.log(`[${index + 1}/${total}] Scheduling: ${stream.title}`);
  console.log(`Date: ${stream.day} Sept 2026 at ${stream.time}`);
  console.log(`------------------------------------------------------------`);

  // Navigate to manage page
  await send('Page.navigate', { url: 'https://studio.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw/livestreaming/manage' });
  await new Promise(r => setTimeout(r, 4500));

  // Click Schedule Stream button
  await send('Runtime.evaluate', { expression: 'document.querySelector("#schedule-button")?.click()' });
  await new Promise(r => setTimeout(r, 3000));

  // If "Create new" exists (reuse dialog)
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const createNewBtn = Array.from(document.querySelectorAll('button, ytcp-button')).find(b => b.innerText.trim().toLowerCase() === 'create new');
        if (createNewBtn) createNewBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  // STEP 1: Details
  // 1. Fill Title
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const titleBox = document.querySelectorAll('[contenteditable="true"]')[0];
        if (titleBox) {
          titleBox.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, ${JSON.stringify(stream.title)});
          titleBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 500));

  // 2. Fill Description
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const descBox = document.querySelectorAll('[contenteditable="true"]')[1];
        if (descBox) {
          descBox.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, ${JSON.stringify(stream.description)});
          descBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 500));

  // Escape hashtag autocomplete popovers
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape' });
  await new Promise(r => setTimeout(r, 400));

  // 3. Not Made for Kids
  await send('Runtime.evaluate', {
    expression: `document.querySelector('[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]')?.click()`
  });
  await new Promise(r => setTimeout(r, 800));

  // 4. Click Next -> Step 2
  await send('Runtime.evaluate', { expression: 'document.querySelector("#next-button")?.click()' });
  await new Promise(r => setTimeout(r, 1500));

  // 5. Click Next -> Step 3
  await send('Runtime.evaluate', { expression: 'document.querySelector("#next-button")?.click()' });
  await new Promise(r => setTimeout(r, 1500));

  // STEP 3: Visibility
  // 1. Select Public
  await send('Runtime.evaluate', {
    expression: `document.querySelector('[name="PUBLIC"]')?.click()`
  });
  await new Promise(r => setTimeout(r, 800));

  // 2. Scroll dialog down so trigger is in view
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const trigger = document.querySelector('#datepicker-trigger');
        if (trigger) trigger.scrollIntoView({ block: 'center', behavior: 'instant' });
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // 3. Click trigger via CDP mouse events
  const triggerBox = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const trigger = document.querySelector('#datepicker-trigger');
        if (!trigger) return null;
        const rect = trigger.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      })()
    `,
    returnByValue: true
  });

  if (triggerBox.result.value) {
    const { x, y } = triggerBox.result.value;
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }
  await new Promise(r => setTimeout(r, 1200));

  // 4. Select Day in Calendar
  const dayClick = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const days = Array.from(document.querySelectorAll('span.calendar-day')).filter(s => s.innerText.trim() === '${stream.day}' && !s.className.includes('disabled'));
        if (days.length > 0) {
          days[0].click();
          return 'Clicked day ${stream.day}';
        }
        return 'Day ${stream.day} not found';
      })()
    `,
    returnByValue: true
  });
  console.log(`  -> Date: ${dayClick.result?.value}`);
  await new Promise(r => setTimeout(r, 800));

  // 5. Set Time
  const timeSet = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const timeInput = document.querySelector('ytcp-datetime-picker input');
        if (timeInput) {
          timeInput.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, '${stream.time}');
          timeInput.dispatchEvent(new Event('input', { bubbles: true }));
          timeInput.dispatchEvent(new Event('change', { bubbles: true }));
          return 'Set time to ' + timeInput.value;
        }
        return 'Time input not found';
      })()
    `,
    returnByValue: true
  });
  console.log(`  -> Time: ${timeSet.result?.value}`);

  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter' });
  await new Promise(r => setTimeout(r, 800));

  // 6. Click Done
  const doneResult = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const doneBtn = document.querySelector('#done-button') || document.querySelector('#create-button');
        const disabled = doneBtn?.getAttribute('aria-disabled');
        if (doneBtn && disabled !== 'true') {
          doneBtn.click();
          return 'Done clicked';
        }
        return 'Done disabled or not found';
      })()
    `,
    returnByValue: true
  });
  console.log(`  -> Action: ${doneResult.result?.value}`);

  // Wait for submission to complete
  await new Promise(r => setTimeout(r, 6000));
  console.log(`  ✓ Successfully scheduled stream: ${stream.title}`);
}

async function main() {
  const tabs = await (await fetch('http://localhost:9222/json')).json();
  const tab = tabs.find(t => t.type === 'page' && t.url.includes('studio.youtube.com'));
  if (!tab) throw new Error('No YouTube Studio tab found');

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const handler = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id === curId) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  await new Promise(r => ws.onopen = r);

  console.log(`Starting scheduling batch for ${STREAMS_TO_SCHEDULE.length} remaining streams (Streams 14 through 24)...`);

  for (let i = 0; i < STREAMS_TO_SCHEDULE.length; i++) {
    await scheduleOne(ws, send, STREAMS_TO_SCHEDULE[i], i, STREAMS_TO_SCHEDULE.length);
  }

  console.log('\n============================================================');
  console.log('ALL REMAINING STREAMS SCHEDULED SUCCESSFULLY!');
  console.log('============================================================');

  ws.close();
}

main().catch(console.error);
