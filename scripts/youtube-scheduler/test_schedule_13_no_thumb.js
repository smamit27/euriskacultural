import { writeFileSync } from 'node:fs';

async function testScheduleWithoutThumbnail(stream) {
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

  console.log(`\n========================================`);
  console.log(`Scheduling: ${stream.title}`);
  console.log(`Date: ${stream.day} Sept 2026 at ${stream.time}`);
  console.log(`========================================`);

  // Navigate to livestreaming manage page
  console.log('Navigating to livestreaming manage...');
  await send('Page.navigate', { url: 'https://studio.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw/livestreaming/manage' });
  await new Promise(r => setTimeout(r, 4500));

  // Click Schedule Stream
  console.log('Clicking Schedule Stream button...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('#schedule-button');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 2500));

  // Handle "Create new" if reuse dialog is shown
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
  console.log('Filling Title...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const titleBox = document.querySelector('#title-textarea #textbox, [aria-label*="title" i]');
        if (titleBox) {
          titleBox.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, ${JSON.stringify(stream.title)});
          titleBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('Filling Description...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const descBox = document.querySelector('#description-textarea #textbox, [aria-label*="description" i]');
        if (descBox) {
          descBox.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, ${JSON.stringify(stream.description)});
          descBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `
  });

  // Escape popovers/tooltips
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape' });
  await new Promise(r => setTimeout(r, 600));

  // Select Not Made for Kids
  console.log('Selecting Not Made for Kids...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const r = document.querySelector('[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]');
        if (r) r.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Click Next -> Step 2 (Customisation)
  console.log('Proceeding to Step 2 (Customisation)...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const nextBtn = document.querySelector('#next-button');
        if (nextBtn) nextBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  // Click Next -> Step 3 (Visibility)
  console.log('Proceeding to Step 3 (Visibility)...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const nextBtn = document.querySelector('#next-button');
        if (nextBtn) nextBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  // STEP 3: Visibility
  // 1. Select Public
  console.log('Selecting Public...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const pub = document.querySelector('[name="PUBLIC"]');
        if (pub) pub.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // 2. Click #datepicker-trigger
  console.log('Opening Datepicker...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const trigger = document.querySelector('#datepicker-trigger');
        if (trigger) {
          trigger.scrollIntoView({ block: 'center' });
          trigger.click();
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1200));

  // Click target day in calendar
  const dayClickRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const days = Array.from(document.querySelectorAll('span.calendar-day')).filter(s => s.innerText.trim() === '${stream.day}');
        if (days.length > 0) {
          days[days.length - 1].click();
          return 'Clicked day ${stream.day}';
        }
        return 'Day ${stream.day} not found. Available: ' + Array.from(document.querySelectorAll('span.calendar-day')).map(s => s.innerText.trim()).join(',');
      })()
    `,
    returnByValue: true
  });
  console.log('Date selection result:', dayClickRes.result.value);
  await new Promise(r => setTimeout(r, 1000));

  // 3. Set Time
  console.log(`Setting Time to ${stream.time}...`);
  const timeRes = await send('Runtime.evaluate', {
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
  console.log('Time selection result:', timeRes.result.value);
  await new Promise(r => setTimeout(r, 1000));

  // Verify before clicking Done
  const verification = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const doneBtn = document.querySelector('#done-button') || document.querySelector('#create-button');
        return {
          doneBtnText: doneBtn?.innerText?.trim(),
          disabled: doneBtn?.getAttribute('aria-disabled'),
          dateText: document.querySelector('#datepicker-trigger')?.innerText?.trim(),
          timeValue: document.querySelector('ytcp-datetime-picker input')?.value
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Verification before Done:', JSON.stringify(verification.result.value, null, 2));

  // Click Done button
  const doneClick = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const doneBtn = document.querySelector('#done-button') || document.querySelector('#create-button');
        if (doneBtn && doneBtn.getAttribute('aria-disabled') !== 'true') {
          doneBtn.click();
          return 'Done button clicked!';
        }
        return 'Done button disabled or not found';
      })()
    `,
    returnByValue: true
  });
  console.log('Done click result:', doneClick.result.value);

  // Wait for creation to complete
  await new Promise(r => setTimeout(r, 5000));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/post_schedule_test13.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved post_schedule_test13.png');

  ws.close();
  return true;
}

const stream13 = {
  title: 'Majestique Euriska - Daily Morning Aarti & Darshan (20 Sep, 8 AM) 🌅',
  description: `🌅 Day 7 Morning Aarti & Divine Darshan from Majestique Euriska Club House.
Start your Sunday with auspicious Ganpati Atharvashirsha chanting, morning aarti and prasad.

📅 Date: 20 September 2026 (Day 7)
⏰ Time: 8:00 AM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Today's Highlights:
• 8:00 AM: Morning Aarti & Darshan
• 6:00 PM: Grand Kalakriti Cultural Talent Show Gala & 8 PM Maha Aarti

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST
• Satyanarayan Katha & Mahaprasad (24 Sep)
• Anant Chaturdashi Visarjan (25 Sep)

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for daily live prayers!

#MajestiqueEuriska #MorningAarti #Kalakriti #Ganeshotsav2026 #LiveStream #Pune`,
  day: '20',
  time: '08:00'
};

testScheduleWithoutThumbnail(stream13).catch(console.error);
