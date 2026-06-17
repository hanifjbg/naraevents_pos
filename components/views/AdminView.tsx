import React, { useState } from 'react';
import { usePos, User, Product, CATEGORIES } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';
import { Plus, Edit2, Trash2, X, Save, Users, Utensils, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from './Dialogs';
import { MenuForm } from './MenuForm';

const SEED_MENU: Partial<Product>[] = [
   { name: 'AMERICANO', price: 15000, category: 'Minuman', recipe: 'Espresso: 30ml\nAIR: 150ml\nGelas: CUP 14 Oz\nMethode: Masukkan espresso ke dalam cup, Tuang air' },
   { name: 'AMERICANO STRAWBERRY', price: 18000, category: 'Minuman', recipe: 'Espresso: 20ml\nAIR: 170ml\nSYRUP STRAWBERRY: 20ml\nGelas: CUP 14 Oz\nMethode: Masukkan espresso ke dalam cup, masukkan syrup, tuang air' },
   { name: 'ES KOPI SUSU PANDAN', price: 20000, category: 'Minuman', recipe: 'Espresso: 20ml\nSUSU: 100ml\nSYRUP PANDAN: 20ml\nGelas: CUP 14 Oz\nMethode: Masukkan espresso ke dalam cup, masukkan susu, masukkan syrup' },
   { name: 'ES KOPI SUSU ALMOND', price: 22000, category: 'Minuman', recipe: 'Espresso: 20ml\nSYRUP ALMOND: 20ml\nAIR: 60ml\nUHT milk: 100ml\nEs batu: 150gr\nGelas: HI BALL 14 OZ\nMethode: Tuang syrup ke dalam gelas, Tuang susu UHT lalu stir dengan mixer, masukkan es batu, Tuang espresso' },
   { name: 'ICE TEA', price: 10000, category: 'Minuman', recipe: 'POWDER TEA: 20gr\nAIR: 150ml\nEs batu: 150gr\nGelas: HI BALL 14 OZ\nMethode: masukkan powder, masukkan air, mixer, tuang es batu' },
   { name: 'ICE Strawberry TEA', price: 12000, category: 'Minuman', recipe: 'POWDER TEA: 20gr\nSTRAWBERRY syrup: 20ml\nAIR: 150ml\nEs batu: 150gr\nGelas: HI BALL 14 OZ\nMethode: Tuang syrup dan ke dalam gelas, Tuang susu UHT lalu stir dengan mixer, Isi gelas dengan es batu' },
   { name: 'ICE PANDAN TEA', price: 12000, category: 'Minuman', recipe: 'POWDER TEA: 20gr\nPandan syrup: 20ml\nair: 150ml\nEs batu: 200gr\nGelas: HI BALL 14 OZ\nMethode: Tuang syrup dan powder ke dalam gelas, Tuang air putih, Isi gelas dengan es batu' },
   { name: 'THAI TEA', price: 15000, category: 'Minuman', recipe: 'powder thai tea: 20gr\nAir putih: 100ml\nsusu: 100ml\nEs batu: 150gr\nGelas: HI BALL 14 OZ\nMethode: tuang powder, Isi gelas dengan es batu, Tuang air putih, masukkan susu' },
   { name: 'CHOCO MILK', price: 18000, category: 'Minuman', recipe: 'powder coklat: 20gr\nUHT milk: 100ml\nEs batu: 200gr\nGelas: HI BALL 14 OZ\nMethode: Tuang powder ke dalam gelas, Tuang susu UHT lalu stir dengan mixer, Isi gelas dengan es batu' },
   { name: 'STRAWBERRY MILK', price: 18000, category: 'Minuman', recipe: 'syrup strawberry: 20ml\nsusu: 100ml\nGelas: CUP 7 OZ\nMethode: masukkan syrup, masukkan susu dan es batu' },
   { name: 'CHOCO ALMOND', price: 20000, category: 'Minuman', recipe: 'Coklat bubuk: 20gr\nsyrup almond: 20ml\nsusu: 100ml\nGelas: CUP 7 OZ\nMethode: Tuang powder dan air ke dalm gelas, masukkan susu dan es batu, masukkan syrup' },
   { name: 'BLACK PINK', price: 22000, category: 'Minuman', recipe: 'charcoal powder: 20gr\nsyrup strawberry: 20ml\nsusu: 100ml\nEs batu: 150gr\nGelas: HI BALL 11 OZ\nMethode: masukkan syrup dan susu, mixer, pada gelas satunya buat adonan charcoal dan susu' },
   { name: 'Choco Cheese', price: 22000, category: 'Minuman', recipe: 'choco chese powder: 20gr\nair: 100ml\nsusu: 100ml\nEs batu: 150gr\nGelas: HI BALL 11 OZ\nMethode: masukkan syrup dan susu, mixer, pada gelas satunya buat adonan charcoal dan susu' },
   { name: 'milky orange', price: 18000, category: 'Minuman', recipe: 'syrup orange: 40ml\nair: 100ml\nsusu: 100ml\nEs batu: 150gr\nGelas: HI BALL 11 OZ\nMethode: masukkan syrup dan susu, mixer, pada gelas satunya buat adonan charcoal dan susu' },
   { name: 'pink lava', price: 18000, category: 'Minuman', recipe: 'syrup cocopandan: 40ml\nair: 100ml\nsusu: 100ml\nEs batu: 150gr\nGelas: HI BALL 11 OZ\nMethode: masukkan syrup dan susu, mixer, pada gelas satunya buat adonan charcoal dan susu' }
];

export default function AdminView() {
  const { menu, setMenu, users, updateUser, deleteUser, addUser, purgeData } = usePos();
  const [activeTab, setActiveTab] = useState<'menu' | 'users' | 'danger'>('menu');
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [editingMenu, setEditingMenu] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [confirmData, setConfirmData] = useState<{message: string, onConfirm: () => void} | null>(null);

  const filteredMenu = menu.filter(item => item.category === activeCategory);

  const handleMenuDelete = (id: string) => {
     setConfirmData({
        message: 'Yakin ingin menghapus menu ini?',
        onConfirm: () => setMenu(menu.filter(m => m.id !== id))
     });
  };

  const handleMenuSave = (newM: Product) => {
     if (editingMenu) {
        setMenu(menu.map(m => m.id === editingMenu.id ? newM : m));
     } else {
        setMenu([...menu, newM]);
     }
     setEditingMenu(null);
     setIsAdding(false);
  };

  const handleUserDelete = (username: string) => {
     setConfirmData({
        message: 'Yakin ingin menghapus pengguna ini?',
        onConfirm: () => deleteUser(username)
     });
  };

  const handleUserSave = (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     const fd = new FormData(e.currentTarget);
     const isEditing = !!editingUser && !isAddingUser;
     const newU: any = {
        username: fd.get('username') as string,
        name: (fd.get('name') as string) || fd.get('username') as string,
        role: fd.get('role') as any,
     };
     const pinStr = fd.get('pin') as string;
     if (pinStr) newU.pin = pinStr;
     
     if (isEditing) {
        updateUser(newU);
     } else {
        addUser(newU);
     }
     setEditingUser(null);
     setIsAddingUser(false);
  };

  const handleSeedMenu = () => {
    setConfirmData({
       message: 'Yakin ingin menambahkan seed menu? Ini akan menimpa menu dengan nama yang sama',
       onConfirm: () => {
          const freshMenu = [...menu];
          SEED_MENU.forEach(sm => {
             const existingIdx = freshMenu.findIndex(m => m.name === sm.name);
             const generatedId = Math.random().toString(36).substring(2, 10);
             if (existingIdx !== -1) {
                 freshMenu[existingIdx] = { ...freshMenu[existingIdx], ...sm, id: freshMenu[existingIdx].id };
             } else {
                 freshMenu.push({ ...sm, id: generatedId } as Product);
             }
          });
          setMenu(freshMenu);
          setConfirmData(null);
       }
    });
  };

  return (
    <div className="p-6 h-full overflow-y-auto flex flex-col gap-6 w-full max-w-6xl mx-auto">
       <div className="flex bg-white rounded-xl shadow-sm border p-1 shrink-0 w-max overflow-x-auto max-w-full">
          <button onClick={() => setActiveTab('menu')} className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === 'menu' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}><Utensils className="w-4 h-4"/> Menu Makanan</button>
          <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}><Users className="w-4 h-4"/> Pengurus & Kasir</button>
          <button onClick={() => setActiveTab('danger')} className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === 'danger' ? 'bg-red-600 text-white shadow-md' : 'text-red-500 hover:bg-red-50'}`}><AlertTriangle className="w-4 h-4"/> Berbahaya</button>
       </div>

       {activeTab === 'menu' && (
          <div className="flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <div className="flex gap-2">
                   {CATEGORIES.map(c => (
                      <button key={c} onClick={() => setActiveCategory(c)} className={`px-4 py-2 rounded-full font-bold text-sm border ${activeCategory === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600'}`}>{c}</button>
                   ))}
                </div>
                <div className="flex gap-2">
                   <button onClick={handleSeedMenu} className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1 shadow-sm">
                      <Save className="w-4 h-4" /> Seed Resep PDF
                   </button>
                   <button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1 shadow-sm hover:bg-blue-700">
                      <Plus className="w-4 h-4" /> Tambah Baru
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredMenu.map(item => (
                   <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border flex flex-col gap-2 relative group">
                      <div className="font-bold text-slate-800 flex items-start justify-between">
                         {item.name}
                         {item.isBundle && <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider">Bundle</span>}
                      </div>
                      <div className="text-blue-600 font-black">{formatRupiah(item.price)}</div>
                      {item.recipe && <div className="text-xs text-slate-500 line-clamp-2 mt-1">{item.recipe}</div>}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white p-1 rounded-lg border shadow-sm">
                         <button onClick={() => setEditingMenu(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                         <button onClick={() => handleMenuDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   </div>
                ))}
            </div>
          </div>
       )}

       {activeTab === 'users' && (
          <div className="flex flex-col gap-6">
             <div className="flex items-center justify-end">
                <button onClick={() => {setIsAddingUser(true); setEditingUser(null);}} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1 shadow-sm hover:bg-blue-700">
                   <Plus className="w-4 h-4" /> Pengguna Baru
                </button>
             </div>

             <div className="overflow-x-auto bg-white rounded-xl shadow-sm border">
                <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50 border-b">
                      <tr>
                         <th className="p-4 font-semibold text-slate-600">Username</th>
                         <th className="p-4 font-semibold text-slate-600">Nama Lengkap</th>
                         <th className="p-4 font-semibold text-slate-600">Peran Role</th>
                         <th className="p-4 font-semibold text-slate-600 text-right">Aksi</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y">
                      {users.map(u => (
                          <tr key={u.username} className="hover:bg-slate-50">
                             <td className="p-4 font-mono font-medium text-slate-800">@{u.username}</td>
                             <td className="p-4 text-slate-600">{u.name}</td>
                             <td className="p-4">
                                <span className={cn("px-2 py-1 uppercase text-[10px] font-bold rounded-md", u.role === 'bos' || u.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>{u.role}</span>
                             </td>
                             <td className="p-4 flex gap-2 justify-end">
                                <button onClick={() => setEditingUser(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleUserDelete(u.username)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"><Trash2 className="w-4 h-4" /></button>
                             </td>
                          </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       )}

       {activeTab === 'danger' && (
          <div className="flex flex-col gap-6 w-full max-w-2xl">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
                <div className="flex items-center gap-3 text-red-600 mb-2">
                   <AlertTriangle className="w-6 h-6" />
                   <h2 className="font-bold text-lg">Hapus Permanen Data</h2>
                </div>
                <p className="text-slate-500 text-sm mb-6">Peringatan: Tindakan ini tidak dapat dibatalkan. Pastikan Anda sudah membuat cadangan atau laporan dari data yang akan dihapus.</p>
                
                <div className="space-y-4">
                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border rounded-xl gap-4">
                      <div>
                         <h3 className="font-bold text-slate-800">Hapus Semua Riwayat Transaksi</h3>
                         <p className="text-xs text-slate-500 mt-1">Menghapus seluruh nota penjualan. (Tidak menghapus data shift)</p>
                      </div>
                      <button onClick={() => setConfirmData({ message: 'PERINGATAN: Seluruh riwayat transaksi (nota) akan DIHAPUS PERMANEN. Lanjutkan?', onConfirm: () => purgeData('TRANSACTIONS') })} className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap">
                         Hapus Transaksi
                      </button>
                   </div>
                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 border rounded-xl gap-4">
                      <div>
                         <h3 className="font-bold text-slate-800">Hapus Semua Riwayat Shift (Sesi)</h3>
                         <p className="text-xs text-slate-500 mt-1">Menghapus riwayat penutupan shift dan saldo kasir.</p>
                      </div>
                      <button onClick={() => setConfirmData({ message: 'PERINGATAN: Seluruh riwayat shift dan sesi kasir akan DIHAPUS PERMANEN. Lanjutkan?', onConfirm: () => purgeData('SHIFTS') })} className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap">
                         Hapus Shift
                      </button>
                   </div>
                </div>
             </div>
          </div>
       )}

       {(isAdding || editingMenu) && (
          <MenuForm 
             menuList={menu} 
             initialData={editingMenu} 
             onSave={handleMenuSave} 
             onClose={() => {setIsAdding(false); setEditingMenu(null);}} 
          />
       )}

       {(isAddingUser || editingUser) && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex flex-col items-center justify-center p-4">
             <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                   <div className="font-bold">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</div>
                   <button onClick={() => {setIsAddingUser(false); setEditingUser(null);}}><X className="w-5 h-5 text-slate-500 hover:text-slate-800" /></button>
                </div>
                <form onSubmit={handleUserSave} className="p-4 space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Username</label>
                      <input name="username" required readOnly={!!editingUser && !isAddingUser} defaultValue={editingUser?.username} className="w-full border rounded-lg p-2.5 focus:border-blue-500 outline-none read-only:bg-slate-100" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap</label>
                      <input name="name" required defaultValue={editingUser?.name} className="w-full border rounded-lg p-2.5 focus:border-blue-500 outline-none" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Role</label>
                      <select name="role" required defaultValue={editingUser?.role || 'kasir'} className="w-full border rounded-lg p-2.5 focus:border-blue-500 outline-none bg-white">
                         <option value="kasir">Kasir</option>
                         <option value="superadmin">Super Admin</option>
                         <option value="bos">Bos (Laporan)</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">PIN (Opsional, kosong = tanpa PIN)</label>
                      <input name="pin" type="text" maxLength={6} defaultValue={editingUser?.pin} placeholder="Cth: 1234" className="w-full border rounded-lg p-2.5 focus:border-blue-500 outline-none font-mono tracking-widest text-lg text-center" />
                   </div>
                   <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-700 flex justify-center items-center gap-2"><Save className="w-4 h-4" /> Simpan</button>
                </form>
             </div>
          </div>
       )}

      {confirmData && <ConfirmDialog message={confirmData.message} onConfirm={confirmData.onConfirm} onClose={() => setConfirmData(null)} />}
    </div>
  );
}
