import { writeFileSync } from 'node:fs';

async function testSingleStream(stream) {
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

  // 1. Force reload to guarantee clean state
  console.log('1. Reloading page...');
  await send('Page.reload', { ignoreCache: true });
  await new Promise(r => setTimeout(r, 6000));

  // 2. Click Schedule Stream
  console.log('2. Clicking Schedule Stream...');
  await send('Runtime.evaluate', { expression: 'document.querySelector("#schedule-button")?.click()' });
  await new Promise(r => setTimeout(r, 3500));

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

  // 3. STEP 1: Details
  console.log('3. Setting Title...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const titleBox = document.querySelectorAll('[contenteditable="true"]')[0];
        if (titleBox) {
          titleBox.focus();
          titleBox.click();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, ${JSON.stringify(stream.title)});
          titleBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('4. Setting Description...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const descBox = document.querySelectorAll('[contenteditable="true"]')[1];
        if (descBox) {
          descBox.focus();
          descBox.click();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, ${JSON.stringify(stream.description)});
          descBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // Escape hashtag autocomplete
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape' });
  await new Promise(r => setTimeout(r, 400));

  // 5. Select Not Made for Kids
  console.log('5. Selecting Not Made for Kids...');
  await send('Runtime.evaluate', {
    expression: `document.querySelector('[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]')?.click()`
  });
  await new Promise(r => setTimeout(r, 800));

  // Verify step 1 title & next button
  const step1 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const titleBox = document.querySelectorAll('[contenteditable="true"]')[0];
        const nextBtn = document.querySelector('#next-button');
        return {
          title: titleBox ? titleBox.innerText : null,
          nextDisabled: nextBtn ? nextBtn.getAttribute('aria-disabled') : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Step 1 status:', JSON.stringify(step1.result.value));

  if (step1.result.value?.nextDisabled === 'true') {
    throw new Error('Next button is disabled on Step 1!');
  }

  // 6. Next -> Step 2
  console.log('6. Next -> Step 2...');
  await send('Runtime.evaluate', { expression: 'document.querySelector("#next-button")?.click()' });
  await new Promise(r => setTimeout(r, 1500));

  // 7. Next -> Step 3
  console.log('7. Next -> Step 3...');
  await send('Runtime.evaluate', { expression: 'document.querySelector("#next-button")?.click()' });
  await new Promise(r => setTimeout(r, 1800));

  // 8. Select Public
  console.log('8. Selecting Public...');
  await send('Runtime.evaluate', { expression: 'document.querySelector(\'[name="PUBLIC"]\')?.click()' });
  await new Promise(r => setTimeout(r, 800));

  // 9. Scroll dialog down
  console.log('9. Scrolling down to Schedule picker...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const trigger = document.querySelector('#datepicker-trigger');
        if (trigger) trigger.scrollIntoView({ block: 'center', behavior: 'instant' });
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // 10. Click trigger with mouse coordinates
  console.log('10. Clicking datepicker trigger...');
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

  // 11. Select Day in Calendar
  console.log(`11. Selecting day ${stream.day}...`);
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
  console.log('Day selection:', dayClick.result.value);
  await new Promise(r => setTimeout(r, 800));

  // 12. Set Time
  console.log(`12. Setting time to ${stream.time}...`);
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
  console.log('Time selection:', timeSet.result.value);

  // Dispatch Enter on time
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter' });
  await new Promise(r => setTimeout(r, 800));

  // 13. Verify Done Button
  const doneStatus = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const doneBtn = document.querySelector('#done-button') || document.querySelector('#create-button');
        return {
          doneBtnText: doneBtn ? doneBtn.innerText.trim() : null,
          ariaDisabled: doneBtn ? doneBtn.getAttribute('aria-disabled') : null,
          triggerText: document.querySelector('#datepicker-trigger')?.innerText?.trim(),
          timeValue: document.querySelector('ytcp-datetime-picker input')?.value
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Done status:', JSON.stringify(doneStatus.result.value, null, 2));

  if (doneStatus.result.value?.ariaDisabled === 'true') {
    throw new Error('Done button is disabled on Step 3!');
  }

  // 14. Click Done
  console.log('14. Clicking Done...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const doneBtn = document.querySelector('#done-button') || document.querySelector('#create-button');
        if (doneBtn) doneBtn.click();
      })()
    `
  });

  await new Promise(r => setTimeout(r, 6000));
  console.log('✓ Successfully scheduled!');

  ws.close();
}

const stream14 = {
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
};

testSingleStream(stream14).catch(console.error);
