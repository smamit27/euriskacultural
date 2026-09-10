import { writeFileSync } from 'node:fs';

const THUMBNAIL_PATH = '/Users/sweta/Amit_Development/Euriska_Cultrual/public/youtube_thumbnail.jpg';

async function testScheduleStream12() {
  const tabs = await (await fetch('http://localhost:9222/json')).json();
  const tab = tabs.find(t => t.type === 'page' && t.url.includes('studio.youtube.com'));
  if (!tab) return;

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

  console.log('Navigating to livestreaming manage page...');
  await send('Page.navigate', { url: 'https://studio.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw/livestreaming/manage' });
  await new Promise(r => setTimeout(r, 4500));

  // Click Schedule Stream
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('#schedule-button');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 2500));

  // STEP 1: Details
  const stream12 = {
    title: 'Majestique Euriska - Society Carnival, Radio City 91.1 FM & 8 PM Aarti (19 Sep) 🎪',
    description: `🎪 Grand Society Carnival, Radio City 91.1 FM RJ Interaction, Games & 8 PM Aarti live from Majestique Euriska Club House!

📅 Date: 19 September 2026 (Day 6)
⏰ Time: 6:00 PM IST onwards
📍 Venue: Amphitheatre, Main Stage & Food Lawn, Majestique Euriska, Pune

✨ Carnival Highlights:
• Kids Drawing Competition Showcase
• "City Cha Bappa" with Radio City 91.1 FM Live RJ & Entertainment
• Society Food Carnival & Stalls
• 8:00 PM Grand Evening Maha Aarti with Modak Bhog

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for all live events!

#MajestiqueEuriska #Carnival #RadioCity #Ganeshotsav2026 #LiveStream #Pune`,
    day: '19',
    time: '18:00'
  };

  // Set Title
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const titleBox = document.querySelector('#title-textarea #textbox, [aria-label*="title" i]');
        if (titleBox) {
          titleBox.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, ${JSON.stringify(stream12.title)});
          titleBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // Set Description
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const descBox = document.querySelector('#description-textarea #textbox, [aria-label*="description" i]');
        if (descBox) {
          descBox.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, ${JSON.stringify(stream12.description)});
          descBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `
  });

  // Escape popovers
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape' });
  await new Promise(r => setTimeout(r, 600));

  // Upload Thumbnail
  try {
    const doc = await send('DOM.getDocument');
    const fileNode = await send('DOM.querySelector', {
      nodeId: doc.root.nodeId,
      selector: '#file-loader'
    });
    if (fileNode && fileNode.nodeId) {
      await send('DOM.setFileInputFiles', {
        nodeId: fileNode.nodeId,
        files: [THUMBNAIL_PATH]
      });
      console.log('Thumbnail dispatched!');
    }
  } catch (e) {
    console.error('Thumbnail error:', e);
  }
  await new Promise(r => setTimeout(r, 2000));

  // Select Not Made for Kids
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
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const pub = document.querySelector('[name="PUBLIC"]');
        if (pub) pub.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // 2. Set Date: Click #datepicker-trigger
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const trigger = document.querySelector('#datepicker-trigger');
        if (trigger) trigger.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click day 19
  const clickDayRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        // Find visible calendar day for 19
        const days = Array.from(document.querySelectorAll('span.calendar-day')).filter(s => s.innerText.trim() === '19');
        // Click the last matching or visible one (September)
        if (days.length > 0) {
          days[days.length - 1].click();
          return 'Clicked day 19';
        }
        return 'Day 19 not found';
      })()
    `,
    returnByValue: true
  });
  console.log('Date selection:', clickDayRes.result.value);
  await new Promise(r => setTimeout(r, 1000));

  // 3. Set Time: 18:00
  const timeRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const timeInput = document.querySelector('ytcp-datetime-picker input');
        if (timeInput) {
          timeInput.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, '18:00');
          timeInput.dispatchEvent(new Event('input', { bubbles: true }));
          timeInput.dispatchEvent(new Event('change', { bubbles: true }));
          return 'Set time to ' + timeInput.value;
        }
        return 'Time input not found';
      })()
    `,
    returnByValue: true
  });
  console.log('Time selection:', timeRes.result.value);
  await new Promise(r => setTimeout(r, 1000));

  // Check state before Done
  const beforeDone = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const doneBtn = document.querySelector('#done-button') || document.querySelector('#create-button');
        return {
          btnText: doneBtn?.innerText,
          disabled: doneBtn?.getAttribute('aria-disabled'),
          dateText: document.querySelector('#datepicker-trigger')?.innerText,
          timeValue: document.querySelector('ytcp-datetime-picker input')?.value
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Before Done:', JSON.stringify(beforeDone.result.value, null, 2));

  // Take screenshot of Step 3
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/step3_schedule_stream12.png', Buffer.from(screenshot.data, 'base64'));

  // Click Done / Create button
  const doneRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const doneBtn = document.querySelector('#done-button') || document.querySelector('#create-button');
        if (doneBtn && doneBtn.getAttribute('aria-disabled') !== 'true') {
          doneBtn.click();
          return 'Done clicked!';
        }
        return 'Done button disabled or not found';
      })()
    `,
    returnByValue: true
  });
  console.log('Done click result:', doneRes.result.value);

  await new Promise(r => setTimeout(r, 5000));

  // Check post-create state
  const postScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/post_schedule_stream12.png', Buffer.from(postScreenshot.data, 'base64'));
  console.log('Post schedule screenshot saved!');

  ws.close();
}

testScheduleStream12().catch(console.error);
