import { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { adminFetchAllBanners, adminCreateBanner, adminUpdateBanner, adminDeleteBanner } from '../../services/bannerService';
import { uploadImage } from '../../services/storageService';
import { BANNER_IMAGE_BUCKET } from '../../lib/supabase';
import type { Banner } from '../../types';
import { LoadingState, EmptyState } from '../../components/LoadingState';

const EMPTY = { title: '', link_url: '', position: 'hero' as Banner['position'], sort_order: 0, media_type: 'image' as Banner['media_type'] };

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true);
    const data = await adminFetchAllBanners();
    setBanners(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      alert('Vui lòng chọn tệp banner (ảnh hoặc video).');
      return;
    }
    setUploading(true);
    try {
      const mediaUrl = await uploadImage(BANNER_IMAGE_BUCKET, file);
      await adminCreateBanner({ ...form, image_url: mediaUrl, status: 'active' });
      setShowForm(false);
      setForm(EMPTY);
      setFile(null);
      load();
    } catch (err: any) {
      alert(err.message ?? 'Lỗi khi tải lên. Hãy chắc chắn bucket "banner-images" đã được tạo trong Supabase Storage.');
    } finally {
      setUploading(false);
    }
  }

  async function handleToggle(b: Banner) {
    await adminUpdateBanner(b.id, { status: b.status === 'active' ? 'inactive' : 'active' });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa banner này?')) return;
    await adminDeleteBanner(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Quản lý banner</h1>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1">
          <PlusIcon className="h-4 w-4" /> Thêm banner
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 mb-6 grid sm:grid-cols-2 gap-3">
          <input required placeholder="Tiêu đề banner" className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="input-field" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value as any })}>
            <option value="hero">Banner chính (Hero)</option>
            <option value="promo">Banner khuyến mãi</option>
            <option value="collection">Banner bộ sưu tập</option>
          </select>
          <input placeholder="Link liên kết (tùy chọn)" className="input-field" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
          <input type="number" placeholder="Thứ tự hiển thị" className="input-field" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />

          {/* CHỌN LOẠI BANNER: ẢNH hoặc VIDEO */}
          <div className="sm:col-span-2 flex gap-4 items-center">
            <span className="text-sm text-ink-900/60">Loại banner:</span>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="media_type"
                checked={form.media_type === 'image'}
                onChange={() => { setForm({ ...form, media_type: 'image' }); setFile(null); }}
              />
              Ảnh
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="media_type"
                checked={form.media_type === 'video'}
                onChange={() => { setForm({ ...form, media_type: 'video' }); setFile(null); }}
              />
              Video
            </label>
          </div>

          <input
            required
            type="file"
            accept={form.media_type === 'video' ? 'video/*' : 'image/*'}
            className="input-field sm:col-span-2"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" disabled={uploading} className="btn-primary">{uploading ? 'Đang tải lên...' : 'Lưu'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Hủy</button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingState />
      ) : banners.length === 0 ? (
        <EmptyState title="Chưa có banner nào" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="card overflow-hidden">
              <div className="aspect-video bg-brand-50">
                {b.media_type === 'video' ? (
                  <video src={b.image_url} className="h-full w-full object-cover" muted loop autoPlay playsInline />
                ) : (
                  <img src={b.image_url} alt={b.title} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm">{b.title}</p>
                <p className="text-xs text-ink-900/50 mb-2">{b.media_type === 'video' ? '🎬 Video' : '🖼️ Ảnh'} · {b.position} · thứ tự {b.sort_order}</p>
                <div className="flex items-center justify-between">
                  <button onClick={() => handleToggle(b)} className={`text-xs rounded-full px-2 py-1 ${b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-ink-900/10 text-ink-900/50'}`}>
                    {b.status === 'active' ? 'Đang hiển thị' : 'Đã tắt'}
                  </button>
                  <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><TrashIcon className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}