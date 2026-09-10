async function listExisting() {
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

  const evalRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const links = Array.from(document.querySelectorAll('a[href*="/livestreaming/stream/"], a[href*="/video/"]'));
        const rows = Array.from(document.querySelectorAll('ytls-broadcast-list-item, ytls-broadcast-row, ytcp-table-row'));
        const titles = [];
        document.querySelectorAll('#broadcast-list .title, #broadcast-list #title, ytls-broadcast-list-item').forEach(el => {
          titles.push(el.innerText.slice(0, 100));
        });
        return {
          hrefs: links.map(a => ({ text: a.innerText.trim(), href: a.href })),
          count: links.length,
          bodyTextSample: document.body.innerText.split('\\n').filter(t => t.includes('Majestique Euriska'))
        };
      })()
    `,
    returnByValue: true
  });

  console.log(JSON.stringify(evalRes.result.value, null, 2));
  ws.close();
}

listExisting().catch(console.error);
