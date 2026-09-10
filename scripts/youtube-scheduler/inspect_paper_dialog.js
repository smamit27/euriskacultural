async function inspectPaperDialog() {
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
        const d = document.querySelector('tp-yt-paper-dialog');
        const text = d ? d.innerText : 'none';
        const buttons = d ? Array.from(d.querySelectorAll('button, ytcp-button')).map(b => ({ id: b.id, text: b.innerText })) : [];
        return { text, buttons };
      })()
    `,
    returnByValue: true
  });

  console.log('Paper dialog info:', JSON.stringify(res.result.value, null, 2));

  // Dismiss / Cancel dialog
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cancelBtn = Array.from(document.querySelectorAll('tp-yt-paper-dialog button, tp-yt-paper-dialog ytcp-button')).find(b => b.innerText.trim().toLowerCase() === 'cancel');
        if (cancelBtn) cancelBtn.click();
      })()
    `
  });

  ws.close();
}

inspectPaperDialog().catch(console.error);
