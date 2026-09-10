import { writeFileSync } from 'node:fs';

async function inspectStep3Dialog() {
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
  await new Promise(r => setTimeout(r, 4000));

  // Click Schedule Stream
  await send('Runtime.evaluate', { expression: 'document.querySelector("#schedule-button")?.click()' });
  await new Promise(r => setTimeout(r, 2500));

  // Check if "Reuse settings" dialog appeared or standard dialog
  const dialogCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const modal = document.querySelector('ytcp-dialog, ytcp-entity-selection-dialog, yt-modal');
        const text = modal ? modal.innerText : '';
        const reuseBtn = Array.from(document.querySelectorAll('button, ytcp-button')).find(b => b.innerText.includes('Reuse') || b.innerText.includes('Create new'));
        return {
          hasModal: !!modal,
          modalText: text.slice(0, 200),
          reuseBtn: reuseBtn ? reuseBtn.innerText : null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Dialog check:', JSON.stringify(dialogCheck.result.value, null, 2));

  // If there's a "Create new" button or "Reuse settings"
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const createNewBtn = Array.from(document.querySelectorAll('button, ytcp-button')).find(b => b.innerText.trim().toLowerCase() === 'create new');
        if (createNewBtn) createNewBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  // Step 1: fill title
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const titleBox = document.querySelector('#title-textarea #textbox');
        if (titleBox) {
          titleBox.focus();
          document.execCommand('insertText', false, 'Test Step 3 Inspection');
          titleBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
        document.querySelector('[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]')?.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  // Next -> Step 2
  await send('Runtime.evaluate', { expression: 'document.querySelector("#next-button")?.click()' });
  await new Promise(r => setTimeout(r, 1500));

  // Next -> Step 3
  await send('Runtime.evaluate', { expression: 'document.querySelector("#next-button")?.click()' });
  await new Promise(r => setTimeout(r, 2000));

  // Capture screenshot of Step 3
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/step3_debug.png', Buffer.from(shot.data, 'base64'));
  console.log('Step 3 screenshot captured');

  // Inspect all elements in Step 3
  const step3Details = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const dialog = document.querySelector('ytcp-uploads-dialog, ytcp-dialog[open], ytcp-dialog');
        const allInputs = Array.from(document.querySelectorAll('input, ytcp-datetime-picker, [role="radio"], ytcp-dropdown-trigger')).map(el => ({
          tag: el.tagName,
          id: el.id,
          name: el.getAttribute('name'),
          type: el.getAttribute('type'),
          role: el.getAttribute('role'),
          value: el.value,
          text: el.innerText ? el.innerText.replace(/\\s+/g, ' ').slice(0, 50) : '',
          visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
        }));

        const buttons = Array.from(document.querySelectorAll('button, ytcp-button')).map(b => ({
          id: b.id,
          text: b.innerText.trim(),
          disabled: b.getAttribute('aria-disabled'),
          visible: !!(b.offsetWidth || b.offsetHeight || b.getClientRects().length)
        })).filter(b => b.text.length > 0);

        return { allInputs, buttons };
      })()
    `,
    returnByValue: true
  });
  console.log('Step 3 Details:', JSON.stringify(step3Details.result.value, null, 2));

  // Close dialog
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const close = document.querySelector('#close-button, [aria-label="Close"]');
        if (close) close.click();
      })()
    `
  });

  ws.close();
}

inspectStep3Dialog().catch(console.error);
