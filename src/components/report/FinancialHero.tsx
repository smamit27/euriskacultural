import React, { useState } from 'react';
import { Share2, Download, Printer, Shield, Check, FileSpreadsheet, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface FinancialHeroProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
  onOpenAdminLogin: () => void;
  lastUpdated?: string;
  totalCollected: number;
  totalExpenses: number;
  currentBalance: number;
  collectionPercentage: number;
}

export const FinancialHero: React.FC<FinancialHeroProps> = ({
  onExportPDF,
  onExportExcel,
  onPrint,
  onOpenAdminLogin,
  lastUpdated,
  totalCollected,
  totalExpenses,
  currentBalance,
  collectionPercentage,
}) => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const reportUrl = `${window.location.origin}/report`;
    const shareText = `🏛️ *EURISKA CULTURAL 2026 – FINANCIAL TRANSPARENCY REPORT*\n✨ *Together We Celebrate, Together We Build*\n\n💰 *Total Collection:* ₹${totalCollected.toLocaleString('en-IN')}\n💳 *Total Expenses:* ₹${totalExpenses.toLocaleString('en-IN')}\n⚖️ *Current Balance:* ₹${currentBalance.toLocaleString('en-IN')}\n📊 *Target Achieved:* ${collectionPercentage}%\n\n🔗 *View live verified report:* ${reportUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Euriska Cultural 2026 – Financial Transparency Report',
          text: shareText,
          url: reportUrl,
        });
        showToast('Shared successfully!', 'success');
        return;
      } catch {
        // Fallback to clipboard if user cancelled or error
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      showToast('📋 Report link & summary copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Direct WhatsApp fallback
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <div className="financial-hero-card" style={{
      position: 'relative',
      background: 'linear-gradient(135deg, #0b1120 0%, #1e1b4b 50%, #2e1065 100%)',
      color: '#ffffff',
      borderRadius: 24,
      padding: '24px 20px',
      marginBottom: 20,
      overflow: 'hidden',
      boxShadow: '0 12px 30px -8px rgba(15, 23, 42, 0.45)',
      border: '1px solid rgba(249, 115, 22, 0.25)',
    }}>
      {/* Background Decorative Mandala Pattern Overlay */}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        style={{
          position: 'absolute',
          right: -30,
          top: -30,
          width: 190,
          height: 190,
          opacity: 0.12,
          pointerEvents: 'none',
        }}
      >
        <circle cx="100" cy="100" r="90" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="65" fill="none" stroke="#fbbf24" strokeWidth="1" />
        <circle cx="100" cy="100" r="40" fill="none" stroke="#f97316" strokeWidth="1" />
        <path d="M100 10 L100 190 M10 100 L190 100 M36 36 L164 164 M36 164 L164 36" stroke="#fbbf24" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="15" fill="#f97316" opacity="0.3" />
      </svg>

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Top Badges Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 14,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(249, 115, 22, 0.18)',
            border: '1px solid rgba(249, 115, 22, 0.4)',
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 800,
            color: '#fdba74',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            <Sparkles size={12} color="#f97316" />
            <span>Community Transparency 2026–27</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: '#94a3b8',
          }}>
            {isAdmin ? (
              <span style={{
                background: '#dc2626',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Shield size={10} /> ADMIN AUDIT VIEW
              </span>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#e2e8f0',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 10,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                🔐 Committee Login
              </button>
            )}
          </div>
        </div>

        {/* Header Title with Diya Motif */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Diya Icon */}
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #f97316, #c2410c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(249, 115, 22, 0.5)',
            flexShrink: 0,
            fontSize: 24,
          }}>
            🪔
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 800,
              color: '#f97316',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              EURISKA CULTURAL 2026
            </div>
            <h1 style={{
              fontSize: 22,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.2,
              margin: '2px 0 4px',
              letterSpacing: '-0.3px',
            }}>
              FINANCIAL TRANSPARENCY REPORT
            </h1>
            <p style={{
              fontSize: 13,
              color: '#cbd5e1',
              fontWeight: 500,
              fontStyle: 'italic',
            }}>
              "Together We Celebrate, Together We Build"
            </p>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 18,
          flexWrap: 'wrap',
        }}>
          {/* WhatsApp / Share */}
          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: copied ? '#059669' : '#25D366',
              color: '#ffffff',
              border: 'none',
              borderRadius: 10,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
              transition: 'transform 0.15s, background 0.2s',
            }}
          >
            {copied ? <Check size={15} /> : <Share2 size={15} />}
            <span>{copied ? 'Copied Link!' : 'Share on WhatsApp'}</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={onExportPDF}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Download size={15} color="#fdba74" />
            <span>Download PDF</span>
          </button>

          {/* Excel / CSV */}
          <button
            onClick={onExportExcel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <FileSpreadsheet size={15} color="#86efac" />
            <span>Excel / CSV</span>
          </button>

          {/* Print */}
          <button
            onClick={onPrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Printer size={15} />
            <span>Print</span>
          </button>
        </div>

        {/* Live sync footnote */}
        {lastUpdated && (
          <div style={{
            fontSize: 11,
            color: '#94a3b8',
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#10b981',
              display: 'inline-block',
            }} />
            <span>Live verified data from Firestore • Updated {lastUpdated}</span>
          </div>
        )}
      </div>
    </div>
  );
};
