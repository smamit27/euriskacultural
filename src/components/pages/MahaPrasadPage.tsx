import React, { useState, useEffect } from 'react';
import { Plus, Clock, MapPin, Calendar, Camera } from 'lucide-react';
import { rsvpService } from '../../services/rsvpService';
import { pdfService } from '../../services/pdfService';
import { RSVPSummaryCards } from '../rsvp/RSVPSummaryCards';
import { CateringEstimator } from '../rsvp/CateringEstimator';
import { RSVPTable } from '../rsvp/RSVPTable';
import { RSVPModal } from '../rsvp/RSVPModal';
import { MahaPrasadPassModal } from '../rsvp/MahaPrasadPassModal';
import { RSVPScannerModal } from '../rsvp/RSVPScannerModal';
import { useToast } from '../../context/ToastContext';
import type { MahaPrasadRSVP, MahaPrasadSummary } from '../../types';

export const MahaPrasadPage: React.FC = () => {
  const { showToast } = useToast();
  const [rsvps, setRsvps] = useState<MahaPrasadRSVP[]>([]);
  const [summary, setSummary] = useState<MahaPrasadSummary>({
    totalHeadcount: 0,
    totalAdults: 0,
    totalChildren: 0,
    totalFamilies: 0,
    satvikCount: 0,
    volunteersCount: 0,
    redeemedCount: 0,
    redeemedFamiliesCount: 0,
    buildingBreakdown: {
      A: { families: 0, headcount: 0 },
      B: { families: 0, headcount: 0 },
      C: { families: 0, headcount: 0 },
    },
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingRSVP, setEditingRSVP] = useState<MahaPrasadRSVP | null>(null);
  const [selectedPassRSVP, setSelectedPassRSVP] = useState<MahaPrasadRSVP | null>(null);

  const loadData = async () => {
    try {
      const list = await rsvpService.getRSVPs();
      setRsvps(list);
      setSummary(rsvpService.calculateSummary(list));
    } catch (err) {
      console.error('Failed to load RSVPs:', err);
      showToast('Could not load Maha Prasad RSVP list.', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveRSVP = async (data: any) => {
    try {
      const saved = await rsvpService.saveRSVP(data);
      showToast(`🍲 RSVP confirmed for Flat ${saved.flatNumber}! (${saved.totalHeadcount} Members)`, 'success');
      loadData();
      // Automatically show the digital pass modal on successful RSVP
      setSelectedPassRSVP(saved);
    } catch (err) {
      console.error(err);
      showToast('Failed to save RSVP.', 'error');
    }
  };

  const handleDeleteRSVP = async (id: string, flatNumber: string) => {
    if (!window.confirm(`Are you sure you want to remove RSVP for Flat ${flatNumber}?`)) {
      return;
    }
    try {
      await rsvpService.deleteRSVP(id);
      showToast(`Removed RSVP for Flat ${flatNumber}`, 'info');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete RSVP.', 'error');
    }
  };

  const handleToggleRedeem = async (rsvp: MahaPrasadRSVP) => {
    try {
      if (rsvp.isRedeemed) {
        await rsvpService.resetRedemption(rsvp.id);
        showToast(`Reset check-in for Flat ${rsvp.flatNumber}. Pass is now ACTIVE.`, 'info');
      } else {
        await rsvpService.redeemRSVP(rsvp.flatNumber, 'Admin Manual Check-In');
        showToast(`✅ Flat ${rsvp.flatNumber} marked as Checked In & Redeemed!`, 'success');
      }
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to update redemption status.', 'error');
    }
  };

  const handleDownloadSinglePDF = async (rsvp: MahaPrasadRSVP) => {
    try {
      await pdfService.exportMahaPrasadPassPDF(rsvp);
      showToast(`📄 Meal Pass for Flat ${rsvp.flatNumber} downloaded!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate PDF pass.', 'error');
    }
  };

  const handleExportCSV = () => {
    try {
      rsvpService.exportRSVPRosterCSV(rsvps);
      showToast('📊 Maha Prasad RSVP Roster CSV downloaded!', 'success');
    } catch {
      showToast('Failed to export CSV.', 'error');
    }
  };

  const handleExportRosterPDF = () => {
    try {
      pdfService.exportMahaPrasadRosterPDF(rsvps);
      showToast('📄 Maha Prasad Catering Roster PDF downloaded!', 'success');
    } catch {
      showToast('Failed to export PDF roster.', 'error');
    }
  };

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 16px 40px 16px' }}>
      {/* Festive Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #9a3412 0%, #c2410c 50%, #ea580c 100%)',
          borderRadius: 24,
          padding: '28px 24px',
          color: '#ffffff',
          marginBottom: 24,
          boxShadow: '0 10px 25px -5px rgba(234, 88, 12, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  background: '#fef08a',
                  color: '#854d0e',
                  fontSize: 11.5,
                  fontWeight: 900,
                  padding: '3px 10px',
                  borderRadius: 20,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                🍲 Grand Community Feast
              </span>
              <span style={{ fontSize: 12.5, color: '#fed7aa', fontWeight: 700 }}>
                Ganeshotsav 2026 Special
              </span>
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 8px 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
              Maha Prasad RSVP &amp; Family Headcount Tracker
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', fontSize: 13.5, color: '#ffedd5', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={16} color="#fef08a" />
                <span>Thursday, 24th September 2026</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} color="#fef08a" />
                <span>8:00 PM – 10:00 PM Sharp</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={16} color="#fef08a" />
                <span>Club House Podium &amp; Party Lawn</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsScannerOpen(true)}
              style={{
                background: '#0f172a',
                color: '#ffffff',
                border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: 14,
                padding: '12px 18px',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              }}
            >
              <Camera size={18} color="#fb923c" />
              <span>📷 Gate Scanner</span>
            </button>

            <button
              onClick={() => {
                setEditingRSVP(null);
                setIsAddModalOpen(true);
              }}
              style={{
                background: '#ffffff',
                color: '#c2410c',
                border: 'none',
                borderRadius: 14,
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              <Plus size={18} />
              <span>RSVP Family</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <RSVPSummaryCards summary={summary} totalSocietyFlats={231} />

      {/* Catering Raw Material Estimator */}
      <CateringEstimator totalHeadcount={summary.totalHeadcount} />

      {/* Registered Devotees Table */}
      <RSVPTable
        rsvps={rsvps}
        onOpenAddModal={() => {
          setEditingRSVP(null);
          setIsAddModalOpen(true);
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
        onToggleRedeem={handleToggleRedeem}
        onEdit={(rsvp) => {
          setEditingRSVP(rsvp);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeleteRSVP}
        onViewPass={(rsvp) => setSelectedPassRSVP(rsvp)}
        onDownloadSinglePDF={handleDownloadSinglePDF}
        onExportCSV={handleExportCSV}
        onExportRosterPDF={handleExportRosterPDF}
      />

      {/* RSVP Modal */}
      <RSVPModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRSVP(null);
        }}
        onSave={handleSaveRSVP}
        existingRSVP={editingRSVP}
      />

      {/* Digital Meal Pass Modal */}
      <MahaPrasadPassModal
        isOpen={Boolean(selectedPassRSVP)}
        onClose={() => setSelectedPassRSVP(null)}
        rsvp={selectedPassRSVP}
        onDownloadPDF={handleDownloadSinglePDF}
      />

      {/* QR Gate Scanner Modal */}
      <RSVPScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onRSVPUpdated={() => {
          loadData();
        }}
      />
    </div>
  );
};
