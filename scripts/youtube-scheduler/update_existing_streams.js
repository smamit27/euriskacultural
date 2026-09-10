import { writeFileSync } from 'node:fs';

const STREAMS_TO_UPDATE = [
  {
    videoId: 'oU9IsBtGAJ4',
    title: 'Majestique Euriska - Ganesh Aagman Miravnuk & Sthapana (14 Sep, 5 PM) 🥁',
    description: `🥁 Ganpati Bappa Morya! Welcome Lord Ganesha with grand Aagman Miravnuk, Dhol Tasha Pathak beats & Sthapana Ceremony live from Majestique Euriska Club House.

📅 Date: 14 September 2026
⏰ Time: 5:00 PM IST onwards
📍 Venue: Main Entrance to Club House Mandap, Majestique Euriska, Pune

✨ Highlights:
• Grand Aagman Procession & Welcome Ceremony
• High-energy Euriska Dhol Tasha Pathak performance
• Auspicious Sthapana Pooja & Abhishek
• Welcome Aarti & Prasad Distribution

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST
• Festive Carnival & Food Stalls (19 Sep)
• Kalakriti Talent Show (20 Sep)
• Satyanarayan Katha & Mahaprasad (24 Sep)
• Anant Chaturdashi Visarjan (25 Sep)

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for all live aartis & celebrations!

#MajestiqueEuriska #GaneshAagman #Ganeshotsav2026 #GaneshChaturthi #LiveStream #Pune`
  },
  {
    videoId: 'Aecjq7F8aJE',
    title: 'Majestique Euriska - Shri Ganesh Pratham Maha Aarti (14 Sep, 8 PM) 🪔',
    description: `🪔 Auspicious First Evening Maha Aarti & Deepotsav of Ganeshotsav 2026.
Join us live for evening prayers, lighting of 101 diyas & Modak Prasad distribution from Majestique Euriska Club House.

📅 Date: 14 September 2026
⏰ Time: 8:00 PM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST
• Special Events: Grand Aagman (14 Sep), Carnival & Radio City (19 Sep), Kalakriti (20 Sep), Satyanarayan Mahaprasad (24 Sep), Anant Chaturdashi Visarjan (25 Sep)

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural & hit the bell icon to join all live aartis!

#MajestiqueEuriska #Ganeshotsav2026 #GaneshAarti #LiveStream #Pune #GaneshChaturthi`
  },
  {
    videoId: '9PNxuSaC2qY',
    title: 'Majestique Euriska - Daily Morning Aarti & Pooja Darshan (15 Sep, 8 AM) 🌅',
    description: `🌅 Auspicious Daily Morning Aarti & Pooja Darshan from Majestique Euriska Mandap.
Start your day with the divine blessings of Lord Ganesha, Vedic stotra chanting & morning aarti.

📅 Date: 15 September 2026 (Day 2)
⏰ Time: 8:00 AM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for daily live darshan!

#MajestiqueEuriska #MorningAarti #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    videoId: '6N62O9WVZb8',
    title: 'Majestique Euriska - Daily Evening Maha Aarti & Bhajans (15 Sep, 8 PM) 🪔',
    description: `🪔 Divine Evening Maha Aarti & Devotional Bhajans from Majestique Euriska Club House.
Join our society residents for sacred chants, dholak beats, and freshly prepared Modak Prasad distribution.

📅 Date: 15 September 2026 (Day 2)
⏰ Time: 8:00 PM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for all live celebrations!

#MajestiqueEuriska #EveningAarti #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    videoId: 'w7dPeNYy5_E',
    title: 'Majestique Euriska - Daily Morning Aarti & Darshan (16 Sep, 8 AM) 🌅',
    description: `🌅 Sacred Daily Morning Aarti & Darshan from Majestique Euriska Club House.
Experience the serene morning devotional prayers, Atharvashirsha recitation & divine darshan of Bappa.

📅 Date: 16 September 2026 (Day 3)
⏰ Time: 8:00 AM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for live stream notifications!

#MajestiqueEuriska #MorningAarti #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    videoId: 'pUb2gP3NRRs',
    title: 'Majestique Euriska - Daily Evening Maha Aarti & Cultural Darshan (16 Sep, 8 PM) 🪔',
    description: `🪔 Majestic Evening Maha Aarti & Community Chanting from Majestique Euriska Mandap.
Come together with family and friends for prayers, devotional hymns, and divine blessings.

📅 Date: 16 September 2026 (Day 3)
⏰ Time: 8:00 PM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for live updates!

#MajestiqueEuriska #EveningAarti #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    videoId: 'VMQWo_CKnE4',
    title: 'Majestique Euriska - Daily Morning Aarti & Darshan (17 Sep, 8 AM) 🌅',
    description: `🌅 Auspicious Morning Aarti & Darshan from Majestique Euriska Club House Mandap.
Begin your morning immersed in the grace of Lord Ganesha with Vedic mantras and sacred aarti.

📅 Date: 17 September 2026 (Day 4)
⏰ Time: 8:00 AM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for daily morning prayers!

#MajestiqueEuriska #MorningAarti #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    videoId: 'oiJ1Hd3A8as',
    title: 'Majestique Euriska - Daily Evening Maha Aarti & Musical Sangeet (17 Sep, 8 PM) 🪔',
    description: `🪔 Devotional Evening Maha Aarti & Sangeet Sandhya from Majestique Euriska.
Featuring traditional devotional melodies, collective society prayers, and Prasad distribution.

📅 Date: 17 September 2026 (Day 4)
⏰ Time: 8:00 PM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural to celebrate with us!

#MajestiqueEuriska #EveningAarti #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    videoId: 'GHjFHw39iwk',
    title: 'Majestique Euriska - Daily Morning Aarti & Darshan (18 Sep, 8 AM) 🌅',
    description: `🌅 Peaceful Morning Aarti, Archana & Darshan from Majestique Euriska Mandap.
Connect live to offer your morning prayers and receive divine blessings of Ganpati Bappa.

📅 Date: 18 September 2026 (Day 5)
⏰ Time: 8:00 AM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for live darshan!

#MajestiqueEuriska #MorningAarti #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    videoId: 'dSOOdWiY8og',
    title: 'Majestique Euriska - Daily Evening Maha Aarti & Bhajan Sandhya (18 Sep, 8 PM) 🪔',
    description: `🪔 Grand Evening Maha Aarti & Bhajan Sandhya from Majestique Euriska Club House.
Experience deep devotion with traditional bhajans, dholak rhythms, and evening Prasad seva.

📅 Date: 18 September 2026 (Day 5)
⏰ Time: 8:00 PM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Ganeshotsav 2026 Schedule (14 Sep – 25 Sep):
• Daily Morning Aarti: 8:00 AM IST
• Daily Evening Maha Aarti: 8:00 PM IST

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural for live devotional events!

#MajestiqueEuriska #EveningAarti #Ganeshotsav2026 #LiveStream #Pune`
  },
  {
    videoId: '8ISxFk91qnQ',
    title: 'Majestique Euriska - Daily Morning Aarti & Darshan (19 Sep, 8 AM) 🌅',
    description: `🌅 Day 6 Morning Aarti & Divine Darshan from Majestique Euriska Club House.
Join us live as we start Carnival Day with auspicious Ganpati prayers and chanting.

📅 Date: 19 September 2026 (Day 6)
⏰ Time: 8:00 AM IST
📍 Venue: Club House Mandap, Majestique Euriska, Pune

✨ Today's Special (19 Sep):
• 8:00 AM: Morning Aarti & Darshan
• 3:00 PM: Kids Drawing Competition
• 6:00 PM: City Cha Bappa with Radio City 91.1 FM Live RJ interaction & Games
• 7:00 PM: Festive Food Stalls & Chaat
• 8:00 PM: Grand Evening Maha Aarti

🌐 Official Website: https://euriskacultural.web.app
🔔 Subscribe to @MajestiqueEuriskaCultural to not miss any live moments!

#MajestiqueEuriska #MorningAarti #Carnival #Ganeshotsav2026 #LiveStream #Pune`
  }
];

const THUMBNAIL_PATH = '/Users/sweta/Amit_Development/Euriska_Cultrual/public/youtube_thumbnail.jpg';

async function updateStream(send, item, index, total) {
  console.log(`\n[${index + 1}/${total}] Processing video: ${item.videoId} ("${item.title.slice(0, 40)}...")`);

  // Navigate to edit page
  await send('Page.navigate', { url: `https://studio.youtube.com/video/${item.videoId}/edit` });
  await new Promise(r => setTimeout(r, 4500));

  // Wait for inputs to be present
  let ready = false;
  for (let attempt = 0; attempt < 10; attempt++) {
    const check = await send('Runtime.evaluate', {
      expression: 'document.querySelectorAll("#textbox").length >= 2',
      returnByValue: true
    });
    if (check.result?.value) {
      ready = true;
      break;
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  if (!ready) {
    console.error(`❌ Timeout waiting for textboxes on video ${item.videoId}`);
    return false;
  }

  // 1. Update Title
  const titleRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const titleBox = document.querySelectorAll('#textbox')[0];
        if (!titleBox) return 'title box not found';
        titleBox.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, ${JSON.stringify(item.title)});
        titleBox.dispatchEvent(new Event('input', { bubbles: true }));
        titleBox.dispatchEvent(new Event('change', { bubbles: true }));
        return 'Set title: ' + titleBox.innerText;
      })()
    `,
    returnByValue: true
  });
  console.log('   Title:', titleRes.result?.value);

  await new Promise(r => setTimeout(r, 500));

  // 2. Update Description
  const descRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const descBox = document.querySelectorAll('#textbox')[1];
        if (!descBox) return 'desc box not found';
        descBox.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, ${JSON.stringify(item.description)});
        descBox.dispatchEvent(new Event('input', { bubbles: true }));
        descBox.dispatchEvent(new Event('change', { bubbles: true }));
        return 'Set description (' + descBox.innerText.length + ' chars)';
      })()
    `,
    returnByValue: true
  });
  console.log('   Description:', descRes.result?.value);

  // Close any popover (e.g. hashtags)
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape' });

  await new Promise(r => setTimeout(r, 800));

  // 3. Upload Thumbnail
  try {
    const doc = await send('DOM.getDocument');
    const fileNode = await send('DOM.querySelector', {
      nodeId: doc.root.nodeId,
      selector: '#file-loader'
    });

    if (fileNode && fileNode.nodeId) {
      await send('DOM.setFileInputFiles', {
        nodeId: fileNode.nodeId,
        files: [THUMBNAIL_PATH]
      });
      console.log('   Thumbnail: Uploaded successfully');
    } else {
      console.log('   Thumbnail: #file-loader not found, attempting change button');
      const changeRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const btn = document.querySelector('input[type="file"]');
            return btn ? btn.id : 'no file input';
          })()
        `,
        returnByValue: true
      });
      console.log('   File input check:', changeRes.result?.value);
    }
  } catch (err) {
    console.error('   Thumbnail upload error:', err.message);
  }

  await new Promise(r => setTimeout(r, 2000));

  // Close popover again before save
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape' });

  // 4. Click Save
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
  console.log('   Save:', saveRes.result?.value);

  // Wait for save to persist
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
  console.log('   Post-save state:', afterState.result?.value);

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

  console.log(`🚀 Starting batch update for ${STREAMS_TO_UPDATE.length} existing scheduled streams...`);

  let successCount = 0;
  for (let i = 0; i < STREAMS_TO_UPDATE.length; i++) {
    const ok = await updateStream(send, STREAMS_TO_UPDATE[i], i, STREAMS_TO_UPDATE.length);
    if (ok) successCount++;
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n✅ Completed update of ${successCount}/${STREAMS_TO_UPDATE.length} streams.`);

  // Navigate back to live videos list and capture verification screenshot
  await send('Page.navigate', {
    url: 'https://studio.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw/videos/live?filter=%5B%5D&sort=%7B%22columnType%22%3A%22date%22%2C%22sortOrder%22%3A%22ASCENDING%22%7D'
  });
  await new Promise(r => setTimeout(r, 5000));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync('/Users/sweta/Amit_Development/Euriska_Cultrual/scripts/youtube-scheduler/updated_streams_verification.png', Buffer.from(screenshot.data, 'base64'));
  console.log('📸 Verification screenshot saved to updated_streams_verification.png');

  ws.close();
}

main().catch(console.error);
