'use client';
import { useState } from 'react';
import { usePos } from '@/lib/store';
import DashboardView from './DashboardView';
import ShiftView from './ShiftView';
import ReportsView from './ReportsView';
import AdminView from './AdminView';

export default function MainApp() {
  const { currentUser, logout, activeShift } = usePos();
  const [currentTab, setCurrentTab] = useState<'pos'|'shift'|'reports'|'admin'>('pos');

  return (
    <div className="flex h-screen w-full bg-slate-50 flex-col md:flex-row">
      <nav className="bg-slate-900 text-slate-300 w-full md:w-64 flex flex-row md:flex-col shrink-0 items-center md:items-stretch overflow-x-auto justify-between md:justify-start">
        <div className="p-4 font-bold text-white text-xl hidden md:block shrink-0">Nyaman POS</div>
        <div className="p-4 bg-slate-800 text-sm hidden md:block shrink-0">
          <div>Hai, {currentUser?.name}</div>
          <div className="text-xs text-slate-400 capitalize">{currentUser?.role}</div>
        </div>
        <div className="flex-1 md:flex-none flex flex-row md:flex-col gap-1 p-2 items-center md:items-stretch h-full overflow-x-auto">
          {(!activeShift) && (
            <button onClick={() => setCurrentTab('shift')} className={`p-2 md:p-3 text-sm md:text-base text-left rounded-lg whitespace-nowrap ${currentTab === 'shift' ? 'bg-slate-800 text-white' : ''}`}>Mulai Shift</button>
          )}
          {(activeShift || currentUser?.role === 'superadmin' || currentUser?.role === 'bos') && (
            <button onClick={() => setCurrentTab('pos')} className={`p-2 md:p-3 text-sm md:text-base text-left rounded-lg whitespace-nowrap ${currentTab === 'pos' ? 'bg-slate-800 text-white' : ''}`}>Kasir</button>
          )}
          {activeShift && (
            <button onClick={() => setCurrentTab('shift')} className={`p-2 md:p-3 text-sm md:text-base text-left rounded-lg whitespace-nowrap ${currentTab === 'shift' ? 'bg-slate-800 text-white' : ''}`}>Akhiri Shift</button>
          )}
          {(currentUser?.role === 'bos' || currentUser?.role === 'superadmin') && (
            <>
              <button onClick={() => setCurrentTab('reports')} className={`p-2 md:p-3 text-sm md:text-base text-left rounded-lg whitespace-nowrap ${currentTab === 'reports' ? 'bg-slate-800 text-white' : ''}`}>Laporan</button>
              <button onClick={() => setCurrentTab('admin')} className={`p-2 md:p-3 text-sm md:text-base text-left rounded-lg whitespace-nowrap ${currentTab === 'admin' ? 'bg-slate-800 text-white' : ''}`}>Admin</button>
            </>
          )}
        </div>
        <button onClick={logout} className="p-3 md:p-4 text-sm md:text-base text-left hover:text-white md:mt-auto shrink-0 whitespace-nowrap">Logout</button>
      </nav>
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {currentTab === 'pos' && <DashboardView />}
        {currentTab === 'shift' && <ShiftView />}
        {currentTab === 'reports' && <ReportsView />}
        {currentTab === 'admin' && <AdminView />}
      </main>
    </div>
  );
}
