import React, { useState, useEffect } from 'react';
import {
  Clock,
  PlusCircle,
  Search,
  Trash2,
  Share2,
  Flame,
  Download,
  MapPin,
  FileText,
  Edit2,
  Phone,
} from 'lucide-react';
import { prasadService } from '../../services/prasadService';
import { pdfService } from '../../services/pdfService';
import { BookPrasadModal } from '../prasad/BookPrasadModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { PrasadSlot, PrasadBooking } from '../../types';
import ganeshBhagwanImg from '/ganesh_bhagwan.jpg';
import { MahaPrasadPage } from './MahaPrasadPage';

export const PrasadPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'DAILY_PRASAD' | 'MAHA_PRASAD'>('DAILY_PRASAD');
  const [slots, setSlots] = useState<PrasadSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'BOOKED' | 'MULTI'>('ALL');
  const [selectedSlot, setSelectedSlot] = useState<PrasadSlot | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<PrasadBooking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'mahaprasad' || window.location.pathname.includes('mahaprasad')) {
      setActiveTab('MAHA_PRASAD');
    }
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const data = await prasadService.getSlots();
      setSlots(data);
    } catch {
      showToast('Could not load prasad slots.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleOpenBooking = (slot?: PrasadSlot, booking?: PrasadBooking) => {
    setSelectedSlot(slot || null);
    setSelectedBooking(booking || null);
    setIsModalOpen(true);
  };

  const handleDeleteBooking = async (slot: PrasadSlot, booking: PrasadBooking, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Remove Prasad Seva booking for Flat ${booking.flatNumber} (${booking.residentName}) on ${slot.dateDisplay}?`
      )
    ) {
      return;
    }

    try {
      await prasadService.deleteBooking(slot.id, booking.id);
      showToast(`Prasad booking for Flat ${booking.flatNumber} removed.`, 'info');
      loadSlots();
    } catch {
      showToast('Failed to remove booking.', 'error');
    }
  };

  const handleShareBooking = (slot: PrasadSlot, booking: PrasadBooking, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `🪔 Euriska Ganpati Prasad Seva 2026\n📅 Date: ${slot.dateDisplay} (8:00 PM Aarti)\n🏠 Flat: ${booking.flatNumber} (${booking.residentName})\n🥟 Prasad: ${booking.prasadItem || 'Modak & Fruits'}\n📍 Venue: Club House Podium, Euriska`;
    if (navigator.share) {
      navigator.share({ title: 'Ganpati Prasad Seva', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      showToast('Slot details copied to clipboard!', 'success');
    }
  };

  const handleExportCSV = () => {
    const header = 'Day,Date,Timing,Flat No,Resident Name,Phone,Prasad Item,Notes\n';
    const rows: string[] = [];

    slots.forEach((s) => {
      const bookings = s.bookings && s.bookings.length > 0 ? s.bookings : [];
      if (bookings.length === 0) {
        rows.push(`"Day ${s.dayNumber}","${s.dateDisplay}","${s.time}","OPEN","Open for Devotees","","",""`);
      } else {
        bookings.forEach((b) => {
          rows.push(
            `"Day ${s.dayNumber}","${s.dateDisplay}","${s.time}","${b.flatNumber}","${b.residentName}","${b.phone || ''}","${b.prasadItem || ''}","${b.notes || ''}"`
          );
        });
      }
    });

    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Euriska_Ganpati_Prasad_Slots_2026.csv`;
    link.click();
    showToast('Prasad schedule exported to CSV!', 'success');
  };

  const handleExportPDF = async () => {
    try {
      await pdfService.exportPrasadSchedulePDF(slots);
      showToast('📄 Prasad Schedule PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate Prasad PDF.', 'error');
    }
  };

  const handleDownloadPass = async (slot: PrasadSlot, booking: PrasadBooking, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await pdfService.exportSinglePrasadPassPDF(slot, booking);
      showToast(`📄 Devotee Pass for Flat ${booking.flatNumber} downloaded!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate devotee pass PDF.', 'error');
    }
  };

  const totalFamiliesCount = slots.reduce((acc, s) => acc + (s.bookings?.length || 0), 0);
  const bookedDaysCount = slots.filter((s) => s.isBooked).length;
  const openDaysCount = slots.length - bookedDaysCount;

  const filteredSlots = slots.filter((s) => {
    const bookingCount = s.bookings?.length || 0;
    if (filter === 'OPEN' && bookingCount > 0) return false;
    if (filter === 'BOOKED' && bookingCount === 0) return false;
    if (filter === 'MULTI' && bookingCount < 2) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDate = s.dateDisplay?.toLowerCase().includes(q) || s.dayLabel?.toLowerCase().includes(q);
      const matchBookings = (s.bookings || []).some(
        (b) =>
          b.flatNumber.toLowerCase().includes(q) ||
          b.residentName.toLowerCase().includes(q) ||
          b.prasadItem?.toLowerCase().includes(q) ||
          b.phone?.includes(q)
      );
      return matchDate || matchBookings;
    }
    return true;
  });

  return (
    <div style={{ padding: '0 14px 28px', width: '100%', boxSizing: 'border-box', fontFamily: "'Outfit', sans-serif" }}>
      {/* Top Tab Switcher between Daily Aarti Seva vs Grand Maha Prasad RSVP (Admin Only) */}
      {isAdmin && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginTop: 10,
            marginBottom: 16,
            background: '#ffffff',
            border: '1.5px solid #fed7aa',
            borderRadius: 16,
            padding: 6,
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)',
          }}
        >
          <button
            onClick={() => setActiveTab('DAILY_PRASAD')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 12,
              border: 'none',
              background: activeTab === 'DAILY_PRASAD' ? 'linear-gradient(135deg, #c2410c, #ea580c)' : 'transparent',
              color: activeTab === 'DAILY_PRASAD' ? '#ffffff' : '#64748b',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: activeTab === 'DAILY_PRASAD' ? '0 4px 12px rgba(234, 88, 12, 0.25)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span>🪔 Daily Aarti Prasad (12 Days)</span>
          </button>

          <button
            onClick={() => setActiveTab('MAHA_PRASAD')}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 12,
              border: 'none',
              background: activeTab === 'MAHA_PRASAD' ? 'linear-gradient(135deg, #c2410c, #ea580c)' : 'transparent',
              color: activeTab === 'MAHA_PRASAD' ? '#ffffff' : '#64748b',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: activeTab === 'MAHA_PRASAD' ? '0 4px 12px rgba(234, 88, 12, 0.25)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <span>🍲 Maha Prasad RSVP (24 Sep, 8-10 PM)</span>
            <span
              style={{
                background: activeTab === 'MAHA_PRASAD' ? '#fef08a' : '#ffedd5',
                color: activeTab === 'MAHA_PRASAD' ? '#854d0e' : '#c2410c',
                fontSize: 11,
                fontWeight: 900,
                padding: '2px 7px',
                borderRadius: 10,
              }}
            >
              Admin
            </span>
          </button>
        </div>
      )}

      {isAdmin && activeTab === 'MAHA_PRASAD' ? (
        <MahaPrasadPage />
      ) : (
        <>
      {/* Festive Hero Banner */}
      <div
        style={{
          marginBottom: 16,
          background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)',
          borderRadius: 20,
          padding: '18px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(194, 65, 12, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            right: -20,
            top: -20,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(254, 215, 170, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Dagdusheth Ganpati Idol Picture */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              overflow: 'hidden',
              background: '#fff',
              padding: 2,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              flexShrink: 0,
            }}
          >
            <img
              src={ganeshBhagwanImg}
              alt="Ganpati Bappa"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '2px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                <Flame size={12} color="#fef08a" />
                <span>Evening Aarti: 8:00 PM</span>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: 'rgba(254, 240, 138, 0.25)',
                  border: '1px solid rgba(254, 240, 138, 0.4)',
                  padding: '2px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#fef08a',
                }}
              >
                <MapPin size={11} />
                <span>Club House Podium</span>
              </div>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
              Ganpati Prasad Seva
            </h1>
            <p style={{ fontSize: 12.5, opacity: 0.9, margin: '2px 0 0', fontWeight: 500 }}>
              Sep 14th – Sep 25th, 2026 • 📍 Multiple Families Welcome Per Day!
            </p>
          </div>
        </div>

        {/* Announcement Message */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 12.5,
            lineHeight: 1.45,
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          🪔 <strong>Slots are open for Ganpati Prasad for evening Aarti at 8:00 PM (14th till 25th Sep) at Club House Podium.</strong>{' '}
          Multiple families can co-sponsor prasad on the same date. Enter your <strong>Flat No. &amp; Date</strong> to join the seva!
        </div>

        {/* Quick Stats & Action Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
            paddingTop: 4,
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 700,
              }}
            >
              👥 {totalFamiliesCount} Families Booked
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 700,
              }}
            >
              🟢 {openDaysCount} Open Days
            </div>
          </div>

          <button
            onClick={() => handleOpenBooking()}
            style={{
              background: '#ffffff',
              color: '#c2410c',
              border: 'none',
              borderRadius: 10,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            <PlusCircle size={16} />
            <span>Book Prasad Seva</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Search by Flat, Family Name, Date, Prasad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: 42,
              paddingLeft: 36,
              paddingRight: 12,
              borderRadius: 12,
              border: '1px solid #cbd5e1',
              fontSize: 13.5,
              outline: 'none',
              background: '#ffffff',
            }}
          />
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All 12 Days' },
            { key: 'OPEN', label: '🟢 Open' },
            { key: 'BOOKED', label: '🔴 Booked' },
            { key: 'MULTI', label: '👥 Multi-Devotee' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as any)}
              style={{
                background: filter === item.key ? '#ea580c' : '#ffffff',
                color: filter === item.key ? '#ffffff' : '#475569',
                border: filter === item.key ? '1px solid #ea580c' : '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '0 12px',
                height: 42,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={handleExportPDF}
            title="Download Full 12-Day Schedule as PDF"
            style={{
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              color: '#c2410c',
              borderRadius: 10,
              padding: '0 12px',
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <FileText size={15} />
            <span>PDF Schedule</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleExportCSV}
              title="Download Schedule CSV"
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                width: 42,
                height: 42,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
            >
              <Download size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Slots List / Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
          Loading Prasad Seva slots...
        </div>
      ) : filteredSlots.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>🪔</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>No slots match your search</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
            Try searching for another date or flat number.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filteredSlots.map((slot) => {
            const bookings = slot.bookings || [];
            const bookingCount = bookings.length;

            return (
              <div
                key={slot.id}
                style={{
                  background: bookingCount > 0 ? '#ffffff' : '#fffbeb',
                  border:
                    bookingCount > 1
                      ? '1.5px solid #d8b4fe'
                      : bookingCount === 1
                      ? '1.5px solid #e2e8f0'
                      : '1.5px dashed #f59e0b',
                  borderRadius: 18,
                  padding: '16px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12,
                  position: 'relative',
                }}
              >
                {/* Header Date & Status Badge */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: '#ea580c',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}
                      >
                        Day {slot.dayNumber} • 14th – 25th Sep
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: '2px 0 0' }}>
                        {slot.dateDisplay}
                      </h3>
                      <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
                        {slot.dayLabel}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: 12,
                        background:
                          bookingCount > 1
                            ? '#f3e8ff'
                            : bookingCount === 1
                            ? '#fff7ed'
                            : '#ecfdf5',
                        color:
                          bookingCount > 1
                            ? '#7e22ce'
                            : bookingCount === 1
                            ? '#c2410c'
                            : '#059669',
                        border:
                          bookingCount > 1
                            ? '1px solid #d8b4fe'
                            : bookingCount === 1
                            ? '1px solid #fed7aa'
                            : '1px solid #a7f3d0',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {bookingCount > 1
                        ? `👥 ${bookingCount} Families`
                        : bookingCount === 1
                        ? '🟠 1 Family Booked'
                        : '🟢 Open for Devotees'}
                    </span>
                  </div>

                  {/* Timing & Venue */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: '#475569',
                      fontWeight: 600,
                      marginTop: 8,
                      background: bookingCount > 0 ? '#f8fafc' : '#fef3c7',
                      padding: '6px 10px',
                      borderRadius: 8,
                    }}
                  >
                    <Clock size={14} color="#ea580c" />
                    <span>8:00 PM Evening Aarti • Club House Podium</span>
                  </div>

                  {/* Bookings List or Open Prompt */}
                  {bookingCount > 0 ? (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {bookings.map((booking, idx) => (
                        <div
                          key={booking.id || idx}
                          style={{
                            padding: '10px 12px',
                            background: '#f8fafc',
                            borderRadius: 12,
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span
                                style={{
                                  background: '#e0f2fe',
                                  color: '#0369a1',
                                  fontSize: 12,
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  border: '1px solid #bae6fd',
                                }}
                              >
                                Flat {booking.flatNumber}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                                {booking.residentName}
                              </span>
                            </div>

                            {/* Mini action icons for this booking */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <button
                                onClick={(e) => handleDownloadPass(slot, booking, e)}
                                title="Download Devotee Pass (PDF)"
                                style={{
                                  background: '#ecfdf5',
                                  border: '1px solid #a7f3d0',
                                  borderRadius: 6,
                                  padding: '3px 6px',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: '#047857',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                }}
                              >
                                <FileText size={12} />
                                <span>Pass</span>
                              </button>

                              <button
                                onClick={(e) => handleShareBooking(slot, booking, e)}
                                title="Share"
                                style={{
                                  background: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: 6,
                                  padding: '3px 6px',
                                  fontSize: 11,
                                  color: '#475569',
                                  cursor: 'pointer',
                                }}
                              >
                                <Share2 size={12} />
                              </button>

                              <button
                                onClick={() => handleOpenBooking(slot, booking)}
                                title="Edit this booking"
                                style={{
                                  background: '#ffedd5',
                                  border: '1px solid #fed7aa',
                                  borderRadius: 6,
                                  padding: '3px 6px',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: '#c2410c',
                                  cursor: 'pointer',
                                }}
                              >
                                <Edit2 size={12} />
                              </button>

                              {isAdmin && (
                                <button
                                  onClick={(e) => handleDeleteBooking(slot, booking, e)}
                                  title="Admin: Remove Booking"
                                  style={{
                                    background: '#fee2e2',
                                    border: '1px solid #fecaca',
                                    borderRadius: 6,
                                    padding: '3px 6px',
                                    fontSize: 11,
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>
                            🥟 Prasad: <strong>{booking.prasadItem || 'Modak & Fruits'}</strong>
                          </div>

                          {booking.phone && (
                            <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Phone size={11} />
                              <span>{booking.phone}</span>
                            </div>
                          )}

                          {booking.notes && (
                            <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
                              Note: {booking.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: 10,
                        padding: '12px',
                        background: '#fffbeb',
                        borderRadius: 10,
                        textAlign: 'center',
                        fontSize: 12,
                        color: '#92400e',
                        fontWeight: 600,
                      }}
                    >
                      ✨ This evening's prasad seva is open! Be the first family to book.
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div style={{ paddingTop: 4 }}>
                  <button
                    onClick={() => handleOpenBooking(slot)}
                    style={{
                      width: '100%',
                      background:
                        bookingCount > 0
                          ? 'linear-gradient(135deg, #ea580c, #c2410c)'
                          : 'linear-gradient(135deg, #f97316, #ea580c)',
                      border: 'none',
                      borderRadius: 10,
                      padding: '9px 12px',
                      fontSize: 12.5,
                      fontWeight: 800,
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                    }}
                  >
                    <PlusCircle size={15} />
                    <span>
                      {bookingCount > 0
                        ? `+ Add Another Family / Offering for ${slot.dateDisplay.split(',')[0]}`
                        : `Book Flat for ${slot.dateDisplay.split(',')[0]}`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Prasad Modal */}
      <BookPrasadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
          setSelectedBooking(null);
        }}
        selectedSlot={selectedSlot}
        selectedBooking={selectedBooking}
        allSlots={slots}
        onSuccess={loadSlots}
      />
      </>
      )}
    </div>
  );
};
