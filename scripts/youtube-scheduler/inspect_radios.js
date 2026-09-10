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

  const radios = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return Array.from(document.querySelectorAll('tp-yt-paper-radio-button, ytcp-radio-button, input[type="radio"]')).map(r => ({
          name: r.getAttribute('name'),
          id: r.id,
          text: r.innerText ? r.innerText.replace(/\\s+/g, ' ') : ''
        }));
      })()
    `,
    returnByValue: true
  });
  console.log('Radios:', JSON.stringify(radios.result.value, null, 2));

  ws.close();
}
run().catch(console.error);
