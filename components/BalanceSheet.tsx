
import React from 'react';
import { formatCurrency } from '../utils';
import { totalCollections2025, societyExpenses2025 } from '../data';
import { TrendingUp, AlertTriangle, ArrowRightCircle } from 'lucide-react';

const BalanceSheet: React.FC = () => {
  const surplus = totalCollections2025.total - 507294; // Total expenses from logs

  const monthlyData = [
    { m: 'Aug', c: 134732, e: 64729 },
    { m: 'Sep', c: 175265, e: 105447 },
    { m: 'Oct', c: 166961, e: 100961 },
    { m: 'Nov', c: 191075, e: 115975 },
    { m: 'Dec', c: 193233, e: 120182 },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold">2025 Balance Sheet</h2>
          <p className="text-white/60">Society Accounting Details (Aug - Dec)</p>
        </div>
        <div className="flex gap-2">
          <span className="px-4 py-1.5 glass rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300">Audited</span>
          <span className="px-4 py-1.5 glass rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">FY 2025-26</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 rounded-3xl shadow-lg">
          <div className="text-white/70 text-xs uppercase font-bold mb-1 tracking-wider">Total Surplus</div>
          <div className="text-3xl font-bold text-white mb-2">{formatCurrency(surplus)}</div>
          <div className="text-xs text-emerald-100 flex items-center gap-1">
            <TrendingUp size={14} />
            Excess collected over expenses
          </div>
        </div>
        
        <div className="glass p-6 rounded-3xl border-white/10">
          <div className="text-white/40 text-xs uppercase font-bold mb-1 tracking-wider">Total Collections</div>
          <div className="text-2xl font-bold text-white mb-1">{formatCurrency(totalCollections2025.total)}</div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-white/50">Owners</span>
              <span className="text-emerald-400 font-bold">{formatCurrency(totalCollections2025.owners)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-white/50">Realtech</span>
              <span className="text-sky-400 font-bold">{formatCurrency(totalCollections2025.realtech)}</span>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border-white/10">
          <div className="text-white/40 text-xs uppercase font-bold mb-1 tracking-wider">Total Expenses</div>
          <div className="text-2xl font-bold text-rose-400 mb-1">{formatCurrency(507294)}</div>
          <div className="text-[10px] text-white/50 uppercase font-bold">5 Major Categories</div>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden mb-10">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-bold">Monthly Operating Cashflow</h3>
            <ArrowRightCircle className="text-indigo-400 opacity-50" size={20} />
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-white/40 border-b border-white/10 text-xs">
              <th className="px-6 py-4 font-bold uppercase">Month</th>
              <th className="px-6 py-4 font-bold uppercase">Collected</th>
              <th className="px-6 py-4 font-bold uppercase">Expense</th>
              <th className="px-6 py-4 font-bold uppercase">Net Surplus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {monthlyData.map((row, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-bold">{row.m}-25</td>
                <td className="px-6 py-4 text-emerald-400 font-medium">{formatCurrency(row.c)}</td>
                <td className="px-6 py-4 text-rose-400 font-medium">{formatCurrency(row.e)}</td>
                <td className="px-6 py-4">
                   <span className="px-3 py-1 bg-white/5 rounded-lg text-sm font-bold text-white/80">
                    {formatCurrency(row.c - row.e)}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex gap-4 items-start">
        <AlertTriangle className="text-amber-500 shrink-0" size={24} />
        <div className="text-sm leading-relaxed text-amber-200/80">
          <strong>Accounting Note:</strong> The 2025 surplus is carried forward to the 2026 operating budget. 
          Individual owner carry-forward amounts are adjusted in the first and second quarters of 2026 maintenance.
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
