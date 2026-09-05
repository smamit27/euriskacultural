import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Users, ArrowRight, Play, Sparkles, Plus, X, Music } from 'lucide-react';
import type { Performance } from '../../types';
import { performanceService } from '../../services/performanceService';

interface PerformanceListProps {
  onSelectPerformance: (perf: Performance) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Traditional Dance': { bg: '#fdf4ff', text: '#7e22ce' },
  'Bollywood Dance': { bg: '#fff7ed', text: '#c2410c' },
  'Vocal Music': { bg: '#ecfdf5', text: '#047857' },
  'Instrumental': { bg: '#eff6ff', text: '#1d4ed8' },
  'Drama/Skit': { bg: '#fef2f2', text: '#b91c1c' },
  'Kids Special': { bg: '#fffbeb', text: '#b45309' },
  'Fashion Show': { bg: '#f0fdf4', text: '#15803d' },
};

const CATEGORIES: Performance['category'][] = [
  'Traditional Dance',
  'Bollywood Dance',
  'Vocal Music',
  'Instrumental',
  'Drama/Skit',
  'Kids Special',
  'Fashion Show',
];

export const PerformanceList: React.FC<PerformanceListProps> = ({ onSelectPerformance }) => {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [performer, setPerformer] = useState('');
  const [groupName, setGroupName] = useState('');
  const [category, setCategory] = useState<Performance['category']>('Traditional Dance');
  const [time, setTime] = useState('');
  const [stage, setStage] = useState('Main Stage');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    performanceService.getPerformances().then((data) => {
      setPerformances(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !performer.trim()) return;

    setIsSubmitting(true);
    try {
      await performanceService.registerPerformance({
        eventId: 'event-1',
        title: title.trim(),
        performer: performer.trim(),
        groupName: groupName.trim() || undefined,
        category,
        time: time.trim() || 'TBD',
        stage: stage.trim() || 'Main Stage',
        description: description.trim() || 'Performance scheduled for Euriska Cultural Celebrations.',
        videoUrl: videoUrl.trim() || undefined,
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      });
      // Reset
      setTitle('');
      setPerformer('');
      setGroupName('');
      setTime('');
      setDescription('');
      setVideoUrl('');
      setImageUrl('');
      setShowAddModal(false);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading performances...</div>
  );

  return (
    <div style={{ padding: '0 14px 24px' }}>
      <div style={{
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Performances</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            Cultural stage acts & talent showcases
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '8px 14px',
            borderRadius: 10,
            fontSize: 12.5,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(249, 115, 22, 0.25)',
          }}
        >
          <Plus size={15} />
          Add Act
        </button>
      </div>

      {performances.length === 0 ? (
        <div style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #fff7ed 100%)',
          border: '1.5px dashed #fed7aa',
          borderRadius: 20,
          padding: '44px 20px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(249, 115, 22, 0.05)',
        }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)',
            color: '#ea580c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.15)',
          }}>
            <Music size={28} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
            No Performances Added Yet
          </h3>
          <p style={{
            fontSize: 13,
            color: '#64748b',
            maxWidth: 340,
            margin: '0 auto 20px',
            lineHeight: 1.5,
          }}>
            Stage performances and cultural acts will be displayed here once scheduled.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
            }}
          >
            <Sparkles size={16} />
            Schedule First Performance
          </button>
        </div>
      ) : (
        <div className="performance-list-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {performances.map((perf) => {
            const catColor = CATEGORY_COLORS[perf.category] || { bg: '#f1f5f9', text: '#334155' };
            return (
              <div
                key={perf.id}
                onClick={() => onSelectPerformance(perf)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.15s',
                }}
              >
                {/* Performance image */}
                <div style={{ position: 'relative', height: 180 }}>
                  <img
                    src={perf.imageUrl}
                    alt={perf.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 12,
                    right: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                      background: catColor.bg,
                      color: catColor.text,
                      padding: '3px 8px',
                      borderRadius: 6,
                    }}>
                      {perf.category}
                    </span>
                    {perf.videoUrl && (
                      <span style={{
                        background: 'rgba(255,255,255,0.9)',
                        color: '#dc2626',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        <Play size={12} fill="#dc2626" />
                        Watch
                      </span>
                    )}
                  </div>
                </div>

                {/* Info section */}
                <div style={{ padding: '12px 14px' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 4, lineHeight: 1.3 }}>
                    {perf.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#475569', marginBottom: 6 }}>
                    <Users size={13} color="#8b5cf6" />
                    <span style={{ fontWeight: 600 }}>{perf.performer}</span>
                    {perf.groupName && <span style={{ color: '#94a3b8' }}>• {perf.groupName}</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={12} color="#f97316" />{perf.time?.split('•')[0]?.trim() || perf.time}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={12} color="#f97316" />{perf.stage}
                      </span>
                    </div>
                    <span style={{ color: '#f97316', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                      View <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Performance Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            width: '100%',
            maxWidth: 480,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px 20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="#f97316" />
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Add Performance / Act
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Performance / Act Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classical Kathak Showcase"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Performer / Artist *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya & Friends"
                    value={performer}
                    onChange={(e) => setPerformer(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Group / Wing
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tower B Troupe"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Performance['category'])}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      background: '#ffffff',
                      boxSizing: 'border-box',
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Stage Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Stage / Lawn"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Time Slot
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 07:30 PM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Video URL (YouTube)
                  </label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Photo / Banner Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Description / Performance Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the performance..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(249, 115, 22, 0.3)',
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Add Performance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
