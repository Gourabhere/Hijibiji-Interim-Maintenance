import React from 'react';
import { X } from 'lucide-react';

interface QrModalProps {
  onClose: () => void;
}

const QrModal: React.FC<QrModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-in fade-in">
      <div className="relative glass rounded-3xl p-4 max-w-sm w-full mx-4">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-white/50 hover:text-white transition-all z-10"
        >
          <X size={28} />
        </button>
        <img src="/WhatsApp Image 2026-02-01 at 17.45.49.jpeg" alt="QR Code for Payment" className="rounded-2xl w-full" />
        <div className="p-4 text-center">
          <p className="font-bold text-lg">Scan to Pay</p>
          <p className="text-white/60 text-sm">Use any UPI app like GPay, PhonePe, or PayTM.</p>
        </div>
      </div>
    </div>
  );
};

export default QrModal;
