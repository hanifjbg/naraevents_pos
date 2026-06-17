import React, { useState } from 'react';
import { usePos } from '@/lib/store';
import { Store } from 'lucide-react';

export default function LoginView() {
  const { users, setCurrentUser } = usePos();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      setCurrentUser(user);
    } else if (username.toLowerCase() === 'admin') {
      setCurrentUser({ username: 'admin', name: 'Super Admin', role: 'superadmin' });
    } else {
      setError('Username tidak ditemukan');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Store className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-2xl font-black text-slate-800 tracking-tight">Nyaman POS</h1>
           <p className="text-sm font-medium text-slate-500">Masuk untuk memulai shift</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => {setUsername(e.target.value); setError('');}}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 font-medium transition-colors"
              placeholder="Masukkan username..."
              autoFocus
            />
          </div>
          {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
          <button type="submit" disabled={!username} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95">
            Masuk
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
           <div className="text-xs text-slate-400 font-medium text-center">Default hint: login as "admin"</div>
        </div>
      </div>
    </div>
  );
}
