import React from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../utils';

interface QrModalProps {
  onClose: () => void;
  amount: number;
}

const QrModal: React.FC<QrModalProps> = ({ onClose, amount }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-in fade-in backdrop-blur-sm">
      <div className="relative glass rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white/80 hover:text-white hover:bg-black/70 transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount Due</p>
          <p className="text-4xl font-black text-white drop-shadow-lg">{formatCurrency(amount)}</p>
        </div>

        <div className="p-2 bg-white rounded-2xl mb-4">
          <img src="/WhatsApp Image 2026-02-01 at 17.45.49.jpeg" alt="QR Code for Payment" className="rounded-xl w-full" />
        </div>

        <div className="text-center">
          <p className="font-bold text-lg text-white mb-1">Scan to Pay</p>
          <p className="text-white/50 text-xs">Use any UPI app like GPay, PhonePe, or PayTM.</p>
        </div>
      </div>
    </div>
  );
};

export default QrModal;
