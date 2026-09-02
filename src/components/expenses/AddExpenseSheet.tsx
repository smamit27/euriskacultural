import React, { useState } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { PlusCircle, Camera, Upload, Smartphone, Banknote, X } from 'lucide-react';
import type { Expense, PaymentMode } from '../../types';

interface AddExpenseSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialExpense?: Expense | null;
}

const CATEGORIES: string[] = [
  'Ganesh Chaturthi',
  'Navratri',
  'Diwali',
  'Christmas',
  'Eid',
  'Holi',
  'Decoration',
  'Sound & Light',
  'Stage & Mandap',
  'Catering & Food',
  'Artist & Performers',
  'Dhol Pathak / Band',
  'Prizes & Trophies',
  'Security & Bouncers',
  'Photography & Video',
  'Pooja & Rituals',
  'Misc & Contingency',
];

export const AddExpenseSheet: React.FC<AddExpenseSheetProps> = ({
  isOpen,
  onClose,
  onSave,
  initialExpense,
}) => {
  const [category, setCategory] = useState<string>('Ganesh Chaturthi');
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode | 'CHEQUE' | 'NET_BANKING'>('ONLINE');
  const [status, setStatus] = useState<Expense['status']>('APPROVED');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [billUrl, setBillUrl] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [createdBy, setCreatedBy] = useState('Sachin Singh');

  React.useEffect(() => {
    if (initialExpense) {
      setCategory(initialExpense.category || 'Ganesh Chaturthi');
      setVendor(initialExpense.vendor || '');
      setDescription(initialExpense.description || '');
      setAmount(initialExpense.amount || 0);
      setPaymentMode(initialExpense.paymentMode || 'ONLINE');
      setStatus(initialExpense.status || 'APPROVED');
      setInvoiceNumber(initialExpense.invoiceNumber || '');
      setBillUrl(initialExpense.billUrl || '');
      setExpenseDate(initialExpense.expenseDate || new Date().toISOString().split('T')[0]);
      setRemarks(initialExpense.remarks || '');
      setCreatedBy(initialExpense.createdBy || 'Sachin Singh');
    } else {
      setCategory('Ganesh Chaturthi');
      setVendor('');
      setDescription('');
      setAmount(0);
      setPaymentMode('ONLINE');
      setStatus('APPROVED');
      setInvoiceNumber('');
      setBillUrl('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setRemarks('');
      setCreatedBy('Sachin Singh');
    }
  }, [initialExpense, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor.trim() || amount <= 0) return;

    onSave({
      eventId: 'EURISKA-CULTURAL-2026',
      category: category as any,
      vendor: vendor.trim(),
      description: description.trim() || `${category} services by ${vendor}`,
      amount,
      paymentMode,
      invoiceNumber: invoiceNumber.trim() || undefined,
      billUrl: billUrl || undefined,
      status,
      expenseDate,
      remarks: remarks.trim() || undefined,
      createdBy: createdBy || 'Sachin Singh',
      approvedBy: status === 'APPROVED' ? (initialExpense?.approvedBy || 'Sachin Singh') : undefined,
      approvedAt: status === 'APPROVED' ? (initialExpense?.approvedAt || new Date().toISOString()) : undefined,
    });

    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={initialExpense ? 'Edit Expense Record' : 'Add New Expense'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">Expense Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-select"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Vendor / Service Provider</label>
          <input
            type="text"
            placeholder="e.g. ABC Decorations & Lights"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description / Scope of Work</label>
          <input
            type="text"
            placeholder="e.g. Stage floral decoration and sound setup"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              placeholder="0"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="form-input"
              required
              min={1}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Expense Date</label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="form-input"
            />
          </div>
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

        <div className="form-group">
          <label className="form-label">Invoice / Receipt Number</label>
          <input
            type="text"
            placeholder="e.g. INV-2026-088"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Mobile Bill Upload Component (Prompt #22) */}
        <div className="form-group">
          <label className="form-label">Upload Bill / Receipt Photo</label>
          {billUrl ? (
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1.5px solid #e2e8f0', maxHeight: 160 }}>
              <img src={billUrl} alt="Bill Preview" style={{ width: '100%', height: 160, objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => setBillUrl('')}
                className="icon-btn"
                style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff' }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <label
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: 12,
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  background: '#f8fafc',
                  textAlign: 'center',
                }}
              >
                <Camera size={22} color="#f97316" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>📷 Take Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>

              <label
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: 12,
                  padding: '14px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  background: '#f8fafc',
                  textAlign: 'center',
                }}
              >
                <Upload size={22} color="#8b5cf6" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>📁 Choose File</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Approval Status</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {(['APPROVED', 'PENDING', 'REJECTED'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(st)}
                className={`filter-chip ${status === st ? 'active' : ''}`}
                style={{
                  justifyContent: 'center',
                  padding: '8px 4px',
                  fontSize: 12,
                  fontWeight: 800,
                  borderRadius: 8,
                }}
              >
                {st === 'APPROVED' ? '✅ Approved' : st === 'PENDING' ? '⏳ Pending' : '❌ Rejected'}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Remarks / Notes</label>
          <input
            type="text"
            placeholder="e.g. Adv booking for Dhol Pathak"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="form-input"
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 6 }}>
          <PlusCircle size={18} />
          <span>{initialExpense ? 'Save Changes' : 'Submit Expense'}</span>
        </button>
      </form>
    </BottomSheet>
  );
};
