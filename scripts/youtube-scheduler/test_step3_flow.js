import { writeFileSync } from 'node:fs';

async function testCompleteCreationFlow() {
  const tabs = await (await fetch('http://localhost:9222/json')).json();
  const tab = tabs.find(t => t.type === 'page' && t.url.includes('studio.youtube.com'));
  if (!tab) return console.log('No tab');

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

  const title = 'Majestique Euriska - Daily Morning Aarti & Darshan (20 Sep, 8 AM) 🌅';
  const description = `🌅 Day 7 Morning Aarti & Divine Darshan from Majestique Euriska Club House.
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

#MajestiqueEuriska #MorningAarti #Kalakriti #Ganeshotsav2026 #LiveStream #Pune`;

  // 1. Set Title
  console.log('1. Setting title...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const titleBox = document.querySelectorAll('[contenteditable="true"]')[0];
        if (titleBox) {
          titleBox.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, ${JSON.stringify(title)});
          titleBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // 2. Set Description
  console.log('2. Setting description...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const descBox = document.querySelectorAll('[contenteditable="true"]')[1];
        if (descBox) {
          descBox.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, ${JSON.stringify(description)});
          descBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // Escape hashtag autocomplete popovers
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape' });
  await new Promise(r => setTimeout(r, 400));

  // 3. Not Made for Kids
  console.log('3. Selecting Not Made for Kids...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const mfk = document.querySelector('[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]');
        if (mfk) mfk.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Check Step 1 validity
  const step1Check = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const nextBtn = document.querySelector('#next-button');
        return {
          title: document.querySelectorAll('[contenteditable="true"]')[0]?.innerText,
          nextDisabled: nextBtn ? nextBtn.getAttribute('aria-disabled') : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Step 1 status:', JSON.stringify(step1Check.result.value, null, 2));

  // Click Next -> Step 2
  console.log('4. Clicking Next -> Step 2...');
  await send('Runtime.evaluate', { expression: 'document.querySelector("#next-button")?.click()' });
  await new Promise(r => setTimeout(r, 1500));

  // Click Next -> Step 3
  console.log('5. Clicking Next -> Step 3...');
  await send('Runtime.evaluate', { expression: 'document.querySelector("#next-button")?.click()' });
  await new Promise(r => setTimeout(r, 1500));

  // Capture Step 3 screenshot
  const shotStep3 = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/step3_success_check.png', Buffer.from(shotStep3.data, 'base64'));
  console.log('Step 3 screenshot saved to step3_success_check.png');

  // STEP 3: Check visibility options
  const step3Check = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const pub = document.querySelector('[name="PUBLIC"]');
        const trigger = document.querySelector('#datepicker-trigger');
        const timeInput = document.querySelector('ytcp-datetime-picker input');
        const doneBtn = document.querySelector('#done-button') || document.querySelector('#create-button');
        return {
          hasPub: !!pub,
          triggerText: trigger?.innerText?.trim(),
          timeValue: timeInput?.value,
          doneDisabled: doneBtn?.getAttribute('aria-disabled')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Step 3 info:', JSON.stringify(step3Check.result.value, null, 2));

  ws.close();
}

testCompleteCreationFlow().catch(console.error);
