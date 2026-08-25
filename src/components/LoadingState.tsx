export function LoadingState({ label = 'Đang tải dữ liệu...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-ink-900/50">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-ink-900/50">
      <p className="text-base font-medium text-ink-900/70">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
      {message}
    </div>
  );
}
