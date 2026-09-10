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

  // Set title
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const titleBox = document.querySelector('#title-textarea #textbox, [aria-label*="title" i]');
        if (titleBox) {
          titleBox.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, 'Test Stream Title');
          titleBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 500));

  // Select Not Made for Kids
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const r = document.querySelector('[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]');
        if (r) r.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 500));

  // Click Next -> Step 2
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const nextBtn = document.querySelector('#next-button');
        if (nextBtn) nextBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  // Click Next -> Step 3
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const nextBtn = document.querySelector('#next-button');
        if (nextBtn) nextBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  // Inspect Step 3
  const step3 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          text: document.body.innerText.slice(0, 1000),
          visibilityRadios: Array.from(document.querySelectorAll('[name="PUBLIC"], [name="UNLISTED"], [name="PRIVATE"]')).map(r => ({ name: r.getAttribute('name'), text: r.innerText })),
          inputs: Array.from(document.querySelectorAll('input')).map(i => ({ id: i.id, placeholder: i.placeholder, value: i.value, ariaLabel: i.getAttribute('aria-label') })),
          buttons: Array.from(document.querySelectorAll('button, ytcp-button')).map(b => ({ id: b.id, text: b.innerText.trim() })).filter(b => b.text)
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Step 3 result:', JSON.stringify(step3.result.value, null, 2));

  // Cancel / Close dialog so we don't save the test
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const closeBtn = document.querySelector('#close-button, [aria-label="Close"]');
        if (closeBtn) closeBtn.click();
      })()
    `
  });

  ws.close();
}
run().catch(console.error);
