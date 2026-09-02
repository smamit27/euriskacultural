import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Home, User, Phone, Sparkles, HeartHandshake, Users, PlusCircle } from 'lucide-react';
import { prasadService } from '../../services/prasadService';
import { useToast } from '../../context/ToastContext';
import type { PrasadSlot, PrasadBooking } from '../../types';

interface BookPrasadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: PrasadSlot | null;
  selectedBooking?: PrasadBooking | null;
  allSlots: PrasadSlot[];
  onSuccess: () => void;
}

const PRASAD_PRESETS = [
  '🥟 Modak (Steamed / Fried)',
  '🍬 Besan / Motichoor Ladoo',
  '🍎 Fresh Fruits & Dryfruits',
  '🥣 Sheera / Halwa / Kheer',
  '🥛 Panchamrit & Flowers',
  '🥥 Coconut & Sweets',
];

export const BookPrasadModal: React.FC<BookPrasadModalProps> = ({
  isOpen,
  onClose,
  selectedSlot,
  selectedBooking,
  allSlots,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [slotId, setSlotId] = useState('');
  const [editingBookingId, setEditingBookingId] = useState<string | undefined>(undefined);
  const [flatNumber, setFlatNumber] = useState('');
  const [residentName, setResidentName] = useState('');
  const [phone, setPhone] = useState('');
  const [prasadItem, setPrasadItem] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBooking && selectedSlot) {
      // Editing a specific booking
      setSlotId(selectedSlot.id);
      setEditingBookingId(selectedBooking.id);
      setFlatNumber(selectedBooking.flatNumber || '');
      setResidentName(selectedBooking.residentName || '');
      setPhone(selectedBooking.phone || '');
      setPrasadItem(selectedBooking.prasadItem || '🥟 Modak (Steamed / Fried)');
      setNotes(selectedBooking.notes || '');
    } else if (selectedSlot) {
      // Adding a new booking to the selected slot
      setSlotId(selectedSlot.id);
      setEditingBookingId(undefined);
      setFlatNumber('');
      setResidentName('');
      setPhone('');
      setPrasadItem('🥟 Modak (Steamed / Fried)');
      setNotes('');
    } else if (allSlots.length > 0) {
      const firstAvailable = allSlots.find((s) => !s.isBooked) || allSlots[0];
      setSlotId(firstAvailable.id);
      setEditingBookingId(undefined);
      setFlatNumber('');
      setResidentName('');
      setPhone('');
      setPrasadItem('🥟 Modak (Steamed / Fried)');
      setNotes('');
    }
  }, [selectedSlot, selectedBooking, allSlots, isOpen]);

  if (!isOpen) return null;

  const currentSlot = allSlots.find((s) => s.id === slotId) || selectedSlot;
  const currentSlotBookings = currentSlot?.bookings || [];
  const otherBookings = editingBookingId
    ? currentSlotBookings.filter((b) => b.id !== editingBookingId)
    : currentSlotBookings;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNumber.trim() || !residentName.trim() || !slotId) {
      showToast('Please fill Flat Number and Resident Name.', 'error');
      return;
    }

    setLoading(true);
    try {
      await prasadService.addOrUpdateBooking(slotId, {
        id: editingBookingId,
        flatNumber: flatNumber.trim(),
        residentName: residentName.trim(),
        phone: phone.trim(),
        prasadItem: prasadItem.trim() || 'Modak & Fruits',
        notes: notes.trim(),
      });

      showToast(
        editingBookingId
          ? `🪔 Prasad booking updated for ${currentSlot?.dateDisplay}!`
          : `🪔 Ganpati Prasad Seva confirmed for Flat ${flatNumber.trim().toUpperCase()} on ${currentSlot?.dateDisplay}! Ganpati Bappa Morya!`,
        'success'
      );
      onSuccess();
      onClose();
    } catch {
      showToast('Failed to save booking. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: 24,
          padding: '24px 20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          overflowY: 'auto',
          fontFamily: "'Outfit', sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
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

        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#fff7ed',
              color: '#c2410c',
              border: '1px solid #fed7aa',
              padding: '4px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            <Sparkles size={13} />
            <span>Evening Aarti 8:00 PM Prasad Seva</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
            {editingBookingId ? 'Edit Prasad Seva Booking' : 'Book Ganpati Prasad Slot'}
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, fontWeight: 500 }}>
            Multiple families can co-sponsor prasad on the same evening!
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Select Date */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 6 }}>
              <Calendar size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Select Date (14th to 25th Sep) *
            </label>
            <select
              value={slotId}
              onChange={(e) => setSlotId(e.target.value)}
              disabled={Boolean(editingBookingId)}
              style={{
                width: '100%',
                height: 46,
                padding: '0 12px',
                borderRadius: 12,
                border: '1.5px solid #cbd5e1',
                background: editingBookingId ? '#f1f5f9' : '#f8fafc',
                fontSize: 13.5,
                fontWeight: 700,
                color: '#0f172a',
                outline: 'none',
              }}
            >
              {allSlots.map((s) => {
                const count = s.bookings?.length || 0;
                let badge = '🟢 [Open]';
                if (count === 1) {
                  badge = `🟠 [1 Family: ${s.bookings![0].flatNumber}]`;
                } else if (count > 1) {
                  badge = `🟣 [${count} Families: ${s.bookings!.map((b) => b.flatNumber).join(', ')}]`;
                }
                return (
                  <option key={s.id} value={s.id}>
                    {s.dateDisplay} — {badge}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Existing Devotees Callout on Selected Date */}
          {otherBookings.length > 0 && (
            <div
              style={{
                background: '#faf5ff',
                border: '1.5px solid #e9d5ff',
                borderRadius: 12,
                padding: '10px 14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Users size={15} color="#7e22ce" />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#6b21a8' }}>
                  {otherBookings.length} {otherBookings.length === 1 ? 'Family' : 'Families'} Already Booked on this Date:
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {otherBookings.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      fontSize: 12,
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ fontWeight: 800, color: '#7e22ce', background: '#f3e8ff', padding: '2px 6px', borderRadius: 6 }}>
                      {b.flatNumber}
                    </span>
                    <span>{b.residentName}</span>
                    <span style={{ color: '#94a3b8' }}>•</span>
                    <span style={{ color: '#b45309', fontWeight: 600 }}>{b.prasadItem}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#7e22ce', fontWeight: 600, marginTop: 6 }}>
                ✨ Great! You can register as an additional family / co-devotee for this auspicious evening.
              </div>
            </div>
          )}

          {/* Time & Venue Banner */}
          <div
            style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: 12,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Clock size={18} color="#b45309" />
            <div style={{ fontSize: 12, color: '#92400e', fontWeight: 700 }}>
              Evening Aarti Timing: <strong>8:00 PM</strong> at <strong>Club House Podium</strong>
            </div>
          </div>

          {/* Flat Number & Resident Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 6 }}>
                <Home size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Flat No. *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. A-304"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                style={{
                  width: '100%',
                  height: 44,
                  padding: '0 12px',
                  borderRadius: 12,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#0f172a',
                  outline: 'none',
                  textTransform: 'uppercase',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 6 }}>
                <User size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                Resident / Family *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sharma Family / Patil Family"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                style={{
                  width: '100%',
                  height: 44,
                  padding: '0 12px',
                  borderRadius: 12,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 6 }}>
              <Phone size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Mobile Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="+91 98231 XXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                height: 44,
                padding: '0 12px',
                borderRadius: 12,
                border: '1.5px solid #cbd5e1',
                fontSize: 14,
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          {/* Prasad Offering */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 6 }}>
              🥟 Prasad Offering
            </label>
            <input
              type="text"
              placeholder="e.g. Modak, Ladoo, Fruits, Sheera..."
              value={prasadItem}
              onChange={(e) => setPrasadItem(e.target.value)}
              style={{
                width: '100%',
                height: 44,
                padding: '0 12px',
                borderRadius: 12,
                border: '1.5px solid #cbd5e1',
                fontSize: 14,
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                marginBottom: 8,
              }}
            />
            {/* Quick Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRASAD_PRESETS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPrasadItem(item)}
                  style={{
                    background: prasadItem === item ? '#ffedd5' : '#f1f5f9',
                    border: prasadItem === item ? '1px solid #f97316' : '1px solid #e2e8f0',
                    color: prasadItem === item ? '#c2410c' : '#475569',
                    borderRadius: 8,
                    padding: '4px 8px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#334155', marginBottom: 6 }}>
              Notes / Co-Sponsor Details (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Bringing 51 Ukadiche Modak / Joining with neighbor"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                height: 44,
                padding: '0 12px',
                borderRadius: 12,
                border: '1.5px solid #cbd5e1',
                fontSize: 14,
                color: '#0f172a',
                outline: 'none',
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !flatNumber.trim() || !residentName.trim()}
            style={{
              width: '100%',
              height: 50,
              borderRadius: 14,
              border: 'none',
              background: !flatNumber.trim() || !residentName.trim()
                ? '#cbd5e1'
                : 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#ffffff',
              fontSize: 15,
              fontWeight: 800,
              cursor: !flatNumber.trim() || !residentName.trim() || loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: !flatNumber.trim() || !residentName.trim()
                ? 'none'
                : '0 6px 20px rgba(249, 115, 22, 0.4)',
              marginTop: 6,
            }}
          >
            {editingBookingId ? (
              <>
                <HeartHandshake size={20} />
                <span>{loading ? 'Saving Changes...' : 'Update Prasad Seva Booking'}</span>
              </>
            ) : (
              <>
                <PlusCircle size={20} />
                <span>
                  {loading
                    ? 'Confirming Prasad Seva...'
                    : currentSlotBookings.length > 0
                    ? 'Confirm & Add Family Prasad Seva 🪔'
                    : 'Confirm Prasad Seva Slot 🪔'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
