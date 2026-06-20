"use client";

import { api } from "@/trpc/react";

type Props = {
  onSelect: (storeId: string, storeName: string) => void;
};

export function StoreSelectScreen({ onSelect }: Props) {
  const { data, isLoading } = api.store.getAll.useQuery();
  const stores: { id: string; name: string; address: string | null }[] = data ?? [];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* 로고/타이틀 */}
      <div className="mb-12 text-center">
        <div className="mb-3 text-5xl">🥢</div>
        <h1 className="text-2xl font-bold text-ink-900">사미반점</h1>
        <p className="mt-2 text-sm text-ink-900/50">매장을 선택해주세요</p>
      </div>

      {/* 매장 카드 */}
      {isLoading ? (
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-3">
          {stores.map((store) => (
            <button
              key={store.id}
              data-testid="store-button"
              onClick={() => onSelect(store.id, store.name)}
              className="group flex items-center justify-between rounded-2xl border border-ink-900/10 bg-white px-6 py-5 text-left shadow-sm transition hover:border-brand-500 hover:shadow-md active:scale-[0.98]"
            >
              <div>
                <p className="text-lg font-semibold text-ink-900">{store.name}</p>
                {store.address && (
                  <p className="mt-1 text-xs text-ink-900/40">{store.address}</p>
                )}
              </div>
              <span className="text-brand-500 transition group-hover:translate-x-1">
                →
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
