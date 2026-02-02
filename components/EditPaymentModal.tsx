import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Owner, Payment2025, Payment2026 } from '../types';
import { upsertPayments2025, upsertPayments2026 } from '../lib/supabase';
import { formatCurrency } from '../utils';

interface Props {
  owner: Owner;
  p25: Payment2025 | null;
  p26: Payment2026 | null;
  onClose: () => void;
  onSave: (p25: Payment2025, p26: Payment2026) => void;
}

const EditPaymentModal: React.FC<Props> = ({ owner, p25, p26, onClose, onSave }) => {
  const [formP25, setFormP25] = useState<Payment2025>(p25 || {
    flatNo: owner.flatNo,
    aug: 0,
    sept: 0,
    oct: 0,
    nov: 0,
    dec: 0,
    paidTillDate: 0,
    outstanding: 0
  });

  const [formP26, setFormP26] = useState<Payment2026>(p26 || {
    flatNo: owner.flatNo,
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
  const [activeTab, setActiveTab] = useState<'2025' | '2026'>('2025');

  const handleP25Change = (field: keyof Payment2025, value: number) => {
    setFormP25(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleP26Change = (field: keyof Payment2026, value: number) => {
    setFormP26(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError('');

      // Update both tables in Supabase
      await Promise.all([
        upsertPayments2025([formP25]),
        upsertPayments2026([formP26])
      ]);

      // Call parent callback
      onSave(formP25, formP26);
      onClose();
    } catch (error) {
      setSaveError(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-3xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/5 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Edit Payment Info</h2>
            <p className="text-sm text-white/60 mt-1">Flat: <span className="font-bold text-indigo-400">{owner.flatNo}</span> | Owner: <span className="font-bold text-indigo-400">{owner.name}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <X size={24} className="text-white/60 hover:text-white" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 p-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('2025')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === '2025'
                ? 'bg-orange-500/30 border border-orange-500/50 text-orange-200'
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            2025 Collections
          </button>
          <button
            onClick={() => setActiveTab('2026')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === '2026'
                ? 'bg-sky-500/30 border border-sky-500/50 text-sky-200'
                : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            2026 Collections
          </button>
        </div>

        {/* Error Alert */}
        {saveError && (
          <div className="m-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-200">{saveError}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {activeTab === '2025' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2">August 2025</label>
                  <input
                    type="number"
                    value={formP25.aug}
                    onChange={(e) => handleP25Change('aug', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold focus:ring-2 ring-orange-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2">September 2025</label>
                  <input
                    type="number"
                    value={formP25.sept}
                    onChange={(e) => handleP25Change('sept', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold focus:ring-2 ring-orange-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2">October 2025</label>
                  <input
                    type="number"
                    value={formP25.oct}
                    onChange={(e) => handleP25Change('oct', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold focus:ring-2 ring-orange-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2">November 2025</label>
                  <input
                    type="number"
                    value={formP25.nov}
                    onChange={(e) => handleP25Change('nov', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold focus:ring-2 ring-orange-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2">December 2025</label>
                  <input
                    type="number"
                    value={formP25.dec}
                    onChange={(e) => handleP25Change('dec', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold focus:ring-2 ring-orange-500/50 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2">Total Paid in 2025</label>
                  <input
                    type="number"
                    value={formP25.paidTillDate}
                    onChange={(e) => handleP25Change('paidTillDate', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold focus:ring-2 ring-cyan-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2">Outstanding in 2025</label>
                  <input
                    type="number"
                    value={formP25.outstanding}
                    onChange={(e) => handleP25Change('outstanding', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold focus:ring-2 ring-red-500/50 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === '2026' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-white/10">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2">2025 Carry Forward</label>
                  <input
                    type="number"
                    value={formP26.carryForward2025}
                    onChange={(e) => handleP26Change('carryForward2025', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold focus:ring-2 ring-emerald-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2">Q1 2026 Payment</label>
                  <input
                    type="number"
                    value={formP26.q1Payment}
                    onChange={(e) => handleP26Change('q1Payment', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold focus:ring-2 ring-sky-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].map(month => (
                  <div key={month}>
                    <label className="block text-xs font-bold text-white/60 mb-2 capitalize">{month.substring(0, 3)} 2026</label>
                    <input
                      type="number"
                      value={formP26[month as keyof typeof formP26] as number}
                      onChange={(e) => handleP26Change(month as keyof Payment2026, Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold text-sm focus:ring-2 ring-sky-500/50 outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2">Total Paid Till Date</label>
                  <input
                    type="number"
                    value={formP26.paidTillDate}
                    onChange={(e) => handleP26Change('paidTillDate', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold focus:ring-2 ring-sky-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2">Outstanding</label>
                  <input
                    type="number"
                    value={formP26.outstanding}
                    onChange={(e) => handleP26Change('outstanding', Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold focus:ring-2 ring-red-500/50 outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/5 backdrop-blur-xl border-t border-white/10 p-6 flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPaymentModal;
