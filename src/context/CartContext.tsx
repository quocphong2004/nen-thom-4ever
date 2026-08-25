import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CartItem, Product, ProductVariant } from '../types';

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant | null, quantity: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalQuantity: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'nen-thom-4ever-cart';

function lineKey(productId: string, variantId: string | null) {
  return `${productId}::${variantId ?? 'default'}`;
}

function getPrice(product: Product, variant: ProductVariant | null): number {
  if (variant) return variant.sale_price ?? variant.price;
  return product.sale_price ?? product.price;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(product: Product, variant: ProductVariant | null, quantity: number) {
    setItems((prev) => {
      const key = lineKey(product.id, variant?.id ?? null);
      const existing = prev.find((i) => lineKey(i.product.id, i.variant?.id ?? null) === key);
      if (existing) {
        return prev.map((i) =>
          lineKey(i.product.id, i.variant?.id ?? null) === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, variant, quantity }];
    });
  }

  function removeItem(productId: string, variantId: string | null) {
    setItems((prev) => prev.filter((i) => lineKey(i.product.id, i.variant?.id ?? null) !== lineKey(productId, variantId)));
  }

  function updateQuantity(productId: string, variantId: string | null, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        lineKey(i.product.id, i.variant?.id ?? null) === lineKey(productId, variantId)
          ? { ...i, quantity }
          : i
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, i) => sum + getPrice(i.product, i.variant) * i.quantity, 0);
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải được dùng bên trong <CartProvider>');
  return ctx;
}

export { getPrice };
