import { writeFileSync } from 'node:fs';

async function testFreshStart() {
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

  console.log('Navigating to manage page...');
  await send('Page.navigate', { url: 'https://studio.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw/livestreaming/manage' });
  await new Promise(r => setTimeout(r, 4500));

  console.log('Clicking #schedule-button...');
  await send('Runtime.evaluate', { expression: 'document.querySelector("#schedule-button")?.click()' });
  await new Promise(r => setTimeout(r, 3000));

  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/fresh_schedule_click.png', Buffer.from(shot1.data, 'base64'));

  const status = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const createNewBtn = Array.from(document.querySelectorAll('button, ytcp-button')).find(b => b.innerText.trim().toLowerCase() === 'create new');
        const reuseBtn = Array.from(document.querySelectorAll('button, ytcp-button')).find(b => b.innerText.trim().toLowerCase() === 'reuse settings');
        const contenteditables = Array.from(document.querySelectorAll('[contenteditable="true"]')).map(el => ({
          ariaLabel: el.getAttribute('aria-label'),
          text: el.innerText
        }));
        return {
          hasCreateNew: !!createNewBtn,
          hasReuse: !!reuseBtn,
          contenteditables
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Status after schedule button:', JSON.stringify(status.result.value, null, 2));

  ws.close();
}

testFreshStart().catch(console.error);
