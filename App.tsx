
import React, { useState, useEffect, useRef, useCallback, MutableRefObject } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Search, Shield, User, Info, ArrowRight, X, RefreshCw, Cloud, Users, CheckCircle, TrendingUp } from 'lucide-react';
import {
  owners as initialOwners,
  payments2025 as initialP25,
  payments2026 as initialP26
} from './data';
import { Owner, DashboardData, Payment2025, Payment2026, TaskLog } from './types';
import { MONTHLY_EXPENSES_2025, Q1_DUE_AMOUNT, MONTHLY_MAINTENANCE_2026 } from './constants';
import { fetchAllData, testConnection, fetchTaskLogs } from './lib/supabase';
import { calculateLifetimePaid } from './lib/utils';
import OwnerDashboard from './components/OwnerDashboard';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import NeumorphicToggle from './components/NeumorphicToggle';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'owner' | 'admin_login' | 'admin'>('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Owner[]>([]);
  const [selectedOwnerData, setSelectedOwnerData] = useState<DashboardData | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudLive, setIsCloudLive] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string>('');
  const searchRef = useRef<HTMLDivElement>(null);
  // Ref for sub-view back handlers (e.g., closing overlays in OwnerDashboard)
  const subViewBackHandler = useRef<(() => boolean) | null>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);

  // App Data State
  const [owners, setOwners] = useState<Owner[]>(initialOwners);
  const [p25List, setP25List] = useState<Payment2025[]>(initialP25);
  const [p26List, setP26List] = useState<Payment2026[]>(initialP26);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]); // State for task logs

  // State for dynamic config
  const [expenses2025, setExpenses2025] = useState(MONTHLY_EXPENSES_2025);
  const [expenseReport, setExpenseReport] = useState<any[]>([]); // New expense report state
  const [appConfig, setAppConfig] = useState({
    q1Due: Q1_DUE_AMOUNT,
    monthlyMaintenance2026: MONTHLY_MAINTENANCE_2026
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      let diagLog = '🚀 App initializing...\n';

      try {
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

        // Fetch task logs in parallel
        const [cloudData, fetchedTaskLogs] = await Promise.race([
          Promise.all([fetchAllData(), fetchTaskLogs()]),
          timeoutPromise
        ]) as [any, TaskLog[]];

        if (cloudData && cloudData.owners?.length > 0) {
          setOwners(cloudData.owners);
          setP25List(cloudData.p25 || []);
          setP26List(cloudData.p26 || []);

          if (fetchedTaskLogs) {
            setTaskLogs(fetchedTaskLogs);
            diagLog += `🧹 Task Logs: Loaded ${fetchedTaskLogs.length} records\n`;
          }

          if (cloudData.expenses2025) {
            setExpenses2025(cloudData.expenses2025);
            diagLog += `💰 Expenses: Loaded custom 2025 rates\n`;
          }
          if (cloudData.expenseReport) {
            setExpenseReport(cloudData.expenseReport);
            diagLog += ` Report: Loaded ${cloudData.expenseReport.length} records\n`;
          }
          if (cloudData.config) {
            setAppConfig(cloudData.config);
            diagLog += `⚙️ Config: Loaded dynamic settings\n`;
          }

          setIsCloudLive(true);
          diagLog += `✅ Loaded ${cloudData.owners.length} units\n`;
          diagLog += `📊 P25 payments: ${cloudData.p25?.length || 0} records\n`;
          diagLog += `📊 P26 payments: ${cloudData.p26?.length || 0} records\n`;

          if (!cloudData.p26 || cloudData.p26.length === 0) {
            diagLog += `⚠️ WARNING: Collections_2026 table is EMPTY!\n`;
          }
        } else {
          diagLog += '⚠️ No data from cloud - using fallback\n';
        }
      } catch (err: any) {
        diagLog += `❌ Error: ${err?.message || 'Unknown'}\n`;
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

  // Sync Android hardware back button with app navigation
  const handleBack = useCallback(() => {
    // First, check if a sub-view has an active overlay to close
    if (subViewBackHandler.current) {
      const handled = subViewBackHandler.current();
      if (handled) return; // Overlay was closed, don't navigate further
    }

    if (view === 'owner') {
      setView('landing');
      setSearchQuery('');
      setIsSearchFocused(false);
    } else if (view === 'admin_login') {
      setView('landing');
    } else if (view === 'admin') {
      setView('landing');
    } else {
      // On landing page, minimize the app
      CapApp.minimizeApp();
    }
  }, [view]);

  useEffect(() => {
    const listener = CapApp.addListener('backButton', () => {
      handleBack();
    });
    return () => {
      listener.then(l => l.remove());
    };
  }, [handleBack]);

  const calculateQ1StatusFromRemarks = (remarks: string): 'Covered' | 'Partial Covered' | 'Paid' | 'Partial Paid' | 'Due' => {
    if (!remarks || typeof remarks !== 'string' || remarks.trim() === '') {
      return 'Due';
    }

    const normalizedRemarks = remarks.toLowerCase().trim();

    if (normalizedRemarks.includes('till q4 paid') || normalizedRemarks.includes('till q4paid')) {
      return 'Paid';
    } else if (normalizedRemarks.includes('till q3 paid') || normalizedRemarks.includes('till q3paid')) {
      return 'Paid';
    } else if (normalizedRemarks.includes('till q2 paid') || normalizedRemarks.includes('till q2paid')) {
      return 'Paid';
    } else if (normalizedRemarks.includes('till q1 paid') || normalizedRemarks.includes('till q1paid')) {
      return 'Paid';
    } else if (normalizedRemarks.includes('q4 paid') || normalizedRemarks.includes('q4paid')) {
      return 'Paid';
    } else if (normalizedRemarks.includes('q3 paid') || normalizedRemarks.includes('q3paid')) {
      return 'Paid';
    } else if (normalizedRemarks.includes('q2 paid') || normalizedRemarks.includes('q2paid')) {
      return 'Paid';
    } else if (normalizedRemarks.includes('q1 paid') || normalizedRemarks.includes('q1paid')) {
      return 'Paid';
    } else if (normalizedRemarks.includes('paid till') || normalizedRemarks.includes('paid till')) {
      return 'Paid';
    } else if (normalizedRemarks.includes('paid')) {
      return 'Partial Paid';
    }

    return 'Due';
  };

  const calculateQ1PaidCoveredCount = (): number => {
    return p26List.reduce((count, p26) => {
      const remarksStatus = calculateQ1StatusFromRemarks(p26.remarks || '');
      if (remarksStatus === 'Paid' || remarksStatus === 'Covered') {
        return count + 1;
      }
      return count;
    }, 0);
  };

  const _unused_calculateSharedExp2025 = (p25: Payment2025) => {
    // 1. Determine Start Month (first non-zero payment)
    const monthlyPayments = { aug: p25.aug, sept: p25.sept, oct: p25.oct, nov: p25.nov, dec: p25.dec };
    const monthOrder = ['aug', 'sept', 'oct', 'nov', 'dec'] as const;
    const startMonth = monthOrder.find(month => monthlyPayments[month] > 0);

    if (!startMonth) return 0;

    // 2. If we have the new Expense Report data, use it
    if (expenseReport && expenseReport.length > 0) {
      let total = 0;
      let countFromStart = false;

      // Map app months to likely report month names
      const monthMap: Record<string, string[]> = {
        'aug': ['aug', 'august'],
        'sept': ['sep', 'sept', 'september'],
        'oct': ['oct', 'october'],
        'nov': ['nov', 'november'],
        'dec': ['dec', 'december']
      };

      for (const month of monthOrder) {
        if (month === startMonth) countFromStart = true;

        if (countFromStart) {
          // Find record for this month
          const reportRow = expenseReport.find(r => {
            const rMonth = (r.Month || r.month || '').toLowerCase();
            return monthMap[month].some(m => rMonth.includes(m));
          });

          if (reportRow) {
            // Try to find the correct column for "Expense borne by each Owner"
            // Common variations + exact user specification
            const val = reportRow['Expense borne by each Owner'] ||
              reportRow['Expense_borne_by_each_Owner'] ||
              reportRow['Share per Flat'] ||
              reportRow['share_per_flat'] || 0;

            // Clean amount string if necessary
            const numVal = typeof val === 'string' ? Number(val.replace(/,/g, '')) : Number(val);
            if (!isNaN(numVal)) {
              total += numVal;
            }
          } else {
            // Fallback to legacy config if month missing in report
            // Handle inconsistent spelling of sep/sept
            const monthExpenses = {
              aug: expenses2025.aug || 0,
              sept: expenses2025.sep || expenses2025.sept || 663,
              oct: expenses2025.oct || 1000,
              nov: expenses2025.nov || 815,
              dec: expenses2025.dec || 780
            };
            const key = month === 'sept' ? (monthExpenses.sept !== undefined ? 'sept' : 'sep') : month;
            total += (monthExpenses as any)[key] || 0;
          }
        }
      }
      return Math.round(total); // Round to nearest integer for cleanliness
    }

    // 3. Fallback to Legacy Logic if no report data
    const monthExpenses = {
      aug: expenses2025.aug || 0,
      sept: expenses2025.sep || expenses2025.sept || 663,
      oct: expenses2025.oct || 1000,
      nov: expenses2025.nov || 815,
      dec: expenses2025.dec || 780
    };

    let totalExpense = 0;
    let countFromStart = false;
    for (const month of monthOrder) {
      if (month === startMonth) countFromStart = true;
      if (countFromStart) {
        // Handle inconsistent spelling of sep/sept in data vs config
        const key = month === 'sept' ? (monthExpenses.sept !== undefined ? 'sept' : 'sep') : month;
        totalExpense += (monthExpenses as any)[key] || 0;
      }
    }
    return totalExpense;
  };

  const handleSelectOwner = (owner: Owner) => {
    const p26 = p26List.find(p => p.flatNo === owner.flatNo) || { flatNo: owner.flatNo, carryForward2025: 0, q1Payment: 0, jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0, paidTillDate: 0, outstanding: 6000 };
    const p25 = p25List.find(p => p.flatNo === owner.flatNo) || { flatNo: owner.flatNo, aug: 0, sept: 0, oct: 0, nov: 0, dec: 0, paidTillDate: 0, outstanding: 0 };

    const carryForward = p26.carryForward2025;
    const q1Payment = p26.q1Payment;
    const totalAvailable = carryForward + q1Payment;
    // Use pre-fetched 2025 Shared Expense from Excess_Amount_2025 table
    const sharedExp2025 = p26.sharedExp2025 || 0;

    // Updated Logic: Lifetime Paid = 2025 Payments + 2026 Q1 Payment
    // const totalPaid2025 = carryForward + sharedExp2025; // Legacy logic removed
    // const lifetimePaid = totalPaid2025 + q1Payment; // Legacy logic removed

    const lifetimePaid = calculateLifetimePaid(p25, p26);

    let q1Status: 'Covered' | 'Partial Covered' | 'Paid' | 'Partial Paid' | 'Due' = 'Due';

    // EXCEPTION: Exempted Flats for 1A3 and 1E1
    const exemptedFlats = ['1A3', '1E1'];
    if (exemptedFlats.includes(owner.flatNo)) {
      q1Status = 'Paid';
    }


    // Use dynamic config
    let q1Due = appConfig.q1Due;
    const monthlyMaintenance = appConfig.monthlyMaintenance2026;

    if (p26.remarks && p26.remarks.toLowerCase().includes('n/a for jan')) {
      q1Due -= monthlyMaintenance;
    }
    if (p26.remarks && p26.remarks.toLowerCase().includes('n/a for feb')) {
      q1Due -= monthlyMaintenance;
    }

    // Check for N/A exemption flags from data
    if (p26.janExempt) {
      q1Due -= 2000;
    }
    if (p26.febExempt) {
      q1Due -= 2000;
    }

    if (p26.outstanding === q1Due) {
      q1Status = 'Due';
    } else {
      const remarksStatus = calculateQ1StatusFromRemarks(p26.remarks || '');
      if (remarksStatus !== 'Due') {
        q1Status = remarksStatus;
      } else {
        if (q1Payment > 0) {
          q1Status = 'Paid';
        } else if (carryForward >= q1Due) {
          q1Status = 'Covered';
        } else if (carryForward > 0) {
          q1Status = 'Partial Covered';
        } else {
          q1Status = 'Due';
        }
      }
    }

    setSelectedOwnerData({
      owner,
      p2025: p25,
      p2026: p26,
      expenses2025: expenses2025,
      config: appConfig,
      calculated: {
        expenseShare2025: sharedExp2025,
        carryForward,
        q1Status,
        maintenancePaidTillDate: lifetimePaid,
        currentBalance: totalAvailable - q1Due
      },
      taskLogs: taskLogs // Pass global task logs or filter by flat if needed
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
      {view === 'landing' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
          <div className="mb-8 animate-in zoom-in duration-700">
            <div className="w-32 h-32 glass rounded-[3rem] flex items-center justify-center mx-auto shadow-neo-flat border-white/5 p-6 neo-convex">
              <img src="/1000551042-removebg-preview.png" alt="Hijibiji Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <h1 className="text-3xl font-black mb-2 tracking-tight">Hijibiji Portal</h1>
          <div className="flex items-center justify-center gap-2 mb-10">
            <p className="text-muted max-w-sm text-xs font-black uppercase tracking-[0.2em]">Financial Registry</p>
            {isCloudLive && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-neo-sm">
                <Cloud size={10} className="text-emerald-500" />
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Cloud Live</span>
              </div>
            )}
          </div>

          <div className="w-full max-w-md relative mb-10" ref={searchRef}>
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-white/50'}`}>
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Unit No. (e.g. 1B3)..."
              className="w-full h-16 bg-transparent neo-inset rounded-[1.5rem] pl-12 pr-12 outline-none focus:ring-2 ring-indigo-500/50 transition-all text-lg placeholder:text-muted font-medium text-main"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-main transition-all"
              >
                <X size={20} />
              </button>
            )}

            {(isSearchFocused && searchResults.length > 0) && (
              <div className="absolute top-[4.5rem] left-0 right-0 glass rounded-[1.5rem] overflow-hidden z-50 text-left shadow-2xl border-white/5 animate-in slide-in-from-top-2 max-h-72 overflow-y-auto">
                <div className="px-4 py-3 border-b border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-muted flex justify-between items-center">
                  <span>{searchQuery ? 'Matching Units' : 'All Units'}</span>
                  <span className="text-muted">{searchResults.length}</span>
                </div>
                {searchResults.map((owner) => (
                  <button
                    key={owner.flatNo}
                    onClick={() => handleSelectOwner(owner)}
                    className="w-full p-5 border-b border-white/5 flex items-center justify-start hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex-1 text-left">
                      <div className="font-black text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-main">{owner.flatNo}</div>
                      <div className="text-xs text-muted font-bold uppercase tracking-wider">{owner.name}</div>
                    </div>
                    <ArrowRight size={18} className="text-muted group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-full max-w-md grid grid-cols-3 gap-4 mb-12">
            <div className="glass rounded-[1.5rem] p-4 shadow-neo-flat border-white/5 hover:transform hover:-translate-y-1 transition-all group text-center">
              <div className="flex items-center justify-center mb-3">
                <Users size={20} className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-black text-main mb-2">{owners.length}</div>
              <p className="text-muted text-[10px] font-bold uppercase tracking-wider">Registered Flats</p>
            </div>

            <div className="glass rounded-[1.5rem] p-4 shadow-neo-flat border-white/5 hover:transform hover:-translate-y-1 transition-all group text-center">
              <div className="flex items-center justify-center mb-3">
                <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-black text-main mb-2">
                {calculateQ1PaidCoveredCount()}
              </div>
              <p className="text-muted text-[10px] font-bold uppercase tracking-wider">Q1 Paid / Covered</p>
            </div>

            <div className="glass rounded-[1.5rem] p-4 shadow-neo-flat border-white/5 hover:transform hover:-translate-y-1 transition-all group text-center">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp size={20} className="text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-black text-main mb-2">
                {owners.length > 0
                  ? ((calculateQ1PaidCoveredCount() / owners.length) * 100).toFixed(1)
                  : '0'
                }%
              </div>
              <p className="text-muted text-[10px] font-bold uppercase tracking-wider">Collection Rate</p>
            </div>
          </div>


          <div className="flex flex-col items-center gap-6 mt-4">
            <div className="flex items-center gap-4 animate-in fade-in duration-1000 delay-500">
              <NeumorphicToggle isChecked={isDarkMode} onChange={setIsDarkMode} />
            </div>

            <button
              onClick={() => setView('admin_login')}
              className="flex items-center gap-3 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all neo-button text-muted"
            >
              <Shield size={16} className="text-indigo-600 dark:text-indigo-400" />
              Management Access
            </button>
          </div>
        </div>
      )}
      {view === 'owner' && selectedOwnerData && (
        <OwnerDashboard
          data={selectedOwnerData}
          onBack={() => { setView('landing'); setSearchQuery(''); setIsSearchFocused(false); }}
          isDarkMode={isDarkMode}
          onToggleTheme={setIsDarkMode}
          backHandlerRef={subViewBackHandler}
        />
      )}
      {view === 'admin_login' && (
        <Login
          onSuccess={() => setView('admin')}
          onCancel={() => setView('landing')}
          isDarkMode={isDarkMode}
          onToggleTheme={setIsDarkMode}
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
          expenses2025={expenses2025}
          expenseReport={expenseReport}
          onLogout={() => setView('landing')}
          isDarkMode={isDarkMode}
          onToggleTheme={setIsDarkMode}
        />
      )}
    </main>
  );
};

export default App;
