import { writeFileSync } from 'node:fs';

async function captureFullLiveList() {
  const tabs = await (await fetch('http://localhost:9222/json')).json();
  const tab = tabs.find(t => t.type === 'page' && t.url.includes('studio.youtube.com'));
  if (!tab) return console.log('No tab found');

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

  await send('Page.navigate', { url: 'https://studio.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw/videos/live' });
  await new Promise(r => setTimeout(r, 5000));

  // Change rows per page to 30 or 50 so all 24 are visible
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const dropdown = document.querySelector('ytcp-table-footer ytcp-dropdown-trigger');
        if (dropdown) dropdown.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const items = Array.from(document.querySelectorAll('tp-yt-paper-item, ytcp-text-menu paper-item')).filter(i => i.innerText.includes('30') || i.innerText.includes('50'));
        if (items.length > 0) items[0].click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 2000));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/all_24_streams_scheduled.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved all_24_streams_scheduled.png');

  ws.close();
}

captureFullLiveList().catch(console.error);
