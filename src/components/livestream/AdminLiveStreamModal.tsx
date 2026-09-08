import React, { useState, useEffect } from 'react';
import {
  Radio,
  Sparkles,
  Play,
  StopCircle,
  X,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { liveStreamService, extractYouTubeVideoId } from '../../services/liveStreamService';
import { useToast } from '../../context/ToastContext';
import type { LiveStreamInfo, LiveStreamCategory } from '../../types';

interface AdminLiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStreamUpdated?: (info: LiveStreamInfo) => void;
}

const PRESET_EVENTS = [
  {
    title: 'Shree Ganesh Evening Maha Aarti (8:00 PM)',
    category: 'Aarti' as LiveStreamCategory,
    desc: 'Live Darshan & Maha Aarti of Lord Ganesha at Majestique Euriska Club House.',
    pinned: '🪔 Maha Prasad distribution starts at 8:45 PM at Club House.',
  },
  {
    title: 'Shree Ganesh Morning Aarti (8:00 AM)',
    category: 'Aarti' as LiveStreamCategory,
    desc: 'Morning prayers, Pooja, and Devotional Bhajans from the Mandap.',
    pinned: '🌸 Morning Pooja and flower offerings underway.',
  },
  {
    title: 'Kalakriti 2026: Dance & Fancy Dress Gala',
    category: 'Kalakriti' as LiveStreamCategory,
    desc: 'Grand cultural talent performances by society kids & residents on stage.',
    pinned: '🎭 Live voting and cheering for Kalakriti stage performers!',
  },
  {
    title: 'Dhol Pathak & Ganesh Aagman Miravnuk',
    category: 'Cultural' as LiveStreamCategory,
    desc: 'Grand procession with traditional Dhol Tasha Pathak beats & celebrations.',
    pinned: '🥁 Ganpati Bappa Morya! Grand welcoming at Society Main Gate.',
  },
  {
    title: 'Anant Chaturdashi Ganesh Visarjan Live',
    category: 'Visarjan' as LiveStreamCategory,
    desc: 'Emotional farewell & Eco-friendly Visarjan immersion ceremony.',
    pinned: '🌺 Pudhchya Varshi Lavkar Ya! Visarjan procession live.',
  },
];

export const AdminLiveStreamModal: React.FC<AdminLiveStreamModalProps> = ({
  isOpen,
  onClose,
  onStreamUpdated,
}) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  // Form State
  const [isLive, setIsLive] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LiveStreamCategory>('Aarti');
  const [description, setDescription] = useState('');
  const [pinnedMessage, setPinnedMessage] = useState('');

  // Derived Preview Video ID
  const videoId = extractYouTubeVideoId(streamUrl);

  useEffect(() => {
    if (!isOpen) return;
    const fetchConfig = async () => {
      const config = await liveStreamService.getLiveStreamConfig();
      setIsLive(config.isLive);
      setStreamUrl(config.streamUrl || '');
      setTitle(config.title || 'Shree Ganesh Evening Maha Aarti (8:00 PM)');
      setCategory(config.category || 'Aarti');
      setDescription(config.description || '');
      setPinnedMessage(config.pinnedMessage || '');
    };
    fetchConfig();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: (typeof PRESET_EVENTS)[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setDescription(preset.desc);
    setPinnedMessage(preset.pinned);
    showToast(`Applied preset: ${preset.title}`, 'info');
  };

  const handleStartStream = async () => {
    if (!streamUrl.trim()) {
      showToast('Please enter a valid YouTube Live Stream URL or Video ID.', 'error');
      return;
    }

    try {
      setLoading(true);
      const updated = await liveStreamService.startLiveStream({
        streamUrl: streamUrl.trim(),
        title: title.trim() || 'Shree Ganesh Evening Maha Aarti',
        category,
        description: description.trim(),
        pinnedMessage: pinnedMessage.trim(),
      });
      setIsLive(true);
      if (onStreamUpdated) onStreamUpdated(updated);
      showToast('🔴 Live Stream is NOW BROADCASTING to all residents!', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to start live stream.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEndStream = async () => {
    try {
      setLoading(true);
      const updated = await liveStreamService.endLiveStream();
      setIsLive(false);
      if (onStreamUpdated) onStreamUpdated(updated);
      showToast('Live stream broadcast ended.', 'info');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to end live stream.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettingsOnly = async () => {
    try {
      setLoading(true);
      const updated = await liveStreamService.updateLiveStreamConfig({
        streamUrl: streamUrl.trim(),
        title: title.trim(),
        category,
        description: description.trim(),
        pinnedMessage: pinnedMessage.trim(),
      });
      if (onStreamUpdated) onStreamUpdated(updated);
      showToast('Live stream settings updated successfully.', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to update live stream settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          maxWidth: 620,
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '20px 22px',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            color: '#fff',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: isLive ? '#ef4444' : 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: isLive ? '0 0 16px rgba(239, 68, 68, 0.6)' : 'none',
              }}
            >
              <Radio size={20} className={isLive ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>
                  Live Stream Control Center
                </h2>
                {isLive ? (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 900,
                      padding: '2px 8px',
                      borderRadius: 12,
                      letterSpacing: 0.5,
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
                    }}
                  >
                    🔴 ON AIR
                  </span>
                ) : (
                  <span
                    style={{
                      background: '#475569',
                      color: '#e2e8f0',
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 12,
                    }}
                  >
                    OFFLINE
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>
                Channel: <strong style={{ color: '#fed7aa' }}>Majestique Euriska Cultural</strong> (majestiqueeuriskacultural@gmail.com)
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '20px 22px' }}>
          {/* Quick Presets Selection */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 800,
                color: '#334155',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              ⚡ Quick Festive Stream Presets
            </label>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {PRESET_EVENTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    flexShrink: 0,
                    background: title === preset.title ? '#fff7ed' : '#f8fafc',
                    border: `1.5px solid ${title === preset.title ? '#ea580c' : '#e2e8f0'}`,
                    color: title === preset.title ? '#ea580c' : '#475569',
                    borderRadius: 12,
                    padding: '8px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Sparkles size={13} />
                  <span>{preset.title.split(':')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* YouTube Stream Link / ID Input */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>YouTube Live Stream Link or Video ID *</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <a
                  href="https://www.youtube.com/channel/UCxRNcIybtSFaD6HWiMlrpLw"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 11,
                    color: '#ef4444',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <span>Channel</span>
                  <ExternalLink size={11} />
                </a>
                <a
                  href="https://studio.youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 11,
                    color: '#ea580c',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <span>YouTube Studio</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <input
              type="text"
              placeholder="e.g. https://www.youtube.com/watch?v=XXXXX or https://youtu.be/XXXXX"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 12,
                border: '1.5px solid #cbd5e1',
                fontSize: 13,
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#f8fafc',
              }}
            />
            <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0' }}>
              Paste standard YouTube Live URL, share link, or 11-digit video ID.
            </p>
          </div>

          {/* Live Preview Embed Box (if videoId detected) */}
          {videoId ? (
            <div
              style={{
                marginBottom: 16,
                background: '#000',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                aspectRatio: '16/9',
                position: 'relative',
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                title="Live Stream Preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : streamUrl ? (
            <div
              style={{
                padding: '10px 14px',
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: 10,
                color: '#92400e',
                fontSize: 12,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>⚠️ Could not parse YouTube video ID. Please check the URL format.</span>
            </div>
          ) : null}

          {/* Title & Category Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 4 }}>
                Broadcast Title
              </label>
              <input
                type="text"
                placeholder="e.g. Shree Ganesh Evening Maha Aarti"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 13,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 4 }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LiveStreamCategory)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 13,
                  boxSizing: 'border-box',
                  background: '#fff',
                }}
              >
                <option value="Aarti">🪔 Aarti</option>
                <option value="Kalakriti">🎭 Kalakriti</option>
                <option value="Visarjan">🌺 Visarjan</option>
                <option value="Cultural">🥁 Cultural</option>
                <option value="AGM">🏢 AGM / Meeting</option>
                <option value="Other">✨ Other</option>
              </select>
            </div>
          </div>

          {/* Pinned Live Announcement */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: '#334155',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <MessageSquare size={14} color="#ea580c" />
              <span>Pinned Live Announcement (Shown beneath video)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Prasad distribution will commence right after Aarti at Club House."
              value={pinnedMessage}
              onChange={(e) => setPinnedMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1.5px solid #cbd5e1',
                fontSize: 12,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
            {isLive ? (
              <button
                type="button"
                onClick={handleEndStream}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  padding: '13px 20px',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                }}
              >
                <StopCircle size={18} />
                <span>{loading ? 'Stopping...' : 'End Live Broadcast'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartStream}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  padding: '13px 20px',
                  fontSize: 14,
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
                }}
              >
                <Play size={18} />
                <span>{loading ? 'Broadcasting...' : '🔴 Go Live Now'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveSettingsOnly}
              disabled={loading}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: 14,
                padding: '13px 18px',
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Save Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
