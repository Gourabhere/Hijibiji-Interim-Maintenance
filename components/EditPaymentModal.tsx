import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Owner, Payment2025, Payment2026 } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  isOpen: boolean;
  owner: Owner | null;
  p25: Payment2025 | null;
  p26: Payment2026 | null;
  onClose: () => void;
  onSave: (p25: Payment2025, p26: Payment2026) => Promise<void>;
}

const EditPaymentModal: React.FC<Props> = ({ isOpen, owner, p25, p26, onClose, onSave }) => {
  const [formData2025, setFormData2025] = useState({
    flatNo: '',
    aug: 0,
    sept: 0,
    oct: 0,
    nov: 0,
    dec: 0,
    paidTillDate: 0,
    outstanding: 0
  });

  const [formData2026, setFormData2026] = useState({
    flatNo: '',
    carryForward2025: 0,
    q1Payment: 0,
    jan: 0,
    feb: 0,
    mar: 0,
    apr: 0,
    may: 0,
    jun: 0,
    jul: 0,
    aug: 0,
    sep: 0,
    oct: 0,
    nov: 0,
    dec: 0,
    paidTillDate: 0,
    outstanding: 0
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeYear, setActiveYear] = useState<2025 | 2026>(2025);

  useEffect(() => {
    if (p25 && p26 && owner) {
      setFormData2025(p25);
      setFormData2026(p26);
      setSaveError('');
    }
  }, [p25, p26, owner]);

  const handleChange2025 = (field: keyof Payment2025, value: any) => {
    setFormData2025(prev => ({
      ...prev,
      [field]: field === 'flatNo' ? value : Number(value) || 0
    }));
  };

  const handleChange2026 = (field: keyof Payment2026, value: any) => {
    setFormData2026(prev => ({
      ...prev,
      [field]: field === 'flatNo' ? value : Number(value) || 0
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError('');
      await onSave(formData2025, formData2026);
      onClose();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save payment information');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !owner) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-[2rem] border border-white/10 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-8 border-b border-white/10 bg-white/5">
          <div>
            <h2 className="text-2xl font-black text-white">Edit Payment Info</h2>
            <p className="text-sm text-white/60 mt-1">{owner.flatNo} - {owner.name}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 hover:bg-white/10 rounded-xl transition-all disabled:opacity-50"
          >
            <X size={24} className="text-white/60" />
          </button>
        </div>

        {/* Error Message */}
        {saveError && (
          <div className="mx-8 mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <span className="text-sm text-red-300">{saveError}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-4 px-8 pt-6 border-b border-white/10">
          <button
            onClick={() => setActiveYear(2025)}
            className={`pb-4 px-4 font-bold text-sm uppercase tracking-wider transition-all ${
              activeYear === 2025
                ? 'text-orange-400 border-b-2 border-orange-400'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            2025 Payments
          </button>
          <button
            onClick={() => setActiveYear(2026)}
            className={`pb-4 px-4 font-bold text-sm uppercase tracking-wider transition-all ${
              activeYear === 2026
                ? 'text-sky-400 border-b-2 border-sky-400'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            2026 Payments
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeYear === 2025 ? (
            <div className="space-y-4">
              <h3 className="font-bold text-white/80 mb-4">2025 Monthly Payments</h3>
              <div className="grid grid-cols-2 gap-4">
                {['aug', 'sept', 'oct', 'nov', 'dec'].map(month => (
                  <div key={month}>
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                      {month.charAt(0).toUpperCase() + month.slice(1)}
                    </label>
                    <input
                      type="number"
                      value={formData2025[month as keyof typeof formData2025] || 0}
                      onChange={(e) => handleChange2025(month as keyof Payment2025, e.target.value)}
                      disabled={isSaving}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold outline-none focus:ring-2 ring-orange-400/50 transition-all disabled:opacity-50"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                    Paid Till Date
                  </label>
                  <input
                    type="number"
                    value={formData2025.paidTillDate || 0}
                    onChange={(e) => handleChange2025('paidTillDate', e.target.value)}
                    disabled={isSaving}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold outline-none focus:ring-2 ring-cyan-400/50 transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                    Outstanding
                  </label>
                  <input
                    type="number"
                    value={formData2025.outstanding || 0}
                    onChange={(e) => handleChange2025('outstanding', e.target.value)}
                    disabled={isSaving}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold outline-none focus:ring-2 ring-red-400/50 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-white/80 mb-4">2026 Monthly Payments</h3>
              
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                  Carry Forward from 2025
                </label>
                <input
                  type="number"
                  value={formData2026.carryForward2025 || 0}
                  onChange={(e) => handleChange2026('carryForward2025', e.target.value)}
                  disabled={isSaving}
                  className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold outline-none focus:ring-2 ring-emerald-400/50 transition-all disabled:opacity-50"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                  Q1 Payment
                </label>
                <input
                  type="number"
                  value={formData2026.q1Payment || 0}
                  onChange={(e) => handleChange2026('q1Payment', e.target.value)}
                  disabled={isSaving}
                  className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold outline-none focus:ring-2 ring-sky-400/50 transition-all disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map(month => (
                  <div key={month}>
                    <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                      {month.charAt(0).toUpperCase() + month.slice(1)}
                    </label>
                    <input
                      type="number"
                      value={formData2026[month as keyof typeof formData2026] || 0}
                      onChange={(e) => handleChange2026(month as keyof Payment2026, e.target.value)}
                      disabled={isSaving}
                      className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold text-sm outline-none focus:ring-2 ring-sky-400/50 transition-all disabled:opacity-50"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                    Paid Till Date
                  </label>
                  <input
                    type="number"
                    value={formData2026.paidTillDate || 0}
                    onChange={(e) => handleChange2026('paidTillDate', e.target.value)}
                    disabled={isSaving}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold outline-none focus:ring-2 ring-cyan-400/50 transition-all disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                    Outstanding
                  </label>
                  <input
                    type="number"
                    value={formData2026.outstanding || 0}
                    onChange={(e) => handleChange2026('outstanding', e.target.value)}
                    disabled={isSaving}
                    className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-bold outline-none focus:ring-2 ring-red-400/50 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-4 p-8 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-3 font-bold text-sm uppercase tracking-wider rounded-lg border border-white/20 hover:bg-white/10 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 font-bold text-sm uppercase tracking-wider rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPaymentModal;
