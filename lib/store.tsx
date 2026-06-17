import { create } from 'zustand';
import { db } from './firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, writeBatch, getDocs, deleteDoc } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock?: number;
  recipe?: string;
  isBundle?: boolean;
  bundleItems?: { productId: string; qty: number }[];
}

export interface User {
  username: string;
  name?: string;
  role: 'superadmin' | 'bos' | 'kasir';
  pin?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'CASH' | 'QRIS';
  cashReceived?: number;
  qrisRef?: string;
  cashier: string;
  shiftId: string;
  voided?: boolean;
}

export interface Shift {
  id: string;
  cashier: string;
  startTime: string;
  endTime?: string;
  startingCash: number;
  expectedCash?: number;
  actualCash?: number;
  totalSales: number;
  status: 'active' | 'closed';
}

interface PosState {
  currentUser: User | null;
  users: User[];
  menu: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  shifts: Shift[];
  activeShift: Shift | null;
  setCurrentUser: (user: User | null) => void;
  addToCart: (product: Product) => void;
  decreaseFromCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: (paymentMethod: 'CASH' | 'QRIS', cashReceived?: number, qrisRef?: string) => Transaction | null;
  voidTransaction: (transactionId: string) => void;
  deleteTransaction: (transactionId: string) => void;
  startShift: (startingCash: number) => void;
  endShift: (actualCash: number, expectedCash: number, shiftId?: string) => void;
  setMenu: (newMenu: Product[]) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (username: string) => void;
}

let unsubUsers: any;
let unsubMenu: any;
let unsubTrans: any;
let unsubShifts: any;

export const CATEGORIES = ['Paket Murah', 'Minuman', 'Makanan'];

export const usePos = create<PosState>((set, get) => {
  if (typeof window !== 'undefined') {
    try {
        unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
           set({ users: snap.docs.map(d => d.data() as User) });
        }, (error) => console.error("Firebase users snap error", error.message));

        unsubMenu = onSnapshot(collection(db, 'menu'), (snap) => {
           const m = snap.docs.map(d => d.data() as Product);
           set({ menu: m.length ? m : [] });
        }, (error) => console.error("Firebase menu snap error", error.message));

        unsubTrans = onSnapshot(collection(db, 'transactions'), (snap) => {
           const t = snap.docs.map(d => d.data() as Transaction).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
           set({ transactions: t });
        }, (error) => console.error("Firebase trans snap error", error.message));

        unsubShifts = onSnapshot(collection(db, 'shifts'), (snap) => {
           const s = snap.docs.map(d => d.data() as Shift).sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
           set({ shifts: s });
        }, (error) => console.error("Firebase shifts snap error", error.message));
    } catch(e: any) {
        console.error("Firebase subscription failed", e?.message || e);
    }
  }

  return {
  currentUser: null,
  users: [],
  menu: [],
  cart: [],
  transactions: [],
  shifts: [],
  activeShift: null,

  setCurrentUser: (user) => {
     set({ currentUser: user });
     if (user) {
        const active = get().shifts.find(s => s.cashier === user.username && s.status === 'active');
        set({ activeShift: active || null });
     } else {
        set({ activeShift: null });
     }
  },

  addToCart: (product) => set((state) => {
    const existing = state.cart.find((item) => item.product.id === product.id);
    if (existing) {
      return {
        cart: state.cart.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        ),
      };
    }
    return { cart: [...state.cart, { product, qty: 1 }] };
  }),

  decreaseFromCart: (productId) => set((state) => {
    const existing = state.cart.find((item) => item.product.id === productId);
    if (existing && existing.qty > 1) {
      return {
        cart: state.cart.map((item) =>
          item.product.id === productId ? { ...item, qty: item.qty - 1 } : item
        ),
      };
    }
    return { cart: state.cart.filter((item) => item.product.id !== productId) };
  }),

  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter((item) => item.product.id !== productId)
  })),

  clearCart: () => set({ cart: [] }),

  checkout: (paymentMethod, cashReceived, qrisRef) => {
    const state = get();
    if (!state.currentUser) return null;
    if (!state.activeShift && state.currentUser.role === 'kasir') {
       return null;
    }
    const total = state.cart.reduce((s, item) => s + item.product.price * item.qty, 0);
    const transaction: any = {
      id: Math.random().toString(36).substring(2, 10),
      timestamp: new Date().toISOString(),
      items: [...state.cart],
      total,
      paymentMethod,
      cashier: state.currentUser.username,
      shiftId: state.activeShift?.id || 'admin-shift'
    };
    if (cashReceived !== undefined) transaction.cashReceived = cashReceived;
    if (qrisRef !== undefined) transaction.qrisRef = qrisRef;

    if (db) setDoc(doc(db, 'transactions', transaction.id), transaction as Transaction);

    set({ cart: [] });

    if (state.activeShift) {
       const shiftTotal = state.activeShift.totalSales + total;
       if (db) updateDoc(doc(db, 'shifts', state.activeShift.id), { totalSales: shiftTotal });
       set({ activeShift: { ...state.activeShift, totalSales: shiftTotal } });
    }

    return transaction;
  },

  voidTransaction: (transactionId) => {
     const state = get();
     const tx = state.transactions.find(t => t.id === transactionId);
     if (!tx || tx.voided) return;
     if (db) {
        updateDoc(doc(db, 'transactions', transactionId), { voided: true });
        if (state.activeShift && tx.shiftId === state.activeShift.id) {
           const shiftTotal = state.activeShift.totalSales - tx.total;
           updateDoc(doc(db, 'shifts', state.activeShift.id), { totalSales: Math.max(0, shiftTotal) });
           set({ activeShift: { ...state.activeShift, totalSales: Math.max(0, shiftTotal) } });
        }
     }
  },

  deleteTransaction: (transactionId: string) => {
     const state = get();
     const tx = state.transactions.find(t => t.id === transactionId);
     if (!tx) return;
     if (db) {
        deleteDoc(doc(db, 'transactions', transactionId));
        
        if (!tx.voided && tx.shiftId) {
            const shift = state.shifts.find(s => s.id === tx.shiftId);
            if (shift) {
                updateDoc(doc(db, 'shifts', shift.id), {
                   totalSales: Math.max(0, shift.totalSales - tx.total)
                });
            }
        }
     }
  },

  startShift: (startingCash) => {
    const state = get();
    const user = state.currentUser;
    if (!user) return;
    const globalActiveShift = state.shifts.find(s => s.status === 'active');
    if (globalActiveShift) {
       throw new Error(`Shift sedang aktif oleh kasir @${globalActiveShift.cashier}. Tidak dapat memulai shift baru.`);
    }
    const shiftId = Math.random().toString(36).substring(2, 10);
    const newShift: Shift = {
      id: shiftId,
      cashier: user.username,
      startTime: new Date().toISOString(),
      startingCash,
      totalSales: 0,
      status: 'active'
    };
    if (db) setDoc(doc(db, 'shifts', shiftId), newShift);
    set({ activeShift: newShift });
  },

  endShift: (actualCash, expectedCash, shiftId) => {
    const state = get();
    const shift = shiftId ? state.shifts.find(s => s.id === shiftId) : state.activeShift;
    if (!shift) return;
    if (db) {
        updateDoc(doc(db, 'shifts', shift.id), {
            endTime: new Date().toISOString(),
            actualCash,
            expectedCash,
            status: 'closed'
        });
    }
    if (state.activeShift?.id === shift.id) {
       set({ activeShift: null });
    }
  },

  setMenu: (newMenu) => {
    const current = get().menu;
    if (db) {
       newMenu.forEach(m => setDoc(doc(db, 'menu', m.id), m));
       current.forEach(c => {
         if (!newMenu.find(n => n.id === c.id)) {
            deleteDoc(doc(db, 'menu', c.id));
         }
       });
    }
  },
  addUser: (user) => {
    if (db) setDoc(doc(db, 'users', user.username), user);
  },
  updateUser: (user) => {
    if (db) setDoc(doc(db, 'users', user.username), user);
  },
  deleteUser: (username) => {
    if (db) deleteDoc(doc(db, 'users', username));
  }
}})
