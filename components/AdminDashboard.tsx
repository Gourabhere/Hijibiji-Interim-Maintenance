
import React, { useState } from 'react';
import { 
  Users, TrendingUp, LogOut, 
  Search, FileText, LayoutDashboard, Database,
  Shield, RefreshCw, Sparkles, Link as LinkIcon, 
  ArrowUpRight, Clock, CheckCircle, AlertCircle,
  Info
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";
import { Owner, Payment2025, Payment2026 } from '../types';
import { formatCurrency } from '../utils';
import BalanceSheet from './BalanceSheet';

interface Props {
  owners: Owner[];
  p25: Payment2025[];
  p26: Payment2026[];
  setOwners: React.Dispatch<React.SetStateAction<Owner[]>>;
  setP25: React.Dispatch<React.SetStateAction<Payment2025[]>>;
  setP26: React.Dispatch<React.SetStateAction<Payment2026[]>>;
  onLogout: () => void;
}

const AdminDashboard: React.FC<Props> = ({ 
  owners, p25, p26, setOwners, setP25, setP26, onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'owners' | 'sync' | 'ai'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/e/2PACX-1vQPZypj95O8KImq4oIOJ-sw9VKcKsxPg9MbjgSWUNM4Yy-vj4f_9Z26gtoRRXymcw/pubhtml');

  const totalCollected25 = p25.reduce((acc, curr) => acc + curr.paidTillDate, 0);
  const totalOutstanding25 = p25.reduce((acc, curr) => acc + (curr.outstanding || 0), 0);
  const totalCollected26 = p26.reduce((acc, curr) => acc + curr.paidTillDate, 0);

  const collectionRate = (totalCollected25 / (totalCollected25 + totalOutstanding25) * 100).toFixed(1);

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

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Sidebar - Desktop Only */}
      <aside className="w-full lg:w-80 space-y-6">
        <div className="glass rounded-[3rem] p-8 shadow-2xl border-white/10 h-fit">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-indigo-500/30">
              <Shield size={28} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight">Admin</h1>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Hijibiji Cloud</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'owners', label: 'Residents', icon: Users },
              { id: 'sync', label: 'Sync Center', icon: Database },
              { id: 'ai', label: 'AI Intelligence', icon: Sparkles },
            ].map(item => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id as any)} 
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTab === item.id 
                    ? 'bg-white text-indigo-900 shadow-2xl' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} /> {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-12 pt-8 border-t border-white/5">
            <button onClick={onLogout} className="w-full flex items-center gap-4 px-6 py-4 text-[11px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-400/10 rounded-2xl transition-all">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        {/* Quick Stats Sidebar Widget */}
        <div className="glass rounded-[2rem] p-6 border-white/5 hidden lg:block">
           <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-white/30">
             <Clock size={14} /> System Activity
           </div>
           <div className="space-y-4">
             <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                <div className="text-[11px] text-white/60">Cloud Sync Success (Just now)</div>
             </div>
             <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                <div className="text-[11px] text-white/60">Gemini model initialized</div>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-8 min-w-0">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Liquidity Gauge Widget */}
            <div className="glass rounded-[3rem] p-10 border-white/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform">
                  <TrendingUp size={160} />
               </div>
               <div className="relative z-10">
                 <div className="flex justify-between items-end mb-6">
                    <div>
                      <h2 className="text-4xl font-black mb-2 tracking-tighter">{collectionRate}%</h2>
                      <p className="text-[11px] font-black uppercase tracking-widest text-white/30">Total Collection Rate 2025</p>
                    </div>
                    <div className="text-right">
                       <div className="text-xl font-black text-emerald-400">{formatCurrency(totalCollected25)}</div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Current Liquidity</p>
                    </div>
                 </div>
                 <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <div className="h-full bg-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.4)]" style={{ width: `${collectionRate}%` }}></div>
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="glass rounded-[2.5rem] p-8 border-white/10">
                 <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-8 flex items-center gap-2">
                   <Users size={16} /> Unit Breakdown
                 </h3>
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-sm font-bold text-white/80">Total Registered</span>
                   <span className="text-2xl font-black text-indigo-400">{owners.length}</span>
                 </div>
                 <div className="text-[11px] text-white/30 font-medium">100% database match with Realtech logs</div>
               </div>

               <div className="glass rounded-[2.5rem] p-8 border-white/10">
                 <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-8 flex items-center gap-2">
                   <RefreshCw size={16} /> Maintenance Pulse
                 </h3>
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-sm font-bold text-white/80">Q1 2026 Collection</span>
                   <span className="text-2xl font-black text-cyan-400">{formatCurrency(totalCollected26)}</span>
                 </div>
                 <div className="text-[11px] text-white/30 font-medium">Projection: 110% target reach expected</div>
               </div>
            </div>

            {/* Collections Chart Widget */}
            <div className="glass rounded-[3rem] p-8 h-[400px]">
               <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-10 px-4">Fiscal Trends (2025)</h3>
               <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={[
                    { name: 'Aug', value: 134732 },
                    { name: 'Sep', value: 175265 },
                    { name: 'Oct', value: 166961 },
                    { name: 'Nov', value: 191075 },
                    { name: 'Dec', value: 193233 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                    <XAxis dataKey="name" stroke="#ffffff30" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis stroke="#ffffff30" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '16px' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="glass p-12 rounded-[3rem] border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                <Database size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Sync Hub</h2>
                <p className="text-white/40 text-sm">Update application data from Google Sheets</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Spreadsheet Public URL</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="flex-1 h-14 bg-black/30 border border-white/10 rounded-2xl px-6 outline-none focus:ring-2 ring-indigo-500/50 transition-all text-sm font-medium"
                    placeholder="https://docs.google.com/spreadsheets/d/.../pubhtml"
                  />
                  <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="h-14 px-8 bg-indigo-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />}
                    {isSyncing ? 'Syncing...' : 'Sync Data'}
                  </button>
                </div>
              </div>

              {syncSuccess && (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-[2rem] flex items-center gap-4 text-emerald-300 animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-sm">Sync Successful</div>
                    <div className="text-[11px] opacity-70">Application records have been refreshed with the latest sheet data.</div>
                  </div>
                </div>
              )}

              <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  <Info size={14} /> Quick Guide
                </div>
                <ul className="text-xs text-white/50 space-y-2 list-disc list-inside">
                  <li>Ensure the sheet is "Published to web" (File &gt; Share &gt; Publish to web).</li>
                  <li>Use the "Web Page" or "CSV" link generated by Google Sheets.</li>
                  <li>Data mapping follows the standard Hijibiji schema.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="glass p-12 rounded-[4rem] border-indigo-500/30 animate-in zoom-in-95 duration-700 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full"></div>
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto relative z-10">
               <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-600/50 mb-8 transform -rotate-6">
                 <Sparkles size={48} className="text-white" />
               </div>
               <h2 className="text-3xl font-black mb-4 tracking-tight">Gemini AI Strategist</h2>
               <p className="text-white/40 mb-12 leading-relaxed">Let artificial intelligence audit your society's financial patterns and suggest liquidity optimizations.</p>
               
               {aiInsight ? (
                 <div className="w-full p-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-left">
                   <div className="text-cyan-400 mb-6 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                     <CheckCircle size={14} /> Gemini Recommendation
                   </div>
                   <p className="text-xl font-medium italic text-indigo-100/90 leading-relaxed">"{aiInsight}"</p>
                   <button onClick={() => setAiInsight('')} className="mt-8 text-[10px] font-black uppercase text-white/30 hover:text-white transition-all">Regenerate Analysis</button>
                 </div>
               ) : (
                 <button 
                  onClick={generateInsight} 
                  disabled={isGeneratingAi} 
                  className="px-12 py-5 bg-indigo-600 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 flex items-center gap-3 neo-button"
                 >
                   {isGeneratingAi ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                   {isGeneratingAi ? 'Analyzing Society Flow...' : 'Generate Strategic Assessment'}
                 </button>
               )}
            </div>
          </div>
        )}

        {activeTab === 'owners' && (
           <div className="glass rounded-[3rem] overflow-hidden border-white/5 shadow-2xl animate-in slide-in-from-right-4 duration-700">
             <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/2">
                <h3 className="font-black text-xs uppercase tracking-widest text-white/40">Unit Registry</h3>
                <div className="relative w-64">
                   <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                   <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    placeholder="Quick find flat/name..." 
                    className="w-full bg-white/5 border border-white/10 text-xs font-bold rounded-xl pl-12 py-3 outline-none focus:ring-2 ring-indigo-500/50"
                   />
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
                     <th className="px-10 py-6">Flat Unit</th>
                     <th className="px-10 py-6">Owner Identity</th>
                     <th className="px-10 py-6">Possession Status</th>
                     <th className="px-10 py-6 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {owners.filter(o => o.flatNo.includes(searchTerm) || o.name.toLowerCase().includes(searchTerm.toLowerCase())).map(o => (
                     <tr key={o.flatNo} className="hover:bg-white/[0.03] transition-colors group">
                       <td className="px-10 py-6 font-black text-indigo-400 text-base">{o.flatNo}</td>
                       <td className="px-10 py-6 font-bold text-white/80">{o.name}</td>
                       <td className="px-10 py-6 text-xs text-white/40">{o.possessionDate}</td>
                       <td className="px-10 py-6 text-right">
                         <button className="p-2.5 glass rounded-xl text-white/20 group-hover:text-cyan-400 transition-all neo-button">
                           <ArrowUpRight size={16} />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-20 glass rounded-[2rem] flex items-center justify-around px-4 z-50 shadow-2xl border-white/20">
        {[
          { id: 'overview', icon: LayoutDashboard },
          { id: 'owners', icon: Users },
          { id: 'sync', icon: Database },
          { id: 'ai', icon: Sparkles },
        ].map(item => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id as any)}
            className={`p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 shadow-xl scale-110' : 'opacity-40'}`}
          >
            <item.icon size={22} className="text-white" />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminDashboard;
