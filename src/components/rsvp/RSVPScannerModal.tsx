import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, CheckCircle2, AlertTriangle, RefreshCw, Users, ShieldCheck, Search } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { rsvpService } from '../../services/rsvpService';
import type { MahaPrasadRSVP } from '../../types';

interface RSVPScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRSVPUpdated: (updatedRSVP: MahaPrasadRSVP) => void;
}

export const RSVPScannerModal: React.FC<RSVPScannerModalProps> = ({
  isOpen,
  onClose,
  onRSVPUpdated,
}) => {
  const [scanResult, setScanResult] = useState<{
    status: 'SUCCESS' | 'EXPIRED' | 'ERROR' | 'IDLE';
    message: string;
    rsvp?: MahaPrasadRSVP;
  }>({ status: 'IDLE', message: '' });

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [manualFlatInput, setManualFlatInput] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'maha-prasad-qr-reader';

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const processPassToken = async (rawText: string) => {
    try {
      // Pause scanner while showing result
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.pause(true);
      }
    } catch {
      // ignore
    }

    let searchKey = rawText.trim();
    // Check if JSON payload
    if (searchKey.startsWith('{') && searchKey.endsWith('}')) {
      try {
        const parsed = JSON.parse(searchKey);
        if (parsed.flat) searchKey = parsed.flat;
        else if (parsed.token) searchKey = parsed.token;
      } catch {
        // fallback
      }
    }

    const res = await rsvpService.redeemRSVP(searchKey, 'Admin Gate Scanner');

    if (res.success && res.rsvp) {
      setScanResult({
        status: 'SUCCESS',
        message: `Devotee pass verified and checked in!`,
        rsvp: res.rsvp,
      });
      onRSVPUpdated(res.rsvp);

      // Trigger festive confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } else if (res.alreadyRedeemed && res.rsvp) {
      setScanResult({
        status: 'EXPIRED',
        message: res.error || 'Pass has already been redeemed!',
        rsvp: res.rsvp,
      });
    } else {
      setScanResult({
        status: 'ERROR',
        message: res.error || 'Invalid QR code or Devotee flat not registered.',
      });
    }
  };

  const startScanner = async () => {
    setCameraError('');
    setScanResult({ status: 'IDLE', message: '' });

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      setIsScanning(true);

      const config = {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0,
      };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          processPassToken(decodedText);
        },
        () => {
          // ignore scan frame errors
        }
      );
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setIsScanning(false);
      setCameraError(
        'Camera permission was not granted or camera is not available. You can also type Flat Number below for manual gate check-in.'
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow DOM node to mount
      const t = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(t);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen]);

  const handleManualRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualFlatInput.trim()) return;
    await processPassToken(manualFlatInput.trim());
    setManualFlatInput('');
  };

  const handleScanNext = async () => {
    setScanResult({ status: 'IDLE', message: '' });
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.resume();
      } catch {
        startScanner();
      }
    } else {
      startScanner();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
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
          maxWidth: 480,
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          border: '2px solid #fed7aa',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            padding: '16px 20px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(234, 88, 12, 0.2)',
                border: '1px solid rgba(234, 88, 12, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fb923c',
              }}
            >
              <Camera size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#ffffff' }}>
                Maha Prasad Gate Scanner
              </h3>
              <p style={{ margin: 0, fontSize: 11.5, color: '#94a3b8' }}>
                Admin & Volunteer Gate Entry Verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
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
        </div>

        {/* Modal Body */}
        <div style={{ padding: '18px 20px' }}>
          {/* Scan Result Card (When scanned) */}
          {scanResult.status !== 'IDLE' && (
            <div
              style={{
                borderRadius: 16,
                padding: '16px',
                marginBottom: 16,
                border:
                  scanResult.status === 'SUCCESS'
                    ? '2px solid #22c55e'
                    : scanResult.status === 'EXPIRED'
                    ? '2px solid #ef4444'
                    : '2px solid #f59e0b',
                background:
                  scanResult.status === 'SUCCESS'
                    ? '#f0fdf4'
                    : scanResult.status === 'EXPIRED'
                    ? '#fef2f2'
                    : '#fffbeb',
                animation: 'fadeIn 0.25s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {scanResult.status === 'SUCCESS' && <CheckCircle2 size={24} color="#16a34a" />}
                {scanResult.status === 'EXPIRED' && <AlertTriangle size={24} color="#dc2626" />}
                {scanResult.status === 'ERROR' && <AlertTriangle size={24} color="#d97706" />}
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 900,
                      color:
                        scanResult.status === 'SUCCESS'
                          ? '#166534'
                          : scanResult.status === 'EXPIRED'
                          ? '#991b1b'
                          : '#92400e',
                    }}
                  >
                    {scanResult.status === 'SUCCESS' && 'PASS VERIFIED & REDEEMED! ✅'}
                    {scanResult.status === 'EXPIRED' && 'DUPLICATE / EXPIRED PASS ⚠️'}
                    {scanResult.status === 'ERROR' && 'UNRECOGNIZED PASS ❌'}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                    {scanResult.message}
                  </div>
                </div>
              </div>

              {/* Devotee Details */}
              {scanResult.rsvp && (
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '12px',
                    marginTop: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>FLAT NUMBER</span>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a' }}>
                        Flat {scanResult.rsvp.flatNumber} (Wing {scanResult.rsvp.buildingId})
                      </div>
                    </div>
                    <div
                      style={{
                        background: '#ea580c',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Users size={13} />
                      <span>{scanResult.rsvp.totalHeadcount} Members</span>
                    </div>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginTop: 4 }}>
                    {scanResult.rsvp.residentName}
                  </div>

                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 6, display: 'flex', gap: 12 }}>
                    <span>Adults: <b>{scanResult.rsvp.adultsCount}</b></span>
                    <span>Kids: <b>{scanResult.rsvp.childrenCount}</b></span>
                    <span>Feast: <b>Pure Satvik</b></span>
                  </div>
                </div>
              )}

              {/* Scan Next Button */}
              <button
                onClick={handleScanNext}
                style={{
                  width: '100%',
                  marginTop: 12,
                  background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '11px',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <RefreshCw size={15} />
                <span>Scan Next Devotee Pass</span>
              </button>
            </div>
          )}

          {/* Camera Viewfinder Box */}
          <div
            style={{
              background: '#0f172a',
              borderRadius: 16,
              overflow: 'hidden',
              position: 'relative',
              minHeight: 250,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
              border: '2px solid #334155',
            }}
          >
            <div id={scannerContainerId} style={{ width: '100%' }} />

            {!isScanning && cameraError && (
              <div style={{ padding: 20, textAlign: 'center', color: '#cbd5e1' }}>
                <AlertTriangle size={32} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#f8fafc' }}>{cameraError}</div>
                <button
                  onClick={startScanner}
                  style={{
                    marginTop: 12,
                    background: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Retry Camera
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              fontSize: 11.5,
              color: '#64748b',
              textAlign: 'center',
              marginTop: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <ShieldCheck size={14} color="#059669" />
            <span>Point camera directly at the QR Code on resident's phone or PDF pass.</span>
          </div>

          {/* Fallback Manual Flat Input */}
          <div
            style={{
              marginTop: 16,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 6 }}>
              Manual Flat Number Check-In (Fallback)
            </div>
            <form onSubmit={handleManualRedeem} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={manualFlatInput}
                onChange={(e) => setManualFlatInput(e.target.value)}
                placeholder="e.g. A-304 or 1007"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 13,
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Search size={14} />
                <span>Verify</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
