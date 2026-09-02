import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { PlusCircle, Smartphone, Banknote } from 'lucide-react';
import type { Contribution, PaymentMode, ContributionStatus } from '../../types';

interface AddContributionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialContribution?: Contribution | null;
  onSave: (data: any) => void;
}

export const AddContributionSheet: React.FC<AddContributionSheetProps> = ({
  isOpen,
  onClose,
  initialContribution,
  onSave,
}) => {
  const [buildingId, setBuildingId] = useState('A');
  const [flatNumber, setFlatNumber] = useState('');
  const [residentName, setResidentName] = useState('');
  const [amount, setAmount] = useState(1500);
  const [status, setStatus] = useState<ContributionStatus>('PAID');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('ONLINE');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (initialContribution) {
      setBuildingId(initialContribution.buildingId);
      setFlatNumber(initialContribution.flatNumber);
      setResidentName(initialContribution.residentName);
      setAmount(initialContribution.paidAmount || initialContribution.expectedAmount || 1500);
      setStatus(initialContribution.status);
      setPaymentMode(initialContribution.paymentMode || 'ONLINE');
      setTransactionId(initialContribution.transactionId || '');
      setPaymentDate(initialContribution.paymentDate || new Date().toISOString().split('T')[0]);
      setRemarks(initialContribution.remarks || '');
    } else {
      setBuildingId('A');
      setFlatNumber('A-');
      setResidentName('');
      setAmount(1500);
      setStatus('PAID');
      setPaymentMode('ONLINE');
      setTransactionId('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setRemarks('');
    }
  }, [initialContribution, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNumber.trim() || !residentName.trim()) return;

    const payload: any = {
      buildingId,
      flatNumber: flatNumber.trim().toUpperCase(),
      residentName: residentName.trim(),
      expectedAmount: initialContribution?.expectedAmount || 1500,
      paidAmount: status === 'PAID' ? (amount || 1500) : 0,
      status,
      remarks: remarks.trim() || '',
    };

    if (status === 'PAID') {
      payload.paymentMode = paymentMode;
      payload.transactionId = transactionId.trim() || (paymentMode === 'ONLINE' ? `UPI-${Date.now().toString().slice(-8)}` : '');
      payload.paymentDate = paymentDate || new Date().toISOString().split('T')[0];
      payload.receiptNumber = initialContribution?.receiptNumber || `REC-2026-${flatNumber.replace(/[^a-zA-Z0-9]/g, '')}`;
    } else {
      payload.paymentMode = undefined;
      payload.transactionId = undefined;
      payload.paymentDate = undefined;
      payload.receiptNumber = undefined;
    }

    onSave(payload);
    onClose();
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialContribution ? `Edit Contribution (${initialContribution.flatNumber})` : 'Add Contribution'}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Building / Wing</label>
          <select
            value={buildingId}
            onChange={(e) => {
              const b = e.target.value;
              setBuildingId(b);
              if (flatNumber.startsWith('A-') || flatNumber.startsWith('B-') || flatNumber.startsWith('C-')) {
                setFlatNumber(`${b}-${flatNumber.slice(2)}`);
              }
            }}
            className="form-select"
          >
            <option value="A">A Building</option>
            <option value="B">B Building</option>
            <option value="C">C Building</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Flat Number</label>
            <input
              type="text"
              placeholder="e.g. A-203"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Resident Name</label>
            <input
              type="text"
              placeholder="e.g. Resident Name"
              value={residentName}
              onChange={(e) => setResidentName(e.target.value)}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Contribution Status</label>
          <div className="payment-toggle-group">
            <button
              type="button"
              onClick={() => setStatus('PAID')}
              className={`payment-toggle-btn ${status === 'PAID' ? 'active' : ''}`}
            >
              ✓ Paid
            </button>
            <button
              type="button"
              onClick={() => setStatus('PENDING')}
              className={`payment-toggle-btn ${status === 'PENDING' ? 'active' : ''}`}
            >
              ⏳ Pending
            </button>
          </div>
        </div>

        {status === 'PAID' && (
          <>
            <div className="form-group">
              <label className="form-label">Amount Paid (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <div className="payment-toggle-group">
                <button
                  type="button"
                  onClick={() => setPaymentMode('ONLINE')}
                  className={`payment-toggle-btn ${paymentMode === 'ONLINE' ? 'active' : ''}`}
                >
                  <Smartphone size={16} style={{ display: 'inline', marginRight: 4 }} />
                  <span>Online UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('CASH')}
                  className={`payment-toggle-btn ${paymentMode === 'CASH' ? 'active' : ''}`}
                >
                  <Banknote size={16} style={{ display: 'inline', marginRight: 4 }} />
                  <span>Cash</span>
                </button>
              </div>
            </div>

            {paymentMode === 'ONLINE' && (
              <div className="form-group">
                <label className="form-label">Transaction ID</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-82736412"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="form-input"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="form-input"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label className="form-label">Remarks</label>
          <input
            type="text"
            placeholder="Optional notes"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="form-input"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 6 }}>
          <PlusCircle size={18} />
          <span>Save Contribution</span>
        </button>
      </form>
    </BottomSheet>
  );
};
