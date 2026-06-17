'use client';
import { useState } from 'react';
import { usePos } from '@/lib/store';
import { CATEGORIES, Product, User } from '@/lib/constants';
import { formatRupiah, generateId } from '@/lib/utils';
import { Plus, Edit2, Trash2, X, Save, Users, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from './Dialogs';

export default function AdminView() {
  const { menu, setMenu, users, updateUser, deleteUser, addUser } = usePos();
  
  const [activeTab, setActiveTab] = useState<'menu' | 'users'>('menu');
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
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

  const handleMenuSave = (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     const fd = new FormData(e.currentTarget);
     const name = fd.get('name') as string;
     const price = parseInt(fd.get('price') as string, 10);
     const category = fd.get('category') as string;

     if (editingItem) {
        setMenu(menu.map(m => m.id === editingItem.id ? { ...m, name, price, category } : m));
        setEditingItem(null);
     } else {
        setMenu([...menu, { id: generateId(), name, price, category }]);
        setIsAdding(false);
     }
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
     const username = fd.get('username') as string;
     const name = fd.get('name') as string;
     const pin = fd.get('pin') as string;
     const role = fd.get('role') as 'superadmin' | 'bos' | 'kasir';

     const userObj: User = { username, name, pin, role };

     if (editingUser) {
        updateUser(userObj);
        setEditingUser(null);
     } else {
        addUser(userObj);
        setIsAddingUser(false);
     }
  };

  return (
    <div className="flex h-full w-full bg-slate-50 flex-col">
       <div className="bg-white px-4 border-b border-slate-100 flex gap-4">
          <button onClick={() => setActiveTab('menu')} className={cn("py-3 font-semibold text-sm border-b-2 flex items-center gap-2", activeTab === 'menu' ? "border-red-600 text-red-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
             <Utensils className="w-4 h-4" /> Manajemen Menu
          </button>
          <button onClick={() => setActiveTab('users')} className={cn("py-3 font-semibold text-sm border-b-2 flex items-center gap-2", activeTab === 'users' ? "border-red-600 text-red-600" : "border-transparent text-slate-500 hover:text-slate-800")}>
             <Users className="w-4 h-4" /> Pengguna
          </button>
       </div>

       { activeTab === 'menu' && (
          <>
            <div className="bg-white px-4 py-3 shadow-sm z-10 shrink-0 flex gap-2 overflow-x-auto items-center">
                  {CATEGORIES.map(cat => (
                     <button key={cat} onClick={() => setActiveCategory(cat)} className={cn("px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all shadow-sm ring-1 ring-inset", activeCategory === cat ? "bg-slate-800 text-white ring-slate-800" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50")}>
                        {cat}
                     </button>
                  ))}
                  <div className="flex-1" />
                  <button onClick={() => setIsAdding(true)} className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-full text-sm font-bold shadow hover:bg-red-700">
                     <Plus className="w-4 h-4" /> Menu Baru
                  </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 content-start space-y-3">
               {filteredMenu.map(product => (
                  <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                     <div>
                        <h3 className="font-bold text-slate-800">{product.name}</h3>
                        <div className="text-red-600 font-semibold text-sm">{formatRupiah(product.price)}</div>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => setEditingItem(product)} className="p-2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleMenuDelete(product.id)} className="p-2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                     </div>
                  </div>
               ))}
            </div>
          </>
       )}

       { activeTab === 'users' && (
          <>
            <div className="bg-white px-4 py-3 shadow-sm z-10 shrink-0 flex justify-between items-center">
               <h2 className="font-bold text-slate-800">Daftar Pengguna / Kasir</h2>
               <button onClick={() => setIsAddingUser(true)} className="flex items-center gap-1 bg-slate-900 text-white px-3 py-2 rounded-full text-sm font-bold shadow hover:bg-slate-800">
                  <Plus className="w-4 h-4" /> User Baru
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 content-start space-y-3">
               {users.map(user => (
                  <div key={user.username} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                     <div>
                        <h3 className="font-bold text-slate-800">{user.name}</h3>
                        <div className="text-slate-500 font-medium text-sm flex gap-3 mt-1">
                           <span>@{user.username}</span>
                           <span className={cn("px-2 rounded text-[10px] uppercase font-bold flex items-center", user.role === 'superadmin' ? "bg-purple-100 text-purple-700" : user.role === 'bos' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700")}>
                              {user.role}
                           </span>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => setEditingUser(user)} className="p-2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"><Edit2 className="w-4 h-4" /></button>
                        {user.role !== 'superadmin' && (
                           <button onClick={() => handleUserDelete(user.username)} className="p-2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                        )}
                     </div>
                  </div>
               ))}
            </div>
          </>
       )}

       {/* Editor Modals */}
       {(isAdding || editingItem) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
             <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between bg-slate-50 items-center">
                   <h3 className="font-bold text-lg">{editingItem ? 'Edit Menu' : 'Tambah Menu'}</h3>
                   <button onClick={() => { setIsAdding(false); setEditingItem(null); }}><X className="w-5 h-5"/></button>
                </div>
                <form onSubmit={handleMenuSave} className="p-5 space-y-4">
                   <input name="name" defaultValue={editingItem?.name} required className="w-full border p-3 rounded-xl" placeholder="Nama Menu" />
                   <input name="price" type="number" defaultValue={editingItem?.price} required className="w-full border p-3 rounded-xl" placeholder="Harga" />
                   <select name="category" defaultValue={editingItem?.category || activeCategory} className="w-full border p-3 rounded-xl">
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                   </select>
                   <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl"><Save className="w-5 h-5 inline mr-2"/>Simpan</button>
                </form>
             </div>
          </div>
       )}

       {(isAddingUser || editingUser) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
             <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between bg-slate-50 items-center">
                   <h3 className="font-bold text-lg">{editingUser ? 'Edit User' : 'Tambah User'}</h3>
                   <button onClick={() => { setIsAddingUser(false); setEditingUser(null); }}><X className="w-5 h-5"/></button>
                </div>
                <form onSubmit={handleUserSave} className="p-5 space-y-4">
                   <input name="name" defaultValue={editingUser?.name} required className="w-full border p-3 rounded-xl" placeholder="Nama Lengkap" />
                   <input name="username" defaultValue={editingUser?.username} readOnly={!!editingUser} required className="w-full border p-3 rounded-xl read-only:bg-slate-100" placeholder="Username" />
                   <input name="pin" type="text" inputMode="numeric" defaultValue={editingUser?.pin} required className="w-full border p-3 rounded-xl" placeholder="PIN" />
                   <select name="role" defaultValue={editingUser?.role || 'kasir'} className="w-full border p-3 rounded-xl">
                      <option value="kasir">Kasir</option>
                      <option value="bos">Bos</option>
                      <option value="superadmin">Super Admin</option>
                   </select>
                   <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl"><Save className="w-5 h-5 inline mr-2"/>Simpan</button>
                </form>
             </div>
          </div>
       )}

      {confirmData && <ConfirmDialog message={confirmData.message} onConfirm={confirmData.onConfirm} onClose={() => setConfirmData(null)} />}
    </div>
  );
}
