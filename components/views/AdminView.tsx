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
    <div className="p-6 h-full overflow-y-auto flex flex-col gap-6 w-full max-w-6xl mx-auto bg-transparent">
       <div className="flex bg-white border-[4px] border-black shadow-neo p-1 shrink-0 w-max overflow-x-auto max-w-full">
          <button onClick={() => setActiveTab('menu')} className={`px-6 py-2 font-black text-sm flex items-center gap-2 whitespace-nowrap uppercase border-[3px] border-transparent ${activeTab === 'menu' ? 'bg-neo-yellow border-black shadow-neo translate-y-[-2px]' : 'text-black hover:bg-neo-yellow/50'}`}><Utensils className="w-4 h-4"/> Menu Makanan</button>
          <button onClick={() => setActiveTab('users')} className={`px-6 py-2 font-black text-sm flex items-center gap-2 whitespace-nowrap uppercase border-[3px] border-transparent ${activeTab === 'users' ? 'bg-neo-blue border-black shadow-neo translate-y-[-2px]' : 'text-black hover:bg-neo-blue/50'}`}><Users className="w-4 h-4"/> Pengurus & Kasir</button>
          <button onClick={() => setActiveTab('danger')} className={`px-6 py-2 font-black text-sm flex items-center gap-2 whitespace-nowrap uppercase border-[3px] border-transparent ${activeTab === 'danger' ? 'bg-neo-red border-black shadow-neo translate-y-[-2px]' : 'text-black hover:bg-neo-red/50'}`}><AlertTriangle className="w-4 h-4"/> Berbahaya</button>
       </div>

       {activeTab === 'menu' && (
          <div className="flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <div className="flex gap-2">
                   {CATEGORIES.map(c => (
                      <button key={c} onClick={() => setActiveCategory(c)} className={`px-4 py-2 font-black uppercase text-sm border-[3px] border-black transition-all ${activeCategory === c ? 'bg-black text-white shadow-neo translate-y-[-2px]' : 'bg-white text-black hover:bg-neo-yellow shadow-neo'}`}>{c}</button>
                   ))}
                </div>
                <div className="flex gap-2">
                   <button onClick={handleSeedMenu} className="bg-neo-yellow text-black border-[3px] border-black shadow-neo hover:translate-y-[2px] transition-all hover:shadow-none px-4 py-2 font-black uppercase text-sm flex items-center gap-1">
                      <Save className="w-4 h-4" /> Seed Resep PDF
                   </button>
                   <button onClick={() => setIsAdding(true)} className="bg-neo-blue text-black border-[3px] border-black shadow-neo hover:translate-y-[2px] transition-all hover:shadow-none px-4 py-2 font-black uppercase text-sm flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Tambah Baru
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredMenu.map(item => (
                   <div key={item.id} className="bg-white p-4 border-[4px] border-black shadow-neo flex flex-col gap-2 relative group hover:bg-neo-yellow transition-all">
                      <div className="font-black text-black flex items-start justify-between uppercase">
                         {item.name}
                         {item.isBundle && <span className="bg-neo-pink text-black text-[10px] px-1.5 py-0.5 border-2 border-black uppercase font-black tracking-wider shadow-sm">Bundle</span>}
                      </div>
                      <div className="bg-neo-green inline-block w-max px-2 py-0.5 border-2 border-black font-black text-black">{formatRupiah(item.price)}</div>
                      {item.recipe && <div className="text-xs font-bold text-black line-clamp-2 mt-1">{item.recipe}</div>}
                      <div className="absolute top-[-10px] right-[-10px] opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white p-1 border-[3px] border-black shadow-neo">
                         <button onClick={() => setEditingMenu(item)} className="p-1 border-[2px] border-black bg-neo-blue text-black hover:bg-blue-400"><Edit2 className="w-4 h-4" /></button>
                         <button onClick={() => handleMenuDelete(item.id)} className="p-1 border-[2px] border-black bg-neo-red text-white hover:bg-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   </div>
                ))}
            </div>
          </div>
       )}

       {activeTab === 'users' && (
          <div className="flex flex-col gap-6">
             <div className="flex items-center justify-end">
                <button onClick={() => {setIsAddingUser(true); setEditingUser(null);}} className="bg-neo-blue text-black border-[3px] border-black shadow-neo px-4 py-2 font-black uppercase text-sm flex items-center gap-1 hover:translate-y-[2px] transition-all">
                   <Plus className="w-4 h-4" /> Pengguna Baru
                </button>
             </div>

             <div className="overflow-x-auto bg-white border-[4px] border-black shadow-neo">
                <table className="w-full text-left text-sm border-collapse">
                   <thead className="bg-neo-yellow border-b-[4px] border-black">
                      <tr>
                         <th className="p-4 font-black text-black uppercase border-r-[4px] border-black">Username</th>
                         <th className="p-4 font-black text-black uppercase border-r-[4px] border-black">Nama Lengkap</th>
                         <th className="p-4 font-black text-black uppercase border-r-[4px] border-black">Peran Role</th>
                         <th className="p-4 font-black text-black uppercase text-right">Aksi</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y-[3px] divide-black">
                      {users.map(u => (
                          <tr key={u.username} className="hover:bg-neo-yellow/20">
                             <td className="p-4 font-mono font-bold text-black border-r-[4px] border-black">@{u.username}</td>
                             <td className="p-4 font-bold text-black border-r-[4px] border-black uppercase">{u.name}</td>
                             <td className="p-4 border-r-[4px] border-black">
                                <span className={cn("px-2 py-1 uppercase text-[10px] font-black border-2 border-black", u.role === 'bos' || u.role === 'superadmin' ? 'bg-neo-pink text-black' : 'bg-neo-green text-black')}>{u.role}</span>
                             </td>
                             <td className="p-4 flex gap-2 justify-end">
                                <button onClick={() => setEditingUser(u)} className="p-2 border-[2px] border-black shadow-neo bg-white hover:bg-neo-blue text-black transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleUserDelete(u.username)} className="p-2 border-[2px] border-black shadow-neo bg-white hover:bg-neo-red text-black transition-colors"><Trash2 className="w-4 h-4" /></button>
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
             <div className="bg-white border-[4px] border-black shadow-neo-lg p-6">
                <div className="flex items-center gap-3 text-black bg-neo-red border-[4px] border-black p-2 shadow-neo w-max mb-4">
                   <AlertTriangle className="w-6 h-6" />
                   <h2 className="font-black text-lg uppercase">Hapus Permanen Data</h2>
                </div>
                <p className="text-black font-bold text-sm mb-6 border-l-4 border-black pl-3 py-1">Peringatan: Tindakan ini tidak dapat dibatalkan. Pastikan Anda sudah membuat cadangan atau laporan dari data yang akan dihapus.</p>
                
                <div className="space-y-4">
                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border-[4px] border-black shadow-none gap-4">
                      <div>
                         <h3 className="font-black text-black uppercase">Hapus Semua Riwayat Transaksi</h3>
                         <p className="text-xs font-bold mt-1">Menghapus seluruh nota penjualan. (Tidak menghapus data shift)</p>
                      </div>
                      <button onClick={() => setConfirmData({ message: 'PERINGATAN: Seluruh riwayat transaksi (nota) akan DIHAPUS PERMANEN. Lanjutkan?', onConfirm: () => purgeData('TRANSACTIONS') })} className="bg-neo-red text-white border-[3px] border-black shadow-neo hover:translate-y-[2px] transition-all px-4 py-2 font-black text-xs uppercase whitespace-nowrap">
                         Hapus Transaksi
                      </button>
                   </div>
                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border-[4px] border-black shadow-none gap-4">
                      <div>
                         <h3 className="font-black text-black uppercase">Hapus Semua Riwayat Shift (Sesi)</h3>
                         <p className="text-xs font-bold mt-1">Menghapus riwayat penutupan shift dan saldo kasir.</p>
                      </div>
                      <button onClick={() => setConfirmData({ message: 'PERINGATAN: Seluruh riwayat shift dan sesi kasir akan DIHAPUS PERMANEN. Lanjutkan?', onConfirm: () => purgeData('SHIFTS') })} className="bg-neo-red text-white border-[3px] border-black shadow-neo hover:translate-y-[2px] transition-all px-4 py-2 font-black text-xs uppercase whitespace-nowrap">
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
          <div className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4">
             <div className="bg-white border-[4px] border-black shadow-neo-lg w-full max-w-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b-[4px] border-black bg-neo-yellow flex items-center justify-between">
                   <div className="font-black uppercase">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</div>
                   <button onClick={() => {setIsAddingUser(false); setEditingUser(null);}} className="bg-white border-2 border-black p-1 shadow-neo hover:bg-neo-red hover:text-white"><X className="w-5 h-5"/></button>
                </div>
                <form onSubmit={handleUserSave} className="p-4 space-y-4">
                   <div>
                      <label className="block text-xs font-black uppercase mb-1">Username</label>
                      <input name="username" required readOnly={!!editingUser && !isAddingUser} defaultValue={editingUser?.username} className="w-full border-[3px] border-black font-bold p-2.5 focus:outline-none focus:bg-neo-yellow/20 read-only:bg-slate-200" />
                   </div>
                   <div>
                      <label className="block text-xs font-black uppercase mb-1">Nama Lengkap</label>
                      <input name="name" required defaultValue={editingUser?.name} className="w-full border-[3px] border-black font-bold p-2.5 focus:outline-none focus:bg-neo-yellow/20" />
                   </div>
                   <div>
                      <label className="block text-xs font-black uppercase mb-1">Role</label>
                      <select name="role" required defaultValue={editingUser?.role || 'kasir'} className="w-full border-[3px] border-black font-bold p-2.5 focus:outline-none bg-white">
                         <option value="kasir">Kasir</option>
                         <option value="superadmin">Super Admin</option>
                         <option value="bos">Bos (Laporan)</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-black uppercase mb-1">PIN (Opsional)</label>
                      <input name="pin" type="text" maxLength={6} defaultValue={editingUser?.pin} placeholder="Cth: 1234" className="w-full border-[3px] border-black font-mono font-black tracking-widest text-lg p-2.5 focus:outline-none focus:bg-neo-yellow/20 text-center" />
                   </div>
                   <button type="submit" className="w-full bg-neo-green text-black border-[4px] border-black shadow-neo font-black uppercase py-3 mt-4 hover:translate-y-[2px] transition-all flex justify-center items-center gap-2"><Save className="w-4 h-4" /> Simpan</button>
                </form>
             </div>
          </div>
       )}

      {confirmData && <ConfirmDialog message={confirmData.message} onConfirm={confirmData.onConfirm} onClose={() => setConfirmData(null)} />}
    </div>
  );
}
