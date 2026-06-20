"use client";

import { useState, useMemo } from "react";
import { api } from "@/trpc/react";
import { useCart } from "@/components/customer/CartContext";

type Props = {
  storeId: string;
  storeName: string;
  onOpenCart: () => void;
  onBack: () => void;
};

export function MenuScreen({ storeId, storeName, onOpenCart, onBack }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { addItem, totalCount, totalAmount } = useCart();

  const { data, isLoading } = api.menu.getByStore.useQuery({ storeId });
  const menus: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    description: string | null;
    soldOut: boolean;
    categoryId: string;
    categoryName: string;
  }[] = data ?? [];

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    menus.forEach((m) => seen.set(m.categoryId, m.categoryName));
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [menus]);

  const filteredMenus = activeCategory
    ? menus.filter((m) => m.categoryId === activeCategory)
    : menus;

  return (
    <div className="pb-28">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 border-b border-ink-900/5 bg-[#faf8f6]/95 px-5 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm text-ink-900/50">
            ← 매장변경
          </button>
          <h1 className="text-base font-semibold text-ink-900">{storeName}</h1>
          <div className="w-16" />
        </div>

        {/* 카테고리 필터 */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeCategory === null
                ? "bg-brand-500 text-white"
                : "bg-white text-ink-900/60 ring-1 ring-ink-900/10"
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeCategory === cat.id
                  ? "bg-brand-500 text-white"
                  : "bg-white text-ink-900/60 ring-1 ring-ink-900/10"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* 메뉴 목록 */}
      <main data-testid="menu-list" className="px-5 py-5">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filteredMenus.map((menu) => (
              <div
                key={menu.id}
                data-testid="menu-card"
                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink-900/5"
              >
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-brand-50 flex items-center justify-center text-2xl">
                  {menu.imageUrl ? (
                    <img src={menu.imageUrl} alt={menu.name} className="h-full w-full object-cover" />
                  ) : (
                    "🍜"
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink-900">{menu.name}</p>
                    {menu.soldOut && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600">
                        품절
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-brand-600">
                    {menu.price.toLocaleString()}원
                  </p>
                </div>

                <button
                  disabled={menu.soldOut}
                  onClick={() =>
                    addItem({ menuId: menu.id, name: menu.name, price: menu.price })
                  }
                  className="flex-shrink-0 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:bg-ink-900/10 disabled:text-ink-900/30"
                >
                  담기
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 장바구니 floating bar */}
      <button
        data-testid="cart-button"
        onClick={onOpenCart}
        className="fixed bottom-5 left-5 right-5 z-20 flex items-center justify-between rounded-2xl bg-ink-900 px-5 py-4 text-white shadow-xl transition active:scale-[0.98]"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          🛒 장바구니 {totalCount > 0 && `(${totalCount})`}
        </span>
        <span className="font-semibold">{totalAmount.toLocaleString()}원</span>
      </button>
    </div>
  );
}
