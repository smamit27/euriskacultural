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

  // Click #datepicker-trigger
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const trigger = document.querySelector('#datepicker-trigger');
        if (trigger) trigger.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  const calendarRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const datepicker = document.querySelector('ytcp-date-picker, [role="dialog"], iron-dropdown, ytcp-calendar');
        const days = Array.from(document.querySelectorAll('.day, [class*="day"], td')).map(d => d.innerText.trim()).filter(Boolean);
        return {
          datepickerTag: datepicker?.tagName,
          sampleDays: days.slice(0, 35)
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Calendar info:', JSON.stringify(calendarRes.result.value, null, 2));

  // Close dialog
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
