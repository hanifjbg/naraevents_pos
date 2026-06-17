export interface User {
  username: string;
  pin: string;
  role: 'superadmin' | 'bos' | 'kasir';
  name: string;
}

export const USERS: User[] = [
  { username: 'fanfeklab', pin: '123123', role: 'superadmin', name: 'Super Admin' },
  { username: 'faldi', pin: '123133', role: 'bos', name: 'Faldi' },
  { username: 'hanif', pin: '123123', role: 'kasir', name: 'Hanif' },
  { username: 'desi', pin: '123123', role: 'kasir', name: 'Desi' },
];

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

export const INITIAL_MENU: Product[] = [
  { id: 'p1', name: 'Biasa (Sosis Telor + Le Minerale)', price: 13000, category: 'Paket Murah' },
  { id: 'p2', name: 'Spesial (Risol + Ice Pink lava + Makroni)', price: 16000, category: 'Paket Murah' },
  { id: 'p3', name: 'Istimewa (2 Risol + Ice Americano + Ice Taro)', price: 25000, category: 'Paket Murah' },
  { id: 'p4', name: 'Lengkap (2 Snack Tray + Risol)', price: 40000, category: 'Paket Murah' },
  { id: 'm1', name: 'Americano', price: 13000, category: 'Minuman' },
  { id: 'm2', name: 'Americano Strawberry', price: 14000, category: 'Minuman' },
  { id: 'm3', name: 'Kopi Susu Almond', price: 14000, category: 'Minuman' },
  { id: 'm4', name: 'Thai Tea', price: 10000, category: 'Minuman' },
  { id: 'm5', name: 'Pink Lava', price: 15000, category: 'Minuman' },
  { id: 'm6', name: 'Chocolate', price: 11000, category: 'Minuman' },
  { id: 'm7', name: 'Choco Almond', price: 14000, category: 'Minuman' },
  { id: 'm8', name: 'Taro', price: 14000, category: 'Minuman' },
  { id: 'm9', name: 'Snack Tray', price: 25000, category: 'Minuman' },
  { id: 'm10', name: 'Le Minerale', price: 5000, category: 'Minuman' },
  { id: 'm11', name: 'Pocary Sweat', price: 10000, category: 'Minuman' },
  { id: 'f1', name: 'Sosis Telor', price: 11000, category: 'Makanan' },
  { id: 'f2', name: 'Mix Platter', price: 20000, category: 'Makanan' },
  { id: 'f3', name: 'Risol', price: 5000, category: 'Makanan' },
  { id: 'f4', name: 'Pop Mie', price: 10000, category: 'Makanan' },
  { id: 'f5', name: 'Makaroni', price: 5000, category: 'Makanan' },
  { id: 'f6', name: 'Keripik', price: 5000, category: 'Makanan' },
];

export const CATEGORIES = ['Paket Murah', 'Minuman', 'Makanan'];

export const PROMO = {
  description: "Gratis Makaroni / keripik dengan minimal pembelian 5 Risol sekaligus. Berlaku kelipatan.",
  triggerItemId: 'f3', // Risol
  triggerQty: 5,
  rewardOptions: ['f5', 'f6'], // Makaroni, Keripik
  rewardQty: 1
};
