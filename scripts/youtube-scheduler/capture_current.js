import { writeFileSync } from 'node:fs';

async function captureCurrent() {
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

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/current_screen.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved current_screen.png');

  const dialogHtml = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const dialog = document.querySelector('ytcp-uploads-dialog, ytcp-dialog[open], ytcp-dialog');
        if (!dialog) return 'No dialog found';
        return {
          innerHTML: dialog.innerHTML.slice(0, 2000),
          innerText: dialog.innerText
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Dialog innerText:\n', dialogHtml.result.value?.innerText);

  ws.close();
}

captureCurrent().catch(console.error);
