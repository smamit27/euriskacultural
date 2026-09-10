import { writeFileSync } from 'node:fs';

const MISSING_STREAMS = [
  // 19th to 25th September
  { videoId: '0TsnJ-hD1n8', date: '19 Sep 8 PM', title: 'Society Carnival, Radio City 91.1 FM & 8 PM Aarti' },
  { videoId: 'vfk34rdMUBo', date: '20 Sep 8 AM', title: 'Daily Morning Aarti & Darshan' },
  { videoId: '6EYWQd9gDiw', date: '20 Sep 6 PM', title: 'Kalakriti Talent Show Gala & 8 PM Aarti' },
  { videoId: 't--8RMjTHBU', date: '21 Sep 8 AM', title: 'Daily Morning Aarti & Darshan' },
  { videoId: 'AsWGil6_DZE', date: '21 Sep 8 PM', title: 'Daily Evening Maha Aarti & Cultural Stage' },
  { videoId: 'WWoP95gLWp8', date: '22 Sep 8 AM', title: 'Daily Morning Aarti & Darshan' },
  { videoId: 'kOQs8iyXpsM', date: '22 Sep 8 PM', title: 'Daily Evening Maha Aarti & Musical Showcase' },
  { videoId: 'z3pruW1ZZaA', date: '23 Sep 8 AM', title: 'Daily Morning Aarti & Darshan' },
  { videoId: 'QQ8kj8eXd4U', date: '23 Sep 8 PM', title: 'Daily Evening Maha Aarti & Devotional Sangeet' },
  { videoId: '9yo4_x38C0U', date: '24 Sep 8 AM', title: 'Daily Morning Aarti & Darshan' },
  { videoId: '2uhngMubFFc', date: '24 Sep 4 PM', title: 'Satyanarayan Katha & Mahaprasad Feast' },
  { videoId: 'eJqDBVUyi7Y', date: '25 Sep 8 AM', title: 'Ganesh Uttarpujana & Morning Darshan' },
  { videoId: 'a3zpCLnjHyY', date: '25 Sep 4 PM', title: 'Anant Chaturdashi Ganesh Visarjan Miravnuk' },
  // Also fix earlier ones if they were missing
  { videoId: '9PNxuSaC2qY', date: '15 Sep 8 AM', title: 'Daily Morning Aarti & Pooja Darshan' },
  { videoId: 'dSOOdWiY8og', date: '18 Sep 8 PM', title: 'Daily Evening Maha Aarti & Bhajan Sandhya' },
];

const THUMBNAIL_PATH = '/Users/sweta/Amit_Development/Euriska_Cultrual/public/youtube_thumbnail.jpg';

async function uploadThumbnailForStream(send, stream, index, total) {
  console.log(`\n[${index + 1}/${total}] Processing ${stream.date} (${stream.videoId}): "${stream.title}"...`);

  await send('Page.navigate', { url: `https://studio.youtube.com/video/${stream.videoId}/edit` });
  await new Promise(r => setTimeout(r, 4500));

  // Wait for #file-loader
  let fileNode = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const doc = await send('DOM.getDocument');
      fileNode = await send('DOM.querySelector', {
        nodeId: doc.root.nodeId,
        selector: '#file-loader'
      });
      if (fileNode && fileNode.nodeId) break;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 800));
  }

  if (!fileNode || !fileNode.nodeId) {
    console.error(`   ❌ Could not find #file-loader for ${stream.videoId}`);
    return false;
  }

  // Upload thumbnail
  await send('DOM.setFileInputFiles', {
    nodeId: fileNode.nodeId,
    files: [THUMBNAIL_PATH]
  });
  console.log('   📤 Thumbnail dispatched via DOM.setFileInputFiles');

  // Wait for YouTube Studio to process thumbnail
  await new Promise(r => setTimeout(r, 3000));

  // Escape any popover that might have popped up
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape' });
  await new Promise(r => setTimeout(r, 500));

  // Click Save button
  const saveRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const saveBtn = document.querySelector('#save') || document.querySelector('ytcp-button#save-button');
        if (saveBtn) {
          const disabled = saveBtn.getAttribute('aria-disabled') === 'true' || saveBtn.disabled;
          if (!disabled) {
            saveBtn.click();
            return 'Save clicked';
          }
          return 'Save button already disabled (no changes or already saved)';
        }
        return 'Save button not found';
      })()
    `,
    returnByValue: true
  });
  console.log('   💾 Save status:', saveRes.result?.value);

  // Wait for save to complete
  await new Promise(r => setTimeout(r, 4000));

  const afterState = await send('Runtime.evaluate', {
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
  console.log('   ✅ After save:', afterState.result?.value);

  return true;
}

async function main() {
  const tabs = await (await fetch('http://localhost:9222/json')).json();
  const tab = tabs.find(t => t.type === 'page' && t.url.includes('studio.youtube.com'));
  if (!tab) {
    console.error('❌ No Studio tab found on port 9222');
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

  console.log(`🚀 Starting thumbnail upload for ${MISSING_STREAMS.length} streams...`);

  let count = 0;
  for (let i = 0; i < MISSING_STREAMS.length; i++) {
    const ok = await uploadThumbnailForStream(send, MISSING_STREAMS[i], i, MISSING_STREAMS.length);
    if (ok) count++;
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log(`\n🎉 Uploaded thumbnails to ${count}/${MISSING_STREAMS.length} streams.`);

  // Return to live videos list to verify
  console.log('\nNavigating to YouTube Studio Live list to verify all streams...');
  await send('Page.navigate', {
    url: 'https://studio.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw/videos/live?filter=%5B%5D&sort=%7B%22columnType%22%3A%22date%22%2C%22sortOrder%22%3A%22ASCENDING%22%7D'
  });
  await new Promise(r => setTimeout(r, 6000));

  const rows = await send('Runtime.evaluate', {
    expression: `(() => {
      return Array.from(document.querySelectorAll('ytcp-video-row')).map(r => {
        const title = r.querySelector('#video-title')?.innerText?.trim();
        const href = r.querySelector('#video-title')?.getAttribute('href');
        const date = r.querySelector('.cell-body.tablecell-date')?.innerText?.trim()?.replace(/\\s+/g, ' ');
        const img = r.querySelector('img#img-with-fallback');
        const src = img?.src || '';
        const hasVersion = src.includes('?v=');
        return { title, href, date, hasVersion };
      });
    })()`,
    returnByValue: true
  });

  console.log('\n📊 Final Verification Table of Live Streams:');
  rows.result.value.forEach((r, idx) => {
    console.log(`[${idx+1}] ${r.date} | ${r.hasVersion ? '✅ HAS THUMB' : '❌ MISSING'} | ${r.title?.slice(0, 48)}`);
  });

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/all_thumbnails_verified.png', Buffer.from(screenshot.data, 'base64'));
  console.log('📸 Verification screenshot saved to all_thumbnails_verified.png');

  ws.close();
}

main().catch(console.error);
