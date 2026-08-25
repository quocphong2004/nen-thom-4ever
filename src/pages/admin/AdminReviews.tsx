import { useEffect, useState } from 'react';
import { StarIcon } from '@heroicons/react/20/solid';
import { adminFetchReviews, adminSetReviewStatus } from '../../services/reviewService';
import type { Review } from '../../types';
import { formatDate } from '../../utils/format';
import { LoadingState, EmptyState } from '../../components/LoadingState';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await adminFetchReviews();
    setReviews(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(id: string, current: string) {
    await adminSetReviewStatus(id, current === 'approved' ? 'hidden' : 'approved');
    load();
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Quản lý đánh giá</h1>

      {reviews.length === 0 ? (
        <EmptyState title="Chưa có đánh giá nào" />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{r.profile?.full_name ?? 'Khách hàng'}</p>
                  <span className="text-xs text-ink-900/40">{formatDate(r.created_at)}</span>
                </div>
                <div className="flex mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className={`h-4 w-4 ${i < r.rating ? 'text-amber-400' : 'text-ink-900/15'}`} />
                  ))}
                </div>
                {r.content && <p className="text-sm text-ink-900/70">{r.content}</p>}
                {r.image_url && <img src={r.image_url} alt="" className="mt-2 h-20 w-20 object-cover rounded-lg" />}
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xs rounded-full px-2 py-1 block mb-2 ${
                  r.status === 'approved' ? 'bg-green-100 text-green-700' : r.status === 'hidden' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {r.status === 'approved' ? 'Hiển thị' : r.status === 'hidden' ? 'Đã ẩn' : 'Chờ duyệt'}
                </span>
                <button onClick={() => handleToggle(r.id, r.status)} className="text-xs font-medium text-brand-600 hover:underline">
                  {r.status === 'approved' ? 'Ẩn đánh giá' : 'Hiển thị'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
