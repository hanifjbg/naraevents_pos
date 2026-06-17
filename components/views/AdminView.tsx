import React, { useState } from 'react';
import { usePos, User, Product, CATEGORIES } from '@/lib/store';
import { formatRupiah } from '@/lib/utils';
import { Plus, Edit2, Trash2, X, Save, Users, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from './Dialogs';

export default function AdminView() {
  const { menu, setMenu, users, updateUser, deleteUser, addUser } = usePos();
  const [activeTab, setActiveTab] = useState<'menu' | 'users'>('menu');
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

  const handleMenuSave = (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     const fd = new FormData(e.currentTarget);
     const newM: Product = {
        id: editingMenu ? editingMenu.id : Math.random().toString(36).substring(2, 10),
        name: fd.get('name') as string,
        price: parseInt(fd.get('price') as string, 10),
        category: fd.get('category') as string,
        recipe: fd.get('recipe') as string,
     };
     
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
     const newU: User = {
        username: fd.get('username') as string,
        name: (fd.get('name') as string) || fd.get('username') as string,
        role: fd.get('role') as any,
     };
     
     if (isEditing) {
        updateUser(newU);
     } else {
        addUser(newU);
     }
     setEditingUser(null);
     setIsAddingUser(false);
  };

  return (
    <div className="p-6 h-full overflow-y-auto flex flex-col gap-6 w-full max-w-6xl mx-auto">
       <div className="flex bg-white rounded-xl shadow-sm border p-1 shrink-0 w-max">
          <button onClick={() => setActiveTab('menu')} className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${activeTab === 'menu' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}><Utensils className="w-4 h-4"/> Menu Makanan</button>
          <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}><Users className="w-4 h-4"/> Pengurus & Kasir</button>
       </div>

       {activeTab === 'menu' && (
          <div className="flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <div className="flex gap-2">
                   {CATEGORIES.map(c => (
                      <button key={c} onClick={() => setActiveCategory(c)} className={`px-4 py-2 rounded-full font-bold text-sm border ${activeCategory === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600'}`}>{c}</button>
                   ))}
                </div>
                <button onClick={() => setIsAdding(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1 shadow-sm hover:bg-blue-700">
                   <Plus className="w-4 h-4" /> Tambah Baru
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredMenu.map(item => (
                   <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border flex flex-col gap-2 relative group">
                      <div className="font-bold text-slate-800">{item.name}</div>
                      <div className="text-blue-600 font-black">{formatRupiah(item.price)}</div>
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

       {(isAdding || editingMenu) && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex flex-col items-center justify-center p-4">
             <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                   <div className="font-bold">{editingMenu ? 'Edit Menu' : 'Tambah Menu'}</div>
                   <button onClick={() => {setIsAdding(false); setEditingMenu(null);}}><X className="w-5 h-5 text-slate-500 hover:text-slate-800" /></button>
                </div>
                <form onSubmit={handleMenuSave} className="p-4 space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Nama Menu</label>
                      <input name="name" required defaultValue={editingMenu?.name} className="w-full border rounded-lg p-2.5 focus:border-blue-500 outline-none" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Harga (Rp)</label>
                      <input name="price" type="number" required defaultValue={editingMenu?.price} className="w-full border rounded-lg p-2.5 focus:border-blue-500 outline-none" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Kategori</label>
                      <select name="category" required defaultValue={editingMenu?.category || activeCategory} className="w-full border rounded-lg p-2.5 focus:border-blue-500 outline-none bg-white">
                         {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Resep Racikan (Opsional)</label>
                      <textarea name="recipe" rows={3} defaultValue={editingMenu?.recipe} placeholder="Cth: 1 sdm gula, 1 shot espresso" className="w-full border rounded-lg p-2.5 focus:border-blue-500 outline-none resize-none"></textarea>
                   </div>
                   <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-700 flex justify-center items-center gap-2"><Save className="w-4 h-4" /> Simpan</button>
                </form>
             </div>
          </div>
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
                   <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-700 flex justify-center items-center gap-2"><Save className="w-4 h-4" /> Simpan</button>
                </form>
             </div>
          </div>
       )}

      {confirmData && <ConfirmDialog message={confirmData.message} onConfirm={confirmData.onConfirm} onClose={() => setConfirmData(null)} />}
    </div>
  );
}
