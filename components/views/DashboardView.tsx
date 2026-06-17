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
      <div className="flex-1 flex flex-col min-h-[50%] h-1/2 md:h-full bg-transparent relative">
        <div className="bg-white p-3 md:p-4 border-b-[3px] border-black flex flex-col gap-3 shrink-0 relative">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-black" />
              <input type="text" placeholder="Cari menu..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border-[3px] border-black font-bold text-black focus:outline-none focus:bg-neo-yellow/20" />
            </div>
            <button onClick={() => setActiveModal('history')} className="px-3 py-2 bg-neo-pink border-[3px] border-black text-black font-bold text-sm shadow-neo hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none active:scale-95 shrink-0 flex items-center transition-all">
               <Clock className="w-4 h-4 mr-1" /> Riwayat
            </button>
          </div>
          {!searchQuery && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 font-black uppercase text-sm whitespace-nowrap border-[3px] border-black transition-all ${activeCategory === cat ? 'bg-black text-white shadow-neo translate-y-[-2px]' : 'bg-white text-black hover:bg-neo-yellow'}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start content-start hide-scrollbar">
          {filteredMenu.map(item => (
            <button key={item.id} onClick={() => addToCart(item)} className="bg-white p-4 border-[3px] border-black shadow-neo flex flex-col items-start gap-2 hover:bg-neo-yellow hover:-translate-y-1 hover:-translate-x-1 hover:shadow-neo-lg transition-all active:translate-y-0 active:translate-x-0 active:shadow-none text-left">
              <div className="font-black text-black text-sm uppercase leading-tight">{item.name}</div>
              <div className="bg-neo-green px-2 py-1 border-2 border-black font-black text-black text-xs">{formatRupiah(item.price)}</div>
            </button>
          ))}
          {filteredMenu.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-400 font-semibold">Tidak ada menu.</div>
          )}
        </div>

      </div>
      
      <div className="w-full md:w-96 bg-white border-l-[3px] border-black flex flex-col h-1/2 md:h-full relative z-10 shrink-0">
        {!activeShift && currentUser?.role === 'kasir' ? (
           <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-neo-yellow">
              <div className="w-16 h-16 bg-white border-[3px] border-black text-black flex items-center justify-center shadow-neo"><Clock className="w-8 h-8" /></div>
              <h2 className="text-2xl font-black uppercase text-black">Shift Belum Dimulai</h2>
              <p className="text-sm font-bold text-black border-2 border-black bg-white p-2">Anda harus memulai shift sebelum dapat memproses transaksi.</p>
              <button onClick={() => setActiveModal('startshift')} className="w-full bg-neo-blue text-black border-[3px] border-black shadow-neo font-black py-4 hover:bg-blue-400 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all uppercase">Mulai Shift Sekarang</button>
           </div>
        ) : (
          <>
            <div className="p-4 border-b-[3px] border-black bg-neo-yellow flex items-center justify-between shrink-0">
               <div className="font-black text-lg flex items-center gap-2 uppercase"><ShoppingCart className="w-6 h-6"/> Pesanan</div>
               {cart.length > 0 && <button onClick={() => clearCart()} className="text-sm font-black bg-white border-2 border-black px-2 py-1 shadow-sm hover:bg-neo-red hover:text-white">HAPUS</button>}
               {activeShift && (
                  <button onClick={() => setActiveModal('endshift')} className="text-xs bg-neo-red text-white border-2 border-black font-black px-3 py-1.5 shadow-sm hover:bg-red-500 uppercase">Akhiri Shift</button>
               )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 hide-scrollbar bg-white">
              {cart.map(item => (
                <div key={item.product.id} className="bg-white p-3 border-[2px] border-black shadow-sm mb-2 flex flex-col gap-2 relative group hover:bg-neo-yellow transition-colors">
                   <div className="flex justify-between items-start pr-8">
                     <div className="font-black text-sm text-black uppercase leading-tight">{item.product.name}</div>
                     <div className="font-black text-sm shrink-0 ml-2 bg-white px-1 border-2 border-black">{formatRupiah(item.product.price * item.qty)}</div>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="flex items-center border-[2px] border-black bg-white shadow-sm overflow-hidden text-sm">
                        <button onClick={() => decreaseFromCart(item.product.id)} className="px-3 py-1 hover:bg-neo-pink text-black font-black transition-colors border-r-2 border-black"><Minus className="w-3 h-3" /></button>
                        <span className="font-black w-8 text-center">{item.qty}</span>
                        <button onClick={() => addToCart(item.product)} className="px-3 py-1 hover:bg-neo-green text-black font-black transition-colors border-l-2 border-black"><Plus className="w-3 h-3" /></button>
                     </div>
                     <div className="text-xs text-black font-bold border-b-2 border-black border-dashed">@ {formatRupiah(item.product.price)}</div>
                   </div>
                   <button onClick={() => removeFromCart(item.product.id)} className="absolute top-3 right-3 text-white bg-black hover:bg-neo-red p-1 opacity-0 group-hover:opacity-100 transition-opacity border-2 border-black shadow-sm"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {cart.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-black font-black text-sm space-y-2 opacity-50 p-6 text-center uppercase">
                    <ShoppingCart className="w-12 h-12 mb-2" />
                    Belum ada menu yang dipilih.
                 </div>
              )}
            </div>

            <div className="p-4 bg-white border-t-[3px] border-black flex flex-col gap-3 shrink-0">
              <div className="flex justify-between items-end mb-2 border-[3px] border-black bg-neo-yellow p-2 shadow-neo">
                <div className="text-sm font-black text-black">TOTAL</div>
                <div className="text-3xl font-black text-black tracking-tight">{formatRupiah(total)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <button onClick={() => setActiveModal('cash')} disabled={cart.length === 0} className="w-full bg-neo-blue border-[3px] border-black text-black font-black py-4 shadow-neo disabled:opacity-50 disabled:shadow-none active:translate-y-1 active:translate-x-1 active:shadow-none transition-all text-sm uppercase">TUNAI</button>
                 <button onClick={() => setActiveModal('qris')} disabled={cart.length === 0} className="w-full bg-neo-green border-[3px] border-black text-black font-black py-4 shadow-neo disabled:opacity-50 disabled:shadow-none active:translate-y-1 active:translate-x-1 active:shadow-none transition-all text-sm uppercase">QRIS</button>
              </div>
            </div>
          </>
        )}
      </div>

       {activeModal === 'startshift' && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-sm border-[4px] border-black flex flex-col overflow-hidden shadow-neo-lg">
                <div className="p-4 border-b-[4px] border-black bg-neo-yellow flex items-center justify-between">
                   <div className="font-black uppercase">Mulai Shift Kasir</div>
                   <button onClick={() => setActiveModal(null)} className="p-2 border-2 border-black bg-white shrink-0 font-bold text-sm hover:bg-neo-red hover:text-white shadow-neo">Batal</button>
                </div>
                <div className="p-6 bg-white">
                   <label className="block text-sm font-black text-black mb-2 uppercase">Modal Awal / Laci (Rp)</label>
                   <input type="number" value={cashInput} onChange={e => setCashInput(e.target.value)} className="w-full text-2xl font-black border-4 border-black p-4 text-center focus:outline-none focus:bg-neo-yellow/20 mb-6 bg-white" placeholder="0" />
                   <button onClick={() => {
                      try {
                          startShift(parseInt(cashInput, 10) || 0);
                          setActiveModal(null);
                          setCashInput('');
                      } catch (e: any) {
                          setAlertMsg(e.message);
                      }
                   }} className="w-full bg-neo-pink text-black border-[4px] border-black font-black py-4 shadow-neo hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all uppercase">Buka Transaksi Kasir</button>
                </div>
             </div>
          </div>
       )}

       {activeModal === 'endshift' && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-sm border-[4px] border-black shadow-neo-lg flex flex-col overflow-hidden">
                <div className="p-4 border-b-[4px] border-black bg-neo-pink flex items-center justify-between">
                   <div className="font-black uppercase">Tutup Shift Kasir</div>
                   <button onClick={() => setActiveModal(null)} className="p-2 border-2 border-black bg-white shrink-0 font-bold text-sm hover:bg-neo-red hover:text-white shadow-neo">Batal</button>
                </div>
                <div className="p-6">
                   <div className="bg-neo-blue p-4 border-[4px] border-black mb-6 shadow-neo">
                      <div className="text-xs font-black text-black mb-1 uppercase">Diharapkan (Sistem)</div>
                      <div className="text-3xl font-black">{formatRupiah((activeShift?.startingCash || 0) + (activeShift?.totalSales || 0))}</div>
                   </div>
                   <label className="block text-sm font-black text-black mb-2 uppercase">Uang Fisik Dihitung (Rp)</label>
                   <input type="number" value={cashInput} onChange={e => setCashInput(e.target.value)} className="w-full text-2xl font-black border-4 border-black p-4 text-center focus:outline-none focus:bg-neo-yellow/20 mb-2" placeholder="0" />
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
                   }} disabled={!cashInput} className="w-full bg-black text-white font-black py-4 border-[4px] border-black shadow-neo hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all disabled:opacity-50 mt-4 uppercase">Akhiri Shift Ini</button>
                </div>
             </div>
          </div>
       )}

      {activeModal === 'cash' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md flex flex-col border-[4px] border-black shadow-neo-lg overflow-hidden">
            <div className="p-4 bg-neo-blue border-b-[4px] border-black flex items-center justify-between shrink-0">
               <div className="font-black text-lg flex items-center gap-2 uppercase">Pembayaran Tunai</div>
               <button onClick={() => setActiveModal(null)} className="p-2 border-2 border-black bg-white shrink-0 font-bold text-sm hover:bg-neo-red hover:text-white shadow-neo">Batal</button>
            </div>
            <div className="p-6 flex flex-col gap-6">
               <div className="flex justify-between items-center text-lg bg-neo-yellow p-4 border-[4px] border-black shadow-neo">
                 <span className="font-black uppercase">Total Tagihan</span>
                 <span className="font-black text-2xl">{formatRupiah(total)}</span>
               </div>
               <div>
                  <label className="text-sm font-black mb-2 block uppercase">Uang Diterima (Rp)</label>
                  <input type="number" value={cashInput} onChange={e => setCashInput(e.target.value)} autoFocus placeholder="0" className="w-full text-3xl font-black text-center py-4 border-[4px] border-black focus:outline-none focus:bg-neo-yellow/20" />
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setCashInput(total.toString())} className="py-3 bg-neo-pink text-black font-black border-[3px] border-black hover:translate-y-[2px] transition-all shadow-neo hover:shadow-none text-sm uppercase">Uang Pas</button>
                  {[50000, 100000, 200000].map(v => (
                     <button key={v} onClick={() => setCashInput(v.toString())} className="py-3 bg-white text-black font-black border-[3px] border-black hover:bg-neo-yellow transition-all shadow-neo hover:translate-y-[2px] hover:shadow-none text-sm">{formatRupiah(v)}</button>
                  ))}
               </div>

               {parseInt(cashInput, 10) >= total && (
                  <div className="flex justify-between items-center bg-neo-green text-black p-4 border-[4px] border-black shadow-neo">
                    <span className="font-black text-sm uppercase">Kembalian</span>
                    <span className="font-black text-2xl">{formatRupiah(parseInt(cashInput, 10) - total)}</span>
                  </div>
               )}
               <button onClick={handleCheckoutCash} disabled={!cashInput || parseInt(cashInput, 10) < total} className="w-full bg-black text-white py-4 font-black text-lg border-[4px] border-black shadow-neo disabled:opacity-50 active:translate-y-1 active:translate-x-1 active:shadow-none transition-transform uppercase">Konfirmasi Bayar</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'qris' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm flex flex-col border-[4px] border-black shadow-neo-lg overflow-hidden">
             <div className="p-4 bg-neo-green border-b-[4px] border-black flex items-center justify-between shrink-0">
               <div className="font-black text-lg flex items-center gap-2 uppercase">Pembayaran QRIS</div>
               <button onClick={() => setActiveModal(null)} className="p-2 border-[2px] border-black shadow-neo bg-white shrink-0 font-bold text-sm hover:bg-neo-red hover:text-white">Batal</button>
             </div>
             <div className="p-6 flex flex-col items-center gap-6 text-center">
               <div className="w-48 h-48 bg-white border-[4px] border-black shadow-neo rounded-none flex items-center justify-center flex-col gap-2">
                  <div className="text-xs font-black text-black uppercase">TAMPILKAN QRIS APP<br/>DI LAYAR INI / EDC</div>
                  <div className="font-black text-2xl text-black">{formatRupiah(total)}</div>
               </div>
               <div className="w-full text-left">
                  <label className="text-sm font-black text-black mb-2 block uppercase">Nomor Referensi (Opsional)</label>
                  <input type="text" value={qrisRef} autoFocus onChange={e => setQrisRef(e.target.value)} placeholder="Misal: 12345678" className="w-full py-3 px-4 border-[4px] border-black focus:outline-none focus:bg-neo-yellow/20 font-mono text-center text-lg" />
               </div>
               <button onClick={handleCheckoutQris} disabled={!qrisRef.trim()} className="w-full bg-black text-white py-4 font-black border-[4px] border-black shadow-neo disabled:opacity-50 active:translate-y-1 active:translate-x-1 active:shadow-none transition-transform uppercase">Konfirmasi QRIS</button>
             </div>
          </div>
        </div>
      )}

      {activeModal === 'receipt' && lastTx && (
        <ReceiptModal tx={lastTx} onClose={() => {setActiveModal(null); setLastTx(null);}} />
      )}

      {activeModal === 'history' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl h-[80vh] flex flex-col border-[4px] border-black shadow-neo-lg overflow-hidden">
             <div className="p-4 bg-neo-yellow border-b-[4px] border-black flex items-center justify-between shrink-0">
               <div className="font-black flex items-center gap-2 uppercase"><Clock className="w-5 h-5"/>{activeShift ? 'Riwayat Shift Ini' : 'Riwayat Hari Ini'}</div>
               <button onClick={() => setActiveModal(null)} className="p-2 border-[2px] border-black shadow-neo bg-white hover:bg-neo-red hover:text-white text-sm font-bold uppercase">Tutup</button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 bg-[#f0f0f0]">
                {historyTransactions.map(tx => (
                   <div key={tx.id} className={`bg-white p-4 border-[3px] border-black mb-3 shadow-neo ${tx.voided ? 'opacity-50 grayscale' : ''}`}>
                      <div className="flex justify-between items-start mb-3 border-b-2 border-black border-dashed pb-3">
                         <div>
                            <div className="font-black text-xs text-black border-2 border-black inline-block px-1 bg-neo-pink uppercase">#{tx.id.toUpperCase()}</div>
                            <div className="text-sm font-bold mt-1">{new Date(tx.timestamp).toLocaleTimeString('id-ID')} - {new Date(tx.timestamp).toLocaleDateString('id-ID')}</div>
                         </div>
                         <div className="text-right">
                            <div className={`font-black text-lg leading-none ${tx.voided ? 'line-through text-black' : 'text-black'}`}>{formatRupiah(tx.total)}</div>
                            <div className={`text-xs font-black px-2 py-0.5 border-2 border-black shadow-sm inline-block mt-1 ${tx.paymentMethod === 'QRIS' ? 'bg-neo-green text-black' : 'bg-neo-blue text-black'}`}>{tx.paymentMethod}</div>
                            {tx.voided && <div className="text-xs font-black px-2 py-0.5 border-2 border-black shadow-sm inline-block mt-1 ml-1 bg-neo-red text-white uppercase">VOID</div>}
                         </div>
                      </div>
                      <div className="text-sm font-bold text-black mb-3 shrink-0">
                         {tx.items.map(i => `${i.qty}x ${i.product.name}`).join(', ')}
                      </div>
                      <div className="flex gap-3">
                         {(!tx.voided && (currentUser?.role === 'superadmin' || currentUser?.role === 'kasir' || currentUser?.role === 'bos')) && (
                            <button onClick={() => {
                               setConfirmData({
                                  message: 'Yakin membatalkan transaksi ini? Total sales akan divoid.',
                                  onConfirm: () => voidTransaction(tx.id)
                               });
                            }} className="flex-1 text-center py-2 bg-neo-yellow text-black border-[3px] border-black shadow-neo hover:translate-y-[2px] transition-all font-black text-xs uppercase">
                               Batalkan
                            </button>
                         )}
                         {(currentUser?.role === 'superadmin' || currentUser?.role === 'bos') && (
                            <button onClick={() => {
                               setConfirmData({
                                  message: 'Yakin MENGHAPUS secara permanen transaksi ini? Total sales akan dikurangi jika belum dibatalkan.',
                                  onConfirm: () => deleteTransaction(tx.id)
                               });
                            }} className="flex-1 text-center py-2 bg-neo-red text-white border-[3px] border-black shadow-neo hover:translate-y-[2px] transition-all font-black text-xs uppercase">
                               Hapus
                            </button>
                         )}
                      </div>
                   </div>
                ))}
                {historyTransactions.length === 0 && (
                   <div className="text-center py-12 text-black border-4 border-black bg-white shadow-neo font-black uppercase">Belum ada transaksi di shift ini.</div>
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
