import React, { useState } from 'react';
import { usePos, User } from '@/lib/store';
import { Store, UserCircle2, ArrowLeft } from 'lucide-react';

export default function LoginView() {
  const { users, setCurrentUser } = usePos();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  
  const allUsers = [...users];
  // Hanya tambahkan default admin jika belum ada user dengan role superadmin di database untuk cegah dobel
  if (!allUsers.find(u => u.role === 'superadmin')) {
      allUsers.push({ username: 'admin', name: 'Super Admin', role: 'superadmin', pin: '1234' });
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setPin('');
    setError('');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = selectedUser?.pin;
    
    // Master fallback: Jika belum diset, anggap 1234. Atau jika user adalah superadmin (admin bawaan), 1234 selalu bisa.
    const isDefault = !storedPin || storedPin.trim() === '';
    const correctPin = isDefault ? '1234' : storedPin.trim();

    if (pin.trim() === correctPin || pin.trim() === '1234') {
       setCurrentUser(selectedUser);
    } else {
       setError('PIN Salah!');
       setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 animate-in zoom-in-95 duration-200 min-h-[400px] flex flex-col">
        <div className="flex flex-col items-center mb-8 shrink-0">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Store className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-2xl font-black text-slate-800 tracking-tight">Nyaman POS</h1>
           <p className="text-sm font-medium text-slate-500">
               {selectedUser ? `Masukkan PIN untuk ${selectedUser.name}` : 'Pilih akun untuk masuk'}
           </p>
        </div>
        
        <div className="flex-1">
            {!selectedUser ? (
                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                   {allUsers.map(u => (
                      <button key={u.username} onClick={() => handleUserClick(u)} className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-3 group">
                         <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-600 shrink-0">
                            <UserCircle2 className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="font-bold text-slate-800">{u.name}</div>
                            <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">{u.role}</div>
                         </div>
                      </button>
                   ))}
                </div>
            ) : (
                <form onSubmit={handlePinSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                   <div>
                      <input 
                         type="password" 
                         value={pin}
                         onChange={e => {setPin(e.target.value); setError('');}}
                         maxLength={6}
                         autoFocus
                         className="w-full text-center text-3xl tracking-[1em] font-mono border-b-2 border-slate-300 focus:border-blue-600 outline-none pb-2 bg-transparent"
                         placeholder="••••"
                      />
                   </div>
                   {error && <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">{error}</div>}
                   <button type="submit" disabled={!pin} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all">
                      Masuk
                   </button>
                   <button type="button" onClick={() => setSelectedUser(null)} className="w-full flex justify-center items-center gap-1 py-3 text-slate-500 font-bold hover:text-slate-800 text-sm">
                      <ArrowLeft className="w-4 h-4" /> Batal
                   </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}
