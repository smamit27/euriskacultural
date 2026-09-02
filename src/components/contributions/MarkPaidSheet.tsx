import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { Smartphone, Banknote, CheckCircle2 } from 'lucide-react';
import type { Contribution, PaymentMode } from '../../types';
import confetti from 'canvas-confetti';

interface MarkPaidSheetProps {
  isOpen: boolean;
  onClose: () => void;
  contribution: Contribution | null;
  onConfirm: (
    id: string,
    data: {
      amount: number;
      paymentMode: PaymentMode;
      transactionId?: string;
      remarks?: string;
    }
  ) => void;
}

export const MarkPaidSheet: React.FC<MarkPaidSheetProps> = ({
  isOpen,
  onClose,
  contribution,
  onConfirm,
}) => {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('ONLINE');
  const [amount, setAmount] = useState<number>(1500);
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');

  // Dynamically set amount from the exact contribution record on the screen
  useEffect(() => {
    if (contribution) {
      const cardAmount =
        contribution.expectedAmount ||
        (contribution as any).amount ||
        contribution.paidAmount ||
        1500;
      setAmount(cardAmount);
      setPaymentMode(contribution.paymentMode || 'ONLINE');
      setTransactionId(contribution.transactionId || '');
      setRemarks(contribution.remarks || '');
    }
  }, [contribution, isOpen]);

  if (!contribution) return null;

  const handleConfirm = () => {
    const finalAmount = amount || contribution.expectedAmount || (contribution as any).amount || 1500;
    onConfirm(contribution.id, {
      amount: finalAmount,
      paymentMode,
      transactionId: transactionId.trim() || undefined,
      remarks: remarks.trim() || 'Paid via mobile confirmation',
    });

    // Festive celebration confetti micro-animation
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // Confetti fallback
    }

    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Mark ${contribution.flatNumber} as Paid`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Resident</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
            {contribution.residentName} ({contribution.flatNumber})
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Contribution Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="form-input"
            style={{ fontSize: 18, fontWeight: 800 }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <div className="payment-toggle-group">
            <button
              type="button"
              onClick={() => setPaymentMode('ONLINE')}
              className={`payment-toggle-btn ${paymentMode === 'ONLINE' ? 'active' : ''}`}
            >
              <Smartphone size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              <span>Online UPI</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode('CASH')}
              className={`payment-toggle-btn ${paymentMode === 'CASH' ? 'active' : ''}`}
            >
              <Banknote size={18} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              <span>Cash</span>
            </button>
          </div>
        </div>

        {paymentMode === 'ONLINE' && (
          <div className="form-group">
            <label className="form-label">Transaction ID / UPI Reference (Optional)</label>
            <input
              type="text"
              placeholder="e.g. UPI-982374923"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="form-input"
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Remarks (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Handed over to Floor Rep"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="form-input"
          />
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          className="btn btn-primary btn-block"
          style={{ marginTop: 8 }}
        >
          <CheckCircle2 size={18} />
          <span>Confirm Payment (₹{amount.toLocaleString('en-IN')})</span>
        </button>
      </div>
    </BottomSheet>
  );
};
