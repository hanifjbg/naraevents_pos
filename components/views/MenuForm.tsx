import React, { useState } from 'react';
import { Product, CATEGORIES } from '@/lib/store';
import { X, Save, Plus, Minus, Trash2 } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

export function MenuForm({ menuList, initialData, onSave, onClose }: { menuList: Product[], initialData: Product | null, onSave: (p: Product) => void, onClose: () => void }) {
  const [isBundle, setIsBundle] = useState(initialData?.isBundle || false);
  const [bundleItems, setBundleItems] = useState<{productId: string, qty: number}[]>(initialData?.bundleItems || []);
  const [activeCategory, setActiveCategory] = useState(initialData?.category || CATEGORIES[0]);

  const addBundleItem = (id: string) => {
      const existing = bundleItems.find(b => b.productId === id);
      if (existing) {
          setBundleItems(bundleItems.map(b => b.productId === id ? {...b, qty: b.qty + 1} : b));
      } else {
          setBundleItems([...bundleItems, {productId: id, qty: 1}]);
      }
  };

  const removeBundleItem = (id: string) => {
      const existing = bundleItems.find(b => b.productId === id);
      if (existing && existing.qty > 1) {
          setBundleItems(bundleItems.map(b => b.productId === id ? {...b, qty: b.qty - 1} : b));
      } else {
          setBundleItems(bundleItems.filter(b => b.productId !== id));
      }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const newM: Product = {
         id: initialData ? initialData.id : Math.random().toString(36).substring(2, 10),
         name: fd.get('name') as string,
         price: parseInt(fd.get('price') as string, 10),
         category: fd.get('category') as string,
         recipe: fd.get('recipe') as string,
         isBundle,
         bundleItems: isBundle ? bundleItems : undefined,
      };
      onSave(newM);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex flex-col items-center justify-center p-4">
       <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 h-[90vh]">
          <div className="p-4 border-b bg-slate-50 flex items-center justify-between shrink-0">
             <div className="font-bold">{initialData ? 'Edit Menu / Promo' : 'Tambah Menu / Promo'}</div>
             <button onClick={onClose}><X className="w-5 h-5 text-slate-500 hover:text-slate-800" /></button>
          </div>
          <form id="menu-form" onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama Menu</label>
                    <input name="name" required defaultValue={initialData?.name} className="w-full border rounded-lg p-2.5 focus:border-blue-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Harga (Rp)</label>
                    <input name="price" type="number" required defaultValue={initialData?.price} className="w-full border rounded-lg p-2.5 focus:border-blue-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                    <select name="category" required value={activeCategory} onChange={e => setActiveCategory(e.target.value)} className="w-full border rounded-lg p-2.5 focus:border-blue-500 outline-none bg-white">
                       {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
             </div>
             
             <div className="flex items-center gap-2 mt-4">
                 <input type="checkbox" checked={isBundle} onChange={e => setIsBundle(e.target.checked)} id="isBundle" className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
                 <label htmlFor="isBundle" className="text-sm font-bold text-purple-700">Ini adalah Paket Promo / Gabungan Menu</label>
             </div>

             {isBundle && (
                 <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-4">
                     <div className="font-bold text-sm text-purple-800">Pilih Isi Paket</div>
                     
                     <div className="flex gap-4">
                        <div className="flex-1 max-h-48 overflow-y-auto border border-purple-200 rounded-lg p-2 bg-white">
                            {menuList.filter(m => !m.isBundle && m.id !== initialData?.id).map(m => (
                                <button type="button" key={m.id} onClick={() => addBundleItem(m.id)} className="w-full text-left p-2 hover:bg-purple-50 rounded flex justify-between items-center text-xs border-b last:border-0 border-slate-100">
                                   <span>{m.name}</span>
                                   <span className="text-slate-400"><Plus className="w-3 h-3"/></span>
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 max-h-48 overflow-y-auto border border-purple-200 rounded-lg p-2 bg-white text-xs">
                            {bundleItems.length === 0 ? (
                                <div className="text-slate-400 text-center mt-4">Belum ada item di paket ini</div>
                            ) : bundleItems.map(b => {
                                const prod = menuList.find(p => p.id === b.productId);
                                if (!prod) return null;
                                return (
                                    <div key={b.productId} className="flex justify-between items-center mb-2 bg-purple-50 p-1.5 rounded">
                                        <div className="font-medium truncate pr-2">{prod.name}</div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button type="button" onClick={() => removeBundleItem(b.productId)} className="bg-white p-1 rounded border shadow-sm text-red-500 hover:bg-red-50"><Minus className="w-3 h-3"/></button>
                                            <span className="font-bold w-4 text-center">{b.qty}</span>
                                            <button type="button" onClick={() => addBundleItem(b.productId)} className="bg-white p-1 rounded border shadow-sm text-blue-500 hover:bg-blue-50"><Plus className="w-3 h-3"/></button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                     </div>
                 </div>
             )}

             <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Resep / Deskripsi (Opsional)</label>
                <textarea name="recipe" rows={3} defaultValue={initialData?.recipe} placeholder="Cth: 1 sdm gula, 1 shot espresso, ATAU isi bundle promonya" className="w-full border rounded-lg p-2.5 focus:border-blue-500 outline-none resize-none"></textarea>
             </div>
          </form>
          <div className="p-4 border-t bg-slate-50 shrink-0">
             <button form="menu-form" type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 flex justify-center items-center gap-2"><Save className="w-4 h-4" /> Simpan</button>
          </div>
       </div>
    </div>
  )
}
