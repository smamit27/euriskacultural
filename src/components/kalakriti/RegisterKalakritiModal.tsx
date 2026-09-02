import React, { useState } from 'react';
import { X, CheckCircle2, User, Home, Phone, Sparkles } from 'lucide-react';
import { KALAKRITI_ACTIVITIES } from '../../services/kalakritiService';
import type { KalakritiEntry, KalakritiActivityKey } from '../../types';

interface RegisterKalakritiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<KalakritiEntry, 'id' | 'sn' | 'createdAt'>) => void;
  initialData?: KalakritiEntry | null;
}

export const RegisterKalakritiModal: React.FC<RegisterKalakritiModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [flatNumber, setFlatNumber] = useState(initialData?.flatNumber || 'A-');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [ageGroup, setAgeGroup] = useState<'Kids' | 'Teens' | 'Adults' | 'Seniors'>(
    initialData?.ageGroup || 'Kids'
  );
  const [remarks, setRemarks] = useState(initialData?.remarks || '');
  const [activities, setActivities] = useState<Record<KalakritiActivityKey, boolean>>({
    drawing: initialData?.drawing || false,
    skit1: initialData?.skit1 || false,
    skit2: initialData?.skit2 || false,
    dance: initialData?.dance || false,
    fashionShow: initialData?.fashionShow || false,
    mimicry: initialData?.mimicry || false,
    singing: initialData?.singing || false,
    fancyDress: initialData?.fancyDress || false,
  });

  if (!isOpen) return null;

  const toggleActivity = (key: KalakritiActivityKey) => {
    setActivities((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      flatNumber: flatNumber.trim() || undefined,
      phone: phone.trim() || undefined,
      ageGroup,
      drawing: activities.drawing,
      skit1: activities.skit1,
      skit2: activities.skit2,
      dance: activities.dance,
      fashionShow: activities.fashionShow,
      mimicry: activities.mimicry,
      singing: activities.singing,
      fancyDress: activities.fancyDress,
      remarks: remarks.trim() || undefined,
    });

    onClose();
  };

  const selectedCount = Object.values(activities).filter(Boolean).length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflowY: 'auto',
          boxShadow: '0 -10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.25s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            background: '#ffffff',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              🎨
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                {initialData ? 'Edit Kalakriti Entry' : 'Kalakriti Registration'}
              </h2>
              <p style={{ fontSize: 11, color: '#64748b', margin: 0, fontWeight: 600 }}>
                Euriska Cultural & Talent Activity Form
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Participant Name */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Participant Full Name <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  height: 42,
                  paddingLeft: 36,
                  paddingRight: 12,
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Flat & Age Group */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Flat No.
              </label>
              <div style={{ position: 'relative' }}>
                <Home size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  placeholder="e.g. A-103"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  style={{
                    width: '100%',
                    height: 42,
                    paddingLeft: 36,
                    paddingRight: 12,
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 14,
                    fontWeight: 600,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Age Category
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as any)}
                style={{
                  width: '100%',
                  height: 42,
                  paddingLeft: 12,
                  paddingRight: 12,
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 13,
                  fontWeight: 600,
                  outline: 'none',
                  background: '#fff',
                }}
              >
                <option value="Kids">Kids (0-12 yrs)</option>
                <option value="Teens">Teens (13-19 yrs)</option>
                <option value="Adults">Adults (20-55 yrs)</option>
                <option value="Seniors">Seniors (55+ yrs)</option>
              </select>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Contact Number (WhatsApp)
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="tel"
                placeholder="+91 98230 XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  height: 42,
                  paddingLeft: 36,
                  paddingRight: 12,
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Activity Selection Matrix */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={15} color="#ea580c" />
                Select Activities ({selectedCount} Selected)
              </label>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Tap to select</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {KALAKRITI_ACTIVITIES.map((act) => {
                const isSelected = activities[act.key];
                return (
                  <div
                    key={act.key}
                    onClick={() => toggleActivity(act.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 12,
                      border: isSelected ? `2px solid ${act.color}` : '1.5px solid #e2e8f0',
                      background: isSelected ? act.badgeBg : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ fontSize: 20 }}>{act.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: isSelected ? act.color : '#1e293b' }}>
                        {act.label}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={16} color={act.color} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Song / Act Title / Costume Details (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Classical song title or group name"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              style={{
                width: '100%',
                height: 40,
                padding: '0 12px',
                borderRadius: 10,
                border: '1.5px solid #cbd5e1',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 6, paddingBottom: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: 46,
                borderRadius: 12,
                border: '1.5px solid #cbd5e1',
                background: '#f8fafc',
                color: '#475569',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || selectedCount === 0}
              style={{
                flex: 2,
                height: 46,
                borderRadius: 12,
                border: 'none',
                background: !name.trim() || selectedCount === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 800,
                cursor: !name.trim() || selectedCount === 0 ? 'not-allowed' : 'pointer',
                boxShadow: !name.trim() || selectedCount === 0 ? 'none' : '0 4px 14px rgba(249, 115, 22, 0.35)',
              }}
            >
              {initialData ? 'Update Registration' : 'Complete Registration ✨'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
