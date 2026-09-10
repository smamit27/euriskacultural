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

  // Click Next -> Step 2 (Customisation)
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const nextBtn = document.querySelector('#next-button');
        if (nextBtn) nextBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Clicked Next to Step 2 (Customisation)');

  // Click Next -> Step 3 (Visibility)
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const nextBtn = document.querySelector('#next-button');
        if (nextBtn) nextBtn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Clicked Next to Step 3 (Visibility)');

  // Inspect Step 3 elements: Schedule date/time picker, Public radio, Done button
  const step3 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const radios = Array.from(document.querySelectorAll('[role="radio"], tp-yt-paper-radio-button, ytcp-radio-button')).map(r => ({
          name: r.getAttribute('name'),
          text: r.innerText ? r.innerText.replace(/\\s+/g, ' ') : ''
        }));
        const inputs = Array.from(document.querySelectorAll('input, ytcp-datetime-picker, ytcp-dropdown-trigger')).map(el => ({
          tag: el.tagName,
          id: el.id,
          placeholder: el.placeholder,
          value: el.value,
          text: el.innerText ? el.innerText.replace(/\\s+/g, ' ') : ''
        }));
        const doneBtn = document.querySelector('#done-button');
        return {
          radios,
          inputs,
          doneBtn: doneBtn ? { text: doneBtn.innerText, disabled: doneBtn.getAttribute('aria-disabled') } : null
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Step 3 Elements:', JSON.stringify(step3.result.value, null, 2));

  // Close modal so we don't accidentally schedule anything incomplete
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
