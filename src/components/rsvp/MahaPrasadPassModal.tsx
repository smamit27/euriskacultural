import React from 'react';
import { X, Download, Share2, Users } from 'lucide-react';
import type { MahaPrasadRSVP } from '../../types';
import euriskaLogo from '/euriska_logo.png';
import ganeshImage from '/ganesh_bhagwan.jpg';

interface MahaPrasadPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  rsvp: MahaPrasadRSVP | null;
  onDownloadPDF: (rsvp: MahaPrasadRSVP) => void;
}

export const MahaPrasadPassModal: React.FC<MahaPrasadPassModalProps> = ({
  isOpen,
  onClose,
  rsvp,
  onDownloadPDF,
}) => {
  if (!isOpen || !rsvp) return null;

  const handleShare = async () => {
    const text = `🍲 *EURISKA MAHA PRASAD SEVA PASS*\n\n` +
      `📍 *Flat:* ${rsvp.flatNumber}\n` +
      `👤 *Family:* ${rsvp.residentName}\n` +
      `👥 *Headcount:* ${rsvp.totalHeadcount} Members (${rsvp.adultsCount} Adults, ${rsvp.childrenCount} Kids)\n` +
      `🍲 *Feast:* Pure Satvik Maha Prasad\n` +
      `📅 *Date:* Thursday, 24th September 2026\n` +
      `⏰ *Timing:* 8:00 PM – 10:00 PM\n` +
      `🏛️ *Venue:* Club House Podium & Party Lawn\n\n` +
      `*Token ID:* EUR-MAHA-${rsvp.flatNumber}\n` +
      `Ganpati Bappa Morya! 🙏`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Maha Prasad Pass - Flat ${rsvp.flatNumber}`,
          text,
          url: window.location.href,
        });
      } catch {
        // ignore
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Pass details copied to clipboard! You can share on WhatsApp.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
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
          borderRadius: 24,
          maxWidth: 440,
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
          border: '2px solid #fed7aa',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pass Top Ribbon */}
        <div
          style={{
            background: 'linear-gradient(135deg, #9a3412, #c2410c)',
            padding: '20px 20px 16px 20px',
            color: '#ffffff',
            position: 'relative',
            textAlign: 'center',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
            <img
              src={euriskaLogo}
              alt="Euriska"
              style={{ width: 34, height: 34, borderRadius: 8, background: '#fff', padding: 2 }}
            />
            <div style={{ fontSize: 10, fontWeight: 800, color: '#fef08a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Euriska Cultural Committee 2026
            </div>
            <img
              src={ganeshImage}
              alt="Bappa"
              style={{ width: 34, height: 34, borderRadius: 8, background: '#fff', objectFit: 'cover' }}
            />
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 900, margin: '2px 0', color: '#ffffff' }}>
            MAHA PRASAD ENTRY TOKEN
          </h3>
          <p style={{ fontSize: 11.5, color: '#fed7aa', margin: 0 }}>
            Community Feast Invitation Pass
          </p>
        </div>

        {/* Pass Content */}
        <div style={{ padding: '18px 20px' }}>
          {/* Main Flat & Headcount Badge */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
              border: '1.5px solid #fdba74',
              borderRadius: 16,
              padding: '14px',
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: '#9a3412', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Reserved for Flat
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#c2410c', lineHeight: 1.2 }}>
              {rsvp.flatNumber}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
              {rsvp.residentName}
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#ea580c',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12.5,
                fontWeight: 800,
                marginTop: 8,
              }}
            >
              <Users size={14} />
              <span>
                {rsvp.totalHeadcount} Members ({rsvp.adultsCount} Adults, {rsvp.childrenCount} Kids)
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Event Date</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                Thu, 24 Sep 2026
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Timing</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                8:00 PM – 10:00 PM
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Feast Type</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#047857', marginTop: 2 }}>
                🍲 Satvik Maha Prasad
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Venue</div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                Club House Podium
              </div>
            </div>
          </div>

          {/* Token Tag */}
          <div
            style={{
              background: '#f1f5f9',
              border: '1px dashed #cbd5e1',
              borderRadius: 12,
              padding: '8px 12px',
              textAlign: 'center',
              marginBottom: 18,
            }}
          >
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>TOKEN NUMBER: </span>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#1e293b' }}>
              EUR-MAHA-{rsvp.flatNumber}
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={() => onDownloadPDF(rsvp)}
              style={{
                background: 'linear-gradient(135deg, #c2410c, #ea580c)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                padding: '11px',
                fontSize: 13,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
              }}
            >
              <Download size={16} />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleShare}
              style={{
                background: '#f8fafc',
                color: '#334155',
                border: '1.5px solid #cbd5e1',
                borderRadius: 12,
                padding: '11px',
                fontSize: 13,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <Share2 size={16} />
              <span>Share Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
