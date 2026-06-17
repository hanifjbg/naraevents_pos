import React, { useState } from 'react';
import { Product, CATEGORIES } from '@/lib/store';
import { X, Save, Plus, Minus, Trash2 } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

export function MenuForm({ menuList, initialData, onSave, onClose }: { menuList: Product[], initialData: Product | null, onSave: (p: Product) => void, onClose: () => void }) {
  const [isBundle, setIsBundle] = useState(initialData?.isBundle || false);
  const [bundleItems, setBundleItems] = useState<{productId: string, qty: number}[]>(initialData?.bundleItems || []);
  const [priceInput, setPriceInput] = useState(initialData?.price ? initialData.price.toLocaleString('id-ID') : '');

  const handlePriceInput = (val: string) => {
    const numeric = val.replace(/\D/g, '');
    if (!numeric) {
      setPriceInput('');
    } else {
      setPriceInput(parseInt(numeric, 10).toLocaleString('id-ID'));
    }
  };
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
      const newM: any = {
         id: initialData ? initialData.id : Math.random().toString(36).substring(2, 10),
         name: fd.get('name') as string,
         price: parseInt(priceInput.replace(/\D/g, ''), 10) || 0,
         category: fd.get('category') as string,
         isBundle
      };
      
      const recipeStr = fd.get('recipe') as string;
      if (recipeStr) newM.recipe = recipeStr;
      
      if (isBundle) newM.bundleItems = bundleItems;

      onSave(newM);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4">
       <div className="bg-white border-[4px] border-black shadow-neo-lg w-full max-w-2xl flex flex-col overflow-hidden h-[90vh]">
          <div className="p-4 border-b-[4px] border-black bg-neo-yellow flex items-center justify-between shrink-0">
             <div className="font-black uppercase">{initialData ? 'Edit Menu / Promo' : 'Tambah Menu / Promo'}</div>
             <button onClick={onClose} className="bg-white border-2 border-black p-1 shadow-neo hover:bg-neo-red hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <form id="menu-form" onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-black uppercase mb-1">Nama Menu</label>
                    <input name="name" required defaultValue={initialData?.name} className="w-full border-[3px] border-black font-bold p-2.5 focus:outline-none focus:bg-neo-yellow/20" />
                 </div>
                 <div>
                    <label className="block text-xs font-black uppercase mb-1">Harga (Rp)</label>
                    <input name="price" type="text" inputMode="numeric" required value={priceInput} onChange={e => handlePriceInput(e.target.value)} className="w-full border-[3px] border-black font-bold p-2.5 focus:outline-none focus:bg-neo-yellow/20" />
                 </div>
                 <div>
                    <label className="block text-xs font-black uppercase mb-1">Kategori</label>
                    <select name="category" required value={activeCategory} onChange={e => setActiveCategory(e.target.value)} className="w-full border-[3px] border-black font-bold p-2.5 focus:outline-none focus:bg-neo-yellow/20 bg-white">
                       {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
             </div>
             
             <div className="flex items-center gap-2 mt-4 bg-neo-pink border-[3px] border-black p-3 w-max shadow-sm">
                 <input type="checkbox" checked={isBundle} onChange={e => setIsBundle(e.target.checked)} id="isBundle" className="w-5 h-5 border-[2px] border-black accent-black bg-white focus:outline-none" />
                 <label htmlFor="isBundle" className="text-sm font-black uppercase cursor-pointer">Ini adalah Paket Promo / Gabungan Menu</label>
             </div>

             {isBundle && (
                 <div className="bg-white p-4 border-[4px] border-black shadow-neo mt-4 space-y-4">
                     <div className="font-black uppercase text-sm border-b-[3px] border-black pb-1 inline-block">Pilih Isi Paket</div>
                     
                     <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 max-h-48 overflow-y-auto border-[3px] border-black p-2 bg-white">
                            {menuList.filter(m => !m.isBundle && m.id !== initialData?.id).map(m => (
                                <button type="button" key={m.id} onClick={() => addBundleItem(m.id)} className="w-full text-left p-2 hover:bg-neo-yellow hover:translate-x-1 transition-all flex justify-between items-center text-xs font-bold uppercase border-b-2 border-dashed border-black last:border-0">
                                   <span>{m.name}</span>
                                   <span className="text-black"><Plus className="w-4 h-4"/></span>
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 max-h-48 overflow-y-auto border-[3px] border-black p-2 bg-neo-yellow/20 text-xs">
                            {bundleItems.length === 0 ? (
                                <div className="text-black font-bold uppercase text-center mt-4">Belum ada item di paket ini</div>
                            ) : bundleItems.map(b => {
                                const prod = menuList.find(p => p.id === b.productId);
                                if (!prod) return null;
                                return (
                                    <div key={b.productId} className="flex justify-between items-center mb-2 bg-white border-2 border-black p-2 shadow-sm">
                                        <div className="font-black uppercase truncate pr-2">{prod.name}</div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button type="button" onClick={() => removeBundleItem(b.productId)} className="bg-neo-red p-1 border-2 border-black shadow-sm text-white hover:translate-y-[2px] transition-all"><Minus className="w-3 h-3"/></button>
                                            <span className="font-black w-4 text-center">{b.qty}</span>
                                            <button type="button" onClick={() => addBundleItem(b.productId)} className="bg-neo-green p-1 border-2 border-black shadow-sm text-black hover:translate-y-[2px] transition-all"><Plus className="w-3 h-3"/></button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                     </div>
                 </div>
             )}

             <div>
                <label className="block text-xs font-black uppercase mb-1">Resep / Deskripsi (Opsional)</label>
                <textarea name="recipe" rows={3} defaultValue={initialData?.recipe} placeholder="Cth: 1 sdm gula, 1 shot espresso, ATAU isi bundle promonya" className="w-full border-[3px] border-black font-bold p-2.5 focus:outline-none focus:bg-neo-yellow/20 resize-none font-mono"></textarea>
             </div>
          </form>
          <div className="p-4 border-t-[4px] border-black shrink-0 relative z-10 bg-white">
             <button form="menu-form" type="submit" className="w-full bg-neo-blue text-black font-black border-[4px] border-black uppercase text-lg py-3 shadow-neo hover:translate-y-[2px] transition-all flex justify-center items-center gap-2">
                 <Save className="w-5 h-5" /> Simpan
             </button>
          </div>
       </div>
    </div>
  )
}
