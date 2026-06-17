import React, { useState } from 'react';
import { Transaction, usePos } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';
import { CheckCircle2, Printer, X, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ReceiptModal({ tx, onClose }: { tx: Transaction, onClose: () => void }) {
  const [showRecipe, setShowRecipe] = useState(false);
  const { menu } = usePos();

  return (
    <div className="fixed inset-0 bg-black/60 z-[200] flex flex-col items-center justify-center p-4 print:p-0 print:bg-white">
       {!showRecipe ? (
           <div className="bg-white w-full max-w-[320px] border-[4px] border-black shadow-neo-lg overflow-hidden flex flex-col font-mono text-xs text-black print:shadow-none print:border-none print:w-full print:max-w-none print:h-auto">
              <div className="p-4 border-b-4 border-black text-center bg-neo-yellow">
                 <div className="w-12 h-12 bg-white border-2 border-black text-black flex items-center justify-center mx-auto mb-2 print:hidden shadow-sm"><CheckCircle2 className="w-6 h-6"/></div>
                 <div className="font-black text-lg uppercase tracking-tight">Nyaman POS</div>
                 <div className="font-bold uppercase text-[10px]">Jl. Contoh No. 123</div>
              </div>
              <div className="p-4 border-b-2 border-dashed border-black space-y-1 bg-white">
                 <div className="flex justify-between font-bold"><span>No</span><span>{tx.id.toUpperCase()}</span></div>
                 <div className="flex justify-between font-bold"><span>Tanggal</span><span>{new Date(tx.timestamp).toLocaleString('id-ID')}</span></div>
                 <div className="flex justify-between font-bold"><span>Kasir</span><span>{tx.cashier}</span></div>
                 <div className="flex justify-between font-bold"><span>Tipe</span><span>{tx.paymentMethod}</span></div>
              </div>
              <div className="p-4 border-b-2 border-dashed border-black bg-white">
                 {tx.items.map(i => (
                    <div key={i.product.id} className="flex flex-col mb-1">
                       <span className="font-black uppercase truncate">{i.product.name}</span>
                       <div className="flex justify-between text-[10px] font-bold">
                          <span>{i.qty} x {formatRupiah(i.product.price)}</span>
                          <span className="font-black">{formatRupiah(i.qty * i.product.price)}</span>
                       </div>
                    </div>
                 ))}
              </div>
              <div className="p-4 font-black text-sm bg-white">
                 <div className="flex justify-between mb-1"><span>TOTAL</span><span>{formatRupiah(tx.total)}</span></div>
                 {tx.paymentMethod === 'CASH' && (
                    <>
                       <div className="flex justify-between font-bold text-xs mb-1"><span>DIBAYAR</span><span>{formatRupiah(tx.cashReceived || 0)}</span></div>
                       <div className="flex justify-between font-bold text-xs"><span>KEMBALI</span><span>{formatRupiah((tx.cashReceived || 0) - tx.total)}</span></div>
                    </>
                 )}
              </div>
              
              <div className="p-4 flex gap-2 w-full bg-white border-t-4 border-black print:hidden justify-center shrink-0 flex-wrap">
                 <Link href={`/print/${tx.id}`} target="_blank" className="flex-1 py-3 bg-white border-2 border-black font-black shadow-sm text-xs flex items-center justify-center gap-1 hover:bg-neo-yellow uppercase transition-colors">
                    <Printer className="w-4 h-4"/> Tab Nota
                 </Link>
                 <button onClick={() => setShowRecipe(true)} className="flex-1 py-3 bg-neo-pink text-black border-2 border-black font-black shadow-sm text-xs flex items-center justify-center gap-1 hover:bg-pink-400 uppercase transition-colors">
                    <FileText className="w-4 h-4"/> Resep
                 </button>
                 <button onClick={onClose} className="w-full py-3 bg-neo-green text-black border-2 border-black font-black shadow-sm text-xs hover:bg-green-400 mt-2 uppercase transition-colors">SELESAI</button>
              </div>
           </div>
       ) : (
           <div className="bg-white w-full max-w-[320px] border-[4px] border-black shadow-neo-lg font-sans text-sm text-black flex flex-col max-h-[80vh] print:hidden">
              <div className="p-4 border-b-4 border-black bg-neo-pink text-black flex items-center justify-between shrink-0">
                 <div className="font-black flex items-center gap-2 uppercase"><FileText className="w-5 h-5"/> Resep Pesanan</div>
                 <button onClick={() => setShowRecipe(false)} className="p-1 hover:bg-white border-2 border-transparent hover:border-black"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-4 overflow-y-auto space-y-4 bg-white">
                 {tx.items.map(i => (
                    <div key={i.product.id} className="bg-white p-3 border-2 border-black shadow-sm">
                       <div className="font-black text-black border-b-2 border-black pb-2 mb-2 flex justify-between uppercase">
                          <span>{i.product.name}</span>
                          <span className="bg-neo-yellow border-2 border-black px-2 py-0.5 text-xs">x{i.qty}</span>
                       </div>
                       
                       {i.product.isBundle && i.product.bundleItems ? (
                           <div className="space-y-3 mt-2">
                               {i.product.bundleItems.map(b => {
                                   const bp = menu.find(m => m.id === b.productId);
                                   return (
                                       <div key={b.productId} className="pl-3 border-l-4 border-black">
                                            <div className="font-bold text-xs text-black mb-1 uppercase">{bp?.name} <span className="bg-neo-yellow border border-black px-1 py-0.5 ml-1 text-[10px]">x{b.qty * i.qty}</span></div>
                                            <div className="text-black text-xs whitespace-pre-wrap font-bold">
                                                {bp?.recipe || "Tidak ada resep."}
                                            </div>
                                       </div>
                                   )
                               })}
                               {i.product.recipe && (
                                   <div className="text-black text-xs whitespace-pre-wrap font-bold mt-3 pt-3 border-t-2 border-black dashed">
                                      {i.product.recipe}
                                   </div>
                               )}
                           </div>
                       ) : (
                           <div className="text-black text-xs whitespace-pre-wrap font-bold mt-2">
                              {i.product.recipe || "Tidak ada resep tersimpan."}
                           </div>
                       )}
                    </div>
                 ))}
              </div>
              <div className="p-4 bg-white border-t-4 border-black shrink-0 relative z-10">
                  <button onClick={() => setShowRecipe(false)} className="w-full py-3 bg-black text-white font-black border-[3px] border-black shadow-neo text-xs hover:translate-y-[2px] transition-all uppercase">Tutup Resep</button>
              </div>
           </div>
       )}
    </div>
  )
}
