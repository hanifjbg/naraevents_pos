'use client';
import { useEffect, useState, use } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Transaction } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

export default function PrintPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [tx, setTx] = useState<Transaction | null>(null);

    useEffect(() => {
        getDoc(doc(db, 'transactions', id)).then(snap => {
            if (snap.exists()) {
                setTx(snap.data() as Transaction);
                setTimeout(() => window.print(), 500);
            }
        });
    }, [id]);

    if (!tx) return <div className="p-8 text-center font-mono text-xs">Memuat nota...</div>;

    return (
        <div className="w-full max-w-[320px] mx-auto font-mono text-xs text-slate-800 p-4">
            <div className="p-4 border-b border-dashed border-slate-300 text-center space-y-1">
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
            <div className="text-center mt-8 text-[10px] text-slate-400">
                Terima kasih atas kunjungan Anda.
            </div>
        </div>
    );
}
