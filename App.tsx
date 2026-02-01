
import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, Shield, User, Info, ArrowRight, X } from 'lucide-react';
import { 
  owners as initialOwners, 
  payments2025 as initialP25, 
  payments2026 as initialP26 
} from './data';
import { Owner, DashboardData, Payment2025, Payment2026 } from './types';
import { MONTHLY_EXPENSES_2025, Q1_DUE_AMOUNT } from './constants';
import OwnerDashboard from './components/OwnerDashboard';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'owner' | 'admin_login' | 'admin'>('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Owner[]>([]);
  const [selectedOwnerData, setSelectedOwnerData] = useState<DashboardData | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // App Data State
  const [owners, setOwners] = useState<Owner[]>(initialOwners);
  const [p25List, setP25List] = useState<Payment2025[]>(initialP25);
  const [p26List, setP26List] = useState<Payment2026[]>(initialP26);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length > 0) {
      const results = owners.filter(o => 
        o.flatNo.toLowerCase().includes(query) || 
        o.name.toLowerCase().includes(query)
      );
      setSearchResults(results);
    } else if (isSearchFocused) {
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

  const calculateSharedExp2025 = (owner: Owner, carryForward: number) => {
    if (carryForward === 0) return 0;
    // Shared expenses for 2025 based on possession date
    // Total Aug-Dec expense per full-resident flat is 3272
    // For Nov-Dec possession, it is 1609 (815 + 794)
    if (owner.possessionDate === 'Nov-25') return 1609;
    return 3272;
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
    
    // Derived Financials
    const sharedExp2025 = calculateSharedExp2025(owner, carryForward);
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

  return (
    <main className="min-h-screen">
      {view === 'landing' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="mb-8 animate-in zoom-in duration-700">
            <div className="w-20 h-20 glass rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl border-white/20">
              <Building2 size={40} className="text-indigo-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black mb-2 tracking-tight">Hijibiji Portal</h1>
          <p className="text-white/40 mb-10 max-w-sm text-xs font-black uppercase tracking-[0.2em]">Live Financial Registry</p>

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
                <div className="px-4 py-2 border-b border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/20">
                  Select Unit for Dashboard
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
