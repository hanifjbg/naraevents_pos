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
    <div className="p-6 h-full overflow-y-auto w-full max-w-7xl mx-auto">
      
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
         <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Dari Tanggal</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
         </div>
         <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Sampai Tanggal</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full border rounded-lg p-2 text-sm" />
         </div>
         <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Kasir</label>
            <select 
               value={currentUser?.role === 'kasir' ? currentUser.username : filterCashier} 
               onChange={e => setFilterCashier(e.target.value)} 
               disabled={currentUser?.role === 'kasir'}
               className={`w-full border rounded-lg p-2 text-sm ${currentUser?.role === 'kasir' ? 'bg-slate-100' : 'bg-white'}`}
            >
               {currentUser?.role !== 'kasir' && <option value="">Semua</option>}
               {users.filter(u => currentUser?.role !== 'kasir' || u.username === currentUser.username).map(u => (
                  <option key={u.username} value={u.username}>{u.name} (@{u.username})</option>
               ))}
            </select>
         </div>
         <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Metode</label>
            <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-white">
               <option value="">Semua</option>
               <option value="CASH">Tunai</option>
               <option value="QRIS">QRIS</option>
            </select>
         </div>
         <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-white">
               <option value="all">Semua</option>
               <option value="success">Sukses</option>
               <option value="void">Batal / Void</option>
            </select>
         </div>
         <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Item Menu</label>
            <select value={filterItem} onChange={e => setFilterItem(e.target.value)} className="w-full border rounded-lg p-2 text-sm bg-white">
               <option value="">Semua</option>
               {menu.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-6 justify-center rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-500 mb-1">Total Pendapatan Terfilter</h3>
            <div className="text-4xl font-bold text-green-600">{formatRupiah(totalRevenue)}</div>
         </div>
         <div className="bg-white p-6 justify-center rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-500 mb-1">Jumlah Transaksi</h3>
            <div className="text-4xl font-bold text-blue-600">{totalTrx}</div>
         </div>
         <div className="bg-white p-6 justify-center rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-500 mb-1">Total Item Terjual</h3>
            <div className="text-4xl font-bold text-purple-600">{totalQtyItem}</div>
         </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 h-80">
         <h3 className="font-bold mb-4">Grafik Penjualan Harian (Sukses)</h3>
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
               <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
               <YAxis fontSize={12} stroke="#94a3b8" />
               <Tooltip formatter={(val: number) => formatRupiah(val)} />
               <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
         </ResponsiveContainer>
      </div>

      <h3 className="font-bold mb-4 mt-8">Detail Transaksi Tersaring</h3>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto mb-8">
         <table className="w-full text-left text-sm min-w-[600px]">
             <thead className="bg-slate-50 border-b">
                <tr>
                   <th className="p-4 font-semibold text-slate-600">ID / Waktu</th>
                   <th className="p-4 font-semibold text-slate-600">Kasir</th>
                   <th className="p-4 font-semibold text-slate-600">Terjual</th>
                   <th className="p-4 font-semibold text-slate-600">Metode & Status</th>
                   <th className="p-4 font-semibold text-slate-600 text-right">Total</th>
                </tr>
             </thead>
             <tbody className="divide-y">
                {filteredTransactions.slice(0, 50).map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                       <td className="p-4">
                          <div className="font-mono text-xs">{t.id.slice(0,8).toUpperCase()}</div>
                          <div className="text-slate-500">{new Date(t.timestamp).toLocaleString('id-ID')}</div>
                       </td>
                       <td className="p-4 font-medium">@{t.cashier}</td>
                       <td className="p-4 text-xs text-slate-600 max-w-xs truncate">
                          {t.items.map(i => `${i.qty}x ${i.product.name}`).join(', ')}
                       </td>
                       <td className="p-4">
                          <div className={`text-xs font-bold ${t.paymentMethod === 'QRIS' ? 'text-green-600' : 'text-blue-600'}`}>
                             {t.paymentMethod}
                          </div>
                          {t.voided && <div className="text-xs text-red-600 font-bold bg-red-50 p-1 inline-block mt-1 rounded">DIBATALKAN</div>}
                       </td>
                       <td className="p-4 text-right font-bold text-slate-800">
                           <span className={t.voided ? 'line-through text-slate-400' : ''}>{formatRupiah(t.total)}</span>
                           <button onClick={() => setSelectedTx(t)} className="ml-3 px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded hover:bg-slate-200">Nota</button>
                       </td>
                    </tr>
                ))}
                {filteredTransactions.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">Tidak ada transaksi ditemukan</td></tr>}
             </tbody>
         </table>
      </div>

      <h3 className="font-bold mb-4 mt-8">Riwayat Semua Shift</h3>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto mb-8">
         <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-slate-50 border-b">
               <tr>
                  <th className="p-4 font-semibold text-slate-600">Kasir</th>
                  <th className="p-4 font-semibold text-slate-600">Mulai</th>
                  <th className="p-4 font-semibold text-slate-600">Selesai</th>
                  <th className="p-4 font-semibold text-slate-600">Modal Awal</th>
                  <th className="p-4 font-semibold text-slate-600">Setor Fisik</th>
                  <th className="p-4 font-semibold text-slate-600 text-right">Total Transaksi</th>
               </tr>
            </thead>
            <tbody className="divide-y">
               {shifts.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                     <td className="p-4 font-bold text-blue-600">@{s.cashier}</td>
                     <td className="p-4 text-slate-600">{new Date(s.startTime).toLocaleString('id-ID')}</td>
                     <td className="p-4 text-slate-600">
                        {s.status === 'active' ? (
                           <>
                              <span className="text-green-600 font-bold text-xs uppercase bg-green-50 px-2 py-1 rounded block w-max mb-1">Shift Aktif</span>
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
                                 }} className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded font-bold hover:bg-red-200 flex items-center gap-1 w-max">
                                    <PowerOff className="w-3 h-3" /> Force End
                                 </button>
                              )}
                           </>
                        ) : new Date(s.endTime!).toLocaleString('id-ID')}
                     </td>
                     <td className="p-4 font-medium">{formatRupiah(s.startingCash)}</td>
                     <td className="p-4 font-medium">
                        {s.status === 'closed' ? (
                           <div className="flex flex-col gap-1 text-xs">
                              <span className="font-bold text-sm">{formatRupiah(s.actualCash!)}</span>
                              <span className={`font-semibold ${s.actualCash! - s.expectedCash! === 0 ? 'text-green-600' : 'text-red-500'}`}>
                                 {s.actualCash! - s.expectedCash! === 0 ? '👍 Sesuai' : `Selisih: ${formatRupiah(s.actualCash! - s.expectedCash!)}`}
                              </span>
                           </div>
                        ) : '-'}
                     </td>
                     <td className="p-4 font-black text-slate-800 text-right break-all max-w-[150px]">{formatRupiah(s.totalSales)}</td>
                  </tr>
               ))}
               {shifts.length === 0 && (
                  <tr>
                     <td colSpan={6} className="p-8 text-center text-slate-400">Belum ada riwayat shift</td>
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
