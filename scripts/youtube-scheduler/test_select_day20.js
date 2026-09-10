import { writeFileSync } from 'node:fs';

async function testSelectDay20AndTime() {
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

  // 1. Click day 20
  const clickRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const days = Array.from(document.querySelectorAll('span.calendar-day')).filter(s => s.innerText.trim() === '20' && !s.className.includes('disabled'));
        if (days.length > 0) {
          days[0].click();
          return 'Clicked day 20';
        }
        return 'Day 20 not found';
      })()
    `,
    returnByValue: true
  });
  console.log('Day 20 click:', clickRes.result.value);
  await new Promise(r => setTimeout(r, 800));

  // 2. Set time input to 08:00
  const timeRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const timeInput = document.querySelector('ytcp-datetime-picker input');
        if (timeInput) {
          timeInput.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, '08:00');
          timeInput.dispatchEvent(new Event('input', { bubbles: true }));
          timeInput.dispatchEvent(new Event('change', { bubbles: true }));
          return 'Set time to ' + timeInput.value;
        }
        return 'Time input not found';
      })()
    `,
    returnByValue: true
  });
  console.log('Time result:', timeRes.result.value);

  // Dispatch Enter on time input to confirm
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter' });
  await new Promise(r => setTimeout(r, 800));

  // 3. Check Done button state
  const doneCheck = await send('Runtime.evaluate', {
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
  console.log('Done check:', JSON.stringify(doneCheck.result.value, null, 2));

  // 4. Click Done!
  const doneClick = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const doneBtn = document.querySelector('#done-button') || document.querySelector('#create-button');
        if (doneBtn && doneBtn.getAttribute('aria-disabled') !== 'true') {
          doneBtn.click();
          return 'Done button clicked!';
        }
        return 'Done button disabled or missing';
      })()
    `,
    returnByValue: true
  });
  console.log('Done click result:', doneClick.result.value);

  await new Promise(r => setTimeout(r, 5000));

  const shotDone = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/stream13_created_check.png', Buffer.from(shotDone.data, 'base64'));
  console.log('Saved stream13_created_check.png');

  ws.close();
}

testSelectDay20AndTime().catch(console.error);
