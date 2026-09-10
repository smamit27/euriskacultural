import { readFileSync, writeFileSync } from 'node:fs';

async function run() {
  const tabs = await (await fetch('http://localhost:9222/json')).json();
  const tab = tabs.find(t => t.type === 'page' && t.url.includes('studio.youtube.com'));
  if (!tab) {
    console.error('No Studio tab found');
    return;
  }

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
        const boxes = document.querySelectorAll('#textbox');
        return Array.from(boxes).map(b => ({
          ariaLabel: b.getAttribute('aria-label'),
          text: b.innerText,
          parent: b.parentElement ? b.parentElement.tagName : ''
        }));
      })()
    `,
    returnByValue: true
  });

  console.log('Boxes:', JSON.stringify(res, null, 2));
  ws.close();
}

run().catch(console.error);
