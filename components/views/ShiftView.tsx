'use client';
import { useState } from 'react';
import { usePos } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';
import { PlayCircle, StopCircle } from 'lucide-react';

export default function ShiftView() {
  const { activeShift, startShift, endShift, transactions } = usePos();
  const [cashInput, setCashInput] = useState('');

  if (!activeShift) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm w-full border">
          <PlayCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Mulai Kasir</h2>
          <p className="text-slate-500 mb-6 text-sm">Masukkan uang modal awal di laci kasir.</p>
          <input 
             type="text" inputMode="numeric" 
             value={cashInput} onChange={e => setCashInput(e.target.value)} 
             placeholder="Contoh: 100000" 
             className="w-full border p-3 rounded-xl text-center text-xl font-bold mb-4 focus:ring-2 focus:ring-blue-500 outline-none" 
          />
          <button 
             onClick={() => {
               const c = parseInt(cashInput.replace(/[^0-9]/g, ''), 10) || 0;
               startShift(c);
             }} 
             disabled={!cashInput}
             className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
          >
            Buka Shift
          </button>
        </div>
      </div>
    );
  }

  const shiftTransactions = transactions.filter(t => t.shiftId === activeShift.id);
  const qrisSales = shiftTransactions.filter(t => t.paymentMethod === 'QRIS').reduce((s,t) => s + t.total, 0);
  const cashSales = shiftTransactions.filter(t => t.paymentMethod === 'CASH').reduce((s,t) => s + t.total, 0);
  const expectedCash = activeShift.startingCash + cashSales;

  return (
    <div className="flex h-full items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full border">
        <div className="text-center mb-6">
           <StopCircle className="w-16 h-16 text-red-500 mx-auto mb-4 bg-red-50 rounded-full" />
           <h2 className="text-xl font-bold mb-1">Akhiri Shift</h2>
           <p className="text-xs text-slate-500 font-mono">Mulai: {new Date(activeShift.startTime).toLocaleString('id-ID')}</p>
        </div>

        <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border">
           <div className="flex justify-between font-medium text-sm"><span>Modal Awal:</span> <span>{formatRupiah(activeShift.startingCash)}</span></div>
           <div className="flex justify-between font-medium text-sm"><span>Total Penjualan:</span> <span>{formatRupiah(activeShift.totalSales)}</span></div>
           <div className="border-t pt-2 mt-2"></div>
           <div className="flex justify-between font-medium text-sm text-green-600"><span>Via QRIS:</span> <span>{formatRupiah(qrisSales)}</span></div>
           <div className="flex justify-between font-medium text-sm text-blue-600"><span>Via Tunai:</span> <span>{formatRupiah(cashSales)}</span></div>
           <div className="border-t border-slate-200 mt-2 pt-2"></div>
           <div className="flex justify-between font-bold text-slate-800">
              <span>Uang Kasir Seharusnya:</span> 
              <span>{formatRupiah(expectedCash)}</span>
           </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Hitung Uang Aktual di Laci:</label>
          <input 
             type="text" inputMode="numeric" 
             value={cashInput} onChange={e => setCashInput(e.target.value)} 
             placeholder={expectedCash.toString()} 
             className="w-full border-2 border-slate-200 p-4 rounded-xl text-center text-2xl font-bold focus:border-red-500 outline-none" 
          />
        </div>

        <button 
           onClick={() => {
             const act = parseInt(cashInput.replace(/[^0-9]/g, ''), 10) || 0;
             if (confirm(`Tutup shift? Selisih uang adalah ${formatRupiah(act - expectedCash)}`)) {
                endShift(act, expectedCash);
             }
           }} 
           disabled={!cashInput}
           className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50"
        >
          Tutup Shift
        </button>
      </div>
    </div>
  );
}
