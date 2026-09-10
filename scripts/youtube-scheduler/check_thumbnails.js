async function checkThumbnails() {
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

  await send('Page.navigate', { url: 'https://studio.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw/videos/live' });
  await new Promise(r => setTimeout(r, 4500));

  const listRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const rows = Array.from(document.querySelectorAll('ytcp-video-row'));
        return rows.map(r => {
          const title = r.querySelector('#video-title')?.innerText?.trim();
          const href = r.querySelector('#video-title')?.getAttribute('href');
          const date = r.querySelector('.cell-body.tablecell-date')?.innerText?.trim();
          const img = r.querySelector('ytcp-thumbnail img, img#img');
          const videoId = href ? href.split('/')[2] : null;
          return {
            title,
            videoId,
            date: date?.replace(/\\s+/g, ' '),
            hasCustomThumbnail: img && !img.src.includes('default') && !img.src.includes('data:image') && img.src.length > 0
          };
        });
      })()
    `,
    returnByValue: true
  });

  console.log('Total live streams found:', listRes.result.value.length);
  console.log(JSON.stringify(listRes.result.value, null, 2));

  ws.close();
}

checkThumbnails().catch(console.error);
