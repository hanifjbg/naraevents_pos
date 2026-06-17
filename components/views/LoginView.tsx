'use client';
import { useState } from 'react';
import { usePos } from '@/lib/store';

export default function LoginView() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login } = usePos();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(username, pin)) {
      setError('Username / PIN salah!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <form onSubmit={handleLogin} className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center text-slate-800">Nyaman POS</h1>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
        <div>
          <label className="block text-sm font-semibold mb-2">Username</label>
          <input className="w-full border p-3 rounded-lg" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">PIN</label>
          <input type="password" inputMode="numeric" className="w-full border p-3 rounded-lg" value={pin} onChange={e => setPin(e.target.value)} />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">Masuk</button>
      </form>
    </div>
  );
}
