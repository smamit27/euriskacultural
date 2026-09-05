import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Phone,
  Building2,
  Heart,
  Crown,
  Share2,
  CheckCircle2,
  MessageCircle,
  Flame,
  Users,
  Plus,
  Download,
  Award
} from 'lucide-react';
import type { Sponsor } from '../../types';
import { sponsorService } from '../../services/volunteerService';
import { pdfService } from '../../services/pdfService';
import { AddSponsorModal } from './AddSponsorModal';
import { useToast } from '../../context/ToastContext';

interface SevaCardData {
  id: string;
  devoteeName: string;
  flat: string;
  building: string;
  sevaTitle: string;
  sevaCategory: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  borderColor: string;
  gradient: string;
  glowColor: string;
  icon: string;
  coverImage: string;
  description: string;
  highlights: string[];
  mantra: string;
  phone: string;
}

const SEVA_DETAILS: Record<string, SevaCardData> = {
  Murti: {
    id: 'spon-rahul-murti-b307',
    devoteeName: 'Rahul Singh',
    flat: 'B-307',
    building: 'B Building',
    sevaTitle: 'Shri Ganesh Murti Seva',
    sevaCategory: 'Murti',
    badge: '👑 MURTI SEVA PATRON',
    badgeBg: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
    badgeColor: '#c2410c',
    borderColor: '#fed7aa',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%)',
    glowColor: 'rgba(234, 88, 12, 0.20)',
    icon: '🌺',
    coverImage: '/ganesh_murti_sponsor.jpg',
    description: 'Generously sponsoring the sacred, eco-friendly Shri Ganesh Idol for Majestique Euriska Utsav 2026. Bringing divine blessings, positivity and joy to all 231+ resident families.',
    highlights: [
      'Sacred Eco-Friendly Shadu Mati Ganesh Murti',
      'Grand Ganesh Aagman Procession on 14th Sep',
      'Daily 11-Day Devotional Sthapana & Aarti Seva',
    ],
    mantra: 'ॐ गं गणपतये नमः — May Lord Ganesha bestow peace, health and infinite joy upon the sponsor family.',
    phone: '+91 98230 00307',
  },
  Decoration: {
    id: 'spon-prashant-decor-a505',
    devoteeName: 'Prashant',
    flat: 'A-505',
    building: 'A Building',
    sevaTitle: 'Grand Mandap & Stage Decoration Seva',
    sevaCategory: 'Decoration',
    badge: '✨ DECORATION SEVA PATRON',
    badgeBg: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
    badgeColor: '#7e22ce',
    borderColor: '#e9d5ff',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)',
    glowColor: 'rgba(124, 58, 237, 0.20)',
    icon: '🎨',
    coverImage: '/dagdusheth_decoration.jpg',
    description: 'Generously sponsoring the grand temple mandap floral design, vibrant cultural stage backdrop, and festive illumination across society grounds.',
    highlights: [
      'Clubhouse Temple Mandap & Floral Decor',
      'Main Stage Backdrop for Cultural Evenings',
      'Festive Lighting & Ambient Podium Setup',
    ],
    mantra: 'Creating a radiant, celebratory atmosphere for our entire Euriska society community.',
    phone: '+91 98900 00505',
  },
};

const OPEN_SEVA_OPPORTUNITIES = [
  {
    title: 'Daily Fresh Pooja Flowers & Garlands',
    icon: '🌸',
    tag: 'Daily Seva',
    color: '#ea580c',
    bg: '#fff7ed',
    desc: 'Sponsor fresh daily flower garlands and pooja samagri for 11 days of morning and evening aartis.',
  },
  {
    title: 'Evening Modak & Maha Prasad Sweets',
    icon: '🍯',
    tag: 'Prasad Seva',
    color: '#16a34a',
    bg: '#f0fdf4',
    desc: 'Sponsor fresh modak prasad distribution to all visiting devotees and children after daily Maha Aarti.',
  },
];

export const SponsorShowcase: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const { showToast } = useToast();

  const [gratitudeCounts, setGratitudeCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('euriska_sponsor_gratitude');
      return saved ? JSON.parse(saved) : { 'B-307': 34, 'A-505': 28 };
    } catch {
      return { 'B-307': 34, 'A-505': 28 };
    }
  });
  const [thankedCards, setThankedCards] = useState<Record<string, boolean>>({});

  const loadSponsors = () => {
    sponsorService.getSponsors().then((data) => {
      setSponsors(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadSponsors();
  }, []);

  const handleAddSponsor = async (sponsorData: Omit<Sponsor, 'id'>) => {
    await sponsorService.addSponsor(sponsorData);
    showToast(`🎉 ${sponsorData.name} (${sponsorData.flatNumber}) recorded as Seva Patron!`, 'success');
    loadSponsors();
  };

  const handleGratitude = (flatKey: string) => {
    setGratitudeCounts((prev) => {
      const nextCount = (prev[flatKey] || 0) + 1;
      const updated = { ...prev, [flatKey]: nextCount };
      localStorage.setItem('euriska_sponsor_gratitude', JSON.stringify(updated));
      return updated;
    });
    setThankedCards((prev) => ({ ...prev, [flatKey]: true }));
  };

  const handleShare = (sponsorName: string, sevaTitle: string, flat: string) => {
    const text = `🙏 Heartfelt gratitude to ${sponsorName} (${flat}) for sponsoring the ${sevaTitle} at Majestique Euriska Cultural Festival 2026! 🕉️✨`;
    if (navigator.share) {
      navigator.share({ title: 'Euriska 2026 Seva Sponsor', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Seva Appreciation copied to clipboard!');
    }
  };

  const handleDownloadCertificate = async (card: SevaCardData) => {
    try {
      showToast(`📄 Generating Official Certificate for ${card.devoteeName}...`, 'info');
      await pdfService.exportSingleSponsorCertificatePDF(card);
      showToast(`✅ Certificate downloaded for ${card.devoteeName}!`, 'success');
    } catch {
      showToast('Could not generate Certificate PDF.', 'error');
    }
  };

  const handleExportAllPDF = async () => {
    try {
      showToast('📄 Exporting Seva Patrons & Sponsors Directory...', 'info');
      await pdfService.exportAllSponsorsPDF(displayCards);
      showToast('✅ Sponsors Directory PDF downloaded!', 'success');
    } catch {
      showToast('Could not export Sponsors PDF.', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🪔</div>
        <p style={{ fontWeight: 600, fontSize: 14 }}>Loading Seva Sponsors...</p>
      </div>
    );
  }

  // Merge sponsors from service with card visual details
  const displayCards: SevaCardData[] = (sponsors.length > 0
    ? sponsors.map((sp) => {
        const isMurti = sp.sevaType === 'Murti' || sp.name.toLowerCase().includes('rahul');
        const isDecor = sp.sevaType === 'Decoration' || sp.name.toLowerCase().includes('prashant');
        const defaultSeva = isMurti ? SEVA_DETAILS.Murti : isDecor ? SEVA_DETAILS.Decoration : {
          id: sp.id,
          devoteeName: sp.name,
          flat: sp.flatNumber || 'Resident',
          building: sp.buildingId ? `${sp.buildingId} Building` : 'Euriska',
          sevaTitle: sp.sevaCategory || 'Community Festival Seva',
          sevaCategory: sp.sevaType || 'General',
          badge: `🤝 ${sp.tier.toUpperCase()} PATRON`,
          badgeBg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          badgeColor: '#16a34a',
          borderColor: '#bbf7d0',
          gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          glowColor: 'rgba(5, 150, 105, 0.20)',
          icon: '✨',
          coverImage: sp.logoUrl || '/dagdusheth_decoration.jpg',
          description: sp.description || 'Generous devotee sponsor for Euriska Cultural Festival 2026.',
          highlights: [
            `${sp.sevaCategory || 'Festival Seva'} Contributor`,
            `Flat ${sp.flatNumber || 'Resident'} Seva`,
            'Community Utsav Partner 2026',
          ],
          mantra: 'Dedicated to the joy and spirit of Majestique Euriska.',
          phone: sp.contactPhone || '',
        };

        return {
          ...defaultSeva,
          id: sp.id || defaultSeva.id,
          devoteeName: sp.name || defaultSeva.devoteeName,
          flat: sp.flatNumber || defaultSeva.flat,
          building: sp.buildingId ? `${sp.buildingId} Building` : defaultSeva.building,
          sevaTitle: sp.sevaCategory || defaultSeva.sevaTitle,
          description: sp.description || defaultSeva.description,
          phone: sp.contactPhone || defaultSeva.phone,
        };
      })
    : [SEVA_DETAILS.Murti, SEVA_DETAILS.Decoration]
  ).filter((item) => {
    if (activeFilter === 'ALL') return true;
    return item.sevaCategory.toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <div style={{ padding: '0 14px 40px', width: '100%', boxSizing: 'border-box' }}>
      {/* Full-Width Hero Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
          borderRadius: 22,
          padding: '24px 20px 22px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 28px rgba(49, 46, 129, 0.25)',
          marginBottom: 20,
        }}
      >
        {/* Background ambient accents */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -30,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(245, 158, 11, 0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -30,
            left: 20,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 0.6,
                  background: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(8px)',
                  color: '#fef08a',
                  padding: '4px 12px',
                  borderRadius: 20,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  border: '1px solid rgba(254, 240, 138, 0.35)',
                }}
              >
                <Sparkles size={13} color="#facc15" /> 50% 50% DUAL SEVA PILLARS • EURISKA 2026
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: 'rgba(249, 115, 22, 0.25)',
                  color: '#fed7aa',
                  padding: '4px 10px',
                  borderRadius: 20,
                  border: '1px solid rgba(249, 115, 22, 0.4)',
                }}
              >
                🌺 Devotee Sponsors
              </span>
            </div>

            {/* Header Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={handleExportAllPDF}
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: 20,
                  padding: '7px 14px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <Download size={14} />
                <span>Export PDF</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: 20,
                  padding: '7px 16px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)',
                }}
              >
                <Plus size={15} />
                <span>Add Sponsor</span>
              </button>
            </div>
          </div>

          <h1
            style={{
              fontSize: 24,
              fontWeight: 900,
              lineHeight: 1.25,
              color: '#ffffff',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <span>Our Sponsors & Seva Patrons</span>
            <span style={{ fontSize: 22 }}>🪔</span>
          </h1>

          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.5,
              color: '#e0e7ff',
              margin: '0 0 16px 0',
              maxWidth: 700,
            }}
          >
            Expressing our heartfelt gratitude to the two dedicated resident families who have graciously sponsored the central pillars for Euriska Cultural Festival 2026.
          </p>

          {/* 50% - 50% Dual Highlights Ribbon */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 10,
              background: 'rgba(15, 23, 42, 0.45)',
              padding: '12px 14px',
              borderRadius: 16,
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 24 }}>🌺</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#fde047' }}>50% Murti Seva</div>
                <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>Rahul Singh • Flat B-307</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderLeft: '1px solid rgba(255,255,255,0.12)', paddingLeft: 10 }}>
              <div style={{ fontSize: 24 }}>✨</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#c084fc' }}>50% Decoration Seva</div>
                <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>Prashant • Flat A-505</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderLeft: '1px solid rgba(255,255,255,0.12)', paddingLeft: 10 }}>
              <div style={{ fontSize: 24 }}>🤝</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#86efac' }}>100% Devotion</div>
                <div style={{ fontSize: 11, color: '#e2e8f0', fontWeight: 600 }}>Resident-Led Community Seva</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 18,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
        }}
      >
        <button
          onClick={() => setActiveFilter('ALL')}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            border: activeFilter === 'ALL' ? '1.5px solid #4338ca' : '1px solid #e2e8f0',
            background: activeFilter === 'ALL' ? '#e0e7ff' : '#ffffff',
            color: activeFilter === 'ALL' ? '#312e81' : '#475569',
            boxShadow: activeFilter === 'ALL' ? '0 2px 8px rgba(67, 56, 202, 0.15)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          <span>✨ 50% - 50% All Sponsors</span>
          <span
            style={{
              fontSize: 11,
              background: activeFilter === 'ALL' ? '#312e81' : '#f1f5f9',
              color: activeFilter === 'ALL' ? '#ffffff' : '#64748b',
              padding: '1px 7px',
              borderRadius: 10,
              fontWeight: 800,
            }}
          >
            {sponsors.length || 2}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('Murti')}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            border: activeFilter === 'Murti' ? '1.5px solid #ea580c' : '1px solid #e2e8f0',
            background: activeFilter === 'Murti' ? '#fff7ed' : '#ffffff',
            color: activeFilter === 'Murti' ? '#c2410c' : '#475569',
            boxShadow: activeFilter === 'Murti' ? '0 2px 8px rgba(234, 88, 12, 0.15)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          <span>🌺 50% Murti Seva</span>
          <span
            style={{
              fontSize: 11,
              background: activeFilter === 'Murti' ? '#c2410c' : '#f1f5f9',
              color: activeFilter === 'Murti' ? '#ffffff' : '#64748b',
              padding: '1px 7px',
              borderRadius: 10,
              fontWeight: 800,
            }}
          >
            B-307
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('Decoration')}
          style={{
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            border: activeFilter === 'Decoration' ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
            background: activeFilter === 'Decoration' ? '#faf5ff' : '#ffffff',
            color: activeFilter === 'Decoration' ? '#6d28d9' : '#475569',
            boxShadow: activeFilter === 'Decoration' ? '0 2px 8px rgba(124, 58, 237, 0.15)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          <span>🎨 50% Decoration Seva</span>
          <span
            style={{
              fontSize: 11,
              background: activeFilter === 'Decoration' ? '#6d28d9' : '#f1f5f9',
              color: activeFilter === 'Decoration' ? '#ffffff' : '#64748b',
              padding: '1px 7px',
              borderRadius: 10,
              fontWeight: 800,
            }}
          >
            A-505
          </span>
        </button>
      </div>

      {/* 50% 50% Dual Column Equal Prominence Sponsor Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 18,
          marginBottom: 30,
          alignItems: 'stretch',
        }}
      >
        {displayCards.map((card) => {
          const flatKey = card.flat;
          const gratitudeCount = gratitudeCounts[flatKey] || 0;
          const isThanked = thankedCards[flatKey] || false;

          return (
            <div
              key={card.id}
              style={{
                background: '#ffffff',
                border: `2px solid ${card.borderColor}`,
                borderRadius: 22,
                overflow: 'hidden',
                boxShadow: `0 10px 30px ${card.glowColor}, 0 2px 8px rgba(0,0,0,0.05)`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div>
                {/* Visual Header Image Banner */}
                <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                  <img
                    src={card.coverImage}
                    alt={card.sevaTitle}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Overlay Gradient */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.2) 60%, transparent 100%)`,
                    }}
                  />

                  {/* Top Badges */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 14,
                      right: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        background: 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(8px)',
                        color: card.badgeColor,
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 900,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    >
                      <Crown size={12} /> {card.badge}
                    </span>

                    <span
                      style={{
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11.5,
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <Building2 size={12} color="#fde047" /> Flat {card.flat}
                    </span>
                  </div>

                  {/* Bottom Image Title */}
                  <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#fef08a', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      {card.sevaTitle}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      {card.devoteeName}
                    </div>
                  </div>
                </div>

                {/* Card Content Body */}
                <div style={{ padding: '18px 20px' }}>
                  {/* Status Banner */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        color: '#059669',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: '#ecfdf5',
                        padding: '3px 9px',
                        borderRadius: 8,
                      }}
                    >
                      <CheckCircle2 size={13} /> 50% Major Seva Dedicated
                    </span>

                    <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
                      {card.building}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                    {card.description}
                  </p>

                  {/* Seva Highlights Box */}
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: 14,
                      padding: '12px 14px',
                      border: '1px solid #e2e8f0',
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                      Seva Highlights
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {card.highlights.map((point, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#1e293b' }}>
                          <span style={{ color: card.badgeColor, fontSize: 14, fontWeight: 900 }}>✓</span>
                          <span style={{ fontWeight: 600 }}>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Devotional Mantra Blessing Box */}
                  <div
                    style={{
                      background: card.badgeBg,
                      border: `1px dashed ${card.borderColor}`,
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontSize: 12,
                      color: card.badgeColor,
                      fontWeight: 700,
                      lineHeight: 1.45,
                      marginBottom: 16,
                      fontStyle: 'italic',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Flame size={16} style={{ flexShrink: 0 }} />
                    <span>"{card.mantra}"</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div
                style={{
                  padding: '12px 20px 18px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  background: '#fafafa',
                  borderBottomLeftRadius: 22,
                  borderBottomRightRadius: 22,
                }}
              >
                {/* Gratitude Button */}
                <button
                  onClick={() => handleGratitude(flatKey)}
                  style={{
                    background: isThanked ? '#ecfdf5' : '#ffffff',
                    border: `1.5px solid ${isThanked ? '#a7f3d0' : '#cbd5e1'}`,
                    color: isThanked ? '#047857' : '#334155',
                    padding: '8px 14px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Heart
                    size={15}
                    color={isThanked ? '#059669' : '#e11d48'}
                    fill={isThanked ? '#059669' : '#e11d48'}
                  />
                  <span>{isThanked ? 'Gratitude Expressed!' : 'Send Gratitude'}</span>
                  <span
                    style={{
                      background: isThanked ? '#d1fae5' : '#e2e8f0',
                      color: isThanked ? '#065f46' : '#1e293b',
                      padding: '2px 8px',
                      borderRadius: 12,
                      fontSize: 11.5,
                      fontWeight: 800,
                    }}
                  >
                    {gratitudeCount}
                  </span>
                </button>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Download Official Devotee Certificate PDF */}
                  <button
                    onClick={() => handleDownloadCertificate(card)}
                    style={{
                      background: '#fff7ed',
                      border: '1.5px solid #fed7aa',
                      color: '#c2410c',
                      padding: '8px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      boxShadow: '0 2px 6px rgba(194, 65, 12, 0.08)',
                    }}
                    title="Download Official Devotee Certificate of Honor PDF"
                  >
                    <Award size={14} color="#ea580c" />
                    <span>Certificate PDF</span>
                  </button>

                  {/* Share Appreciation */}
                  <button
                    onClick={() => handleShare(card.devoteeName, card.sevaTitle, card.flat)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      padding: '8px 10px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Share2 size={13} />
                    <span>Share</span>
                  </button>

                  {/* Call/Connect */}
                  {card.phone && (
                    <a
                      href={`tel:${card.phone}`}
                      style={{
                        background: '#0f172a',
                        color: '#ffffff',
                        padding: '8px 12px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Phone size={13} />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Open Seva & Sponsorship Opportunities Section */}
      <div
        style={{
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: 22,
          padding: '22px 20px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{ fontSize: 18 }}>🤝</span>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Open Seva & Sponsorship Opportunities
              </h2>
            </div>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
              Would your family or business like to sponsor an event or seva for Euriska 2026?
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'linear-gradient(135deg, #ea580c, #c2410c)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 20,
              padding: '7px 16px',
              fontSize: 12.5,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
            }}
          >
            <Plus size={14} />
            <span>Sponsor a Seva</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 18 }}>
          {OPEN_SEVA_OPPORTUNITIES.map((opp, idx) => (
            <div
              key={idx}
              style={{
                background: opp.bg,
                border: `1px solid ${opp.color}30`,
                borderRadius: 14,
                padding: '14px 16px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <div style={{ fontSize: 24, flexShrink: 0 }}>{opp.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{opp.title}</span>
                </div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: opp.color,
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    marginBottom: 4,
                  }}
                >
                  {opp.tag}
                </span>
                <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.45, margin: 0 }}>
                  {opp.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Committee CTA Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #cbd5e1',
            borderRadius: 16,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#4338ca',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a' }}>
                Join as a Seva Patron
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                Contact the Cultural Committee (Sachin Singh / Amit Singh) to block your seva slot.
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/919823011223?text=Namaste%20Cultural%20Committee,%20I%20would%20like%20to%20sponsor%20a%20seva%20for%20Euriska%20Cultural%20Festival%202026."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#16a34a',
              color: '#ffffff',
              padding: '9px 18px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
            }}
          >
            <MessageCircle size={15} />
            <span>Connect on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Devotional Sanskrit Blessing Banner */}
      <div
        style={{
          textAlign: 'center',
          padding: '18px 20px',
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1px solid #fde68a',
          borderRadius: 18,
          color: '#92400e',
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 4, letterSpacing: 0.5 }}>
          वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
        </div>
        <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>
          Dedicated to the joy, unity and harmony of all families at Majestique Euriska.
        </div>
      </div>

      {/* Add Sponsor Modal */}
      <AddSponsorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSponsor}
      />
    </div>
  );
};
