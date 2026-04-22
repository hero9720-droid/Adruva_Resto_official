import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  cart_id: string; // Unique ID for this specific customization
  id: string;      // Menu Item ID
  variant_id?: string;
  name: string;
  price_paise: number;
  quantity: number;
  photo_url?: string;
  food_type: 'veg' | 'non_veg';
  modifiers: Record<string, any[]>;
  notes: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'cart_id'>) => void;
  removeItem: (cart_id: string) => void;
  updateQuantity: (cart_id: string, delta: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const cart_id = Math.random().toString(36).substr(2, 9);
        const existing = get().items.find((i) => 
          i.id === item.id && 
          JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers) &&
          i.notes === item.notes &&
          i.variant_id === item.variant_id
        );
        
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.cart_id === existing.cart_id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, cart_id }] });
        }
      },
      removeItem: (cart_id) => {
        set({ items: get().items.filter((i) => i.cart_id !== cart_id) });
      },
      updateQuantity: (cart_id, delta) => {
        set({
          items: get().items
            .map((i) => (i.cart_id === cart_id ? { ...i, quantity: i.quantity + delta } : i))
            .filter((i) => i.quantity > 0),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, i) => sum + i.price_paise * i.quantity, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'adruva-cart-v2',
    }
  )
);
