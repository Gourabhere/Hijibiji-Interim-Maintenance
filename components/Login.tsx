
import React, { useState } from 'react';
import { Shield, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';
import NeumorphicToggle from './NeumorphicToggle';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  isDarkMode: boolean;
  onToggleTheme: (isDark: boolean) => void;
}

const Login: React.FC<Props> = ({ onSuccess, onCancel, isDarkMode, onToggleTheme }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'Ultimatix@1') {
      onSuccess();
    } else {
      setError('Invalid credentials. Access denied.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-100 dark:bg-[#1e293b] rounded-[2.5rem] p-8 text-slate-900 dark:text-white shadow-neo-flat relative border border-white/5">
        <button onClick={onCancel} className="absolute left-6 top-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all neo-button">
          <ArrowLeft size={18} />
        </button>
        <div className="absolute right-6 top-6">
          <NeumorphicToggle isChecked={isDarkMode} onChange={onToggleTheme} />
        </div>

        <div className="flex flex-col items-center mt-6 mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 neo-button">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-slate-600 dark:text-white/60 text-sm">Secure authorization required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-white/70 ml-1">Username</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-white/40" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-14 bg-slate-100 dark:bg-black/20 neo-inset rounded-2xl pl-12 pr-4 outline-none focus:ring-2 ring-indigo-500/50 transition-all border-none text-slate-900 dark:text-white"
                placeholder="Enter admin ID"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-white/70 ml-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 bg-slate-100 dark:bg-black/20 neo-inset rounded-2xl pl-12 pr-4 outline-none focus:ring-2 ring-indigo-500/50 transition-all border-none text-slate-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-2 items-center text-rose-300 text-xs shadow-neo-sm">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full h-14 bg-indigo-600 rounded-2xl font-bold text-lg text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 neo-button"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
