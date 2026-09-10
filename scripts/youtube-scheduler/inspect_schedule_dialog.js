import { writeFileSync } from 'node:fs';

async function run() {
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

  const res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const allDialogs = Array.from(document.querySelectorAll('[role="dialog"], ytcp-dialog, ytcp-paper-dialog, ytls-broadcast-dialog'));
        return {
          dialogCount: allDialogs.length,
          dialogs: allDialogs.map(d => ({
            tag: d.tagName,
            id: d.id,
            textSample: d.innerText ? d.innerText.slice(0, 300) : ''
          }))
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Dialogs:', JSON.stringify(res.result.value, null, 2));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/schedule_dialog.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Screenshot saved to schedule_dialog.png');

  ws.close();
}

run().catch(console.error);
