import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProductType = 'house' | 'apartment' | 'office';

export interface CartItem {
  id: string; // unique cart item id
  productType: ProductType;
  mainNumber: string;
  streetName: string;
  officeName: string;
  officeFunction: string;
  finish: 'black' | 'white';
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      
      addItem: (item) => {
        const newItem = { ...item, id: crypto.randomUUID() };
        set((state) => ({
          items: [...state.items, newItem],
          isCartOpen: true, // open cart when adding
        }));
      },
      
      removeItem: (id) => 
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
        
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) => 
            item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        })),
        
      clearCart: () => set({ items: [] }),
      
      setCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
      
      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getCartCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'numeredecasa-cart-storage',
    }
  )
);
