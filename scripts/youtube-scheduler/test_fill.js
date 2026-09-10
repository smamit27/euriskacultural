async function testFill() {
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

  const fillRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const dialog = document.querySelector('ytcp-dialog[open], ytcp-uploads-dialog, [role="dialog"]');
        const boxes = document.querySelectorAll('[contenteditable="true"]');
        const titleBox = boxes[0];
        return {
          hasDialog: !!dialog,
          boxCount: boxes.length,
          dialogTag: dialog ? dialog.tagName : null,
          titleBoxVal: titleBox ? titleBox.textContent : null
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Fill res:', JSON.stringify(fillRes.result.value, null, 2));
  ws.close();
}

testFill().catch(console.error);
