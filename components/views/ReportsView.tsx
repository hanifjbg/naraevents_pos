import React, { useState, useMemo } from 'react';
import { usePos, Transaction } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ReceiptModal from './ReceiptModal';
import { FileText, PowerOff } from 'lucide-react';
import { ConfirmDialog } from './Dialogs';

export default function ReportsView() {
  const { currentUser, transactions, shifts, users, menu, endShift } = usePos();
  
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterCashier, setFilterCashier] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterStatus, setFilterStatus] = useState('success');
  const [filterItem, setFilterItem] = useState('');
  
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [confirmData, setConfirmData] = useState<{message: string, onConfirm: () => void} | null>(null);

  const filteredTransactions = useMemo(() => {
     let data = transactions;

     if (dateFrom) {
        data = data.filter(t => new Date(t.timestamp) >= new Date(dateFrom + 'T00:00:00'));
     }
     if (dateTo) {
        data = data.filter(t => new Date(t.timestamp) <= new Date(dateTo + 'T23:59:59'));
     }
     
     const actualCashierFilter = currentUser?.role === 'kasir' ? currentUser.username : filterCashier;
     if (actualCashierFilter) {
        data = data.filter(t => t.cashier === actualCashierFilter);
     }
     
     if (filterMethod) {
        data = data.filter(t => t.paymentMethod === filterMethod);
     }
     if (filterStatus === 'success') {
        data = data.filter(t => !t.voided);
     } else if (filterStatus === 'void') {
        data = data.filter(t => t.voided);
     }
     if (filterItem) {
        data = data.filter(t => t.items.some(i => i.product.id === filterItem));
     }

     return data;
  }, [transactions, dateFrom, dateTo, filterCashier, filterMethod, filterStatus, filterItem, currentUser]);

  const totalRevenue = filteredTransactions.reduce((s,t) => s + (!t.voided ? t.total : 0), 0);
  const totalTrx = filteredTransactions.length;
  const totalQtyItem = filteredTransactions.reduce((s,t) => s + (!t.voided ? t.items.reduce((sum, item) => sum + item.qty, 0) : 0), 0);
  const totalCash = filteredTransactions.reduce((s,t) => s + (!t.voided && t.paymentMethod === 'CASH' ? t.total : 0), 0);
  const totalQris = filteredTransactions.reduce((s,t) => s + (!t.voided && t.paymentMethod === 'QRIS' ? t.total : 0), 0);
  
  const { activeShift } = usePos();
  const currentCashInHand = activeShift ? activeShift.startingCash + filteredTransactions.reduce((s, t) => s + (!t.voided && t.paymentMethod === 'CASH' && t.shiftId === activeShift.id ? t.total : 0), 0) : 0;

  const chartDataMap = filteredTransactions.reduce((acc: any, t) => {
     if (t.voided) return acc;
     const d = new Date(t.timestamp).toLocaleDateString();
     if (!acc[d]) acc[d] = 0;
     acc[d] += t.total;
     return acc;
  }, {});

  const chartData = Object.keys(chartDataMap).map(k => ({
     name: k,
     sales: chartDataMap[k]
  })).slice(0, 14);

  return (
    <div className="p-6 h-full overflow-y-auto w-full max-w-7xl mx-auto print:p-0 print:overflow-visible bg-transparent">
      
      <div className="bg-white p-4 border-[4px] border-black shadow-neo mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 print:hidden">
         <div>
            <label className="text-xs font-black uppercase mb-1 block">Dari Tanggal</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full border-[3px] border-black p-2 text-sm font-bold focus:outline-none focus:bg-neo-yellow/20" />
         </div>
         <div>
            <label className="text-xs font-black uppercase mb-1 block">Sampai Tanggal</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full border-[3px] border-black p-2 text-sm font-bold focus:outline-none focus:bg-neo-yellow/20" />
         </div>
         <div>
            <label className="text-xs font-black uppercase mb-1 block">Kasir</label>
            <select 
               value={currentUser?.role === 'kasir' ? currentUser.username : filterCashier} 
               onChange={e => setFilterCashier(e.target.value)} 
               disabled={currentUser?.role === 'kasir'}
               className={`w-full border-[3px] border-black p-2 text-sm font-bold focus:outline-none ${currentUser?.role === 'kasir' ? 'bg-slate-200' : 'bg-white'}`}
            >
               {currentUser?.role !== 'kasir' && <option value="">Semua</option>}
               {users.filter(u => currentUser?.role !== 'kasir' || u.username === currentUser.username).map(u => (
                  <option key={u.username} value={u.username}>{u.name} (@{u.username})</option>
               ))}
            </select>
         </div>
         <div>
            <label className="text-xs font-black uppercase mb-1 block">Metode</label>
            <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)} className="w-full border-[3px] border-black p-2 text-sm bg-white font-bold focus:outline-none">
               <option value="">Semua</option>
               <option value="CASH">Tunai</option>
               <option value="QRIS">QRIS</option>
            </select>
         </div>
         <div>
            <label className="text-xs font-black uppercase mb-1 block">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full border-[3px] border-black p-2 text-sm bg-white font-bold focus:outline-none">
               <option value="all">Semua</option>
               <option value="success">Sukses</option>
               <option value="void">Batal / Void</option>
            </select>
         </div>
         <div>
            <label className="text-xs font-black uppercase mb-1 block">Item Menu</label>
            <select value={filterItem} onChange={e => setFilterItem(e.target.value)} className="w-full border-[3px] border-black p-2 text-sm bg-white font-bold focus:outline-none">
               <option value="">Semua</option>
               {menu.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
         </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-6">
          <h2 className="text-2xl font-black uppercase border-b-[4px] border-black pb-1">Ringkasan Laporan</h2>
          <button onClick={() => window.print()} className="bg-neo-blue text-black border-[3px] border-black shadow-neo px-4 py-2 font-black uppercase text-sm hover:translate-y-[2px] transition-all flex gap-2 items-center print:hidden">
              <FileText className="w-4 h-4" /> Cetak PDF (Laporan)
          </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
         <div onClick={() => setFilterStatus('success')} className="bg-white p-4 justify-center border-[4px] border-black shadow-neo flex flex-col cursor-pointer hover:bg-neo-yellow transition-colors hover:translate-x-[-2px] hover:translate-y-[-2px]">
            <h3 className="text-xs font-black uppercase mb-1">Total Pendapatan</h3>
            <div className="text-xl font-black text-black">{formatRupiah(totalRevenue)}</div>
         </div>
         <div onClick={() => setFilterMethod('CASH')} className="bg-white p-4 justify-center border-[4px] border-black shadow-neo flex flex-col cursor-pointer hover:bg-neo-green transition-colors hover:translate-x-[-2px] hover:translate-y-[-2px]">
            <h3 className="text-xs font-black uppercase mb-1">Tunai (CASH)</h3>
            <div className="text-xl font-black text-black">{formatRupiah(totalCash)}</div>
         </div>
         <div onClick={() => setFilterMethod('QRIS')} className="bg-white p-4 justify-center border-[4px] border-black shadow-neo flex flex-col cursor-pointer hover:bg-neo-blue transition-colors hover:translate-x-[-2px] hover:translate-y-[-2px]">
            <h3 className="text-xs font-black uppercase mb-1">Non-Tunai (QRIS)</h3>
            <div className="text-xl font-black text-black">{formatRupiah(totalQris)}</div>
         </div>
         <div className="bg-white p-4 justify-center border-[4px] border-black shadow-neo flex flex-col">
            <h3 className="text-xs font-black uppercase mb-1">Jumlah Transaksi</h3>
            <div className="text-xl font-black text-black">{totalTrx} x</div>
         </div>
         <div className="bg-white p-4 justify-center border-[4px] border-black shadow-neo flex flex-col">
            <h3 className="text-xs font-black uppercase mb-1">Item Terjual</h3>
            <div className="text-xl font-black text-black">{totalQtyItem} item</div>
         </div>
         {activeShift && (
             <div className="bg-neo-yellow p-4 justify-center border-[4px] border-black shadow-neo flex flex-col">
                <h3 className="text-xs font-black uppercase mb-1">Cash In Hand</h3>
                <div className="text-xl font-black text-black">{formatRupiah(currentCashInHand)}</div>
             </div>
         )}
      </div>

      <div className="bg-white p-6 border-[4px] border-black shadow-neo mb-8 h-80">
         <h3 className="font-black uppercase mb-4 text-xl">Grafik Penjualan Harian</h3>
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
               <XAxis dataKey="name" fontSize={12} stroke="#000" tickLine={false} axisLine={{ strokeWidth: 2 }} />
               <YAxis fontSize={12} stroke="#000" tickLine={false} axisLine={{ strokeWidth: 2 }} />
               <Tooltip formatter={(val: number) => formatRupiah(val)} contentStyle={{ border: '3px solid black', borderRadius: 0, fontWeight: 'bold' }} />
               <Bar dataKey="sales" fill="#ff90e8" stroke="#000" strokeWidth={3} radius={[0, 0, 0, 0]} />
            </BarChart>
         </ResponsiveContainer>
      </div>

      <h3 className="text-2xl font-black uppercase mb-4 mt-8 border-b-[4px] border-black pb-1 inline-block">Detail Transaksi</h3>
      <div className="bg-white border-[4px] border-black shadow-neo overflow-x-auto mb-8">
         <table className="w-full text-left text-sm min-w-[600px] border-collapse">
             <thead className="bg-neo-yellow border-b-[4px] border-black">
                <tr>
                   <th className="p-4 font-black uppercase border-r-[4px] border-black text-black">ID / Waktu</th>
                   <th className="p-4 font-black uppercase border-r-[4px] border-black text-black">Kasir</th>
                   <th className="p-4 font-black uppercase border-r-[4px] border-black text-black">Terjual</th>
                   <th className="p-4 font-black uppercase border-r-[4px] border-black text-black">Metode & Status</th>
                   <th className="p-4 font-black uppercase text-right text-black">Total</th>
                </tr>
             </thead>
             <tbody className="divide-y-[3px] divide-black">
                {filteredTransactions.slice(0, 50).map(t => (
                    <tr key={t.id} className="hover:bg-neo-yellow/20">
                       <td className="p-4 border-r-[4px] border-black">
                          <div className="font-mono font-black text-black text-xs">{t.id.slice(0,8).toUpperCase()}</div>
                          <div className="font-bold text-black">{new Date(t.timestamp).toLocaleString('id-ID')}</div>
                       </td>
                       <td className="p-4 font-black text-black border-r-[4px] border-black uppercase">@{t.cashier}</td>
                       <td className="p-4 text-xs font-bold text-black border-r-[4px] border-black max-w-xs truncate uppercase">
                          {t.items.map(i => `${i.qty}x ${i.product.name}`).join(', ')}
                       </td>
                       <td className="p-4 border-r-[4px] border-black">
                          <div className={`text-xs font-black uppercase border-2 border-black inline-block px-1 ${t.paymentMethod === 'QRIS' ? 'bg-neo-green' : 'bg-neo-blue'}`}>
                             {t.paymentMethod}
                          </div>
                          {t.voided && <div className="text-xs text-white font-black uppercase bg-neo-red border-2 border-black p-1 inline-block mt-1 ml-1">DIBATALKAN</div>}
                       </td>
                       <td className="p-4 text-right font-black text-black">
                           <span className={t.voided ? 'line-through decoration-[3px] opacity-70' : ''}>{formatRupiah(t.total)}</span>
                           <button onClick={() => setSelectedTx(t)} className="ml-3 px-2 py-1 bg-white border-2 border-black shadow-sm font-bold text-xs hover:bg-neo-yellow uppercase transition-colors print:hidden">Nota</button>
                       </td>
                    </tr>
                ))}
                {filteredTransactions.length === 0 && <tr><td colSpan={5} className="p-8 text-center font-bold uppercase text-black">Tidak ada transaksi ditemukan</td></tr>}
             </tbody>
         </table>
      </div>

      <h3 className="text-2xl font-black uppercase mb-4 mt-8 border-b-[4px] border-black pb-1 inline-block">Riwayat Shift</h3>
      <div className="bg-white border-[4px] border-black shadow-neo overflow-x-auto mb-8">
         <table className="w-full text-left text-sm min-w-[600px] border-collapse">
            <thead className="bg-neo-yellow border-b-[4px] border-black">
               <tr>
                  <th className="p-4 font-black uppercase border-r-[4px] border-black text-black">Kasir</th>
                  <th className="p-4 font-black uppercase border-r-[4px] border-black text-black">Mulai</th>
                  <th className="p-4 font-black uppercase border-r-[4px] border-black text-black">Selesai</th>
                  <th className="p-4 font-black uppercase border-r-[4px] border-black text-black">Modal Awal</th>
                  <th className="p-4 font-black uppercase border-r-[4px] border-black text-black">Setor Fisik</th>
                  <th className="p-4 font-black uppercase text-right text-black">Total Transaksi</th>
               </tr>
            </thead>
            <tbody className="divide-y-[3px] divide-black">
               {shifts.map(s => (
                  <tr key={s.id} className="hover:bg-neo-yellow/20">
                     <td className="p-4 font-black border-r-[4px] border-black text-black uppercase">@{s.cashier}</td>
                     <td className="p-4 font-bold border-r-[4px] border-black text-black">{new Date(s.startTime).toLocaleString('id-ID')}</td>
                     <td className="p-4 font-bold border-r-[4px] border-black text-black">
                        {s.status === 'active' ? (
                           <>
                              <span className="text-black font-black text-xs uppercase bg-neo-green border-2 border-black px-2 py-1 block w-max mb-1 shadow-sm">Shift Aktif</span>
                              {['superadmin', 'bos'].includes(currentUser?.role || '') && (
                                 <button onClick={() => {
                                    const expected = s.startingCash + s.totalSales;
                                    setConfirmData({
                                       message: `Paksa Akhiri Shift ${s.cashier}? (Sistem menganggap uang setor = ${formatRupiah(expected)})`,
                                       onConfirm: () => {
                                          endShift(expected, expected, s.id);
                                          setConfirmData(null);
                                       }
                                    });
                                 }} className="text-[10px] bg-neo-red text-white uppercase border-2 border-black px-2 py-1 font-black hover:translate-y-[2px] transition-all flex items-center gap-1 w-max shadow-sm">
                                    <PowerOff className="w-3 h-3" /> Force End
                                 </button>
                              )}
                           </>
                        ) : new Date(s.endTime!).toLocaleString('id-ID')}
                     </td>
                     <td className="p-4 font-black border-r-[4px] border-black text-black">{formatRupiah(s.startingCash)}</td>
                     <td className="p-4 font-black border-r-[4px] border-black text-black">
                        {s.status === 'closed' ? (
                           <div className="flex flex-col gap-1 text-xs">
                              <span className="font-black text-sm">{formatRupiah(s.actualCash!)}</span>
                              <span className={`font-black uppercase border border-black px-1 inline-block w-max ${s.actualCash! - s.expectedCash! === 0 ? 'bg-neo-green' : 'bg-neo-red text-white'}`}>
                                 {s.actualCash! - s.expectedCash! === 0 ? '👍 Sesuai' : `Selisih: ${formatRupiah(s.actualCash! - s.expectedCash!)}`}
                              </span>
                           </div>
                        ) : '-'}
                     </td>
                     <td className="p-4 font-black text-black text-right break-all max-w-[150px]">{formatRupiah(s.totalSales)}</td>
                  </tr>
               ))}
               {shifts.length === 0 && (
                  <tr>
                     <td colSpan={6} className="p-8 text-center font-bold uppercase text-black">Belum ada riwayat shift</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>

      {selectedTx && <ReceiptModal tx={selectedTx} onClose={() => setSelectedTx(null)} />}
      {confirmData && <ConfirmDialog message={confirmData.message} onConfirm={confirmData.onConfirm} onClose={() => setConfirmData(null)} />}
    </div>
  );
}
