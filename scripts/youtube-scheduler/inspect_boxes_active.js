async function inspectBoxes() {
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

  const res = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const textboxes = Array.from(document.querySelectorAll('[contenteditable="true"]')).map(el => {
          let p = el.parentElement;
          let chain = [];
          for (let i = 0; i < 4 && p; i++) {
            chain.push(p.tagName + (p.id ? '#' + p.id : '') + (p.className ? '.' + p.className.split(' ')[0] : ''));
            p = p.parentElement;
          }
          return {
            id: el.id,
            ariaLabel: el.getAttribute('aria-label'),
            text: el.innerText,
            ancestors: chain.join(' < ')
          };
        });
        return textboxes;
      })()
    `,
    returnByValue: true
  });

  console.log('Contenteditable elements:', JSON.stringify(res.result.value, null, 2));
  ws.close();
}

inspectBoxes().catch(console.error);
