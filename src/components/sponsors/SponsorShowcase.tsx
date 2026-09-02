import React, { useState, useEffect } from 'react';
import { Globe, Phone, IndianRupee } from 'lucide-react';
import type { Sponsor, SponsorTier } from '../../types';
import { sponsorService } from '../../services/volunteerService';

const TIER_CONFIG: Record<SponsorTier, { label: string; color: string; bg: string; icon: string }> = {
  Title: { label: 'TITLE SPONSOR', color: '#7e22ce', bg: '#f5f3ff', icon: '👑' },
  Platinum: { label: 'PLATINUM', color: '#475569', bg: '#f8fafc', icon: '💎' },
  Gold: { label: 'GOLD', color: '#b45309', bg: '#fffbeb', icon: '🥇' },
  Silver: { label: 'SILVER', color: '#475569', bg: '#f8fafc', icon: '🥈' },
  Bronze: { label: 'BRONZE', color: '#92400e', bg: '#fff7ed', icon: '🥉' },
  Community: { label: 'COMMUNITY', color: '#065f46', bg: '#ecfdf5', icon: '🤝' },
};

export const SponsorShowcase: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sponsorService.getSponsors().then((data) => {
      setSponsors(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>Loading sponsors...</div>;

  return (
    <div style={{ padding: '0 14px 20px' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>Our Sponsors</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>Partners who made Euriska 2026 possible</p>
      </div>

      <div className="sponsor-list-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sponsors.map((sponsor) => {
          const tier = TIER_CONFIG[sponsor.tier] || TIER_CONFIG.Community;
          return (
            <div
              key={sponsor.id}
              style={{
                background: '#ffffff',
                border: `1px solid ${sponsor.tier === 'Title' ? '#c4b5fd' : '#e2e8f0'}`,
                borderRadius: 16,
                padding: '14px 16px',
                boxShadow: sponsor.tier === 'Title' ? '0 4px 16px rgba(139,92,246,0.12)' : 'var(--shadow-sm)',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              {/* Logo */}
              <div style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                background: '#f1f5f9',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <span style={{
                    fontSize: 9.5,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    color: tier.color,
                    background: tier.bg,
                    padding: '2px 6px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                  }}>
                    {tier.icon} {tier.label}
                  </span>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: sponsor.paymentStatus === 'PAID' ? '#059669' : '#d97706',
                  }}>
                    {sponsor.paymentStatus === 'PAID' ? '✓ Paid' : '⏳ Pending'}
                  </span>
                </div>

                <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>
                  {sponsor.name}
                </div>

                {sponsor.description && (
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                    {sponsor.description}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#475569', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700, color: '#047857' }}>
                    <IndianRupee size={12} />
                    {sponsor.amount.toLocaleString('en-IN')}
                  </span>
                  {sponsor.website && (
                    <a href={sponsor.website} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: 3 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Globe size={12} /> Website
                    </a>
                  )}
                  <a href={`tel:${sponsor.contactPhone}`}
                    style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 3 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone size={12} /> Call
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
