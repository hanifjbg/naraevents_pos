'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, User, INITIAL_MENU, USERS as INITIAL_USERS } from './constants';
import { generateId } from './utils';
import { db } from './firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, writeBatch, getDocs, deleteDoc } from 'firebase/firestore';

export interface CartItem {
  product: Product;
  qty: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  shiftId: string | null;
  cashier: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'CASH' | 'QRIS';
  cashReceived?: number | null;
  change?: number | null;
  qrisRef?: string | null;
  voided?: boolean;
}

export interface Shift {
  id: string;
  startTime: string;
  endTime?: string;
  cashierUsername: string;
  cashierName: string;
  startingCash: number;
  actualCash?: number;
  expectedCash?: number;
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
  login: (username: string, pin: string) => User | null;
  logout: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  decreaseFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: (paymentMethod: 'CASH' | 'QRIS', cashReceived?: number, qrisRef?: string) => Transaction | null;
  voidTransaction: (transactionId: string) => void;
  startShift: (startingCash: number) => void;
  endShift: (actualCash: number, expectedCash: number) => void;
  setMenu: (newMenu: Product[]) => void;
  updateUser: (user: User) => void;
  deleteUser: (username: string) => void;
  addUser: (user: User) => void;
}

const PosContext = createContext<PosState | undefined>(undefined);

export function PosProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [menu, setMenuState] = useState<Product[]>(INITIAL_MENU);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const activeShift = currentUser ? shifts.find(s => s.cashierUsername === currentUser.username && s.status === 'active') || null : null;

  useEffect(() => {
    const storedUser = localStorage.getItem('pos_user');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    setIsHydrated(true);

    if (!db) return;

    const seedDb = async () => {
       try {
           const userSnap = await getDocs(collection(db, 'users'));
           if (userSnap.empty) {
              const batch = writeBatch(db);
              INITIAL_USERS.forEach(u => batch.set(doc(db, 'users', u.username), u));
              INITIAL_MENU.forEach(m => batch.set(doc(db, 'menu', m.id), m));
              await batch.commit();
           }
       } catch (e) {
           console.error("Firebase seeding failed", e);
       }
    };
    seedDb();

    let unsubUsers = () => {};
    let unsubMenu = () => {};
    let unsubTrans = () => {};
    let unsubShifts = () => {};

    try {
        unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
           setUsers(snap.docs.map(d => d.data() as User));
        });

        unsubMenu = onSnapshot(collection(db, 'menu'), (snap) => {
           const m = snap.docs.map(d => d.data() as Product);
           if (m.length > 0) setMenuState(m);
        });

        unsubTrans = onSnapshot(collection(db, 'transactions'), (snap) => {
           const t = snap.docs.map(d => d.data() as Transaction).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
           setTransactions(t);
        });

        unsubShifts = onSnapshot(collection(db, 'shifts'), (snap) => {
           const s = snap.docs.map(d => d.data() as Shift).sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
           setShifts(s);
        });
    } catch(e) {
        console.error("Firebase subscription failed", e);
    }

    return () => {
       unsubUsers();
       unsubMenu();
       unsubTrans();
       unsubShifts();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (currentUser) {
       localStorage.setItem('pos_user', JSON.stringify(currentUser));
    } else {
       localStorage.removeItem('pos_user');
    }
  }, [currentUser, isHydrated]);

  const login = (username: string, pin: string) => {
    const user = users.find((u: User) => u.username === username && u.pin === pin);
    if (user) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const decreaseFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (existing && existing.qty > 1) {
        return prev.map((item) =>
          item.product.id === productId ? { ...item, qty: item.qty - 1 } : item
        );
      } else {
        return prev.filter((item) => item.product.id !== productId);
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const checkout = (paymentMethod: 'CASH' | 'QRIS', cashReceived?: number, qrisRef?: string) => {
    if (!currentUser) return null;
    const total = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    const change = cashReceived ? cashReceived - total : 0;

    const transaction: Transaction = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      shiftId: activeShift ? activeShift.id : null,
      cashier: currentUser.name,
      items: [...cart],
      total,
      paymentMethod,
      cashReceived: cashReceived ?? null,
      change: change ?? null,
      qrisRef: qrisRef ?? null,
      voided: false,
    };

    if (db) {
       setDoc(doc(db, 'transactions', transaction.id), transaction);
       if (activeShift) {
          updateDoc(doc(db, 'shifts', activeShift.id), {
             totalSales: activeShift.totalSales + total
          });
       }
    }
    
    setCart([]);
    return transaction;
  };

  const voidTransaction = (transactionId: string) => {
     const tx = transactions.find(t => t.id === transactionId);
     if (!tx || tx.voided) return;
     if (db) {
        updateDoc(doc(db, 'transactions', transactionId), { voided: true });
        
        if (tx.shiftId) {
            const shift = shifts.find(s => s.id === tx.shiftId);
            if (shift) {
                updateDoc(doc(db, 'shifts', shift.id), {
                   totalSales: Math.max(0, shift.totalSales - tx.total)
                });
            }
        }
     }
  };

  const startShift = (startingCash: number) => {
    if (!currentUser) return;
    const shiftId = generateId();
    const newShift: Shift = {
      id: shiftId,
      startTime: new Date().toISOString(),
      cashierUsername: currentUser.username,
      cashierName: currentUser.name,
      startingCash,
      totalSales: 0,
      status: 'active'
    };
    if (db) {
       setDoc(doc(db, 'shifts', shiftId), newShift);
    }
  };

  const endShift = (actualCash: number, expectedCash: number) => {
    if (!activeShift) return;
    if (db) {
       updateDoc(doc(db, 'shifts', activeShift.id), {
          endTime: new Date().toISOString(),
          actualCash,
          expectedCash,
          status: 'closed'
       });
    }
  };

  const setMenuAction = async (newMenu: Product[]) => {
    if (!db) return;
    const currentMap = new Map(menu.map(m => [m.id, m]));
    const batch = writeBatch(db);
    newMenu.forEach(m => {
       batch.set(doc(db, 'menu', m.id), m);
       currentMap.delete(m.id);
    });
    currentMap.forEach((m, id) => {
       batch.delete(doc(db, 'menu', id));
    });
    await batch.commit();
  };

  const addUser = (user: User) => {
     if (db) setDoc(doc(db, 'users', user.username), user);
  };

  const updateUser = (user: User) => {
     if (db) setDoc(doc(db, 'users', user.username), user);
  };

  const deleteUserAction = (username: string) => {
     if (db) deleteDoc(doc(db, 'users', username));
  };

  if (!isHydrated) return null;

  return (
    <PosContext.Provider
      value={{
        currentUser,
        users,
        menu,
        cart,
        transactions,
        shifts,
        activeShift,
        login,
        logout,
        addToCart,
        removeFromCart,
        decreaseFromCart,
        clearCart,
        checkout,
        voidTransaction,
        startShift,
        endShift,
        setMenu: setMenuAction,
        addUser,
        updateUser,
        deleteUser: deleteUserAction
      }}
    >
      {children}
    </PosContext.Provider>
  );
}

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) throw new Error('usePos must be used within PosProvider');
  return context;
};
