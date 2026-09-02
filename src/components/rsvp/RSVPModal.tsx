import React, { useState, useEffect } from 'react';
import { X, Users, Utensils, CheckCircle2, HeartHandshake, Clock, MapPin } from 'lucide-react';
import type { MahaPrasadRSVP } from '../../types';

interface RSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    buildingId: 'A' | 'B' | 'C';
    flatNumber: string;
    residentName: string;
    phone: string;
    adultsCount: number;
    childrenCount: number;
    dietaryPreference?: string;
    timeSlot?: string;
    isVolunteering?: boolean;
    notes?: string;
  }) => Promise<void>;
  existingRSVP?: MahaPrasadRSVP | null;
}

export const RSVPModal: React.FC<RSVPModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingRSVP,
}) => {
  const [buildingId, setBuildingId] = useState<'A' | 'B' | 'C'>('A');
  const [flatNumber, setFlatNumber] = useState('');
  const [residentName, setResidentName] = useState('');
  const [phone, setPhone] = useState('');
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(1);
  const [dietaryPreference] = useState<string>('SATVIK');
  const [timeSlot, setTimeSlot] = useState<string>('8:00 PM - 9:00 PM');
  const [isVolunteering, setIsVolunteering] = useState<boolean>(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (existingRSVP) {
      setBuildingId(existingRSVP.buildingId || 'A');
      // Extract numeric flat number if it contains prefix
      const rawFlat = existingRSVP.flatNumber.replace(/^[ABC]-/i, '');
      setFlatNumber(rawFlat);
      setResidentName(existingRSVP.residentName || '');
      setPhone(existingRSVP.phone || '');
      setAdultsCount(existingRSVP.adultsCount || 2);
      setChildrenCount(existingRSVP.childrenCount || 0);
      setTimeSlot(existingRSVP.timeSlot || '8:00 PM - 9:00 PM');
      setIsVolunteering(Boolean(existingRSVP.isVolunteering));
      setNotes(existingRSVP.notes || '');
    } else {
      setBuildingId('A');
      setFlatNumber('');
      setResidentName('');
      setPhone('');
      setAdultsCount(2);
      setChildrenCount(1);
      setTimeSlot('8:00 PM - 9:00 PM');
      setIsVolunteering(false);
      setNotes('');
    }
    setErrorMsg('');
  }, [existingRSVP, isOpen]);

  if (!isOpen) return null;

  const totalMembers = Number(adultsCount || 0) + Number(childrenCount || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNumber.trim()) {
      setErrorMsg('Please enter your flat number (e.g. 402).');
      return;
    }
    if (!residentName.trim()) {
      setErrorMsg('Please enter your name or family name.');
      return;
    }
    if (totalMembers < 1) {
      setErrorMsg('Total headcount must be at least 1 person.');
      return;
    }

    const fullFlat = `${buildingId}-${flatNumber.trim()}`;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await onSave({
        id: existingRSVP?.id,
        buildingId,
        flatNumber: fullFlat,
        residentName,
        phone,
        adultsCount: Number(adultsCount),
        childrenCount: Number(childrenCount),
        dietaryPreference,
        timeSlot,
        isVolunteering,
        notes,
      });
      onClose();
    } catch {
      setErrorMsg('Failed to save RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          maxWidth: 540,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          border: '1px solid #fed7aa',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Festive Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #c2410c, #ea580c)',
            padding: '20px 24px',
            color: '#ffffff',
            position: 'relative',
            borderTopLeftRadius: 19,
            borderTopRightRadius: 19,
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ background: '#fef08a', color: '#854d0e', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 12 }}>
              ✨ 24th September 2026
            </span>
            <span style={{ fontSize: 12, color: '#ffedd5', fontWeight: 600 }}>
              8:00 PM – 10:00 PM
            </span>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 900, margin: '4px 0 2px 0', color: '#ffffff' }}>
            {existingRSVP ? 'Update Maha Prasad RSVP' : '🍲 Maha Prasad Family RSVP'}
          </h2>
          <p style={{ fontSize: 12.5, color: '#fed7aa', margin: 0 }}>
            Join the society community feast at Club House Podium &amp; Party Lawn.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {errorMsg && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: 13,
                marginBottom: 16,
                fontWeight: 600,
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Event Quick Info Badge */}
          <div
            style={{
              background: '#fff7ed',
              border: '1px solid #ffedd5',
              borderRadius: 12,
              padding: '10px 14px',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9a3412', fontWeight: 700 }}>
              <Clock size={15} color="#ea580c" />
              <span>Timing: 8:00 PM to 10:00 PM</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9a3412', fontWeight: 700 }}>
              <MapPin size={15} color="#ea580c" />
              <span>Club House Podium</span>
            </div>
          </div>

          {/* Wing & Flat Number Selection */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Select Wing &amp; Flat Number *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value as 'A' | 'B' | 'C')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0f172a',
                  background: '#f8fafc',
                }}
              >
                <option value="A">Wing A</option>
                <option value="B">Wing B</option>
                <option value="C">Wing C</option>
              </select>

              <input
                type="text"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                placeholder="e.g. 402"
                required
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  color: '#0f172a',
                }}
              />
            </div>
          </div>

          {/* Devotee Name & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Devotee / Family Name *
              </label>
              <input
                type="text"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                placeholder="e.g. Rajesh Sharma & Family"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 98220 12345"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Headcount Selection (Adults + Kids) */}
          <div
            style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: 14,
              padding: '14px 16px',
              marginBottom: 18,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={16} color="#ea580c" /> Total Headcount
              </span>
              <span
                style={{
                  background: '#ea580c',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: 13,
                  padding: '3px 10px',
                  borderRadius: 20,
                }}
              >
                {totalMembers} {totalMembers === 1 ? 'Person' : 'People'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Adults (12+ Years)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setAdultsCount(Math.max(1, Number(adultsCount || 1) - 1))}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      border: '1.5px solid #cbd5e1',
                      background: '#fff',
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={adultsCount}
                    onChange={(e) => setAdultsCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    style={{
                      width: 52,
                      height: 38,
                      padding: 0,
                      textAlign: 'center',
                      fontSize: 16,
                      fontWeight: 800,
                      color: '#0f172a',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: 8,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setAdultsCount(Number(adultsCount || 0) + 1)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      border: '1.5px solid #cbd5e1',
                      background: '#fff',
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  Kids (&lt;12 Years)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setChildrenCount(Math.max(0, Number(childrenCount || 0) - 1))}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      border: '1.5px solid #cbd5e1',
                      background: '#fff',
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    style={{
                      width: 52,
                      height: 38,
                      padding: 0,
                      textAlign: 'center',
                      fontSize: 16,
                      fontWeight: 800,
                      color: '#0f172a',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: 8,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setChildrenCount(Number(childrenCount || 0) + 1)}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      border: '1.5px solid #cbd5e1',
                      background: '#fff',
                      fontSize: 18,
                      fontWeight: 900,
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Satvik Maha Prasad Feast Note */}
          <div
            style={{
              marginBottom: 16,
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: '#fef08a',
                color: '#854d0e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Utensils size={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#92400e' }}>
                Pure Satvik Maha Prasad
              </div>
              <div style={{ fontSize: 11.5, color: '#78350f', marginTop: 1 }}>
                100% purely vegetarian holy feast prepared for all devotee families.
              </div>
            </div>
          </div>

          {/* Preferred Time Window */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Expected Arrival Window (8:00 PM – 10:00 PM)
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1.5px solid #cbd5e1',
                fontSize: 13.5,
                color: '#0f172a',
                background: '#ffffff',
              }}
            >
              <option value="8:00 PM - 9:00 PM">Batch 1: 8:00 PM - 9:00 PM (Early Dinner)</option>
              <option value="9:00 PM - 10:00 PM">Batch 2: 9:00 PM - 10:00 PM (Late Dinner)</option>
              <option value="Anytime (8:00 PM - 10:00 PM)">Anytime between 8:00 PM - 10:00 PM</option>
            </select>
          </div>

          {/* Volunteer Checkbox */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: 12,
              padding: '12px 14px',
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
            }}
            onClick={() => setIsVolunteering(!isVolunteering)}
          >
            <input
              type="checkbox"
              checked={isVolunteering}
              onChange={(e) => setIsVolunteering(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#16a34a', cursor: 'pointer' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                <HeartHandshake size={15} /> Ready to Volunteer in Prasad Seva Distribution?
              </div>
              <div style={{ fontSize: 11.5, color: '#15803d' }}>
                Join the youth &amp; resident committee in serving Prasad with love.
              </div>
            </div>
          </div>

          {/* Special Requests */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
              Special Notes / Requests (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Wheelchair assistance needed / packing for elderly at home"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                border: '1.5px solid #cbd5e1',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#475569',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #c2410c, #ea580c)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Saving...' : existingRSVP ? 'Update RSVP' : 'Confirm RSVP'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
