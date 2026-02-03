import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Owner, Payment2025, Payment2026 } from '../types';
import { calculateSharedExp2025, getMonthlyExpenseBreakdown } from '../lib/utils';

interface Props {
  owners: Owner[];
  p25List: Payment2025[];
  p26List: Payment2026[];
  expenses2025?: Record<string, number>;
  expenseReport?: any[];
}

const DataDebugTable: React.FC<Props> = ({ owners, p25List, p26List, expenses2025, expenseReport }) => {
  const [expanded, setExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<'flatNo' | 'name'>('flatNo');

  // Calculate monthly rates for display
  const monthlyRates = getMonthlyExpenseBreakdown(expenses2025 || {}, expenseReport || []);

  const sortedOwners = [...owners].sort((a, b) => {
    if (sortBy === 'flatNo') return a.flatNo.localeCompare(b.flatNo);
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="w-full max-w-7xl">
      {/* Monthly Expense Rates Summary */}
      <div className="mb-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
        <h3 className="text-indigo-300 text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          Monthly Expense Rates (2025)
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(monthlyRates).map(([month, amount]) => (
            <div key={month} className="bg-black/20 p-3 rounded-lg border border-white/5">
              <div className="text-white/50 text-xs uppercase font-bold mb-1">{month}</div>
              <div className="text-white font-mono text-lg font-bold">₹{amount}</div>
            </div>
          ))}
        </div>
      </div>


      {/* Collapsed Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full mb-6 p-4 glass rounded-2xl border border-white/10 flex items-center justify-between hover:border-white/20 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white">📊 Data Debug Table</span>
          <span className="text-sm text-white/60">{owners.length} owners</span>
        </div>
        {expanded ? (
          <ChevronUp className="text-indigo-400" size={24} />
        ) : (
          <ChevronDown className="text-indigo-400" size={24} />
        )}
      </button>

      {/* Expanded Table */}
      {expanded && (
        <div className="w-full mb-6 glass rounded-2xl border border-white/10 p-4 overflow-x-auto">
          {/* Empty Data Warning */}
          {p25List.length === 0 && p26List.length === 0 && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <div className="text-red-400 font-bold text-sm">🚨 No Payment Data Available</div>
              <div className="text-red-300/80 text-xs mt-2">
                Both Collections_2025 and Collections_2026 tables appear to be empty in the Supabase database.
                <br />
                Please populate these tables with payment data to see amounts in this table.
              </div>
            </div>
          )}

          <div className="mb-4 flex gap-4 items-center">
            <label className="text-sm text-white/70 font-medium">Sort by:</label>
            <button
              onClick={() => setSortBy('flatNo')}
              className={`px-4 py-2 rounded-lg transition-all ${sortBy === 'flatNo'
                ? 'bg-indigo-500/50 border border-indigo-400 text-white'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
            >
              Flat No
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 rounded-lg transition-all ${sortBy === 'name'
                ? 'bg-indigo-500/50 border border-indigo-400 text-white'
                : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
            >
              Name
            </button>
          </div>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left p-2 text-indigo-300 font-bold">Flat No</th>
                <th className="text-left p-2 text-indigo-300 font-bold">Owner Name</th>
                <th className="text-right p-2 text-orange-300 font-bold">2025 Aug</th>
                <th className="text-right p-2 text-orange-300 font-bold">2025 Sep</th>
                <th className="text-right p-2 text-orange-300 font-bold">2025 Oct</th>
                <th className="text-right p-2 text-orange-300 font-bold">2025 Nov</th>
                <th className="text-right p-2 text-orange-300 font-bold">2025 Dec</th>
                <th className="text-right p-2 text-cyan-300 font-bold">2025 Paid</th>
                <th className="text-right p-2 text-red-300 font-bold">2025 Outst</th>
                <th className="text-right p-2 text-lime-300 font-bold">2025 Shared</th>
                <th className="text-right p-2 text-emerald-300 font-bold">Carry Fwd</th>
                <th className="text-right p-2 text-sky-300 font-bold">Q1 Pay</th>
                <th className="text-right p-2 text-sky-300 font-bold">2026 Jan</th>
                <th className="text-right p-2 text-sky-300 font-bold">2026 Feb</th>
                <th className="text-right p-2 text-sky-300 font-bold">2026 Mar</th>
                <th className="text-right p-2 text-sky-300 font-bold">2026 Paid</th>
                <th className="text-right p-2 text-red-300 font-bold">2026 Outst</th>
              </tr>
            </thead>
            <tbody>
              {sortedOwners.map((owner) => {
                const p25 = p25List.find(p => p.flatNo === owner.flatNo);
                const p26 = p26List.find(p => p.flatNo === owner.flatNo);
                const sharedExp2025 = p25?.sharedExp2025 || 0;

                const isNaN25 = !p25 || (isNaN(p25.aug) && isNaN(p25.sept) && isNaN(p25.oct));
                const isNaN26 = !p26 || (isNaN(p26.jan) && isNaN(p26.feb) && isNaN(p26.mar));
                const rowClass = isNaN25 || isNaN26 ? 'bg-red-500/10' : 'hover:bg-white/5';

                return (
                  <tr key={owner.flatNo} className={`border-b border-white/10 ${rowClass} transition-colors`}>
                    <td className="p-2 text-white font-bold">{owner.flatNo}</td>
                    <td className="p-2 text-white/80">{owner.name}</td>
                    <td className="p-2 text-right text-orange-300">{p25?.aug ?? 'N/A'}</td>
                    <td className="p-2 text-right text-orange-300">{p25?.sept ?? 'N/A'}</td>
                    <td className="p-2 text-right text-orange-300">{p25?.oct ?? 'N/A'}</td>
                    <td className="p-2 text-right text-orange-300">{p25?.nov ?? 'N/A'}</td>
                    <td className="p-2 text-right text-orange-300">{p25?.dec ?? 'N/A'}</td>
                    <td className="p-2 text-right text-cyan-300">{p25?.paidTillDate ?? 'N/A'}</td>
                    <td className="p-2 text-right text-red-300">{p25?.outstanding ?? 'N/A'}</td>
                    <td className="p-2 text-right text-lime-300 font-bold">{sharedExp2025}</td>
                    <td className="p-2 text-right text-emerald-300">{p26?.carryForward2025 ?? 'N/A'}</td>
                    <td className="p-2 text-right text-sky-300">{p26?.q1Payment ?? 'N/A'}</td>
                    <td className="p-2 text-right text-sky-300">{p26?.jan ?? 'N/A'}</td>
                    <td className="p-2 text-right text-sky-300">{p26?.feb ?? 'N/A'}</td>
                    <td className="p-2 text-right text-sky-300">{p26?.mar ?? 'N/A'}</td>
                    <td className="p-2 text-right text-sky-300">{p26?.paidTillDate ?? 'N/A'}</td>
                    <td className="p-2 text-right text-red-300">{p26?.outstanding ?? 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Summary Stats */}
          <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-4 gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <div className="text-emerald-400 text-xs font-bold">Total Owners</div>
              <div className="text-emerald-200 text-xl font-black">{owners.length}</div>
            </div>
            <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
              <div className="text-orange-400 text-xs font-bold">P25 Records</div>
              <div className="text-orange-200 text-xl font-black">{p25List.length}</div>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-lg border border-sky-500/30">
              <div className="text-sky-400 text-xs font-bold">P26 Records</div>
              <div className="text-sky-200 text-xl font-black">{p26List.length}</div>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="text-red-400 text-xs font-bold">NaN Issues</div>
              <div className="text-red-200 text-xl font-black">
                {sortedOwners.filter(owner => {
                  const p25 = p25List.find(p => p.flatNo === owner.flatNo);
                  const p26 = p26List.find(p => p.flatNo === owner.flatNo);
                  return !p25 || !p26 || (isNaN(p25.aug) && isNaN(p25.sept)) || (isNaN(p26.jan) && isNaN(p26.feb));
                }).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataDebugTable;
