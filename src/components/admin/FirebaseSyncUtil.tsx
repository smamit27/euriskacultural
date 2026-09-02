import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { syncService } from '../../services/syncService';
import type { SyncResult } from '../../services/syncService';

export const FirebaseSyncUtil: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const syncResult = await syncService.syncAllDataToFirebase();
      setResult(syncResult);
    } catch (error) {
      console.error('Sync error:', error);
      setResult({
        contributions: { success: 0, failed: 0, total: 0 },
        timestamp: new Date().toISOString(),
        status: 'failed',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button to open sync dialog */}
      <button
        onClick={() => setShowModal(true)}
        title="Sync data to Firebase"
        style={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          border: 'none',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          zIndex: 50,
        }}
      >
        <Upload size={24} />
      </button>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
              🔄 Sync to Firebase
            </h3>

            {!result ? (
              <>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
                  This will upload all contributions and expenses from local storage to Firebase Firestore.
                </p>

                <button
                  onClick={handleSync}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: isLoading ? '#cbd5e1' : '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader size={16} className="spin" /> Syncing...
                    </>
                  ) : (
                    <>
                      <Upload size={16} /> Start Sync
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                    backgroundColor: result.status === 'failed' ? '#fee2e2' : '#ecfdf5',
                    borderLeft: `4px solid ${result.status === 'failed' ? '#dc2626' : '#10b981'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {result.status === 'failed' ? (
                      <>
                        <AlertCircle size={18} style={{ color: '#dc2626' }} />
                        <span style={{ fontWeight: 600, color: '#dc2626' }}>Sync Failed</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                        <span style={{ fontWeight: 600, color: '#10b981' }}>
                          {result.status === 'partial' ? 'Partially Synced' : 'Sync Successful'}
                        </span>
                      </>
                    )}
                  </div>

                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    <p>
                      <strong>Contributions:</strong> {result.contributions.success}/{result.contributions.total} synced
                      {result.contributions.failed > 0 && ` (${result.contributions.failed} failed)`}
                    </p>
                    {result.expenses && result.expenses.total > 0 && (
                      <p>
                        <strong>Expenses:</strong> {result.expenses.success}/{result.expenses.total} synced
                        {result.expenses.failed > 0 && ` (${result.expenses.failed} failed)`}
                      </p>
                    )}
                    <p style={{ marginTop: 8, opacity: 0.7 }}>
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
};
