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

  // Inspect the datetime picker container
  const res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const picker = document.querySelector('ytcp-datetime-picker');
        if (!picker) return 'no ytcp-datetime-picker';
        return {
          pickerHTML: picker.outerHTML.slice(0, 500),
          dateInput: picker.querySelector('#datepicker-trigger, [aria-label*="Date" i], ytcp-dropdown-trigger')?.innerText,
          timeInput: picker.querySelector('input')?.value
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Picker info:', JSON.stringify(res.result.value, null, 2));

  // Also close dialog if still open
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
