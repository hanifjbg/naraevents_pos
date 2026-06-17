import React, { useState } from 'react';
import { Transaction } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';
import { CheckCircle2, Printer, X, FileText } from 'lucide-react';

export default function ReceiptModal({ tx, onClose }: { tx: Transaction, onClose: () => void }) {
  const [showRecipe, setShowRecipe] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[200] flex flex-col items-center justify-center p-4 print:p-0 print:bg-white animate-in fade-in duration-200">
       {!showRecipe ? (
           <div className="bg-white w-full max-w-[320px] shadow-2xl rounded-lg overflow-hidden flex flex-col font-mono text-xs text-slate-800 animate-in zoom-in-95 duration-200 print:shadow-none print:w-full print:max-w-none print:h-auto">
              <div className="p-4 border-b border-dashed border-slate-300 text-center space-y-1">
                 <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 print:hidden"><CheckCircle2 className="w-6 h-6"/></div>
                 <div className="font-bold text-base uppercase">Nyaman POS</div>
                 <div className="text-slate-500 text-[10px]">Jl. Contoh No. 123</div>
              </div>
              <div className="p-4 border-b border-dashed border-slate-300 space-y-1">
                 <div className="flex justify-between"><span>No</span><span>{tx.id.toUpperCase()}</span></div>
                 <div className="flex justify-between"><span>Tanggal</span><span>{new Date(tx.timestamp).toLocaleString('id-ID')}</span></div>
                 <div className="flex justify-between"><span>Kasir</span><span>{tx.cashier}</span></div>
                 <div className="flex justify-between"><span>Tipe</span><span>{tx.paymentMethod}</span></div>
              </div>
              <div className="p-4 border-b border-dashed border-slate-300">
                 {tx.items.map(i => (
                    <div key={i.product.id} className="flex flex-col mb-1">
                       <span className="font-bold truncate">{i.product.name}</span>
                       <div className="flex justify-between text-[10px]">
                          <span>{i.qty} x {formatRupiah(i.product.price)}</span>
                          <span className="font-bold">{formatRupiah(i.qty * i.product.price)}</span>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="p-4 font-bold text-sm">
                 <div className="flex justify-between mb-1"><span>TOTAL</span><span>{formatRupiah(tx.total)}</span></div>
                 {tx.paymentMethod === 'CASH' && (
                    <>
                       <div className="flex justify-between font-normal text-xs mb-1"><span>DIBAYAR</span><span>{formatRupiah(tx.cashReceived || 0)}</span></div>
                       <div className="flex justify-between font-normal text-xs"><span>KEMBALI</span><span>{formatRupiah((tx.cashReceived || 0) - tx.total)}</span></div>
                    </>
                 )}
              </div>
              
              <div className="p-4 flex gap-2 w-full bg-slate-100 print:hidden justify-center shrink-0 flex-wrap">
                 <button onClick={() => window.print()} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded shadow text-xs flex items-center justify-center gap-1 hover:bg-slate-700"><Printer className="w-4 h-4"/> Print / PDF</button>
                 <button onClick={() => setShowRecipe(true)} className="flex-1 py-3 bg-amber-100 text-amber-700 font-bold rounded shadow text-xs flex items-center justify-center gap-1 hover:bg-amber-200"><FileText className="w-4 h-4"/> Resep</button>
                 <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white font-bold rounded shadow text-xs hover:bg-blue-700 mt-2">SELESAI</button>
              </div>
           </div>
       ) : (
           <div className="bg-white w-full max-w-[320px] shadow-2xl rounded-lg font-sans text-sm text-slate-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh] print:hidden">
              <div className="p-4 border-b bg-amber-50 text-amber-800 flex items-center justify-between shrink-0 rounded-t-lg">
                 <div className="font-bold flex items-center gap-2"><FileText className="w-5 h-5"/> Resep Pesanan</div>
                 <button onClick={() => setShowRecipe(false)} className="p-1 hover:bg-amber-200 rounded"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-4 overflow-y-auto space-y-4">
                 {tx.items.map(i => (
                    <div key={i.product.id} className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                       <div className="font-bold text-amber-900 border-b border-amber-200 pb-2 mb-2 flex justify-between">
                          <span>{i.product.name}</span>
                          <span className="bg-amber-200 px-2 py-0.5 rounded text-xs">x{i.qty}</span>
                       </div>
                       <div className="text-amber-800 text-xs whitespace-pre-wrap font-medium">
                          {i.product.recipe || "Tidak ada resep tersimpan."}
                       </div>
                    </div>
                 ))}
              </div>
              <div className="p-4 bg-slate-50 border-t shrink-0">
                  <button onClick={() => setShowRecipe(false)} className="w-full py-3 bg-slate-800 text-white font-bold rounded-lg shadow text-xs hover:bg-slate-700">Tutup Resep</button>
              </div>
           </div>
       )}
    </div>
  )
}
