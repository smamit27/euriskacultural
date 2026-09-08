import { db, isFirebaseConfigured } from '../firebase/config';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import type { LiveStreamInfo } from '../types';

const STORAGE_KEY = 'euriska_livestream_config';

export const DEFAULT_LIVESTREAM: LiveStreamInfo = {
  id: 'current',
  isLive: false,
  title: 'Shree Ganesh Evening Maha Aarti (8:00 PM)',
  description: 'Live broadcast of Daily Aarti, Devotional Bhajans & Community Celebrations from Majestique Euriska Club House.',
  category: 'Aarti',
  streamUrl: '',
  youtubeVideoId: '',
  channelName: 'Majestique Euriska Cultural',
  channelEmail: 'majestiqueeuriskacultural@gmail.com',
  channelUrl: 'https://www.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw',
  scheduledTime: 'Daily 8:00 PM',
  viewerCount: 42,
  pinnedMessage: '🌸 Ganpati Bappa Morya! Prasad distribution will commence right after Aarti at Club House.',
  updatedAt: new Date().toISOString(),
};

export const AARTI_LYRICS = [
  {
    title: 'Sukhkarta Dukhharta (Shri Ganpati Aarti)',
    marathi: `सुखकर्ता दुखहर्ता वार्ता विघ्नाची ।
नुरवी पुरवी प्रेम कृपा जयाची ।
सर्वांगी सुंदर उटी शेंदुराची ।
कंठी झळके माळ मुक्ताफळांची ॥ १ ॥

जय देव जय देव जय मंगलमूर्ती ।
दर्शनमात्रे मनकामना पुरती ॥ धृ. ॥

रत्नखचित फरा तुज गौरीकुमरा ।
चंदनाची उटी कुमकुमकेशरा ।
हीरेजडित मुकुट शोभतो बरा ।
रुणझुणती नूपुरे चरणी घागरिया ॥ २ ॥ जय देव...

लंबोदर पीतांबर फणिवरबंधना ।
सरळ सोंड वक्रतुंड त्रिनयना ।
दास रामाचा वाट पाहे सदना ।
संकटी पावावे निर्वाणी रक्षावे सुरवरवंदना ॥ ३ ॥ जय देव...`,
  },
  {
    title: 'Shendur Lal Chadhayo (Sindoor Aarti)',
    marathi: `शेंदूर लाल चढायो अच्छा गजमुखको ।
दोंदिल लाल बिराजे सुत गौरीहरको ।
हात लिये गुडलड्डू साईं सुरवरको ।
महिमा कहे न जाय लागत हूँ पदको ॥ १ ॥

जय जय श्री गणराज विद्यासुखदाता ।
धन्य तुम्हारो दर्शन मेरा मन रमता ॥ धृ. ॥

अष्टौ सिद्धि नवनिधि दायक दाता ।
सर्व सुखदाता आनंददाता ।
भक्तजनहितकारी वरद विधाता ।
आरती करू मंगलमूर्ती सुखदाता ॥ २ ॥ जय जय...`,
  },
  {
    title: 'Ghalin Lotangan (Mangal Aarti)',
    marathi: `घालीन लोटांगण वंदीन चरण ।
डोळ्यांनी पाहीन रूप तुझे ।
प्रेमे आलिंगिन आनंदे पूजिन ।
भावे ओवाळीन म्हणे नामा ॥ १ ॥

त्वमेव माता च पिता त्वमेव ।
त्वमेव बंधुश्च सखा त्वमेव ।
त्वमेव विद्या द्रविणं त्वमेव ।
त्वमेव सर्वं मम देवदेव ॥ २ ॥

कायेन वाचा मनसेंद्रियैर्वा ।
बुद्ध्यात्मना वा प्रकृतिस्वभावात् ।
करोमि यद्यत् सकलं परस्मै ।
नारायणायेति समर्पयामि ॥ ३ ॥`,
  },
];

/**
 * Extracts YouTube Video ID from various link formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - Plain 11-char ID
 */
export function extractYouTubeVideoId(urlOrId: string | undefined | null): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();

  // If already 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // https://youtu.be/ID
  const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (youtuBeMatch && youtuBeMatch[1]) {
    return youtuBeMatch[1];
  }

  // https://youtube.com/live/ID
  const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch && liveMatch[1]) {
    return liveMatch[1];
  }

  // https://youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  // https://youtube.com/embed/ID
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) {
    return embedMatch[1];
  }

  return '';
}

export const liveStreamService = {
  /**
   * Get cached or initial live stream settings
   */
  getLiveStreamConfigLocal(): LiveStreamInfo {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_LIVESTREAM, ...JSON.parse(stored) };
      }
    } catch {}
    return { ...DEFAULT_LIVESTREAM };
  },

  /**
   * Fetch current live stream config from Firebase or cache
   */
  async getLiveStreamConfig(): Promise<LiveStreamInfo> {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'livestreams', 'current');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as LiveStreamInfo;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          return { ...DEFAULT_LIVESTREAM, ...data };
        }
      } catch (err) {
        console.warn('Firebase livestream fetch notice:', err);
      }
    }
    return this.getLiveStreamConfigLocal();
  },

  /**
   * Real-time subscription to live stream status
   */
  subscribeLiveStream(onUpdate: (info: LiveStreamInfo) => void): () => void {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'livestreams', 'current');
        const unsubscribe = onSnapshot(
          docRef,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data() as LiveStreamInfo;
              const fullData = { ...DEFAULT_LIVESTREAM, ...data };
              localStorage.setItem(STORAGE_KEY, JSON.stringify(fullData));
              onUpdate(fullData);
            } else {
              onUpdate(this.getLiveStreamConfigLocal());
            }
          },
          (err) => {
            console.warn('Live stream listener error:', err);
            onUpdate(this.getLiveStreamConfigLocal());
          }
        );
        return unsubscribe;
      } catch (e) {
        console.warn('Firestore subscription failed, using local storage fallback:', e);
      }
    }

    // Local storage tab sync fallback
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          onUpdate(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    onUpdate(this.getLiveStreamConfigLocal());
    return () => window.removeEventListener('storage', handleStorage);
  },

  /**
   * Save / Update Live Stream settings
   */
  async updateLiveStreamConfig(info: Partial<LiveStreamInfo>): Promise<LiveStreamInfo> {
    const current = await this.getLiveStreamConfig();
    const videoId = info.streamUrl ? extractYouTubeVideoId(info.streamUrl) : (info.youtubeVideoId || current.youtubeVideoId);

    const updated: LiveStreamInfo = {
      ...current,
      ...info,
      youtubeVideoId: videoId,
      channelName: 'Majestique Euriska Cultural',
      channelEmail: 'majestiqueeuriskacultural@gmail.com',
      channelUrl: 'https://www.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw',
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'livestreams', 'current');
        await setDoc(docRef, updated, { merge: true });
      } catch (err) {
        console.error('Failed to sync live stream config to Firestore:', err);
      }
    }

    return updated;
  },

  /**
   * Quick Admin action: Start Live Broadcast
   */
  async startLiveStream(params: {
    streamUrl: string;
    title?: string;
    category?: LiveStreamInfo['category'];
    description?: string;
    pinnedMessage?: string;
  }): Promise<LiveStreamInfo> {
    const videoId = extractYouTubeVideoId(params.streamUrl);

    return this.updateLiveStreamConfig({
      isLive: true,
      streamUrl: params.streamUrl.trim(),
      youtubeVideoId: videoId,
      title: params.title || 'Shree Ganesh Evening Maha Aarti (8:00 PM)',
      category: params.category || 'Aarti',
      description: params.description || 'Live broadcast of Daily Aarti & Devotional Celebrations from Majestique Euriska Club House.',
      pinnedMessage: params.pinnedMessage || '🌸 Ganpati Bappa Morya! Live streaming from Majestique Euriska Mandap.',
      startedAt: new Date().toISOString(),
      viewerCount: Math.floor(Math.random() * 25) + 35,
    });
  },

  /**
   * Quick Admin action: End Live Broadcast
   */
  async endLiveStream(replayUrl?: string): Promise<LiveStreamInfo> {
    const current = await this.getLiveStreamConfig();
    return this.updateLiveStreamConfig({
      isLive: false,
      endedAt: new Date().toISOString(),
      replayUrl: replayUrl || current.streamUrl,
    });
  },
};
