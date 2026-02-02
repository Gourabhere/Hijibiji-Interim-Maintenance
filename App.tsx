
import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, Shield, User, Info, ArrowRight, X, RefreshCw, Sun, Moon, Cloud, Users, CheckCircle, TrendingUp } from 'lucide-react';
import { 
  owners as initialOwners, 
  payments2025 as initialP25, 
  payments2026 as initialP26 
} from './data';
import { Owner, DashboardData, Payment2025, Payment2026 } from './types';
import { MONTHLY_EXPENSES_2025, Q1_DUE_AMOUNT } from './constants';
import { fetchAllData, testConnection, debugInfo } from './lib/supabase';
import OwnerDashboard from './components/OwnerDashboard';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import DataDebugTable from './components/DataDebugTable';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'owner' | 'admin_login' | 'admin'>('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Owner[]>([]);
  const [selectedOwnerData, setSelectedOwnerData] = useState<DashboardData | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudLive, setIsCloudLive] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [diagnostics, setDiagnostics] = useState<string>('');
  const searchRef = useRef<HTMLDivElement>(null);

  // App Data State
  const [owners, setOwners] = useState<Owner[]>(initialOwners);
  const [p25List, setP25List] = useState<Payment2025[]>(initialP25);
  const [p26List, setP26List] = useState<Payment2026[]>(initialP26);

  // Theme Sync helper
  const applyTheme = (t: 'dark' | 'light') => {
    if (t === 'light') {
      document.body.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.body.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  };

  // Initial Theme Sync
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    
    const initialTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      let diagLog = '🚀 App initializing...\n';
      
      try {
        // Test connection
        diagLog += '🧪 Testing Supabase...\n';
        const isConnected = await testConnection();
        
        if (!isConnected) {
          diagLog += '❌ Connection failed - using fallback\n';
          setDiagnostics(diagLog);
          setIsLoading(false);
          return;
        }
        
        diagLog += '✅ Connection OK\n';
        diagLog += '📥 Fetching data...\n';
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Fetch timeout')), 4000)
        );

        const cloudData = await Promise.race([fetchAllData(), timeoutPromise]) as any;
        
        if (cloudData && cloudData.owners?.length > 0) {
          setOwners(cloudData.owners);
          setP25List(cloudData.p25 || []);
          setP26List(cloudData.p26 || []);
          setIsCloudLive(true);
          diagLog += `✅ Loaded ${cloudData.owners.length} units\n`;
          diagLog += `📊 P25 payments: ${cloudData.p25?.length || 0} records\n`;
          diagLog += `📊 P26 payments: ${cloudData.p26?.length || 0} records\n`;
          
          // Warn if payment tables are empty
          if (!cloudData.p25 || cloudData.p25.length === 0) {
            diagLog += `⚠️ WARNING: Collections_2025 table is EMPTY!\n`;
          }
          if (!cloudData.p26 || cloudData.p26.length === 0) {
            diagLog += `⚠️ WARNING: Collections_2026 table is EMPTY!\n`;
          }
          
          console.log('✅ Successfully loaded data from Supabase');
        } else {
          diagLog += '⚠️ No data from cloud - using fallback\n';
          console.log('⚠️ Cloud data empty or unavailable, using built-in registry');
        }
      } catch (err: any) {
        diagLog += `❌ Error: ${err?.message || 'Unknown'}\n`;
        console.warn('⚠️ Cloud connection issue:', err);
      } finally {
        setDiagnostics(diagLog);
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length > 0) {
      // Filter based on search query
      const results = owners.filter(o => 
        o.flatNo.toLowerCase().includes(query) || 
        o.name.toLowerCase().includes(query)
      );
      setSearchResults(results);
    } else if (isSearchFocused) {
      // When focused without query, show all units
      setSearchResults(owners);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, owners, isSearchFocused]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculateSharedExp2025 = (p25: Payment2025) => {
    // Determine which month they started paying
    const monthlyPayments = {
      aug: p25.aug,
      sept: p25.sept,
      oct: p25.oct,
      nov: p25.nov,
      dec: p25.dec
    };

    const monthOrder = ['aug', 'sept', 'oct', 'nov', 'dec'] as const;
    
    // Find first month with non-zero payment
    const startMonth = monthOrder.find(month => monthlyPayments[month] > 0);
    
    if (!startMonth) return 0; // No payments made
    
    // Sum monthly expenses from start month onwards
    const monthExpenses = {
      aug: 0,
      sept: 663,
      oct: 1000,
      nov: 815,
      dec: 794
    };
    
    let totalExpense = 0;
    let countFromStart = false;
    
    for (const month of monthOrder) {
      if (month === startMonth) countFromStart = true;
      if (countFromStart) {
        totalExpense += monthExpenses[month];
      }
    }
    
    return totalExpense;
  };

  const handleSelectOwner = (owner: Owner) => {
    const p26 = p26List.find(p => p.flatNo === owner.flatNo) || {
      flatNo: owner.flatNo, carryForward2025: 0, q1Payment: 0, jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0, paidTillDate: 0, outstanding: 6000
    };
    const p25 = p25List.find(p => p.flatNo === owner.flatNo) || {
      flatNo: owner.flatNo, aug: 0, sept: 0, oct: 0, nov: 0, dec: 0, paidTillDate: 0, outstanding: 0
    };

    const carryForward = p26.carryForward2025;
    const q1Payment = p26.q1Payment;
    const totalAvailable = carryForward + q1Payment;
    
    const sharedExp2025 = calculateSharedExp2025(p25);
    const totalPaid2025 = carryForward + sharedExp2025;
    const lifetimePaid = totalPaid2025 + q1Payment;
    
    let q1Status: 'Covered' | 'Partial Covered' | 'Paid' | 'Partial Paid' | 'Due' = 'Due';
    
    if (q1Payment > 0) {
      q1Status = 'Paid';
    } else if (carryForward >= Q1_DUE_AMOUNT) {
      q1Status = 'Covered';
    } else if (carryForward > 0) {
      q1Status = 'Partial Covered';
    } else {
      q1Status = 'Due';
    }

    setSelectedOwnerData({
      owner,
      p2025: p25,
      p2026: p26,
      calculated: {
        expenseShare2025: sharedExp2025,
        carryForward,
        q1Status,
        maintenancePaidTillDate: lifetimePaid,
        currentBalance: totalAvailable - Q1_DUE_AMOUNT
      }
    });
    setIsSearchFocused(false);
    setView('owner');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-indigo-400 space-y-4">
        <RefreshCw className="animate-spin" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Connecting to Hive...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen transition-all duration-500">
      <button 
        onClick={toggleTheme}
        className="fixed top-6 left-6 z-[60] p-3 glass rounded-2xl hover:bg-white/10 transition-all neo-button"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
      </button>

      {view === 'landing' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
          <div className="mb-8 animate-in zoom-in duration-700">
            <div className="w-20 h-20 glass rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl border-white/20">
              <Building2 size={40} className="text-indigo-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black mb-2 tracking-tight">Hijibiji Portal</h1>
          <div className="flex items-center justify-center gap-2 mb-10">
            <p className="text-white/40 max-w-sm text-xs font-black uppercase tracking-[0.2em]">Financial Registry</p>
            {isCloudLive && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Cloud size={10} className="text-emerald-500" />
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Cloud Live</span>
              </div>
            )}
          </div>

          <div className="w-full max-w-md relative mb-10" ref={searchRef}>
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-indigo-400' : 'text-white/30'}`}>
              <Search size={20} />
            </div>
            <input 
              type="text"
              placeholder="Unit No. (e.g. 1B3)..."
              className="w-full h-16 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] pl-12 pr-12 outline-none focus:ring-2 ring-indigo-500/50 transition-all text-lg placeholder:text-white/20 font-medium"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            )}
            
            {(isSearchFocused && searchResults.length > 0) && (
              <div className="absolute top-[4.5rem] left-0 right-0 glass rounded-[1.5rem] overflow-hidden z-50 text-left shadow-2xl border-white/10 animate-in slide-in-from-top-2 max-h-72 overflow-y-auto">
                <div className="px-4 py-3 border-b border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 flex justify-between items-center">
                  <span>{searchQuery ? 'Matching Units' : 'All Units'}</span>
                  <span className="text-white/60">{searchResults.length}</span>
                </div>
                {searchResults.map((owner) => (
                  <button 
                    key={owner.flatNo}
                    onClick={() => handleSelectOwner(owner)}
                    className="w-full p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors group"
                  >
                    <div>
                      <div className="font-black text-lg group-hover:text-indigo-400 transition-colors">{owner.flatNo}</div>
                      <div className="text-xs text-white/40 font-bold uppercase tracking-wider">{owner.name}</div>
                    </div>
                    <ArrowRight size={18} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* KPI Cards */}
          <div className="w-full max-w-md grid grid-cols-3 gap-4 mb-12">
            {/* Registered Flats */}
            <div className="glass rounded-[1.5rem] p-4 shadow-2xl border-white/10 hover:shadow-xl hover:border-white/20 transition-all group text-center">
              <div className="flex items-center justify-center mb-3">
                <Users size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-black text-white mb-2">{owners.length}</div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Registered Flats</p>
            </div>

            {/* Q1 Paid / Covered */}
            <div className="glass rounded-[1.5rem] p-4 shadow-2xl border-white/10 hover:shadow-xl hover:border-white/20 transition-all group text-center">
              <div className="flex items-center justify-center mb-3">
                <CheckCircle size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-black text-white mb-2">
                {p26List.filter(p => (p.q1Payment || 0) >= 6000).length}
              </div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Q1 Paid / Covered</p>
            </div>

            {/* Collection Rate */}
            <div className="glass rounded-[1.5rem] p-4 shadow-2xl border-white/10 hover:shadow-xl hover:border-white/20 transition-all group text-center">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-black text-white mb-2">
                {owners.length > 0 
                  ? ((p26List.filter(p => (p.q1Payment || 0) >= 6000).length / owners.length) * 100).toFixed(1)
                  : '0'
                }%
              </div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Collection Rate</p>
            </div>
          </div>

          <button 
            onClick={() => setView('admin_login')}
            className="flex items-center gap-3 px-8 py-4 glass rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all neo-button"
          >
            <Shield size={16} className="text-indigo-400" />
            Management Access
          </button>
        </div>
      )}
      {view === 'owner' && selectedOwnerData && (
        <OwnerDashboard 
          data={selectedOwnerData} 
          onBack={() => { setView('landing'); setSearchQuery(''); setIsSearchFocused(false); }} 
        />
      )}
      {view === 'admin_login' && (
        <Login 
          onSuccess={() => setView('admin')} 
          onCancel={() => setView('landing')} 
        />
      )}
      {view === 'admin' && (
        <AdminDashboard 
          owners={owners}
          p25={p25List}
          p26={p26List}
          setOwners={setOwners}
          setP25={setP25List}
          setP26={setP26List}
          onLogout={() => setView('landing')} 
        />
      )}
    </main>
  );
};

export default App;
