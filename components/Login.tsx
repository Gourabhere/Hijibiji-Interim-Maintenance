
import React, { useState } from 'react';
import { Shield, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const Login: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      onSuccess();
    } else {
      setError('Invalid credentials. Access denied.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md glass rounded-[2.5rem] p-8 text-white shadow-2xl relative">
        <button onClick={onCancel} className="absolute left-6 top-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all">
          <ArrowLeft size={18} />
        </button>

        <div className="flex flex-col items-center mt-6 mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <p className="text-white/50 text-sm">Secure authorization required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/60 ml-1">Username</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-14 glass-dark rounded-2xl pl-12 pr-4 outline-none focus:ring-2 ring-indigo-500/50 transition-all"
                placeholder="Enter admin ID"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/60 ml-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 glass-dark rounded-2xl pl-12 pr-4 outline-none focus:ring-2 ring-indigo-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl flex gap-2 items-center text-rose-300 text-xs">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full h-14 bg-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
