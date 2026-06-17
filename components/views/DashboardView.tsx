'use client';
import { useState } from 'react';
import { usePos, Transaction } from '@/lib/store';
import { CATEGORIES, Product } from '@/lib/constants';
import { formatRupiah } from '@/lib/utils';
import { ShoppingCart, Plus, Minus, Trash2, Clock, CheckCircle2, ChevronLeft, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlertDialog, ConfirmDialog } from './Dialogs';

export default function DashboardView() {
  const { currentUser, menu, cart, addToCart, decreaseFromCart, removeFromCart, clearCart, checkout, transactions, voidTransaction, activeShift } = usePos();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [activeModal, setActiveModal] = useState<'qris' | 'cash' | 'receipt' | 'history' | null>(null);
  const [cashInput, setCashInput] = useState('');
  const [qrisRef, setQrisRef] = useState('');
  const [lastTx, setLastTx] = useState<Transaction | null>(null);
  const [alertMsg, setAlertMsg] = useState('');
  const [confirmData, setConfirmData] = useState<{message: string, onConfirm: () => void} | null>(null);

  const filteredMenu = menu.filter(item => item.category === activeCategory);
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
    }
  };

  const cashValue = parseInt(cashInput, 10) || 0;
  const cashChange = cashValue - total;

  const handleNumpad = (val: string | number) => {
    if (val === 'clear') setCashInput('');
    else if (val === 'del') setCashInput(p => p.slice(0, -1));
    else if (val === '000') setCashInput(p => p === '' ? '' : p + '000');
    else if (val === 'pas') setCashInput(total.toString());
    else if (typeof val === 'number') setCashInput(val.toString()); // preset number
    else setCashInput(p => p + val); // string number digit 0-9
  };

  const historyTransactions = activeShift 
     ? transactions.filter(t => t.shiftId === activeShift.id) 
     : transactions.filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString());

  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      {/* Left Menu Selection */}
      <div className="flex-1 flex flex-col min-h-[50%] h-1/2 md:h-full bg-slate-50 relative">
        <div className="bg-white p-3 md:p-4 shadow-sm flex items-center shrink-0 border-b relative">
          <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap shadow-sm border transition-colors ${activeCategory === cat ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                {cat}
              </button>
            ))}
          </div>
          <button onClick={() => setActiveModal('history')} className="ml-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 shadow-sm flex items-center font-bold text-sm shrink-0">
             <Clock className="w-4 h-4 mr-1" /> Riwayat
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start content-start hide-scrollbar">
          {filteredMenu.map(item => (
            <div key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md hover:border-blue-500 transition-all select-none active:scale-95 flex flex-col">
              <div className="font-bold text-sm mb-2 h-10 overflow-hidden line-clamp-2 leading-tight">{item.name}</div>
              <div className="text-blue-600 font-bold mt-auto">{formatRupiah(item.price)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Cart List */}
      <div className="w-full md:w-[360px] lg:w-[400px] bg-white border-t md:border-l md:border-t-0 h-1/2 md:h-full flex flex-col shrink-0 relative z-10">
        <div className="p-4 border-b font-bold flex justify-between items-center bg-slate-50 shrink-0">
          <span>Pesanan Saat Ini</span>
          {cart.length > 0 && <button onClick={clearCart} className="text-red-500 text-sm hover:underline">Kosongkan</button>}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
          {cart.map(item => (
            <div key={item.product.id} className="flex flex-col gap-2 relative border-b border-slate-100 pb-3">
              <div className="font-semibold text-sm pr-6 leading-tight">{item.product.name}</div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-sm font-medium">{formatRupiah(item.product.price)}</span>
                <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                  <button onClick={() => decreaseFromCart(item.product.id)} className="w-7 h-7 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 active:scale-95 transition-transform"><Minus className="w-4 h-4" /></button>
                  <span className="font-bold text-sm w-5 text-center">{item.qty}</span>
                  <button onClick={() => addToCart(item.product)} className="w-7 h-7 flex items-center justify-center bg-blue-600 rounded shadow-sm text-white active:scale-95 transition-transform"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 min-h-[300px]">
              <ShoppingCart className="w-12 h-12 opacity-20" />
              <p>Belum ada pesanan</p>
            </div>
          )}
        </div>
        <div className="p-4 bg-white border-t space-y-3 shrink-0">
          <div className="flex justify-between font-bold text-lg">
            <span>Total Tagihan</span>
            <span className="text-blue-600">{formatRupiah(total)}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveModal('qris')} disabled={cart.length === 0} className="flex-1 bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 disabled:opacity-50 active:scale-95 transition-transform">QRIS</button>
            <button onClick={() => setActiveModal('cash')} disabled={cart.length === 0} className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 active:scale-95 transition-transform">TUNAI</button>
          </div>
        </div>
        
        {/* Cash Modal */}
        {activeModal === 'cash' && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-bottom-5 duration-200">
            <div className="p-4 bg-slate-50 border-b flex items-center justify-between shrink-0">
               <div className="font-bold text-lg flex items-center gap-2">Pembayaran Tunai</div>
               <button onClick={() => setActiveModal(null)} className="p-2 border rounded-lg bg-white shrink-0 font-bold text-sm hover:bg-slate-100">Batal</button>
            </div>
            <div className="p-4 bg-slate-100 flex-col flex gap-2 shrink-0">
              <div className="flex justify-between text-sm font-semibold text-slate-500">
                 <span>Total Tagihan</span>
                 <span className="text-slate-800 text-lg">{formatRupiah(total)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-slate-500">
                 <span>Uang Diterima</span>
                 <span className="text-blue-600 text-2xl font-bold">{cashInput ? formatRupiah(cashValue) : 'Rp 0'}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-slate-500 pt-2 border-t border-slate-200/50">
                 <span>Kembalian</span>
                 <span className={cn("text-lg font-bold", cashChange < 0 ? "text-red-500" : "text-green-600")}>
                    {cashChange < 0 ? "-" + formatRupiah(Math.abs(cashChange)) : formatRupiah(cashChange)}
                 </span>
              </div>
            </div>
            <div className="flex-1 bg-slate-200/50 p-2 overflow-y-auto">
               <div className="grid grid-cols-4 gap-2 mb-2 p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                  <button onClick={() => handleNumpad(10000)} className="py-3 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200">10K</button>
                  <button onClick={() => handleNumpad(20000)} className="py-3 bg-green-50 text-green-700 font-bold rounded-lg border border-green-200">20K</button>
                  <button onClick={() => handleNumpad(50000)} className="py-3 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200">50K</button>
                  <button onClick={() => handleNumpad(100000)} className="py-3 bg-red-50 text-red-700 font-bold rounded-lg border border-red-200">100K</button>
               </div>
               <div className="grid grid-cols-4 gap-2 p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                  {['1','2','3'].map(n => <button key={n} onClick={() => handleNumpad(n)} className="py-4 text-xl font-bold bg-slate-50 hover:bg-slate-100 rounded-lg">{n}</button>)}
                  <button onClick={() => handleNumpad('pas')} className="py-4 text-sm font-bold bg-slate-800 text-white hover:bg-slate-700 rounded-lg shadow-sm row-span-2">UANG<br/>PAS</button>
                  {['4','5','6'].map(n => <button key={n} onClick={() => handleNumpad(n)} className="py-4 text-xl font-bold bg-slate-50 hover:bg-slate-100 rounded-lg">{n}</button>)}
                  {['7','8','9'].map(n => <button key={n} onClick={() => handleNumpad(n)} className="py-4 text-xl font-bold bg-slate-50 hover:bg-slate-100 rounded-lg">{n}</button>)}
                  <button onClick={() => handleNumpad('clear')} className="py-4 text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg">C</button>
                  <button onClick={() => handleNumpad('000')} className="py-4 text-xl font-bold bg-slate-50 hover:bg-slate-100 rounded-lg relative overflow-hidden"><span className="text-xs absolute top-1 right-2 text-slate-400">000</span>{'.000'}</button>
                  <button onClick={() => handleNumpad('0')} className="py-4 text-xl font-bold bg-slate-50 hover:bg-slate-100 rounded-lg">0</button>
                  <button onClick={() => handleNumpad('del')} className="py-4 text-sm font-bold bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center"><ChevronLeft className="w-5 h-5"/></button>
                  <button onClick={handleCheckoutCash} disabled={cashChange < 0} className="col-span-4 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-md disabled:bg-slate-300 disabled:opacity-50 active:scale-95 transition-transform mt-2">Bayar Sekarang</button>
               </div>
            </div>
          </div>
        )}

        {/* QRIS Modal */}
        {activeModal === 'qris' && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-bottom-5 duration-200">
             <div className="p-4 bg-slate-50 border-b flex items-center justify-between shrink-0">
               <div className="font-bold text-lg flex items-center gap-2">Pembayaran QRIS</div>
               <button onClick={() => setActiveModal(null)} className="p-2 border rounded-lg bg-white shrink-0 font-bold text-sm hover:bg-slate-100">Batal</button>
             </div>
             <div className="p-6 flex-col flex gap-6 shrink-0 bg-white items-center">
                <div className="w-full bg-slate-100 rounded-2xl p-6 text-center shadow-inner border border-slate-200">
                   <div className="text-sm font-semibold text-slate-500 mb-1">Tagihan QRIS</div>
                   <div className="text-4xl text-green-600 font-bold">{formatRupiah(total)}</div>
                </div>
                <div className="w-full text-center space-y-4">
                   <p className="text-sm text-slate-600 font-medium">Pembeli scan QRIS dan lakukan pembayaran. Setelah berhasil, masukkan No. Ref / ID Transaksi dari aplikasi pembeli.</p>
                   <div>
                     <label className="text-sm font-bold self-start block text-left mb-2 text-slate-800">No. Referensi / ID Transaksi</label>
                     <input type="text" autoFocus value={qrisRef} onChange={e => setQrisRef(e.target.value)} className="w-full border-2 border-slate-300 p-4 rounded-xl text-lg font-mono focus:border-green-500 outline-none uppercase tracking-widest" placeholder="Misal: QR1234567" />
                   </div>
                </div>
             </div>
             <div className="p-4 mt-auto">
               <button onClick={handleCheckoutQris} disabled={!qrisRef.trim()} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg shadow-md disabled:opacity-50 active:scale-95 transition-transform">Konfirmasi QRIS</button>
             </div>
          </div>
        )}

        {/* Receipt / Invoice Modal */}
        {activeModal === 'receipt' && lastTx && (
          <div className="absolute inset-0 bg-slate-100 z-30 flex flex-col animate-in zoom-in-95 duration-200 p-4 items-center justify-center">
             <div className="bg-white w-full max-w-[320px] shadow-2xl rounded-lg overflow-hidden flex flex-col font-mono text-xs text-slate-800">
                <div className="p-4 border-b border-dashed border-slate-300 text-center space-y-1">
                   <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2"><CheckCircle2 className="w-6 h-6"/></div>
                   <div className="font-bold text-base uppercase">Nyaman POS</div>
                   <div>Tanda Terima Pembayaran</div>
                </div>
                <div className="p-4 border-b border-dashed border-slate-300 space-y-2">
                   <div className="flex justify-between"><span>No:</span><span>{lastTx.id.slice(0, 8).toUpperCase()}</span></div>
                   <div className="flex justify-between"><span>Waktu:</span><span>{new Date(lastTx.timestamp).toLocaleString('id-ID')}</span></div>
                   <div className="flex justify-between"><span>Kasir:</span><span>{lastTx.cashier}</span></div>
                   <div className="flex justify-between"><span>Metode:</span><span className="font-bold">{lastTx.paymentMethod}</span></div>
                   {lastTx.paymentMethod === 'QRIS' && lastTx.qrisRef && <div className="flex justify-between"><span>No.Ref:</span><span className="uppercase">{lastTx.qrisRef}</span></div>}
                </div>
                <div className="p-4 border-b border-dashed border-slate-300 space-y-2">
                   {lastTx.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                         <div>{it.product.name} <br/><span className="text-slate-500">{it.qty} x {formatRupiah(it.product.price)}</span></div>
                         <div className="self-end">{formatRupiah(it.qty * it.product.price)}</div>
                      </div>
                   ))}
                </div>
                <div className="p-4 bg-slate-50 space-y-2 pb-6">
                   <div className="flex justify-between font-bold text-sm"><span>TOTAL</span><span>{formatRupiah(lastTx.total)}</span></div>
                   {lastTx.paymentMethod === 'CASH' && (
                      <>
                        <div className="flex justify-between"><span>TUNAI</span><span>{formatRupiah(lastTx.cashReceived || 0)}</span></div>
                        <div className="flex justify-between"><span>KEMBALI</span><span>{formatRupiah(lastTx.change || 0)}</span></div>
                      </>
                   )}
                </div>
             </div>
             <button onClick={() => { setActiveModal(null); setLastTx(null); }} className="mt-6 font-bold text-slate-500 bg-white px-6 py-3 rounded-full shadow hover:bg-slate-50 active:scale-95 transition-transform">Selesai & Tutup</button>
          </div>
        )}

        {/* History Modal */}
        {activeModal === 'history' && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col animate-in slide-in-from-right duration-200">
             <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-md">
               <div className="font-bold flex items-center gap-2"><Clock className="w-5 h-5"/>{activeShift ? 'Riwayat Shift Ini' : 'Riwayat Hari Ini'}</div>
               <button onClick={() => setActiveModal(null)} className="p-2 border border-slate-600 rounded-lg hover:bg-slate-800 text-sm font-bold">Tutup</button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 hide-scrollbar">
                {historyTransactions.map(tx => (
                   <div key={tx.id} className={cn("bg-white p-4 rounded-xl shadow-sm border", tx.voided ? "border-red-200 bg-red-50/50" : "border-slate-200")}>
                      <div className="flex justify-between items-start mb-2">
                         <div>
                            <div className="text-xs text-slate-500 font-mono">{new Date(tx.timestamp).toLocaleTimeString('id-ID')} - {tx.id.slice(0,6).toUpperCase()}</div>
                            <div className="font-bold text-slate-800 mt-1">{formatRupiah(tx.total)}</div>
                         </div>
                         <div className="text-right">
                           <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", tx.paymentMethod === 'QRIS' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>{tx.paymentMethod}</span>
                           {tx.voided && <div className="text-xs text-red-600 font-bold mt-1">BATAL <Trash2 className="w-3 h-3 inline"/></div>}
                         </div>
                      </div>
                      <div className="text-sm text-slate-600 mb-3 truncate">
                         {tx.items.map(i => `${i.qty}x ${i.product.name}`).join(', ')}
                      </div>
                      {(!tx.voided && (currentUser?.role === 'superadmin' || currentUser?.role === 'kasir' || currentUser?.role === 'bos')) && (
                         <button onClick={() => {
                            setConfirmData({
                               message: 'Yakin membatalkan transaksi ini? Total sales akan divoid.',
                               onConfirm: () => voidTransaction(tx.id)
                            });
                         }} className="w-full text-center py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-semibold text-xs border border-red-100 transition-colors">
                            Batalkan Transaksi
                         </button>
                      )}
                   </div>
                ))}
                {historyTransactions.length === 0 && (
                   <div className="flex flex-col items-center justify-center p-8 text-slate-400 gap-2 h-full">
                      <Search className="w-10 h-10 opacity-20" />
                      <p className="text-sm font-medium">Belum ada transaksi di riwayat ini.</p>
                   </div>
                )}
             </div>
          </div>
        )}
      </div>
      
      {alertMsg && <AlertDialog message={alertMsg} onClose={() => setAlertMsg('')} />}
      {confirmData && <ConfirmDialog message={confirmData.message} onConfirm={confirmData.onConfirm} onClose={() => setConfirmData(null)} />}
    </div>
  );
}
