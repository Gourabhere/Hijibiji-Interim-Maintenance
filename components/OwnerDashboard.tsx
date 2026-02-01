
import React, { useState } from 'react';
import { 
  ArrowLeft, Wallet, Info, CheckCircle2, AlertCircle, 
  Clock, Megaphone, Activity, PhoneCall, Zap, Droplets, Dumbbell,
  Shield, CreditCard, TrendingUp, TrendingDown, History
} from 'lucide-react';
import { DashboardData } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  data: DashboardData;
  onBack: () => void;
}

const OwnerDashboard: React.FC<Props> = ({ data, onBack }) => {
  const [selectedYear, setSelectedYear] = useState<2025 | 2026>(2026);
  const { owner, p2025, p2026, calculated } = data;

  const getMonthValue2025 = (month: string) => {
    // Determine participation: either they have a carry-forward or they paid more than the Q1 2026 due
    const participatedIn2025 = p2026.carryForward2025 > 0 || (p2026.paidTillDate > p2026.q1Payment);
    if (!participatedIn2025) return 0;

    // Society shared pool only covers Aug-Dec 2025
    const poolMonths = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (!poolMonths.includes(month)) return 0;

    // If possession is TBD but they participated, assume they are covered for the full pool period
    if (owner.possessionDate === 'TBD') return 2000;

    const parts = owner.possessionDate.split('-');
    if (parts.length < 2) return 0;
    
    const posMonthStr = parts[0];
    const posYearStr = parts[1];

    // If possession year is not 2025, they don't have 2025 shared expense obligations
    if (posYearStr !== '25') return 0;

    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const posIndex = allMonths.indexOf(posMonthStr);
    const currIndex = allMonths.indexOf(month);
    const poolStartIndex = allMonths.indexOf('Aug');

    // Effective start is whichever is later: the possession month or the society pool start (Aug)
    const effectiveStart = Math.max(posIndex, poolStartIndex);
    
    // If current month is at or after the effective start, it's covered
    if (currIndex >= effectiveStart) return 2000;
    
    return 0;
  };

  const months2026 = [
    { label: 'Jan', amount: p2026.jan }, { label: 'Feb', amount: p2026.feb },
    { label: 'Mar', amount: p2026.mar }, { label: 'Apr', amount: p2026.apr },
    { label: 'May', amount: p2026.may }, { label: 'Jun', amount: p2026.jun },
    { label: 'Jul', amount: p2026.jul }, { label: 'Aug', amount: p2026.aug },
    { label: 'Sep', amount: p2026.sep }, { label: 'Oct', amount: p2026.oct },
    { label: 'Nov', amount: p2026.nov }, { label: 'Dec', amount: p2026.dec },
  ];

  const months2025 = [
    { label: 'Jan', amount: 0 }, { label: 'Feb', amount: 0 },
    { label: 'Mar', amount: 0 }, { label: 'Apr', amount: 0 },
    { label: 'May', amount: 0 }, { label: 'Jun', amount: 0 },
    { label: 'Jul', amount: 0 }, 
    { label: 'Aug', amount: getMonthValue2025('Aug') },
    { label: 'Sep', amount: getMonthValue2025('Sep') }, 
    { label: 'Oct', amount: getMonthValue2025('Oct') },
    { label: 'Nov', amount: getMonthValue2025('Nov') }, 
    { label: 'Dec', amount: getMonthValue2025('Dec') },
  ];

  const displayMonths = selectedYear === 2026 ? months2026 : months2025;

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Covered':
      case 'Paid':
        return 'bg-emerald-600/40 border-emerald-400/30 text-emerald-100';
      case 'Partial Covered':
      case 'Partial Paid':
        return 'bg-amber-600/40 border-amber-400/30 text-amber-100';
      default:
        return 'bg-rose-600/40 border-rose-400/30 text-rose-100';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Covered' || status === 'Paid') return <CheckCircle2 size={120} />;
    if (status === 'Partial Covered' || status === 'Partial Paid') return <Clock size={120} />;
    return <AlertCircle size={120} />;
  };

  const totalFunds = p2026.carryForward2025 + p2026.q1Payment;
  const isSurplus = calculated.currentBalance > 0;
  const isDebt = calculated.currentBalance < 0;

  return (
    <div className="min-h-screen p-4 pb-28 max-w-2xl mx-auto space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 glass rounded-2xl hover:bg-white/10 transition-all neo-button">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Flat {owner.flatNo}</h1>
          <p className="text-[10px] text-cyan-400 uppercase font-black tracking-[0.2em]">{owner.name}</p>
        </div>
      </div>

      {/* Primary Status Widget */}
      <div className="grid grid-cols-1 gap-4">
        <div className={`rounded-[2.5rem] p-6 border-2 shadow-2xl relative overflow-hidden transition-all duration-500 ${getStatusStyles(calculated.q1Status)}`}>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            {getStatusIcon(calculated.q1Status)}
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-60">2026 Q1 Maintenance</div>
            <div className="text-4xl font-black mb-6">{calculated.q1Status}</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="text-[8px] font-black uppercase opacity-60 mb-1 flex items-center gap-1">
                   <History size={10} /> Lifetime Paid
                </div>
                <div className="text-xl font-black text-indigo-200">{formatCurrency(calculated.maintenancePaidTillDate)}</div>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md text-right">
                <div className="text-[8px] font-black uppercase opacity-60 mb-1 flex items-center justify-end gap-1">
                   2025 Shared Exp. <Wallet size={10} />
                </div>
                <div className="text-xl font-black text-emerald-200">{formatCurrency(calculated.expenseShare2025)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-[2rem] p-5 border-white/10">
          <div className="text-[9px] opacity-40 mb-1 uppercase font-black tracking-widest">2025 carry forward</div>
          <div className="text-xl font-black text-indigo-400">{formatCurrency(p2026.carryForward2025)}</div>
          <div className="text-[8px] mt-2 text-white/20 font-bold uppercase tracking-wider">Balance from 2025</div>
        </div>
        
        {/* Dynamic Balance Display */}
        <div className={`glass rounded-[2rem] p-5 border-white/10 transition-colors duration-500 ${isDebt ? 'bg-rose-500/5' : 'bg-emerald-500/5'}`}>
          <div className="text-[9px] opacity-40 mb-1 uppercase font-black tracking-widest flex items-center gap-1">
             {isSurplus ? 'Surplus Credit (Available)' : isDebt ? 'Amount Outstanding' : 'Balance Settled'}
             {isSurplus ? <TrendingUp size={10} /> : isDebt ? <TrendingDown size={10} /> : null}
          </div>
          <div className={`text-xl font-black ${isDebt ? 'text-rose-400' : 'text-cyan-400'}`}>
            {formatCurrency(Math.abs(calculated.currentBalance))}
          </div>
          <div className="text-[8px] mt-2 text-white/20 font-bold uppercase tracking-wider">
            {isSurplus ? 'Advance for Q2/Q3' : isDebt ? 'Q1 Payment Required' : 'Q1 Fully Paid'}
          </div>
        </div>
      </div>

      {/* Facility Status */}
      <div className="glass rounded-[2rem] p-6 border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-400"><Activity size={18} /></div>
          <h3 className="font-black text-xs uppercase tracking-widest text-white/50">Society Pulse</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Lifts', status: 'Online', icon: Zap, color: 'text-emerald-400' },
            { label: 'Water', status: 'Stable', icon: Droplets, color: 'text-sky-400' },
            { label: 'Security', status: 'Active', icon: Shield, color: 'text-indigo-400' },
          ].map((f, i) => (
            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center">
              <f.icon size={20} className={`mb-2 ${f.color}`} />
              <div className="text-[9px] font-black uppercase tracking-tighter text-white/40 mb-1">{f.label}</div>
              <div className="text-[10px] font-bold">{f.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History Grid */}
      <div className="glass rounded-[2.5rem] p-6 border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-[10px] uppercase tracking-[0.2em] text-white/30">Monthly Ledger</h2>
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
            {[2025, 2026].map(y => (
              <button 
                key={y}
                onClick={() => setSelectedYear(y as any)}
                className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all ${selectedYear === y ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'opacity-40 hover:opacity-100'}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {displayMonths.map((m, idx) => (
            <div key={idx} className="flex flex-col items-center group">
              <div className={`w-full aspect-square rounded-2xl flex items-center justify-center border-2 transition-all duration-300 mb-2 transform group-hover:scale-110 ${
                m.amount >= 2000 ? 'bg-emerald-500/20 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 
                m.amount > 0 ? 'tile-partial border-amber-300/40' : 'bg-white/5 border-white/10'
              }`}>
                {m.amount >= 2000 ? <CheckCircle2 size={16} className="text-emerald-400" /> : m.amount > 0 ? <Clock size={16} className="text-amber-300" /> : null}
              </div>
              <span className="text-[8px] font-black opacity-30 uppercase tracking-tighter">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
