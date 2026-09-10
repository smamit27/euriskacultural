import { writeFileSync } from 'node:fs';

async function testScrollAndSetDateTime() {
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

  // 1. Scroll dialog down
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const dialogContent = document.querySelector('ytcp-dialog #dialog, ytcp-uploads-dialog #dialog, .dialog-content, ytcp-dialog');
        const trigger = document.querySelector('#datepicker-trigger');
        if (trigger) trigger.scrollIntoView({ block: 'center', behavior: 'instant' });
      })()
    `
  });
  await new Promise(r => setTimeout(r, 600));

  // Screenshot after scroll
  const shotScroll = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/step3_scrolled.png', Buffer.from(shotScroll.data, 'base64'));
  console.log('Saved step3_scrolled.png');

  // 2. Click the datepicker trigger using exact coordinates via CDP
  const triggerBox = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const trigger = document.querySelector('#datepicker-trigger');
        if (!trigger) return null;
        const rect = trigger.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, text: trigger.innerText.trim() };
      })()
    `,
    returnByValue: true
  });
  console.log('Trigger box:', triggerBox.result.value);

  if (triggerBox.result.value) {
    const { x, y } = triggerBox.result.value;
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }
  await new Promise(r => setTimeout(r, 1200));

  // Screenshot after datepicker click
  const shotCalendar = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/step3_calendar_opened.png', Buffer.from(shotCalendar.data, 'base64'));
  console.log('Saved step3_calendar_opened.png');

  // Inspect calendar days
  const calDays = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const days = Array.from(document.querySelectorAll('span.calendar-day, [class*="calendar-day"]')).map(el => ({
          text: el.innerText.trim(),
          classes: el.className
        }));
        return { daysCount: days.length, daysSample: days.slice(0, 31) };
      })()
    `,
    returnByValue: true
  });
  console.log('Calendar days:', JSON.stringify(calDays.result.value, null, 2));

  ws.close();
}

testScrollAndSetDateTime().catch(console.error);
