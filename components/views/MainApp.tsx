"use client";
import React, { useState } from 'react';
import { usePos } from '@/lib/store';
import LoginView from './LoginView';
import DashboardView from './DashboardView';
import AdminView from './AdminView';
import ReportsView from './ReportsView';
import { Store, LogOut, Settings, BarChart3, Calculator } from 'lucide-react';

export default function MainApp() {
  const { currentUser, setCurrentUser, activeShift } = usePos();
  const [activeTab, setActiveTab] = useState<'pos' | 'reports' | 'admin'>('pos');
  const [isReady, setIsReady] = useState(false);

  React.useEffect(() => {
     try {
        const cached = localStorage.getItem('pos_current_user');
        if (cached) {
           setCurrentUser(JSON.parse(cached));
        }
     } catch (e) {
        // ignore
     }
     setIsReady(true);
  }, [setCurrentUser]);

  if (!isReady) return null;
  if (!currentUser) return <LoginView />;

  return (
    <div className="flex flex-col h-screen bg-[#fdfdfd] overflow-hidden text-black font-sans">
      <header className="bg-neo-yellow border-b-[3px] border-black text-black shrink-0 p-3 flex items-center justify-between z-10 print:hidden relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tighter uppercase px-2 py-1 bg-white border-[3px] border-black shadow-neo">
             <Store className="w-6 h-6 text-black" /> NYAMAN
          </div>
          <div className="hidden md:flex bg-white border-[3px] border-black p-1 gap-1 shadow-neo">
             <button onClick={() => setActiveTab('pos')} className={`px-4 py-1.5 font-bold uppercase transition-all border-[3px] ${activeTab === 'pos' ? 'bg-neo-pink border-black shadow-neo translate-y-[-2px] translate-x-[-2px]' : 'bg-transparent border-transparent text-black hover:bg-slate-100'}`}>Kasir</button>
             <button onClick={() => setActiveTab('reports')} className={`px-4 py-1.5 font-bold uppercase transition-all border-[3px] ${activeTab === 'reports' ? 'bg-neo-blue border-black shadow-neo translate-y-[-2px] translate-x-[-2px]' : 'bg-transparent border-transparent text-black hover:bg-slate-100'}`}>Laporan</button>
             {['superadmin', 'bos'].includes(currentUser.role) && (
                <button onClick={() => setActiveTab('admin')} className={`px-4 py-1.5 font-bold uppercase transition-all border-[3px] ${activeTab === 'admin' ? 'bg-neo-green border-black shadow-neo translate-y-[-2px] translate-x-[-2px]' : 'bg-transparent border-transparent text-black hover:bg-slate-100'}`}>Admin</button>
             )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block bg-white px-3 py-1 border-[3px] border-black shadow-neo">
            <div className="text-xs font-black text-black uppercase">@{currentUser.username}</div>
            <div className="text-[10px] text-black font-bold uppercase tracking-widest bg-neo-pink px-1 inline-block border-2 border-black">{currentUser.role}</div>
          </div>
          <button onClick={() => setCurrentUser(null)} className="p-2 bg-neo-red hover:bg-red-400 border-[3px] border-black shadow-neo transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none text-black font-bold">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="md:hidden bg-white border-b-[3px] border-black p-3 flex gap-2 overflow-x-auto shrink-0 z-0">
          <button onClick={() => setActiveTab('pos')} className={`flex-1 py-2 px-3 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 border-[3px] border-black ${activeTab === 'pos' ? 'bg-neo-pink shadow-neo translate-y-[-2px]' : 'bg-white text-black active:bg-neo-yellow'}`}><Calculator className="w-4 h-4"/> Kasir</button>
          <button onClick={() => setActiveTab('reports')} className={`flex-1 py-2 px-3 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 border-[3px] border-black ${activeTab === 'reports' ? 'bg-neo-blue shadow-neo translate-y-[-2px]' : 'bg-white text-black active:bg-neo-yellow'}`}><BarChart3 className="w-4 h-4"/> Lap</button>
          {['superadmin', 'bos'].includes(currentUser.role) && (
             <button onClick={() => setActiveTab('admin')} className={`flex-1 py-2 px-3 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 border-[3px] border-black ${activeTab === 'admin' ? 'bg-neo-green shadow-neo translate-y-[-2px]' : 'bg-white text-black active:bg-neo-yellow'}`}><Settings className="w-4 h-4"/> Admin</button>
          )}
      </div>

      <main className="flex-1 overflow-hidden relative border-t-0 p-2 md:p-4 bg-[url('https://www.transparenttextures.com/patterns/gridme.png')] bg-white">
        {activeTab === 'pos' && <DashboardView />}
        {activeTab === 'admin' && <AdminView />}
        {activeTab === 'reports' && <ReportsView />}
      </main>
    </div>
  );
}
