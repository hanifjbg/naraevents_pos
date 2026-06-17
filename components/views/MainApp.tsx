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

  if (!currentUser) return <LoginView />;

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden text-slate-800">
      <header className="bg-slate-900 text-white shrink-0 p-3 shadow-md flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight text-white/90">
             <Store className="w-5 h-5 text-blue-400" /> NYAMAN
          </div>
          <div className="hidden md:flex bg-slate-800 rounded-lg p-1 gap-1">
             <button onClick={() => setActiveTab('pos')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'pos' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>Kasir</button>
             {['superadmin', 'bos'].includes(currentUser.role) && (
                <button onClick={() => setActiveTab('reports')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>Laporan</button>
             )}
             {['superadmin', 'bos'].includes(currentUser.role) && (
                <button onClick={() => setActiveTab('admin')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'admin' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>Admin</button>
             )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-blue-300">@{currentUser.username}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">{currentUser.role}</div>
          </div>
          <button onClick={() => setCurrentUser(null)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="md:hidden bg-slate-800 p-2 flex gap-2 overflow-x-auto shrink-0 shadow-inner z-0">
          <button onClick={() => setActiveTab('pos')} className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'pos' ? 'bg-blue-500 text-white' : 'text-slate-400 bg-slate-900/50'}`}><Calculator className="w-4 h-4"/> Kasir</button>
          {['superadmin', 'bos'].includes(currentUser.role) && (
             <button onClick={() => setActiveTab('reports')} className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'reports' ? 'bg-blue-500 text-white' : 'text-slate-400 bg-slate-900/50'}`}><BarChart3 className="w-4 h-4"/> Laporan</button>
          )}
          {['superadmin', 'bos'].includes(currentUser.role) && (
             <button onClick={() => setActiveTab('admin')} className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'admin' ? 'bg-blue-500 text-white' : 'text-slate-400 bg-slate-900/50'}`}><Settings className="w-4 h-4"/> Admin</button>
          )}
      </div>

      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'pos' && <DashboardView />}
        {activeTab === 'admin' && <AdminView />}
        {activeTab === 'reports' && <ReportsView />}
      </main>
    </div>
  );
}
