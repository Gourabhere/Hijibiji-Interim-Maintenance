
import React, { useState } from 'react';
import {
  ArrowLeft, Wallet, Info, CheckCircle2, AlertCircle,
  Clock, Megaphone, Activity, PhoneCall, Zap, Droplets, Dumbbell,
  Shield, CreditCard, TrendingUp, TrendingDown, History, X
} from 'lucide-react';
import { DashboardData } from '../types';
import { formatCurrency } from '../utils';
import QrModal from './QrModal';

interface Props {
  data: DashboardData;
  onBack: () => void;
}

interface Tooltip {
  key: string;
  title: string;
  description: string;
}

interface MonthDetail {
  month: string;
  year: number;
  amount: number;
  status: 'paid' | 'partial' | 'pending';
  date?: string;
  mode?: string;
}

const tooltips: Record<string, Tooltip> = {
  carryForward: {
    key: 'carryForward',
    title: '2025 Carry Forward',
    description: 'Balance remaining from 2025 expenses. This credits towards 2026 payments.'
  },
  expenseShare: {
    key: 'expenseShare',
    title: '2025 Shared Expense',
    description: 'Your share of society maintenance (security, water, housekeeping) for Aug-Dec 2025.'
  },
  q1Status: {
    key: 'q1Status',
    title: 'Q1 2026 Maintenance',
    description: 'Status of Jan-Mar 2026 payments. Calculated from your carry forward + monthly contributions.'
  },
  currentBalance: {
    key: 'currentBalance',
    title: 'Current Balance',
    description: 'Positive = Credit available. Negative = Amount due. Based on all payments and expenses.'
  },
  lifetime: {
    key: 'lifetime',
    title: 'Lifetime Paid',
    description: 'Total maintenance paid since your flat took possession.'
  }
};

const OwnerDashboard: React.FC<Props> = ({ data, onBack }) => {
  const [selectedYear, setSelectedYear] = useState<2025 | 2026>(2026);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<MonthDetail | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const { owner, p2025, p2026, calculated } = data;

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
    { label: 'Aug', amount: p2025.aug },
    { label: 'Sep', amount: p2025.sept },
    { label: 'Oct', amount: p2025.oct },
    { label: 'Nov', amount: p2025.nov },
    { label: 'Dec', amount: p2025.dec },
  ];

  const displayMonths = selectedYear === 2026 ? months2026 : months2025;

  const getMonthStatus = (amount: number): 'paid' | 'partial' | 'pending' => {
    if (amount >= 2000) return 'paid';
    if (amount > 0) return 'partial';
    return 'pending';
  };

  const handleMonthClick = (month: { label: string; amount: number }) => {
    setSelectedMonth({
      month: month.label,
      year: selectedYear,
      amount: month.amount,
      status: getMonthStatus(month.amount),
      date: month.amount >= 2000 ? '12 ' + month.label + ' ' + selectedYear : undefined,
      mode: month.amount >= 2000 ? 'UPI' : undefined
    });
  };

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

  const isSurplus = calculated.currentBalance > 0;
  const isDebt = calculated.currentBalance < 0;

  // Calculate months covered
  const monthsCovered = displayMonths.filter(m => m.amount >= 2000).length;
  const totalMonths = displayMonths.filter(m => m.amount > 0 || selectedYear === 2026).length;
  const coveragePercent = totalMonths > 0 ? Math.round((monthsCovered / totalMonths) * 100) : 0;

  // Generate contextual notifications
  const getNotifications = () => {
    const notif = [];

    if (calculated.q1Status === 'Partial Covered' && selectedYear === 2026) {
      notif.push({
        type: 'warning',
        icon: '⚠',
        title: 'Partial Coverage',
        message: 'Your carry forward covers through February. March payment expected soon.'
      });
    } else if (isDebt && selectedYear === 2026) {
      notif.push({
        type: 'alert',
        icon: '!',
        title: 'Payment Due',
        message: `Outstanding amount: ${formatCurrency(Math.abs(calculated.currentBalance))}. Please settle at your earliest convenience.`
      });
    }

    if (isSurplus && selectedYear === 2026) {
      notif.push({
        type: 'info',
        icon: '→',
        title: 'Credit Balance',
        message: `You have a surplus of ${formatCurrency(Math.abs(calculated.currentBalance))} credited towards future months.`
      });
    }


    return notif;
  };

  const Tooltip = ({ id, children }: { id: string; children: React.ReactNode }) => {
    const tooltip = tooltips[id];
    if (!tooltip) return <>{children}</>;

    return (
      <div className="relative group">
        {children}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveTooltip(activeTooltip === id ? null : id);
          }}
          className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 transition-colors"
        >
          <Info size={12} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 pb-28 max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      {isQrModalOpen && <QrModal onClose={() => setIsQrModalOpen(false)} />}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 glass rounded-2xl hover:bg-white/10 transition-all neo-button">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">Flat {owner.flatNo}</h1>
          <p className="text-[10px] text-cyan-500 dark:text-cyan-400 uppercase font-black tracking-[0.2em]">{owner.name}</p>
        </div>
      </div>

      {/* Tooltip Display */}
      {activeTooltip && tooltips[activeTooltip] && (
        <div className="glass rounded-[1.5rem] p-4 border border-indigo-400/30 bg-indigo-500/10 animate-in slide-in-from-top-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-black text-indigo-300 mb-1">{tooltips[activeTooltip].title}</h4>
              <p className="text-xs text-white/70 leading-relaxed">{tooltips[activeTooltip].description}</p>
            </div>
            <button
              onClick={() => setActiveTooltip(null)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Contextual Notifications */}
      {getNotifications().map((notif, idx) => (
        <div
          key={idx}
          className={`rounded-[1.5rem] p-4 border animate-in slide-in-from-top-2 ${notif.type === 'success'
            ? 'glass border-emerald-400/30 bg-emerald-500/10'
            : notif.type === 'warning'
              ? 'glass border-amber-400/30 bg-amber-500/10'
              : notif.type === 'alert'
                ? 'glass border-rose-400/30 bg-rose-500/10'
                : 'glass border-cyan-400/30 bg-cyan-500/10'
            }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`text-xl font-black flex-shrink-0 ${notif.type === 'success'
                ? 'text-emerald-400'
                : notif.type === 'warning'
                  ? 'text-amber-400'
                  : notif.type === 'alert'
                    ? 'text-rose-400'
                    : 'text-cyan-400'
                }`}
            >
              {notif.icon}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className={`font-black text-sm mb-1 ${notif.type === 'success'
                ? 'text-emerald-300'
                : notif.type === 'warning'
                  ? 'text-amber-300'
                  : notif.type === 'alert'
                    ? 'text-rose-300'
                    : 'text-cyan-300'
                }`}>
                {notif.title}
              </h4>
              <p className="text-xs text-white/70">{notif.message}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Primary Status Widget */}
      <div className="grid grid-cols-1 gap-4">
        <div className={`rounded-[2.5rem] p-6 border-2 shadow-2xl relative overflow-hidden transition-all duration-500 ${getStatusStyles(calculated.q1Status)}`}>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            {getStatusIcon(calculated.q1Status)}
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-1 opacity-60 flex items-center gap-2">
              2026 Q1 Maintenance
              <Tooltip id="q1Status">
                <span></span>
              </Tooltip>
            </div>
            <div className="text-4xl font-black mb-6">{calculated.q1Status}</div>

            {['Due', 'Partial Paid'].includes(calculated.q1Status) && (
              <div className="mt-4 mb-6">
                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-black rounded-2xl transition-all neo-button flex items-center justify-center gap-2"
                >
                  <CreditCard size={16} />
                  Pay Now
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="text-[8px] font-black uppercase opacity-60 mb-1 flex items-center gap-1">
                  <History size={10} /> Lifetime Paid
                  <Tooltip id="lifetime">
                    <span></span>
                  </Tooltip>
                </div>
                <div className="text-xl font-black text-indigo-200">{formatCurrency(calculated.maintenancePaidTillDate)}</div>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md text-right">
                <div className="text-[8px] font-black uppercase opacity-60 mb-1 flex items-center justify-end gap-1">
                  2025 Shared Exp. <Wallet size={10} />
                  <Tooltip id="expenseShare">
                    <span></span>
                  </Tooltip>
                </div>
                <div className="text-xl font-black text-emerald-200">{formatCurrency(calculated.expenseShare2025)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-[2rem] p-5">
          <div className="text-[9px] text-white/50 mb-1 uppercase font-black tracking-widest flex items-center gap-1">
            2025 carry forward
            <Tooltip id="carryForward">
              <span></span>
            </Tooltip>
          </div>
          <div className="text-xl font-black text-indigo-500 dark:text-indigo-400">{formatCurrency(p2026.carryForward2025)}</div>
          <div className="text-[8px] mt-2 text-white/30 font-bold uppercase tracking-wider">Balance from 2025</div>
        </div>

        <div className={`glass rounded-[2rem] p-5 transition-colors duration-500 ${isDebt ? 'bg-rose-500/5' : 'bg-emerald-500/5'}`}>
          <div className="text-[9px] text-white/50 mb-1 uppercase font-black tracking-widest flex items-center gap-1">
            {isSurplus ? 'Surplus Credit' : isDebt ? 'Amount Outstanding' : 'Balance Settled'}
            {isSurplus ? <TrendingUp size={10} /> : isDebt ? <TrendingDown size={10} /> : null}
            <Tooltip id="currentBalance">
              <span></span>
            </Tooltip>
          </div>
          <div className={`text-xl font-black ${isDebt ? 'text-rose-500 dark:text-rose-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
            {formatCurrency(Math.abs(calculated.currentBalance))}
          </div>
          <div className="text-[8px] mt-2 text-white/30 font-bold uppercase tracking-wider">
            {isSurplus ? 'Advance for Q2/Q3' : isDebt ? 'Q1 Payment Required' : 'Q1 Fully Paid'}
          </div>
        </div>
      </div>

      {/* Coverage Progress */}
      {selectedYear === 2026 && (
        <div className="glass rounded-[2rem] p-5">
          <div className="text-[9px] text-white/50 mb-3 uppercase font-black tracking-widest">Coverage Progress</div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${coveragePercent}%` }}
                ></div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-cyan-400">{monthsCovered}/{totalMonths}</div>
              <div className="text-[8px] text-white/40">{coveragePercent}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Facility Status */}
      <div className="glass rounded-[2rem] p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-500/20 rounded-xl text-cyan-600 dark:text-cyan-400"><Activity size={18} /></div>
          <h3 className="font-black text-xs uppercase tracking-widest text-white/50">Society Pulse</h3>
          <span className="text-[8px] text-white/30 ml-auto">Updated now</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Lifts', status: 'Online', icon: Zap, color: 'text-emerald-500 dark:text-emerald-400' },
            { label: 'Water', status: 'Stable', icon: Droplets, color: 'text-sky-500 dark:text-sky-400' },
            { label: 'Security', status: 'Active', icon: Shield, color: 'text-indigo-500 dark:text-indigo-400' },
          ].map((f, i) => (
            <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/20 flex flex-col items-center text-center transition-all duration-300 cursor-pointer hover:bg-white/10">
              <f.icon size={20} className={`mb-2 ${f.color}`} />
              <div className="text-[9px] font-black uppercase tracking-tighter text-white/40 mb-1">{f.label}</div>
              <div className="text-[10px] font-bold text-white">{f.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History Grid */}
      <div className="glass rounded-[2.5rem] p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-[10px] uppercase tracking-[0.2em] text-white/30">Monthly Ledger</h2>
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 transition-colors duration-500">
            {[2025, 2026].map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y as any)}
                className={`px-5 py-2 rounded-lg text-[10px] font-black transition-all ${selectedYear === y ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-white/40 hover:text-white'}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {displayMonths.map((m, idx) => (
            <div key={idx} className="flex flex-col items-center group">
              <button
                onClick={() => handleMonthClick(m)}
                className={`w-full aspect-square rounded-2xl flex items-center justify-center border-2 transition-all duration-300 mb-2 transform hover:scale-110 cursor-pointer ${m.amount >= 2000 ? 'bg-emerald-500/20 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                  m.amount > 0 ? 'tile-partial border-amber-300/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
              >
                {m.amount >= 2000 ? <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" /> : m.amount > 0 ? <Clock size={16} className="text-amber-500 dark:text-amber-300" /> : null}
              </button>
              <span className="text-[8px] font-black text-white/30 uppercase tracking-tighter">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Month Detail Modal */}
      {selectedMonth && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end animate-in fade-in duration-200">
          <div className="w-full glass rounded-t-[2rem] p-6 border border-white/20 border-b-0 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black">{selectedMonth.month} {selectedMonth.year}</h3>
              <button
                onClick={() => setSelectedMonth(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-sm text-white/50 mb-2">Amount</div>
                <div className="text-2xl font-black text-cyan-400">{formatCurrency(selectedMonth.amount)}</div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-sm text-white/50 mb-2">Status</div>
                <div className={`text-lg font-black ${selectedMonth.status === 'paid' ? 'text-emerald-400' :
                  selectedMonth.status === 'partial' ? 'text-amber-400' :
                    'text-rose-400'
                  }`}>
                  {selectedMonth.status === 'paid' ? '✓ Paid' :
                    selectedMonth.status === 'partial' ? '⊙ Partial' :
                      '○ Not Paid'}
                </div>
              </div>

              {selectedMonth.date && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-sm text-white/50 mb-2">Payment Date</div>
                  <div className="text-lg font-bold">{selectedMonth.date}</div>
                </div>
              )}

              {selectedMonth.mode && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-sm text-white/50 mb-2">Mode</div>
                  <div className="text-lg font-bold">{selectedMonth.mode}</div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedMonth(null)}
              className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all neo-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
