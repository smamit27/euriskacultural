import { writeFileSync } from 'node:fs';

async function fixDate() {
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

  await send('Page.navigate', { url: 'https://studio.youtube.com/video/0TsnJ-hD1n8/edit' });
  await new Promise(r => setTimeout(r, 4500));

  // Find the datepicker trigger element inside ytcp-datetime-picker
  const triggerBox = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const trigger = document.querySelector('ytcp-datetime-picker #datepicker-trigger');
        if (!trigger) return null;
        const rect = trigger.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, text: trigger.innerText.trim() };
      })()
    `,
    returnByValue: true
  });
  console.log('Trigger box:', triggerBox.result.value);

  if (triggerBox.result.value) {
    // Click at the exact coordinates
    const { x, y } = triggerBox.result.value;
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  }

  await new Promise(r => setTimeout(r, 1200));

  // Take screenshot to see if calendar is open
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/calendar_open_check.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Screenshot saved!');

  ws.close();
}

fixDate().catch(console.error);
