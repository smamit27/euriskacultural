import React, { useState, useEffect } from 'react';
import { ShieldCheck, Smartphone, Laptop, Tablet, RefreshCw, Clock, Globe } from 'lucide-react';
import { auditService, type LoginLogEntry } from '../../services/auditService';
import { useAuth } from '../../context/AuthContext';

export const LoginAuditLogView: React.FC = () => {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState<LoginLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for live logins from all devices across the world
    const unsubscribe = auditService.subscribeLoginLogs((data) => {
      setLogs(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleManualRefresh = async () => {
    setLoading(true);
    const data = await auditService.getLoginLogs();
    setLogs(data);
    setLoading(false);
  };

  if (!isAdmin) return null;

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'Mobile':
        return <Smartphone size={18} color="#ea580c" />;
      case 'Tablet':
        return <Tablet size={18} color="#7c3aed" />;
      default:
        return <Laptop size={18} color="#0284c7" />;
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: '18px 16px',
        marginTop: 14,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: '#fff7ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={20} color="#ea580c" />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', margin: 0 }}>
              🔐 Admin Login Tracker &amp; Device Logs
            </h3>
            <p style={{ fontSize: 11.5, color: '#64748b', margin: 0 }}>
              Tracks which device, OS, browser &amp; IP accessed Admin mode
            </p>
          </div>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={loading}
          title="Refresh Logs"
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 12,
            fontWeight: 700,
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: '#94a3b8' }}>
          Loading login logs from Firebase...
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: '#94a3b8' }}>
          No login records logged yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
          {logs.map((log) => {
            const isSuccess = log.status === 'SUCCESS';
            return (
              <div
                key={log.id}
                style={{
                  background: isSuccess ? '#f8fafc' : '#fef2f2',
                  border: isSuccess ? '1px solid #e2e8f0' : '1px solid #fecaca',
                  borderRadius: 12,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getDeviceIcon(log.deviceType)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                        {log.deviceModel} ({log.os})
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: 6,
                          background: isSuccess ? '#ecfdf5' : '#fee2e2',
                          color: isSuccess ? '#059669' : '#dc2626',
                          border: isSuccess ? '1px solid #a7f3d0' : '1px solid #fca5a5',
                        }}
                      >
                        {isSuccess ? '✓ Logged In' : '✗ Failed'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      <span>🌐 {log.browser}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Globe size={11} />
                        {log.ip}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: '#334155' }}>
                    <Clock size={12} color="#94a3b8" />
                    <span>{log.timeFormatted}</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                    Screen: {log.screenSize}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
