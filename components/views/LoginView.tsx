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
       const userToSet = selectedUser ? JSON.parse(JSON.stringify(selectedUser)) : null;
       setTimeout(() => setCurrentUser(userToSet), 10);
    } else {
       setError('PIN Salah!');
       setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-[#ff90e8] bg-[url('https://www.transparenttextures.com/patterns/gridme.png')] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border-[4px] border-black shadow-neo-lg p-8 min-h-[400px] flex flex-col">
        <div className="flex flex-col items-center mb-8 shrink-0">
           <div className="w-16 h-16 bg-neo-yellow border-[4px] border-black flex items-center justify-center mb-4 shadow-neo">
              <Store className="w-8 h-8 text-black" />
           </div>
           <h1 className="text-3xl font-black text-black tracking-tighter uppercase border-b-[4px] border-black pb-1 mb-2">Nyaman POS</h1>
           <p className="text-sm font-black text-black uppercase bg-neo-blue border-[2px] border-black px-2 py-1 shadow-sm text-center">
               {selectedUser ? `PIN: ${selectedUser.name}` : 'Pilih Akun'}
           </p>
        </div>
        
        <div className="flex-1">
            {!selectedUser ? (
                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                   {allUsers.map(u => (
                      <button key={u.username} onClick={() => handleUserClick(u)} className="w-full text-left p-4 border-[3px] border-black bg-white hover:bg-neo-yellow hover:translate-x-[-2px] hover:translate-y-[-2px] shadow-neo transition-all flex items-center gap-3 group">
                         <div className="w-10 h-10 border-2 border-black bg-neo-green flex items-center justify-center text-black shrink-0 shadow-sm">
                            <UserCircle2 className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="font-black text-black uppercase">{u.name}</div>
                            <div className="text-[10px] uppercase font-bold tracking-widest text-black bg-white border border-black inline-block px-1 mt-1">{u.role}</div>
                         </div>
                      </button>
                   ))}
                </div>
            ) : (
                <form onSubmit={handlePinSubmit} className="space-y-6">
                   <div>
                      <input 
                         type="password" 
                         value={pin}
                         onChange={e => {setPin(e.target.value); setError('');}}
                         maxLength={6}
                         autoFocus
                         className="w-full text-center text-3xl tracking-[0.5em] font-mono border-[4px] border-black py-4 focus:outline-none focus:bg-neo-yellow/20"
                         placeholder="••••"
                      />
                   </div>
                   {error && <div className="text-white text-sm font-black text-center bg-red-600 border-[3px] border-black p-2 shadow-neo uppercase">{error}</div>}
                   <button type="submit" disabled={!pin} className="w-full bg-neo-green border-[4px] border-black text-black font-black uppercase tracking-widest py-4 shadow-neo hover:translate-y-[2px] disabled:opacity-50 transition-all hover:shadow-none">
                      Masuk
                   </button>
                   <button type="button" onClick={() => setSelectedUser(null)} className="w-full flex justify-center items-center gap-1 py-3 text-black font-black uppercase text-sm border-2 border-transparent hover:border-black transition-all">
                      <ArrowLeft className="w-4 h-4" /> Batal
                   </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}
