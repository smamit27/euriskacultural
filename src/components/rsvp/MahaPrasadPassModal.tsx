import React, { useState, useEffect } from 'react';
import { X, Download, Share2, Users, CheckCircle2, AlertTriangle, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
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
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (rsvp) {
      // Generate QR Code containing verification payload
      const qrPayload = JSON.stringify({
        token: `EUR-MAHA-PASS:${rsvp.flatNumber}`,
        flat: rsvp.flatNumber,
        name: rsvp.residentName,
        headcount: rsvp.totalHeadcount,
        id: rsvp.id,
      });

      QRCode.toDataURL(qrPayload, {
        width: 220,
        margin: 1.5,
        color: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      })
        .then(setQrDataUrl)
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [rsvp]);

  if (!isOpen || !rsvp) return null;

  const isExpired = Boolean(rsvp.isRedeemed);

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
      `*Status:* ${isExpired ? 'EXPIRED (Already Redeemed)' : 'ACTIVE (Valid for Entry)'}\n` +
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
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
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
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
          border: '2px solid #fed7aa',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pass Top Ribbon */}
        <div
          style={{
            background: isExpired
              ? 'linear-gradient(135deg, #475569, #334155)'
              : 'linear-gradient(135deg, #9a3412, #c2410c)',
            padding: '20px 20px 16px 20px',
            color: '#ffffff',
            position: 'relative',
            textAlign: 'center',
            transition: 'background 0.3s ease',
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
            MAHA PRASAD ENTRY PASS
          </h3>
          <p style={{ fontSize: 11.5, color: '#fed7aa', margin: 0 }}>
            Thursday, 24th Sep 2026 • 8:00 PM – 10:00 PM
          </p>
        </div>

        {/* Pass Content */}
        <div style={{ padding: '18px 20px' }}>
          {/* Active vs Expired Status Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 12,
              marginBottom: 14,
              background: isExpired ? '#fef2f2' : '#f0fdf4',
              border: `1.5px solid ${isExpired ? '#fca5a5' : '#86efac'}`,
              color: isExpired ? '#991b1b' : '#166534',
              fontWeight: 800,
              fontSize: 12.5,
            }}
          >
            {isExpired ? (
              <>
                <AlertTriangle size={17} color="#dc2626" />
                <span>EXPIRED / REDEEMED AT GATE</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={17} color="#16a34a" />
                <span>🟢 VALID ENTRY PASS</span>
              </>
            )}
          </div>

          {/* Main Flat & Headcount Badge */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
              border: '1.5px solid #fdba74',
              borderRadius: 16,
              padding: '14px',
              textAlign: 'center',
              marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Wing {rsvp.buildingId} • Registered Flat
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#9a3412', margin: '2px 0' }}>
              Flat {rsvp.flatNumber}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#334155' }}>
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
              <span>{rsvp.totalHeadcount} Total Members ({rsvp.adultsCount} Adults, {rsvp.childrenCount} Kids)</span>
            </div>
          </div>

          {/* QR Code Card */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: 16,
              padding: '12px',
              textAlign: 'center',
              marginBottom: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              position: 'relative',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <QrCode size={13} />
              <span>Scan QR Code at Gate Entry</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Pass for ${rsvp.flatNumber}`}
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: 10,
                    border: '1px solid #cbd5e1',
                    filter: isExpired ? 'grayscale(100%) opacity(40%)' : 'none',
                  }}
                />
              ) : (
                <div style={{ width: 140, height: 140, background: '#f1f5f9', borderRadius: 10 }} />
              )}

              {/* Expired Watermark Stamp */}
              {isExpired && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-15deg)',
                    border: '3px solid #dc2626',
                    color: '#dc2626',
                    borderRadius: 8,
                    padding: '4px 10px',
                    fontWeight: 900,
                    fontSize: 14,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    background: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 4px 10px rgba(220, 38, 38, 0.2)',
                  }}
                >
                  REDEEMED
                </div>
              )}
            </div>

            <div style={{ fontSize: 11, color: isExpired ? '#dc2626' : '#64748b', fontWeight: 600, marginTop: 6 }}>
              {isExpired
                ? `Scanned: ${new Date(rsvp.redeemedAt || rsvp.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                : `Token: EUR-MAHA-${rsvp.flatNumber}`}
            </div>
          </div>

          {/* Quick Details Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '8px 10px' }}>
              <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>Date & Time</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                24 Sep • 8-10 PM
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '8px 10px' }}>
              <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600 }}>Feast Type</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#047857', marginTop: 2 }}>
                🍲 Satvik Maha Prasad
              </div>
            </div>
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
