import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TrashIcon } from '@heroicons/react/24/outline';
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminSetProductScents,
  adminAddProductImage,
  adminDeleteProductImage,
  adminUpsertVariant,
  adminDeleteVariant,
  adminFetchProducts,
} from '../../services/productService';
import { fetchCategories, fetchScents } from '../../services/categoryService';
import { uploadImage } from '../../services/storageService';
import { PRODUCT_IMAGE_BUCKET } from '../../lib/supabase';
import { slugify } from '../../utils/format';
import type { Category, Scent, Product, ProductVariant } from '../../types';
import { LoadingState } from '../../components/LoadingState';

const EMPTY_PRODUCT = {
  name: '', code: '', category_id: '', short_description: '', description: '',
  ingredients: '', usage_instructions: '', storage_instructions: '', safety_notes: '',
  usage_duration: '', suitable_space: '', price: 0, sale_price: null as number | null,
  stock: 0, status: 'active' as const, is_new: false, is_featured: false, is_best_seller: false,
};

export default function AdminProductForm() {
  const { productId } = useParams();
  const isEdit = productId && productId !== 'moi';
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [scents, setScents] = useState<Scent[]>([]);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [selectedScents, setSelectedScents] = useState<string[]>([]);
  const [images, setImages] = useState<Product['images']>([]);
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);
  const [loading, setLoading] = useState(!!isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(isEdit ? productId! : null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories(false).then(setCategories);
    fetchScents(false).then(setScents);
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const all = await adminFetchProducts();
      const p = all.find((x) => x.id === productId);
      if (!p) { setLoading(false); return; }
      setForm({
        name: p.name, code: p.code, category_id: p.category_id ?? '',
        short_description: p.short_description ?? '', description: p.description ?? '',
        ingredients: p.ingredients ?? '', usage_instructions: p.usage_instructions ?? '',
        storage_instructions: p.storage_instructions ?? '', safety_notes: p.safety_notes ?? '',
        usage_duration: p.usage_duration ?? '', suitable_space: p.suitable_space ?? '',
        price: p.price, sale_price: p.sale_price, stock: p.stock, status: p.status as 'active',
        is_new: p.is_new, is_featured: p.is_featured, is_best_seller: p.is_best_seller,
      });
      setSelectedScents(p.scents?.map((s) => s.id) ?? []);
      setImages(p.images ?? []);
      setVariants(p.variants ?? []);
      setLoading(false);
    })();
  }, [isEdit, productId]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleScent(id: string) {
    setSelectedScents((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.code || form.price <= 0) {
      setError('Vui lòng nhập tên, mã sản phẩm và giá bán hợp lệ.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, slug: slugify(form.name), category_id: form.category_id || null };
      let id = currentProductId;
      if (id) {
        await adminUpdateProduct(id, payload);
      } else {
        const created = await adminCreateProduct(payload);
        id = created.id;
        setCurrentProductId(id);
      }
      await adminSetProductScents(id!, selectedScents);
      navigate('/admin/san-pham');
    } catch (err: any) {
      setError(err.message ?? 'Có lỗi khi lưu sản phẩm.');
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!currentProductId) {
      setError('Vui lòng lưu sản phẩm trước, sau đó mới thêm hình ảnh.');
      return;
    }
    setUploadingImg(true);
    try {
      const url = await uploadImage(PRODUCT_IMAGE_BUCKET, file);
      await adminAddProductImage(currentProductId, url, images?.length ?? 0);
      setImages((prev) => [...(prev ?? []), { id: crypto.randomUUID(), product_id: currentProductId!, image_url: url, sort_order: prev?.length ?? 0 }]);
    } catch (err: any) {
      setError('Upload ảnh thất bại: ' + (err.message ?? 'lỗi không xác định. Kiểm tra bucket "product-images" đã tạo trong Supabase Storage.'));
    } finally {
      setUploadingImg(false);
    }
  }

  async function handleDeleteImage(imageId: string) {
    await adminDeleteProductImage(imageId);
    setImages((prev) => prev?.filter((i) => i.id !== imageId));
  }

  function addVariantRow() {
    setVariants((prev) => [...prev, { name: '', weight: '', price: form.price, stock: 0, status: 'active' }]);
  }

  async function saveVariant(index: number) {
    if (!currentProductId) {
      setError('Vui lòng lưu sản phẩm trước, sau đó mới thêm biến thể.');
      return;
    }
    const v = variants[index];
    const saved = await adminUpsertVariant({ ...v, product_id: currentProductId });
    setVariants((prev) => prev.map((x, i) => (i === index ? saved : x)));
  }

  async function removeVariant(index: number) {
    const v = variants[index];
    if (v.id) await adminDeleteVariant(v.id);
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h1>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <div className="card p-6 space-y-4">
          <h2 className="font-medium">Thông tin cơ bản</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input required placeholder="Tên sản phẩm *" className="input-field sm:col-span-2" value={form.name} onChange={(e) => updateField('name', e.target.value)} />
            <input required placeholder="Mã sản phẩm *" className="input-field" value={form.code} onChange={(e) => updateField('code', e.target.value)} />
            <select className="input-field" value={form.category_id} onChange={(e) => updateField('category_id', e.target.value)}>
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input required type="number" min={0} placeholder="Giá bán *" className="input-field" value={form.price} onChange={(e) => updateField('price', Number(e.target.value))} />
            <input type="number" min={0} placeholder="Giá khuyến mãi" className="input-field" value={form.sale_price ?? ''} onChange={(e) => updateField('sale_price', e.target.value ? Number(e.target.value) : null)} />
            <input type="number" min={0} placeholder="Tồn kho" className="input-field" value={form.stock} onChange={(e) => updateField('stock', Number(e.target.value))} />
            <select className="input-field" value={form.status} onChange={(e) => updateField('status', e.target.value as any)}>
              <option value="active">Đang bán</option>
              <option value="inactive">Ẩn</option>
              <option value="out_of_stock">Hết hàng</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_new} onChange={(e) => updateField('is_new', e.target.checked)} /> Sản phẩm mới</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => updateField('is_featured', e.target.checked)} /> Nổi bật</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_best_seller} onChange={(e) => updateField('is_best_seller', e.target.checked)} /> Bán chạy</label>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-medium">Mô tả & hướng dẫn</h2>
          <textarea placeholder="Mô tả ngắn" rows={2} className="input-field" value={form.short_description} onChange={(e) => updateField('short_description', e.target.value)} />
          <textarea placeholder="Mô tả chi tiết" rows={4} className="input-field" value={form.description} onChange={(e) => updateField('description', e.target.value)} />
          <textarea placeholder="Thành phần" rows={2} className="input-field" value={form.ingredients} onChange={(e) => updateField('ingredients', e.target.value)} />
          <textarea placeholder="Hướng dẫn sử dụng" rows={2} className="input-field" value={form.usage_instructions} onChange={(e) => updateField('usage_instructions', e.target.value)} />
          <textarea placeholder="Hướng dẫn bảo quản" rows={2} className="input-field" value={form.storage_instructions} onChange={(e) => updateField('storage_instructions', e.target.value)} />
          <textarea placeholder="Lưu ý an toàn" rows={2} className="input-field" value={form.safety_notes} onChange={(e) => updateField('safety_notes', e.target.value)} />
          <div className="grid sm:grid-cols-2 gap-4">
            <input placeholder="Thời gian sử dụng (vd: 40-50 giờ cháy)" className="input-field" value={form.usage_duration} onChange={(e) => updateField('usage_duration', e.target.value)} />
            <input placeholder="Không gian phù hợp (vd: Phòng ngủ)" className="input-field" value={form.suitable_space} onChange={(e) => updateField('suitable_space', e.target.value)} />
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <h2 className="font-medium">Mùi hương</h2>
          <div className="flex flex-wrap gap-2">
            {scents.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => toggleScent(s.id)}
                className={`rounded-full px-3 py-1.5 text-sm border ${
                  selectedScents.includes(s.id) ? 'bg-brand-600 text-white border-brand-600' : 'border-ink-900/15 text-ink-900/60'
                }`}
              >
                {s.name}
              </button>
            ))}
            {scents.length === 0 && <p className="text-sm text-ink-900/40">Chưa có mùi hương nào. Thêm ở mục "Mùi hương".</p>}
          </div>
        </div>

        <div className="card p-6 space-y-3">
          <h2 className="font-medium">Hình ảnh</h2>
          <div className="flex flex-wrap gap-3">
            {images?.map((img) => (
              <div key={img.id} className="relative h-20 w-20 rounded-lg overflow-hidden group">
                <img src={img.image_url} className="h-full w-full object-cover" />
                <button type="button" onClick={() => handleDeleteImage(img.id)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
            <label className="h-20 w-20 rounded-lg border-2 border-dashed border-ink-900/20 flex items-center justify-center text-xs text-ink-900/40 cursor-pointer text-center px-1">
              {uploadingImg ? 'Đang tải...' : '+ Thêm ảnh'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImg} />
            </label>
          </div>
          {!currentProductId && <p className="text-xs text-amber-600">Lưu sản phẩm trước để có thể upload hình ảnh.</p>}
        </div>

        <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Biến thể (khối lượng / dung tích)</h2>
            <button type="button" onClick={addVariantRow} className="text-sm text-brand-600 font-medium">+ Thêm biến thể</button>
          </div>
          {variants.length === 0 && <p className="text-sm text-ink-900/40">Chưa có biến thể. Sản phẩm sẽ dùng giá/tồn kho mặc định ở trên.</p>}
          {variants.map((v, i) => (
            <div key={v.id ?? i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center border-t border-ink-900/5 pt-3">
              <input placeholder="Tên (vd: 200g)" className="input-field !py-1.5" value={v.name} onChange={(e) => setVariants((prev) => prev.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
              <input placeholder="Khối lượng" className="input-field !py-1.5" value={v.weight ?? ''} onChange={(e) => setVariants((prev) => prev.map((x, idx) => idx === i ? { ...x, weight: e.target.value } : x))} />
              <input type="number" placeholder="Giá" className="input-field !py-1.5" value={v.price ?? 0} onChange={(e) => setVariants((prev) => prev.map((x, idx) => idx === i ? { ...x, price: Number(e.target.value) } : x))} />
              <input type="number" placeholder="Tồn kho" className="input-field !py-1.5" value={v.stock ?? 0} onChange={(e) => setVariants((prev) => prev.map((x, idx) => idx === i ? { ...x, stock: Number(e.target.value) } : x))} />
              <div className="flex gap-2">
                <button type="button" onClick={() => saveVariant(i)} className="text-xs text-brand-600 font-medium">Lưu</button>
                <button type="button" onClick={() => removeVariant(i)} className="text-xs text-red-500 font-medium">Xóa</button>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Đang lưu...' : 'Lưu sản phẩm'}</button>
          <button type="button" onClick={() => navigate('/admin/san-pham')} className="btn-secondary">Hủy</button>
        </div>
      </form>
    </div>
  );
}
