import { writeFileSync } from 'node:fs';

async function testDialogFlow() {
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

  await send('Page.navigate', { url: 'https://studio.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw/livestreaming/manage' });
  await new Promise(r => setTimeout(r, 4500));

  // Click Schedule Stream button
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('#schedule-button');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 2500));

  // Inspect Step 1 (Details)
  const step1 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const titleInput = document.querySelector('#title-textarea #textbox, [aria-label*="title" i]');
        const descInput = document.querySelector('#description-textarea #textbox, [aria-label*="description" i]');
        const fileInput = document.querySelector('input[type="file"]#file-loader');
        const notForKids = document.querySelector('tp-yt-paper-radio-button[name="NOT_MADE_FOR_KIDS"], ytcp-radio-button[name="NOT_MADE_FOR_KIDS"]');
        const nextBtn = document.querySelector('#next-button');
        return {
          hasTitle: !!titleInput,
          hasDesc: !!descInput,
          hasFile: !!fileInput,
          hasNotForKids: !!notForKids,
          hasNext: !!nextBtn,
          nextDisabled: nextBtn ? nextBtn.getAttribute('aria-disabled') : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Step 1 Elements:', JSON.stringify(step1.result.value, null, 2));

  ws.close();
}

testDialogFlow().catch(console.error);
