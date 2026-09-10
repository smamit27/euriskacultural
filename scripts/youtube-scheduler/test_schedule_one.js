import { writeFileSync } from 'node:fs';

const THUMBNAIL_PATH = '/Users/sweta/Amit_Development/Euriska_Cultrual/public/youtube_thumbnail.jpg';

async function scheduleOneStream(send, item) {
  console.log(`\n🚀 Scheduling stream: ${item.title} (${item.dateStr}, ${item.time})`);

  // Navigate to livestreaming manage page
  await send('Page.navigate', { url: 'https://studio.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw/livestreaming/manage' });
  await new Promise(r => setTimeout(r, 4500));

  // Click Schedule Stream
  const schedBtn = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('#schedule-button');
        if (btn) {
          btn.click();
          return 'Clicked Schedule button';
        }
        return 'Schedule button not found';
      })()
    `,
    returnByValue: true
  });
  console.log('   ', schedBtn.result?.value);
  await new Promise(r => setTimeout(r, 3000));

  // STEP 1: Details
  // Set Title
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const titleBox = document.querySelector('#title-textarea #textbox, [aria-label*="title" i]');
        if (titleBox) {
          titleBox.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, ${JSON.stringify(item.title)});
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
          document.execCommand('insertText', false, ${JSON.stringify(item.description)});
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
      console.log('   Thumbnail uploaded');
    }
  } catch (e) {
    console.error('   Thumbnail upload error:', e.message);
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

  // 2. Set Date
  // Click datepicker trigger
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const trigger = document.querySelector('#datepicker-trigger');
        if (trigger) trigger.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Type date string into calendar input
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cal = document.querySelector('ytcp-date-picker');
        const input = cal ? cal.querySelector('input') : null;
        if (input) {
          input.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, ${JSON.stringify(item.dateStr)});
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 300));
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter' });
  await new Promise(r => setTimeout(r, 800));

  // 3. Set Time
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const timeInput = document.querySelector('ytcp-datetime-picker input');
        if (timeInput) {
          timeInput.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, ${JSON.stringify(item.time)});
          timeInput.dispatchEvent(new Event('input', { bubbles: true }));
          timeInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 300));
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter' });
  await new Promise(r => setTimeout(r, 1000));

  // Verify selections
  const verifyState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          date: document.querySelector('#datepicker-trigger')?.innerText?.trim(),
          time: document.querySelector('ytcp-datetime-picker input')?.value,
          doneDisabled: document.querySelector('#done-button, #create-button')?.getAttribute('aria-disabled')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('   Settings before Done:', JSON.stringify(verifyState.result?.value));

  // Click Done
  const doneRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const doneBtn = document.querySelector('#done-button') || document.querySelector('#create-button');
        if (doneBtn && doneBtn.getAttribute('aria-disabled') !== 'true') {
          doneBtn.click();
          return 'Done clicked';
        }
        return 'Done button disabled or not found';
      })()
    `,
    returnByValue: true
  });
  console.log('   Done result:', doneRes.result?.value);

  // Wait for completion
  await new Promise(r => setTimeout(r, 5000));
  return true;
}

async function main() {
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

  const testStream = {
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
    dateStr: '20 Sept 2026',
    time: '08:00'
  };

  await scheduleOneStream(send, testStream);

  // Verify on live videos list
  await send('Page.navigate', { url: 'https://studio.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw/videos/live?filter=%5B%5D&sort=%7B%22columnType%22%3A%22date%22%2C%22sortOrder%22%3A%22ASCENDING%22%7D' });
  await new Promise(r => setTimeout(r, 4000));

  const list = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const rows = Array.from(document.querySelectorAll('ytcp-video-row')).map(r => ({
          title: r.querySelector('a#video-title')?.innerText?.trim(),
          date: r.querySelector('.table-cell-date')?.innerText?.trim()
        }));
        return rows;
      })()
    `,
    returnByValue: true
  });
  console.log('Updated list after test creation:\n', JSON.stringify(list.result?.value, null, 2));

  ws.close();
}

main().catch(console.error);
