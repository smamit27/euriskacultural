import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Sparkles,
  Flame,
  Bell as BellIcon,
  Volume2,
  VolumeX,
  Wind,
  Plus,
  Compass,
  Trophy as TrophyIcon,
  Info,
} from 'lucide-react';
import { createAartiDarshanScene, type AartiDarshanController } from './scenes/AartiDarshanScene';
import { createDeepotsavScene, type DeepotsavController } from './scenes/DeepotsavScene';
import { createMandapScene, type MandapController } from './scenes/MandapScene';
import { createTrophyScene, type TrophyController } from './scenes/TrophyScene';
import { deepotsavService, type LightedDiya } from '../../services/deepotsavService';
import { useToast } from '../../context/ToastContext';

export type Experience3DTab = 'aarti' | 'deepotsav' | 'mandap' | 'trophy';

interface Experience3DHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: Experience3DTab;
}

export const Experience3DHubModal: React.FC<Experience3DHubModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'aarti',
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Experience3DTab>(initialTab);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const aartiControllerRef = useRef<AartiDarshanController | null>(null);
  const deepotsavControllerRef = useRef<DeepotsavController | null>(null);
  const mandapControllerRef = useRef<MandapController | null>(null);
  const trophyControllerRef = useRef<TrophyController | null>(null);

  // Aarti State
  const [isAartiMoving, setIsAartiMoving] = useState(true);
  const [isDhoopActive, setIsDhoopActive] = useState(true);
  const [bellRingCount, setBellRingCount] = useState(0);
  const [flowerShowerCount, setFlowerShowerCount] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Deepotsav State
  const [diyas, setDiyas] = useState<LightedDiya[]>([]);
  const [showLightDiyaModal, setShowLightDiyaModal] = useState(false);
  const [residentName, setResidentName] = useState('');
  const [residentFlat, setResidentFlat] = useState('');
  const [residentMessage, setResidentMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState('#f59e0b');
  const [isSubmittingDiya, setIsSubmittingDiya] = useState(false);
  const [selectedDiya, setSelectedDiya] = useState<LightedDiya | null>(null);

  // Synchronize Deepotsav diyas
  useEffect(() => {
    if (!isOpen) return;
    const unsub = deepotsavService.subscribeDiyas((items) => {
      setDiyas(items);
      if (deepotsavControllerRef.current) {
        deepotsavControllerRef.current.updateDiyas(items);
      }
    });
    return () => unsub();
  }, [isOpen]);

  // Handle Tab Switch & Scene Mount/Cleanup
  useEffect(() => {
    if (!isOpen || !canvasContainerRef.current) return;

    // Clean up previous scenes
    if (aartiControllerRef.current) {
      aartiControllerRef.current.dispose();
      aartiControllerRef.current = null;
    }
    if (deepotsavControllerRef.current) {
      deepotsavControllerRef.current.dispose();
      deepotsavControllerRef.current = null;
    }
    if (mandapControllerRef.current) {
      mandapControllerRef.current.dispose();
      mandapControllerRef.current = null;
    }
    if (trophyControllerRef.current) {
      trophyControllerRef.current.dispose();
      trophyControllerRef.current = null;
    }

    const container = canvasContainerRef.current;
    container.innerHTML = '';

    if (activeTab === 'aarti') {
      aartiControllerRef.current = createAartiDarshanScene(container, () => {
        setBellRingCount((c) => c + 1);
      });
    } else if (activeTab === 'deepotsav') {
      const currentDiyas = deepotsavService.getStoredDiyas();
      deepotsavControllerRef.current = createDeepotsavScene(container, currentDiyas, (d) => {
        setSelectedDiya(d);
      });
    } else if (activeTab === 'mandap') {
      mandapControllerRef.current = createMandapScene(container);
    } else if (activeTab === 'trophy') {
      trophyControllerRef.current = createTrophyScene(container);
    }

    return () => {
      if (aartiControllerRef.current) {
        aartiControllerRef.current.dispose();
        aartiControllerRef.current = null;
      }
      if (deepotsavControllerRef.current) {
        deepotsavControllerRef.current.dispose();
        deepotsavControllerRef.current = null;
      }
      if (mandapControllerRef.current) {
        mandapControllerRef.current.dispose();
        mandapControllerRef.current = null;
      }
      if (trophyControllerRef.current) {
        trophyControllerRef.current.dispose();
        trophyControllerRef.current = null;
      }
    };
  }, [isOpen, activeTab]);

  // Devotional Audio Toggle
  const handleToggleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/menu.ogg');
      audioRef.current.loop = true;
    }
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
      showToast('Aarti music paused', 'info');
    } else {
      audioRef.current.play().then(() => {
        setIsAudioPlaying(true);
        showToast('🎵 Devotional music playing', 'success');
      }).catch(() => {
        showToast('Tap to enable sound', 'info');
      });
    }
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
    onClose();
  };

  // Actions
  const handleShowerFlowers = () => {
    if (aartiControllerRef.current) {
      aartiControllerRef.current.showerFlowers(100);
      setFlowerShowerCount((c) => c + 1);
      showToast('🌸 Pushpanjali offered to Lord Ganesha!', 'success');
    }
  };

  const handleRingBell = () => {
    if (aartiControllerRef.current) {
      aartiControllerRef.current.ringBell();
      showToast('🔔 Ghanti Naad — Mangal Bhavana!', 'info');
    }
  };

  const handleToggleAarti = () => {
    if (aartiControllerRef.current) {
      const isMoving = aartiControllerRef.current.toggleAartiMotion();
      setIsAartiMoving(isMoving);
      showToast(isMoving ? 'Aarti thali orbit resumed' : 'Aarti thali paused', 'info');
    }
  };

  const handleToggleDhoop = () => {
    if (aartiControllerRef.current) {
      const active = aartiControllerRef.current.toggleDhoop();
      setIsDhoopActive(active);
      showToast(active ? 'Dhoop smoke active' : 'Dhoop paused', 'info');
    }
  };

  const handleLightDiyaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentName.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }
    setIsSubmittingDiya(true);
    try {
      const created = await deepotsavService.lightDiya(
        residentName,
        residentFlat,
        residentMessage,
        selectedColor
      );
      if (deepotsavControllerRef.current) {
        deepotsavControllerRef.current.highlightDiya(created.id);
      }
      showToast(`🪔 Diya lit by ${residentName} (${residentFlat || 'Euriska'})!`, 'success');
      setShowLightDiyaModal(false);
      setResidentName('');
      setResidentFlat('');
      setResidentMessage('');
    } catch {
      showToast('Failed to light diya. Please retry.', 'error');
    } finally {
      setIsSubmittingDiya(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#07040d',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#fff',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Top Glass Header */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, rgba(7,4,13,0.95) 0%, rgba(7,4,13,0.4) 80%, transparent 100%)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(245,158,11,0.5)',
            }}
          >
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.3px', color: '#fef08a' }}>
              Euriska 3D Cultural Hub
            </div>
            <div style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 500 }}>
              {activeTab === 'aarti' && '🪔 Interactive 3D Ganpati Aarti & Darshan'}
              {activeTab === 'deepotsav' && '🕯️ Community Virtual Deepotsav'}
              {activeTab === 'mandap' && '🏛️ 360° Grand Festival Mandap'}
              {activeTab === 'trophy' && '🏆 Cultural Excellence Podium'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeTab === 'aarti' && (
            <button
              onClick={handleToggleAudio}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: '1px solid rgba(245,158,11,0.4)',
                background: isAudioPlaying ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.1)',
                color: isAudioPlaying ? '#fef08a' : '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Toggle Devotional Music"
            >
              {isAudioPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          )}

          <button
            onClick={handleClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Close 3D Experience"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Experience Category Selector Pills */}
      <div
        style={{
          position: 'absolute',
          top: 68,
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(15, 23, 42, 0.75)',
            padding: '4px 6px',
            borderRadius: 30,
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(16px)',
            maxWidth: '100%',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('aarti')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeTab === 'aarti' ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'transparent',
              color: activeTab === 'aarti' ? '#fff' : '#cbd5e1',
              boxShadow: activeTab === 'aarti' ? '0 2px 10px rgba(245,158,11,0.4)' : 'none',
            }}
          >
            🪔 3D Aarti
          </button>

          <button
            onClick={() => setActiveTab('deepotsav')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeTab === 'deepotsav' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
              color: activeTab === 'deepotsav' ? '#fff' : '#cbd5e1',
              boxShadow: activeTab === 'deepotsav' ? '0 2px 10px rgba(245,158,11,0.4)' : 'none',
            }}
          >
            🕯️ Deepotsav ({diyas.length})
          </button>

          <button
            onClick={() => setActiveTab('mandap')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeTab === 'mandap' ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'transparent',
              color: activeTab === 'mandap' ? '#fff' : '#cbd5e1',
              boxShadow: activeTab === 'mandap' ? '0 2px 10px rgba(139,92,246,0.4)' : 'none',
            }}
          >
            🏛️ Mandap
          </button>

          <button
            onClick={() => setActiveTab('trophy')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12.5,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: activeTab === 'trophy' ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'transparent',
              color: activeTab === 'trophy' ? '#fff' : '#cbd5e1',
              boxShadow: activeTab === 'trophy' ? '0 2px 10px rgba(236,72,153,0.4)' : 'none',
            }}
          >
            🏆 Trophy
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={canvasContainerRef}
        style={{
          width: '100%',
          height: '100%',
          flex: 1,
          position: 'relative',
          touchAction: 'none',
          cursor: 'grab',
        }}
      />

      {/* Gesture Hint overlay */}
      <div
        style={{
          position: 'absolute',
          top: 118,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(15,23,42,0.6)',
            padding: '4px 12px',
            borderRadius: 16,
            fontSize: 11,
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Compass size={13} />
          <span>Touch / Drag to orbit camera 360°</span>
        </div>
      </div>

      {/* Interactive Bottom Control Docks */}
      {/* 1. Aarti Bottom Dock */}
      {activeTab === 'aarti' && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 16,
            right: 16,
            zIndex: 10,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'center',
          }}
        >
          <button
            onClick={handleShowerFlowers}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
              color: '#fff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: 30,
              fontWeight: 800,
              fontSize: 13.5,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(245,158,11,0.5)',
              transform: 'scale(1)',
              transition: 'all 0.15s ease',
            }}
          >
            🌸 Shower Flowers {flowerShowerCount > 0 && `(${flowerShowerCount})`}
          </button>

          <button
            onClick={handleRingBell}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(30, 41, 59, 0.85)',
              color: '#fef08a',
              border: '1.5px solid #f59e0b',
              padding: '12px 18px',
              borderRadius: 30,
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}
          >
            <BellIcon size={17} />
            <span>Ring Bell {bellRingCount > 0 && `(${bellRingCount})`}</span>
          </button>

          <button
            onClick={handleToggleAarti}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isAartiMoving ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: isAartiMoving ? '#6ee7b7' : '#fca5a5',
              border: `1px solid ${isAartiMoving ? '#10b981' : '#ef4444'}`,
              padding: '12px 16px',
              borderRadius: 30,
              fontWeight: 600,
              fontSize: 12.5,
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Flame size={15} />
            <span>{isAartiMoving ? 'Thali Orbiting' : 'Thali Paused'}</span>
          </button>

          <button
            onClick={handleToggleDhoop}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(30, 41, 59, 0.85)',
              color: isDhoopActive ? '#e2e8f0' : '#64748b',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '12px 16px',
              borderRadius: 30,
              fontWeight: 600,
              fontSize: 12.5,
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Wind size={15} />
            <span>{isDhoopActive ? 'Dhoop On' : 'Dhoop Off'}</span>
          </button>
        </div>
      )}

      {/* 2. Deepotsav Bottom Dock */}
      {activeTab === 'deepotsav' && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 16,
            right: 16,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {selectedDiya && (
            <div
              style={{
                background: 'rgba(15,23,42,0.9)',
                border: '1.5px solid #f59e0b',
                padding: '10px 16px',
                borderRadius: 16,
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                maxWidth: 420,
                width: '100%',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Flame size={20} color="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#fef08a' }}>
                  {selectedDiya.name} ({selectedDiya.flatNo || 'Euriska'})
                </div>
                {selectedDiya.message && (
                  <div style={{ fontSize: 12, color: '#cbd5e1', fontStyle: 'italic', marginTop: 2 }}>
                    "{selectedDiya.message}"
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedDiya(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowLightDiyaModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff',
              border: 'none',
              padding: '14px 28px',
              borderRadius: 30,
              fontWeight: 800,
              fontSize: 15,
              cursor: 'pointer',
              boxShadow: '0 4px 25px rgba(245,158,11,0.6)',
            }}
          >
            <Plus size={18} />
            <span>Light Your 3D Diya</span>
          </button>
        </div>
      )}

      {/* 3. Mandap / Trophy Bottom Info Badges */}
      {(activeTab === 'mandap' || activeTab === 'trophy') && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            padding: '0 16px',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(15,23,42,0.85)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 20,
              padding: '8px 18px',
              backdropFilter: 'blur(12px)',
              fontSize: 12,
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {activeTab === 'mandap' ? (
              <>
                <Info size={15} color="#818cf8" />
                <span>Grand Mandap Stage for Cultural Performances & Aarti</span>
              </>
            ) : (
              <>
                <TrophyIcon size={15} color="#ec4899" />
                <span>Honoring Best Performances, Kalakriti Art & Volunteers</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Light Diya Sub-Modal / Drawer */}
      {showLightDiyaModal && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#0f172a',
              border: '1.5px solid rgba(245,158,11,0.5)',
              borderRadius: 20,
              padding: 24,
              maxWidth: 440,
              width: '100%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Flame size={22} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: 18, color: '#fef08a', fontWeight: 800 }}>Light a Sacred Diya</h3>
              </div>
              <button
                onClick={() => setShowLightDiyaModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLightDiyaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 5 }}>
                  Your Name / Family Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma Family"
                  value={residentName}
                  onChange={(e) => setResidentName(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#fff',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 5 }}>
                  Flat Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. A-402"
                  value={residentFlat}
                  onChange={(e) => setResidentFlat(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#fff',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 5 }}>
                  Devotional Wish / Prayer (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ganpati Bappa Morya!"
                  value={residentMessage}
                  onChange={(e) => setResidentMessage(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: 10,
                    padding: '10px 12px',
                    color: '#fff',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1', display: 'block', marginBottom: 6 }}>
                  Diya Flame Aura Color
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { label: 'Golden Amber', color: '#f59e0b' },
                    { label: 'Festive Rose', color: '#f43f5e' },
                    { label: 'Divine Violet', color: '#8b5cf6' },
                    { label: 'Sacred Emerald', color: '#10b981' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => setSelectedColor(c.color)}
                      style={{
                        flex: 1,
                        background: c.color,
                        border: selectedColor === c.color ? '3px solid #fff' : '2px solid transparent',
                        borderRadius: 8,
                        height: 32,
                        cursor: 'pointer',
                        boxShadow: selectedColor === c.color ? `0 0 12px ${c.color}` : 'none',
                      }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowLightDiyaModal(false)}
                  style={{
                    flex: 1,
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#94a3b8',
                    padding: '12px',
                    borderRadius: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDiya}
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                    border: 'none',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(245,158,11,0.4)',
                  }}
                >
                  {isSubmittingDiya ? 'Lighting...' : '🪔 Place in Sacred Pond'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
