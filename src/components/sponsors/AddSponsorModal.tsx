import React, { useState } from 'react';
import { X, Sparkles, User, Building, Phone, IndianRupee, FileText } from 'lucide-react';
import type { Sponsor, SponsorTier } from '../../types';
import { DEFAULT_EVENT_ID } from '../../firebase/collections';

interface AddSponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sponsorData: Omit<Sponsor, 'id'>) => Promise<void>;
}

const SEVA_CATEGORIES = [
  { value: 'Murti', label: '🌺 Shri Ganesh Murti Seva (Idol)', icon: '🌺', defaultTier: 'Platinum' as SponsorTier },
  { value: 'Decoration', label: '✨ Mandap & Stage Decoration Seva', icon: '🎨', defaultTier: 'Gold' as SponsorTier },
  { value: 'Flowers', label: '🌸 Daily Fresh Flowers & Pooja Garlands', icon: '🌸', defaultTier: 'Silver' as SponsorTier },
  { value: 'Prasad', label: '🍯 Evening Modak & Maha Prasad Sweets', icon: '🍯', defaultTier: 'Gold' as SponsorTier },
  { value: 'Lighting', label: '💡 Society Campus & Podium Illumination', icon: '💡', defaultTier: 'Bronze' as SponsorTier },
  { value: 'General', label: '🤝 Community Festival Seva Patron', icon: '🤝', defaultTier: 'Community' as SponsorTier },
];

export const AddSponsorModal: React.FC<AddSponsorModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [building, setBuilding] = useState('B');
  const [flatNumber, setFlatNumber] = useState('');
  const [sevaType, setSevaType] = useState('Murti');
  const [customTitle, setCustomTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<string>('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter Devotee / Sponsor name');
      return;
    }
    if (!flatNumber.trim()) {
      setError('Please enter Flat number (e.g. 307 or B-307)');
      return;
    }

    const cleanFlat = flatNumber.toUpperCase().startsWith(building)
      ? flatNumber.toUpperCase()
      : `${building}-${flatNumber.replace(/[^0-9]/g, '')}`;

    const selectedCategory = SEVA_CATEGORIES.find((c) => c.value === sevaType) || SEVA_CATEGORIES[0];
    const categoryTitle = customTitle.trim() || selectedCategory.label.replace(/^[^\s]+\s/, '');

    setIsSubmitting(true);
    setError('');

    try {
      await onAdd({
        eventId: DEFAULT_EVENT_ID,
        name: name.trim(),
        tier: selectedCategory.defaultTier,
        amount: Number(amount) || 0,
        paymentStatus: 'PAID',
        contactPerson: name.trim(),
        contactPhone: phone.trim() || undefined,
        flatNumber: cleanFlat,
        buildingId: building,
        sevaType: sevaType,
        sevaCategory: categoryTitle,
        description: description.trim() || `Devotee sponsor for ${categoryTitle} for Euriska Cultural Festival 2026.`,
        logoUrl: sevaType === 'Murti'
          ? '/ganesh_murti_sponsor.jpg'
          : '/dagdusheth_decoration.jpg',
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save sponsor. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            color: '#ffffff',
            padding: '18px 20px',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              🌺
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900 }}>Add Seva Sponsor</div>
              <div style={{ fontSize: 11, color: '#c7d2fe', fontWeight: 600 }}>
                Record a resident sponsor or festival contributor
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {/* Devotee / Sponsor Name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
              Devotee / Sponsor Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Singh / Prashant"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 13,
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Wing & Flat Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
                Wing
              </label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 13,
                  fontWeight: 700,
                  outline: 'none',
                  background: '#fff',
                  boxSizing: 'border-box',
                }}
              >
                <option value="A">A Building</option>
                <option value="B">B Building</option>
                <option value="C">C Building</option>
                <option value="Society">Society / External</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
                Flat Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Building size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  placeholder="e.g. 307 or 505"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 13,
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Seva Category */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
              Seva Category / Sponsorship Type <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={sevaType}
              onChange={(e) => setSevaType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1.5px solid #cbd5e1',
                fontSize: 13,
                fontWeight: 600,
                outline: 'none',
                background: '#fff',
                boxSizing: 'border-box',
              }}
            >
              {SEVA_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Seva Title / Item */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
              Custom Seva Title / Details (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <FileText size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Eco-friendly Clay Idol / Stage Flowers"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 13,
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Contact Phone & Amount Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
                Contact Phone (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98230..."
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 13,
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
                Rupees (₹ 0 if Seva)
              </label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    fontSize: 13,
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>
              Notes / Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Sponsoring the divine Ganesh Murti for all 11 days..."
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1.5px solid #cbd5e1',
                fontSize: 12.5,
                fontWeight: 500,
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#475569',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 2,
                padding: '11px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                color: '#ffffff',
                fontSize: 13,
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
              }}
            >
              <Sparkles size={15} />
              <span>{isSubmitting ? 'Saving...' : 'Record Seva Sponsor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
