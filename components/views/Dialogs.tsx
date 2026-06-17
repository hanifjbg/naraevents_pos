import React from 'react';

export function AlertDialog({ message, onClose }: { message: string, onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-slate-800 font-medium mb-6">{message}</p>
        <button onClick={onClose} className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Tutup</button>
      </div>
    </div>
  )
}

export function ConfirmDialog({ message, onConfirm, onClose }: { message: string, onConfirm: () => void, onClose: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="text-slate-800 font-medium mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200">Batal</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Ya, Lanjutkan</button>
        </div>
      </div>
    </div>
  )
}
