
import React, { useState } from 'react';
import {
  Users, TrendingUp, LogOut,
  Search, FileText, LayoutDashboard, Database,
  Shield, RefreshCw, Sparkles, Link as LinkIcon,
  ArrowUpRight, Clock, CheckCircle, AlertCircle,
  Info, CloudUpload, Menu, X
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";
import { Owner, Payment2025, Payment2026 } from '../types';
import { formatCurrency } from '../utils';
import { upsertOwners, upsertPayments2026, upsertPayments2025, fetchAllData } from '../lib/supabase';
import BalanceSheet from './BalanceSheet';
import DataDebugTable from './DataDebugTable';
import EditPaymentModal from './EditPaymentModal';
import NeumorphicToggle from './NeumorphicToggle';

interface Props {
  owners: Owner[];
  p25: Payment2025[];
  p26: Payment2026[];
  setOwners: React.Dispatch<React.SetStateAction<Owner[]>>;
  setP25: React.Dispatch<React.SetStateAction<Payment2025[]>>;
  setP26: React.Dispatch<React.SetStateAction<Payment2026[]>>;
  expenses2025?: Record<string, number>;
  expenseReport?: any[];
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: (isDark: boolean) => void;
}

const AdminDashboard: React.FC<Props> = ({
  owners, p25, p26, setOwners, setP25, setP26, expenses2025, expenseReport, onLogout, isDarkMode, onToggleTheme
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'owners' | 'sync' | 'ai' | 'debug'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPersisting, setIsPersisting] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const totalCollected25 = p25.reduce((acc, curr) => acc + curr.paidTillDate, 0);
  const totalOutstanding25 = p25.reduce((acc, curr) => acc + (curr.outstanding || 0), 0);
  const totalCollected26 = p26.reduce((acc, curr) => acc + curr.paidTillDate, 0);

  const totalPossible25 = totalCollected25 + totalOutstanding25;
  const collectionRate = totalPossible25 > 0 ? (totalCollected25 / totalPossible25 * 100).toFixed(1) : "0.0";

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      const csvUrl = sheetUrl.replace('/pubhtml', '/pub?output=csv');
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error("Failed to fetch Google Sheet");
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 5000);
    } catch (err) {
      console.error("Sync Error:", err);
      alert("Error syncing data. Please ensure the Google Sheet is published to web.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePersistToCloud = async () => {
    setIsPersisting(true);
    try {
      const mappedOwners = owners.map(o => ({
        flat_no: o.flatNo,
        name: o.name,
        possession_date: o.possessionDate,
        sn: o.sn
      }));
      const mappedP26 = p26.map(p => ({
        flat_no: p.flatNo,
        carry_forward_2025: p.carryForward2025,
        q1_payment: p.q1Payment,
        jan: p.jan, feb: p.feb, mar: p.mar,
        apr: p.apr, may: p.may, jun: p.jun,
        jul: p.jul, aug: p.aug, sep: p.sep,
        oct: p.oct, nov: p.nov, dec: p.dec,
        paid_till_date: p.paidTillDate,
        outstanding: p.outstanding
      }));
      await upsertOwners(mappedOwners);
      await upsertPayments2026(mappedP26);
      alert("Cloud database successfully updated!");
    } catch (err) {
      console.error("Persistence error:", err);
      alert("Cloud persistence failed. Check your Supabase configuration.");
    } finally {
      setIsPersisting(false);
    }
  };

  const generateInsight = async () => {
    setIsGeneratingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analyze: Total Units ${owners.length}, Collection Rate ${collectionRate}%. Suggest one step to increase 2026 collection efficiency.`;
      const res = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      setAiInsight(res.text || "");
    } catch (err) { setAiInsight("Error generating insight."); }
    finally { setIsGeneratingAi(false); }
  };

  const handleEditPayment = async (p25Data: Payment2025, p26Data: Payment2026) => {
    try {
      await upsertPayments2025([p25Data]);
      await upsertPayments2026([p26Data]);

      // Refresh data from Supabase
      const newData = await fetchAllData();
      setOwners(newData.owners);
      setP25(newData.p25);
      setP26(newData.p26);

      setShowEditModal(false);
      setEditingOwner(null);
    } catch (err) {
      console.error('Payment update failed:', err);
      alert('Failed to update payment. Please try again.');
    }
  };

  const getFilteredOwners = () => {
    if (!searchTerm.trim()) return owners;

    const term = searchTerm.toLowerCase().trim();
    // Normalize string to remove spaces and special chars for fuzzy matching
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const termNorm = normalize(term);

    return owners.filter(o => {
      const flat = o.flatNo.toLowerCase();
      const name = o.name.toLowerCase();
      const possession = o.possessionDate ? o.possessionDate.toLowerCase() : '';

      // 1. Direct Inclusion (Fastest)
      if (flat.includes(term) || name.includes(term) || possession.includes(term)) return true;

      // 2. Normalized Inclusion (Handles "1 B 3" matching "1B3")
      const flatNorm = normalize(o.flatNo);
      const nameNorm = normalize(o.name);
      if (flatNorm.includes(termNorm) || nameNorm.includes(termNorm)) return true;

      // 3. Token Based Matching (Handles "Suman A" matching "Sumanta Adhikary")
      const tokens = term.split(/\s+/).filter(t => t.length > 0);
      if (tokens.length > 0) {
        const targetText = `${flat} ${name} ${possession}`;
        // All tokens must be present in the target text
        const allTokensMatch = tokens.every(token => targetText.includes(token));
        if (allTokensMatch) return true;
      }

      return false;
    });
  };

  const filteredOwners = getFilteredOwners();

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="hidden lg:fixed lg:block top-6 left-6 z-50 p-3 rounded-2xl hover:bg-white/5 transition-all neo-button"
        title={isSidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
      >
        {isSidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
      </button>

      <aside className={`w-full lg:space-y-6 transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-24' : 'lg:w-80'}`}>
        <nav className="space-y-2">
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'owners', label: 'Residents', icon: Users },
            { id: 'sync', label: 'Sync Center', icon: Database },
            { id: 'ai', label: 'AI Intelligence', icon: Sparkles },
            { id: 'debug', label: 'Data Debug', icon: FileText },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-4'} px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === item.id
                ? 'bg-transparent text-indigo-600 dark:text-indigo-400 shadow-neo-pressed'
                : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-white/5 neo-button'
                }`}
              title={isSidebarCollapsed ? item.label : ''}
            >
              <item.icon size={20} />
              {!isSidebarCollapsed && item.label}
            </button>
          ))}
        </nav>
        <div className={`mt-12 pt-8 border-t border-white/5 ${isSidebarCollapsed ? 'flex flex-col items-center gap-4' : 'space-y-4'}`}>
          <div className={`${isSidebarCollapsed ? '' : 'px-6'}`}>
            <NeumorphicToggle isChecked={isDarkMode} onChange={onToggleTheme} />
          </div>
          <button
            onClick={onLogout}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center p-4' : 'gap-4 px-6 py-4 w-full'} text-[11px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-300 hover:bg-rose-400/10 rounded-2xl transition-all neo-button`}
            title={isSidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && 'Logout'}
          </button>
        </div>
      </aside>

      <main className="flex-1 space-y-8 min-w-0 lg:pl-20">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="rounded-[3rem] p-10 border border-white/5 relative overflow-hidden group shadow-neo-flat">
              <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform">
                <TrendingUp size={160} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <h2 className="text-4xl font-black mb-2 tracking-tighter">{collectionRate} %</h2>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-white/50 flex items-center gap-2">
                      Total Collection Rate 2025
                      <span className="inline-flex items-center gap-1 ml-2 px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] shadow-neo-sm">
                        <ArrowUpRight size={12} /> +4.2% vs Jan
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(totalCollected25)}</div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">Current Liquidity</p>
                  </div>
                </div>
                <div className="h-3 w-full bg-black/20 neo-inset rounded-full overflow-hidden flex">
                  <div className="h-full bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.4)]" style={{ width: `${collectionRate}%` }}></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-[2.5rem] p-8 border border-white/5 shadow-neo-flat">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/30 mb-8 flex items-center gap-2">
                  <Users size={16} /> Unit Breakdown
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-white/80">Total Registered</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{owners.length}</span>
                </div>
                <div className="text-[9px] text-slate-600 dark:text-white/60 mt-3">
                  ✓ {owners.filter(o => o.possessionDate !== 'TBD').length} Occupied
                </div>
              </div>
              <div className="rounded-[2.5rem] p-8 border border-white/5 shadow-neo-flat">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-white/50 mb-8 flex items-center gap-2">
                  <RefreshCw size={16} /> Maintenance Pulse
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-white/80">Q1 2026 Collection</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{formatCurrency(totalCollected26)}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg text-[9px] shadow-neo-sm">
                      <ArrowUpRight size={12} /> +8.5%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="p-12 rounded-[3rem] border border-white/5 shadow-neo-flat animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-neo-sm">
                <Database size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sync Hub</h2>
                <p className="text-slate-600 dark:text-white/60 text-sm">Update application data from Google Sheets</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-white/50 ml-1">Spreadsheet Public URL</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="flex-1 h-14 bg-black/20 neo-inset border border-white/5 rounded-2xl px-6 outline-none focus:ring-2 ring-indigo-500/50 transition-all text-sm font-medium text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="h-14 px-8 bg-indigo-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-50 neo-button shadow-lg"
                  >
                    {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                    Sync Data
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/30 flex items-center gap-2">
                  <CloudUpload size={14} /> Cloud Persistence
                </div>
                <button
                  onClick={handlePersistToCloud}
                  disabled={isPersisting}
                  className="w-full h-14 bg-emerald-600/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 neo-button shadow-neo-sm"
                >
                  {isPersisting ? <RefreshCw className="animate-spin" size={16} /> : <CloudUpload size={16} />}
                  {isPersisting ? 'Committing Changes...' : 'Persist to Supabase Cloud'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="p-12 rounded-[4rem] border border-indigo-500/20 shadow-neo-flat animate-in zoom-in-95 duration-700 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/5 blur-[120px] rounded-full"></div>
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto relative z-10">
              <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-600/50 mb-8 transform -rotate-6 text-white neo-button">
                <Sparkles size={48} />
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tight text-slate-900 dark:text-white">Gemini AI Strategist</h2>
              {aiInsight ? (
                <div className="w-full p-8 bg-white/5 border border-white/5 rounded-[2.5rem] text-left neo-inset text-slate-900 dark:text-white">
                  <p className="text-xl font-medium italic text-indigo-800 dark:text-indigo-100/90 leading-relaxed">"{aiInsight}"</p>
                </div>
              ) : (
                <button
                  onClick={generateInsight}
                  disabled={isGeneratingAi}
                  className="px-12 py-5 bg-indigo-600 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 flex items-center gap-3 neo-button text-white"
                >
                  {isGeneratingAi ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                  {isGeneratingAi ? 'Analyzing...' : 'Generate Strategic Assessment'}
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'owners' && (
          <div className="rounded-[3rem] overflow-hidden border border-white/5 shadow-neo-flat animate-in slide-in-from-right-4 duration-700">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 dark:text-white/40">Unit Registry</h3>
              <div className="relative w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search name, flat, or date..."
                  className="w-full bg-black/20 neo-inset border border-white/5 text-xs font-bold rounded-xl pl-12 py-3 outline-none focus:ring-2 ring-indigo-500/30 transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/30 border-b border-white/5">
                    <th className="px-10 py-6">Flat Unit</th>
                    <th className="px-10 py-6">Owner Identity</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOwners.map(o => (
                    <tr key={o.flatNo} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-10 py-6 font-black text-indigo-600 dark:text-indigo-400 text-base">{o.flatNo}</td>
                      <td className="px-10 py-6 font-bold text-slate-700 dark:text-white/80">{o.name}</td>
                      <td className="px-10 py-6 text-right">
                        <button
                          onClick={() => {
                            const ownerP25 = p25.find(p => p.flatNo === o.flatNo);
                            const ownerP26 = p26.find(p => p.flatNo === o.flatNo);
                            if (ownerP25 && ownerP26) {
                              setEditingOwner(o);
                              setShowEditModal(true);
                            }
                          }}
                          className="p-2.5 rounded-xl text-slate-400 dark:text-white/20 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-all neo-button"
                        >
                          <ArrowUpRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOwners.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-10 py-8 text-center text-slate-400 dark:text-white/30 text-sm font-medium">
                        No matching records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'debug' && (
          <div className="rounded-[3rem] overflow-hidden border border-white/5 shadow-neo-flat animate-in slide-in-from-right-4 duration-700 p-8">
            <h3 className="font-black text-xs uppercase tracking-widest text-slate-500 dark:text-white/40 mb-6">Data Debug & Inspection</h3>
            <DataDebugTable owners={owners} p25List={p25} p26List={p26} expenses2025={expenses2025} expenseReport={expenseReport} />
          </div>
        )}
      </main>

      <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 glass rounded-[2rem] flex items-center justify-around px-4 z-50 shadow-2xl border-white/20">
        {[
          { id: 'overview', icon: LayoutDashboard },
          { id: 'owners', icon: Users },
          { id: 'sync', icon: Database },
          { id: 'ai', icon: Sparkles },
          { id: 'debug', icon: FileText },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 shadow-xl scale-110' : 'opacity-40'}`}
          >
            <item.icon size={22} className="text-slate-200 dark:text-white" />
          </button>
        ))}
      </nav>

      {editingOwner && (
        <EditPaymentModal
          isOpen={showEditModal}
          owner={editingOwner}
          p25={p25.find(p => p.flatNo === editingOwner.flatNo) || null}
          p26={p26.find(p => p.flatNo === editingOwner.flatNo) || null}
          onClose={() => {
            setShowEditModal(false);
            setEditingOwner(null);
          }}
          onSave={handleEditPayment}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
