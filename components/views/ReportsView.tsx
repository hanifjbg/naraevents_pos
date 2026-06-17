'use client';
import { usePos } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsView() {
  const { transactions, shifts } = usePos();

  const totalRevenue = transactions.reduce((s,t) => s + t.total, 0);
  const totalTrx = transactions.length;

  const chartData = shifts.map(s => ({
    name: new Date(s.startTime).toLocaleDateString(),
    sales: s.totalSales
  })).slice(0, 7);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Laporan Penjualan</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         <div className="bg-white p-6 justify-center rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-500 mb-1">Total Pendapatan (Semua Waktu)</h3>
            <div className="text-4xl font-bold text-green-600">{formatRupiah(totalRevenue)}</div>
         </div>
         <div className="bg-white p-6 justify-center rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-500 mb-1">Total Transaksi</h3>
            <div className="text-4xl font-bold text-blue-600">{totalTrx}</div>
         </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 h-80">
         <h3 className="font-bold mb-4">Grafik Penjualan Per Shift</h3>
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
               <XAxis dataKey="name" fontSize={12} stroke="#94a3b8" />
               <YAxis fontSize={12} stroke="#94a3b8" tickFormatter={(val) => `Rp ${val/1000}k`} />
               <Tooltip formatter={(val: number) => formatRupiah(val)} />
               <Bar dataKey="sales" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
         </ResponsiveContainer>
      </div>

      <h3 className="font-bold mb-4 mt-8">Riwayat Shift Kasir</h3>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
         <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-slate-50 border-b">
               <tr>
                  <th className="p-4 font-semibold text-slate-600">Waktu</th>
                  <th className="p-4 font-semibold text-slate-600">Kasir</th>
                  <th className="p-4 font-semibold text-slate-600">Total Sales</th>
                  <th className="p-4 font-semibold text-slate-600">Selisih Uang</th>
                  <th className="p-4 font-semibold text-slate-600">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y">
               {shifts.map(s => {
                   const selisih = (s.actualCash || 0) - (s.expectedCash || 0);
                   return (
                     <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-4">{new Date(s.startTime).toLocaleString('id-ID')}</td>
                        <td className="p-4 font-medium">{s.cashierName}</td>
                        <td className="p-4 font-bold">{formatRupiah(s.totalSales)}</td>
                        <td className="p-4 font-bold">
                           {s.status === 'active' ? '-' : (
                              <span className={selisih < 0 ? 'text-red-600' : 'text-green-600'}>
                                 {formatRupiah(selisih)}
                              </span>
                           )}
                        </td>
                        <td className="p-4">
                           <span className={`px-2 py-1 rounded inline-block text-xs font-bold uppercase ${s.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                              {s.status}
                           </span>
                        </td>
                     </tr>
                   )
               })}
               {shifts.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">Belum ada data shift</td></tr>}
            </tbody>
         </table>
      </div>
    </div>
  );
}
