import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import type { Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import { LoadingState, EmptyState } from '../../components/LoadingState';

export default function Wishlist() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('wishlist_items')
        .select('product:products(*, category:categories(*), images:product_images(*))')
        .eq('user_id', user.id);
      setProducts((data ?? []).map((d: any) => d.product).filter(Boolean));
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <LoadingState />;
  if (products.length === 0) {
    return <EmptyState title="Chưa có sản phẩm yêu thích" description="Nhấn biểu tượng trái tim trên sản phẩm để lưu vào đây." />;
  }

  return (
    <div>
      <h1 className="font-display text-xl font-semibold mb-6">Sản phẩm yêu thích</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
