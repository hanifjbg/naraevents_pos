import React, { useState } from 'react';
import { usePos, CATEGORIES, Transaction } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';
import { ShoppingCart, Plus, Minus, Trash2, Clock, CheckCircle2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlertDialog, ConfirmDialog } from './Dialogs';
import ReceiptModal from './ReceiptModal';

export default function DashboardView() {
  const { currentUser, menu, cart, addToCart, decreaseFromCart, removeFromCart, clearCart, checkout, transactions, voidTransaction, deleteTransaction, activeShift, startShift, endShift } = usePos();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModal, setActiveModal] = useState<'qris' | 'cash' | 'receipt' | 'history' | 'startshift' | 'endshift' | null>(null);
  const [cashInput, setCashInput] = useState('');
  const [qrisRef, setQrisRef] = useState('');
  const [lastTx, setLastTx] = useState<Transaction | null>(null);
  const [alertMsg, setAlertMsg] = useState('');
  const [confirmData, setConfirmData] = useState<{message: string, onConfirm: () => void} | null>(null);

  const filteredMenu = menu.filter(item => {
    if (searchQuery) return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return item.category === activeCategory;
  });
  const total = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const handleCheckoutCash = () => {
    const cash = parseInt(cashInput, 10) || 0;
    if (cash < total) {
      setAlertMsg('Uang kurang!');
      return;
    }
    const t = checkout('CASH', cash);
    if (t) {
       setLastTx(t);
       setActiveModal('receipt');
       setCashInput('');
    } else {
       setAlertMsg("Anda harus membuka shift terlebih dahulu!");
    }
  };

  const handleCheckoutQris = () => {
    if (!qrisRef.trim()) {
      setAlertMsg('Masukkan nomor referensi QRIS!');
      return;
    }
    const t = checkout('QRIS', undefined, qrisRef);
    if (t) {
       setLastTx(t);
       setActiveModal('receipt');
       setQrisRef('');
    } else {
       setAlertMsg("Anda harus membuka shift terlebih dahulu!");
    }
  };

  const currentShiftTransactions = transactions.filter(t => activeShift && t.shiftId === activeShift.id);
  const todaysTransactions = transactions.filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString());
  const historyTransactions = activeShift ? currentShiftTransactions : todaysTransactions;

  return (
    <div className="flex flex-col md:flex-row h-full w-full relative">
      <div className="flex-1 flex flex-col min-h-[50%] h-1/2 md:h-full bg-slate-50 relative">
        <div className="bg-white p-3 md:p-4 shadow-sm flex flex-col gap-3 shrink-0 border-b relative">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Cari menu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:bg-white" />
            </div>
            <button onClick={() => setActiveModal('history')} className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 shadow-sm flex items-center font-bold text-sm shrink-0">
               <Clock className="w-4 h-4 mr-1" /> Riwayat
            </button>
          </div>
          {!searchQuery && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap shadow-sm border transition-colors ${activeCategory === cat ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start content-start hide-scrollbar">
          {filteredMenu.map(item => (
            <button key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-start gap-2 hover:border-blue-300 hover:shadow-md transition-all active:scale-95 text-left">
              <div className="font-bold text-slate-800 text-sm">{item.name}</div>
              <div className="text-blue-600 font-black flex-1 flex flex-col justify-end text-sm">{formatRupiah(item.price)}</div>
            </button>
          ))}
          {filteredMenu.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-400 font-semibold">Tidak ada menu.</div>
          )}
        </div>

      </div>
      
      <div className="w-full md:w-96 bg-white border-l shadow-2xl flex flex-col h-1/2 md:h-full relative z-10 shrink-0">
        {!activeShift && currentUser?.role === 'kasir' ? (
           <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-slate-50">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full"><Clock className="w-8 h-8" /></div>
              <h2 className="text-xl font-black">Shift Belum Dimulai</h2>
              <p className="text-sm text-slate-500">Anda harus memulai shift sebelum dapat memproses transaksi.</p>
              <button onClick={() => setActiveModal('startshift')} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-transform">Mulai Shift Sekarang</button>
           </div>
        ) : (
          <>
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between shrink-0">
               <div className="font-bold text-lg flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Pesanan</div>
               {cart.length > 0 && <button onClick={() => clearCart()} className="text-sm font-bold text-red-500 hover:text-red-700 p-1">Hapus Semua</button>}
               {activeShift && (
                  <button onClick={() => setActiveModal('endshift')} className="text-xs bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-md hover:bg-red-200">Akhiri Shift</button>
               )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 hide-scrollbar">
              {cart.map(item => (
                <div key={item.product.id} className="bg-white p-3 border-b flex flex-col gap-2 relative group hover:bg-slate-50">
                   <div className="flex justify-between items-start pr-8">
                     <div className="font-bold text-sm text-slate-800 leading-tight">{item.product.name}</div>
                     <div className="font-bold text-sm shrink-0 ml-2">{formatRupiah(item.product.price * item.qty)}</div>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="flex items-center border rounded-lg bg-white shadow-sm overflow-hidden text-sm">
                        <button onClick={() => decreaseFromCart(item.product.id)} className="px-3 py-1 hover:bg-slate-100 text-slate-600 transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="font-bold w-6 text-center">{item.qty}</span>
                        <button onClick={() => addToCart(item.product)} className="px-3 py-1 hover:bg-slate-100 text-slate-600 transition-colors"><Plus className="w-3 h-3" /></button>
                     </div>
                     <div className="text-xs text-slate-400 font-medium">@ {formatRupiah(item.product.price)}</div>
                   </div>
                   <button onClick={() => removeFromCart(item.product.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 bg-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {cart.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400 font-medium text-sm space-y-2 opacity-50 p-6 text-center">
                    <ShoppingCart className="w-12 h-12 mb-2" />
                    Belum ada menu yang dipilih. Klik menu di samping untuk menambahkan.
                 </div>
              )}
            </div>

            <div className="p-4 bg-white border-t flex flex-col gap-3 shrink-0 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-end mb-2">
                <div className="text-sm font-bold text-slate-500">TOTAL TAGIHAN</div>
                <div className="text-3xl font-black text-slate-800 tracking-tight">{formatRupiah(total)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => setActiveModal('cash')} disabled={cart.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all text-sm">TUNAI</button>
                 <button onClick={() => setActiveModal('qris')} disabled={cart.length === 0} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all text-sm">QRIS</button>
              </div>
            </div>
          </>
        )}
      </div>

       {activeModal === 'startshift' && (
          <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                   <div className="font-bold">Mulai Shift Kasir</div>
                   <button onClick={() => setActiveModal(null)} className="p-2 border rounded-lg bg-white shrink-0 font-bold text-sm hover:bg-slate-100">Batal</button>
                </div>
                <div className="p-6">
                   <label className="block text-sm font-bold text-slate-600 mb-2">Modal Awal / Laci (Rp)</label>
                   <input type="number" value={cashInput} onChange={e => setCashInput(e.target.value)} className="w-full text-2xl font-black border-2 rounded-xl p-4 text-center focus:outline-none focus:border-blue-500 mb-6" placeholder="0" />
                   <button onClick={() => {
                      try {
                          startShift(parseInt(cashInput, 10) || 0);
                          setActiveModal(null);
                          setCashInput('');
                      } catch (e: any) {
                          setAlertMsg(e.message);
                      }
                   }} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700">Buka Transaksi Kasir</button>
                </div>
             </div>
          </div>
       )}

       {activeModal === 'endshift' && (
          <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
             <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                   <div className="font-bold">Tutup Shift Kasir</div>
                   <button onClick={() => setActiveModal(null)} className="p-2 border rounded-lg bg-white shrink-0 font-bold text-sm hover:bg-slate-100">Batal</button>
                </div>
                <div className="p-6">
                   <div className="bg-blue-50 p-4 rounded-xl mb-6">
                      <div className="text-xs font-bold text-blue-600 mb-1">Diharapkan (Sistem)</div>
                      <div className="text-3xl font-black">{formatRupiah((activeShift?.startingCash || 0) + (activeShift?.totalSales || 0))}</div>
                   </div>
                   <label className="block text-sm font-bold text-slate-600 mb-2">Uang Fisik Dihitung (Rp)</label>
                   <input type="number" value={cashInput} onChange={e => setCashInput(e.target.value)} className="w-full text-2xl font-black border-2 rounded-xl p-4 text-center focus:outline-none focus:border-blue-500 mb-2" placeholder="0" />
                   <button onClick={() => {
                      const expected = (activeShift?.startingCash || 0) + (activeShift?.totalSales || 0);
                      const actual = parseInt(cashInput, 10) || 0;
                      setConfirmData({
                         message: `Tutup shift? Selisih uang kasir adalah ${formatRupiah(actual - expected)}. Lanjutkan?`,
                         onConfirm: () => {
                            endShift(actual, expected);
                            setActiveModal(null);
                            setCashInput('');
                         }
                      });
                   }} disabled={!cashInput} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 mt-4">Akhiri Shift Ini</button>
                </div>
             </div>
          </div>
       )}

      {activeModal === 'cash' && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-50 border-b flex items-center justify-between shrink-0">
               <div className="font-bold text-lg flex items-center gap-2">Pembayaran Tunai</div>
               <button onClick={() => setActiveModal(null)} className="p-2 border rounded-lg bg-white shrink-0 font-bold text-sm hover:bg-slate-100">Batal</button>
            </div>
            <div className="p-6 flex flex-col gap-6">
               <div className="flex justify-between items-center text-lg bg-slate-50 p-4 rounded-xl border">
                 <span className="font-semibold text-slate-500">Total Tagihan</span>
                 <span className="font-black text-slate-800">{formatRupiah(total)}</span>
               </div>
               <div>
                  <label className="text-sm font-bold text-slate-600 mb-2 block">Uang Diterima (Rp)</label>
                  <input type="number" value={cashInput} onChange={e => setCashInput(e.target.value)} autoFocus placeholder="0" className="w-full text-3xl font-black text-center py-4 border-2 rounded-xl focus:outline-none focus:border-blue-500 text-blue-600" />
               </div>
               
               <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setCashInput(total.toString())} className="py-3 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-100 hover:bg-blue-100 text-sm">Uang Pas</button>
                  {[50000, 100000, 200000].map(v => (
                     <button key={v} onClick={() => setCashInput(v.toString())} className="py-3 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 text-sm">{formatRupiah(v)}</button>
                  ))}
               </div>

               {parseInt(cashInput, 10) >= total && (
                  <div className="flex justify-between items-center bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
                    <span className="font-bold text-sm">Kembalian</span>
                    <span className="font-black text-2xl">{formatRupiah(parseInt(cashInput, 10) - total)}</span>
                  </div>
               )}
               <button onClick={handleCheckoutCash} disabled={!cashInput || parseInt(cashInput, 10) < total} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-md disabled:opacity-50 active:scale-95 transition-transform">Konfirmasi Bayar</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'qris' && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-sm flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-4 bg-slate-50 border-b flex items-center justify-between shrink-0">
               <div className="font-bold text-lg flex items-center gap-2">Pembayaran QRIS</div>
               <button onClick={() => setActiveModal(null)} className="p-2 border rounded-lg bg-white shrink-0 font-bold text-sm hover:bg-slate-100">Batal</button>
             </div>
             <div className="p-6 flex flex-col items-center gap-6 text-center">
               <div className="w-48 h-48 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center flex-col gap-2">
                  <div className="text-xs font-bold text-slate-400">TAMPILKAN QRIS APP<br/>DI LAYAR INI / EDC</div>
                  <div className="font-black text-2xl text-slate-800">{formatRupiah(total)}</div>
               </div>
               <div className="w-full text-left">
                  <label className="text-sm font-bold text-slate-600 mb-2 block">Nomor Referensi (Opsional / Wajib App)</label>
                  <input type="text" value={qrisRef} autoFocus onChange={e => setQrisRef(e.target.value)} placeholder="Misal: 12345678" className="w-full py-3 px-4 border-2 rounded-xl focus:outline-none focus:border-green-500 font-mono text-center text-lg" />
               </div>
               <button onClick={handleCheckoutQris} disabled={!qrisRef.trim()} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg shadow-md disabled:opacity-50 active:scale-95 transition-transform">Konfirmasi QRIS</button>
             </div>
          </div>
        </div>
      )}

      {activeModal === 'receipt' && lastTx && (
        <ReceiptModal tx={lastTx} onClose={() => {setActiveModal(null); setLastTx(null);}} />
      )}

      {activeModal === 'history' && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
               <div className="font-bold flex items-center gap-2"><Clock className="w-5 h-5"/>{activeShift ? 'Riwayat Shift Ini' : 'Riwayat Hari Ini'}</div>
               <button onClick={() => setActiveModal(null)} className="p-2 border border-slate-600 rounded-lg hover:bg-slate-800 text-sm font-bold">Tutup</button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                {historyTransactions.map(tx => (
                   <div key={tx.id} className={`bg-white p-4 rounded-xl border mb-3 shadow-sm ${tx.voided ? 'opacity-60 grayscale' : ''}`}>
                      <div className="flex justify-between items-start mb-3 border-b pb-3">
                         <div>
                            <div className="font-mono text-xs font-bold text-slate-500">#{tx.id.toUpperCase()}</div>
                            <div className="text-sm font-medium">{new Date(tx.timestamp).toLocaleTimeString('id-ID')} - {new Date(tx.timestamp).toLocaleDateString('id-ID')}</div>
                         </div>
                         <div className="text-right">
                            <div className={`font-black text-lg leading-none ${tx.voided ? 'line-through text-slate-400' : 'text-slate-800'}`}>{formatRupiah(tx.total)}</div>
                            <div className={`text-xs font-bold px-2 py-0.5 rounded inline-block mt-1 ${tx.paymentMethod === 'QRIS' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{tx.paymentMethod}</div>
                            {tx.voided && <div className="text-xs font-bold px-2 py-0.5 rounded inline-block mt-1 ml-1 bg-red-100 text-red-600">VOID</div>}
                         </div>
                      </div>
                      <div className="text-sm text-slate-600 mb-3 truncate">
                         {tx.items.map(i => `${i.qty}x ${i.product.name}`).join(', ')}
                      </div>
                      <div className="flex gap-2">
                         {(!tx.voided && (currentUser?.role === 'superadmin' || currentUser?.role === 'kasir' || currentUser?.role === 'bos')) && (
                            <button onClick={() => {
                               setConfirmData({
                                  message: 'Yakin membatalkan transaksi ini? Total sales akan divoid.',
                                  onConfirm: () => voidTransaction(tx.id)
                               });
                            }} className="flex-1 text-center py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-semibold text-xs border border-amber-100 transition-colors">
                               Batalkan Transaksi
                            </button>
                         )}
                         {(currentUser?.role === 'superadmin' || currentUser?.role === 'bos') && (
                            <button onClick={() => {
                               setConfirmData({
                                  message: 'Yakin MENGHAPUS secara permanen transaksi ini? Total sales akan dikurangi jika belum dibatalkan.',
                                  onConfirm: () => deleteTransaction(tx.id)
                               });
                            }} className="flex-1 text-center py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-semibold text-xs border border-red-100 transition-colors">
                               Hapus Permanen
                            </button>
                         )}
                      </div>
                   </div>
                ))}
                {historyTransactions.length === 0 && (
                   <div className="text-center py-12 text-slate-400 font-semibold">Belum ada transaksi di shift ini.</div>
                )}
             </div>
          </div>
        </div>
      )}
      
      {alertMsg && <AlertDialog message={alertMsg} onClose={() => setAlertMsg('')} />}
      {confirmData && <ConfirmDialog message={confirmData.message} onConfirm={confirmData.onConfirm} onClose={() => setConfirmData(null)} />}
    </div>
  );
}
