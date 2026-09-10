import { writeFileSync } from 'node:fs';

const THUMBNAIL_PATH = '/Users/sweta/Amit_Development/Euriska_Cultrual/public/youtube_thumbnail.jpg';

async function testCreateStream13() {
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

  console.log('Navigating to manage page...');
  await send('Page.navigate', { url: 'https://studio.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw/livestreaming/manage' });
  await new Promise(r => setTimeout(r, 4500));

  // Click Schedule Stream
  await send('Runtime.evaluate', { expression: 'document.querySelector("#schedule-button")?.click()' });
  await new Promise(r => setTimeout(r, 2500));

  const stream = {
    title: 'Majestique Euriska - Daily Morning Aarti & Darshan (20 Sep, 8 AM) 🌅',
    description: `🌅 Day 7 Morning Aarti & Divine Darshan from Majestique Euriska Club House.
Start your Sunday with auspicious Ganpati Atharvashirsha chanting, morning aarti and prasad.

📅 Date: 20 September 2026 (Day 7)
⏰ Time: 8:00 AM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Today's Highlights:
• 8:00 AM: Morning Aarti & Darshan
• 6:00 PM: Grand Kalakriti Cultural Talent Show Gala & 8 PM Maha Aarti

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for daily live prayers!

#MajestiqueEuriska #MorningAarti #Kalakriti #Ganeshotsav2026 #LiveStream #Pune`,
    day: '20',
    time: '08:00'
  };

  // 1. Set Title
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const titleBox = document.querySelector('#title-textarea #textbox');
        titleBox.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, ${JSON.stringify(stream.title)});
        titleBox.dispatchEvent(new Event('input', { bubbles: true }));
      })()
    `
  });
  await new Promise(r => setTimeout(r, 500));

  // 2. Set Description
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const descBox = document.querySelector('#description-textarea #textbox');
        descBox.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, ${JSON.stringify(stream.description)});
        descBox.dispatchEvent(new Event('input', { bubbles: true }));
      })()
    `
  });

  // Escape popovers
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape' });
  await new Promise(r => setTimeout(r, 500));

  // 3. Upload Thumbnail
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
      console.log('Thumbnail uploaded');
    }
  } catch (e) {
    console.error('Thumbnail error:', e.message);
  }
  await new Promise(r => setTimeout(r, 2000));

  // 4. Select Not Made for Kids
  await send('Runtime.evaluate', {
    expression: `document.querySelector('[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]')?.click()`
  });
  await new Promise(r => setTimeout(r, 600));

  // 5. Next -> Step 2
  await send('Runtime.evaluate', { expression: 'document.querySelector("#next-button")?.click()' });
  await new Promise(r => setTimeout(r, 1200));

  // 6. Next -> Step 3
  await send('Runtime.evaluate', { expression: 'document.querySelector("#next-button")?.click()' });
  await new Promise(r => setTimeout(r, 1200));

  // 7. Click datepicker trigger
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const trigger = document.querySelector('#datepicker-trigger');
        trigger.scrollIntoView({ block: 'center' });
        trigger.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  // 8. Click day 20 in September
  const dayClickRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cal = document.querySelector('ytcp-date-picker');
        const days = Array.from(cal.querySelectorAll('span.calendar-day')).filter(s => s.innerText.trim() === '20');
        if (days.length > 0) {
          days[0].click();
          return 'Clicked September 20';
        }
        return 'Day 20 not found';
      })()
    `,
    returnByValue: true
  });
  console.log(dayClickRes.result?.value);
  await new Promise(r => setTimeout(r, 800));

  // 9. Set time: 08:00
  const timeSetRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const timeInput = document.querySelector('ytcp-datetime-picker input');
        if (timeInput) {
          timeInput.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, '08:00');
          timeInput.dispatchEvent(new Event('input', { bubbles: true }));
          return 'Set time to 08:00';
        }
        return 'Time input not found';
      })()
    `,
    returnByValue: true
  });
  console.log(timeSetRes.result?.value);

  // Press Enter on time input
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter' });
  await new Promise(r => setTimeout(r, 800));

  // Check state
  const state = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          date: document.querySelector('#datepicker-trigger')?.innerText?.trim(),
          time: document.querySelector('ytcp-datetime-picker input')?.value
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Selected date/time:', JSON.stringify(state.result?.value));

  // 10. Click Done
  const doneRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const doneBtn = document.querySelector('#done-button') || document.querySelector('#create-button') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Done');
        if (doneBtn) {
          doneBtn.click();
          return 'Clicked Done!';
        }
        return 'Done button not found';
      })()
    `,
    returnByValue: true
  });
  console.log(doneRes.result?.value);

  await new Promise(r => setTimeout(r, 5000));
  console.log('Finished stream 13 creation.');

  ws.close();
}

testCreateStream13().catch(console.error);
