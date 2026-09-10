import { readFileSync, writeFileSync } from 'node:fs';

async function run() {
  const tabs = await (await fetch('http://localhost:9222/json')).json();
  const tab = tabs.find(t => t.type === 'page' && t.url.includes('studio.youtube.com'));
  if (!tab) {
    console.error('No Studio tab found');
    return;
  }

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

  // 1. Upload Thumbnail
  const doc = await send('DOM.getDocument');
  const fileNode = await send('DOM.querySelector', {
    nodeId: doc.root.nodeId,
    selector: '#file-loader'
  });

  console.log('File loader node:', fileNode);
  const filePath = '/Users/sweta/Amit_Development/Euriska_Cultrual/public/youtube_thumbnail.jpg';
  await send('DOM.setFileInputFiles', {
    nodeId: fileNode.nodeId,
    files: [filePath]
  });
  console.log('Thumbnail dispatched!');

  await new Promise(r => setTimeout(r, 2000));

  // 2. Set description
  const descriptionText = `🪔 Auspicious First Evening Maha Aarti & Deepotsav of Ganeshotsav 2026.
Join us live for evening prayers, lighting of 101 diyas & Modak Prasad distribution from Majestique Euriska Club House.

📅 Date: 14 September 2026
⏰ Time: 8:00 PM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Morning Aarti: 8:00 AM IST
• Evening Maha Aarti: 8:00 PM IST
• Special Events: Grand Aagman (14 Sep), Carnival & Radio City (19 Sep), Kalakriti Talent Show (20 Sep), Satyanarayan Mahaprasad (24 Sep), Anant Chaturdashi Visarjan (25 Sep)

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural & hit the bell icon to join all live aartis!

#MajestiqueEuriska #Ganeshotsav2026 #GaneshAarti #LiveStream #Pune #GaneshChaturthi`;

  const descRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const descBox = document.querySelectorAll('#textbox')[1];
        if (!descBox) return 'desc box not found';
        descBox.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, ${JSON.stringify(descriptionText)});
        descBox.dispatchEvent(new Event('input', { bubbles: true }));
        descBox.dispatchEvent(new Event('change', { bubbles: true }));
        return 'Updated description, length: ' + descBox.innerText.length;
      })()
    `,
    returnByValue: true
  });
  console.log('Description result:', descRes.result.value);

  await new Promise(r => setTimeout(r, 2000));

  // 3. Check save button
  const saveState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const saveBtn = document.querySelector('#save') || document.querySelector('ytcp-button#save-button');
        return {
          disabled: saveBtn?.getAttribute('aria-disabled') || saveBtn?.disabled,
          text: saveBtn?.innerText
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Save button state:', saveState.result.value);

  // Click save
  const clickRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const saveBtn = document.querySelector('#save') || document.querySelector('ytcp-button#save-button');
        if (saveBtn && saveBtn.getAttribute('aria-disabled') !== 'true') {
          saveBtn.click();
          return 'Clicked save';
        }
        return 'Save button disabled or not found';
      })()
    `,
    returnByValue: true
  });
  console.log('Click result:', clickRes.result.value);

  await new Promise(r => setTimeout(r, 4000));

  // Take screenshot
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/test_save_14sep8pm.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Screenshot saved!');

  ws.close();
}

run().catch(console.error);
