"use client";

import { useCart } from "@/components/customer/CartContext";

type Props = {
  open: boolean;
  onClose: () => void;
  onProceedToOrder: () => void;
};

export function CartDrawer({ open, onClose, onProceedToOrder }: Props) {
  const { items, increaseQty, decreaseQty, removeItem, totalAmount } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* 배경 */}
      <button
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      {/* 드로어 */}
      <div className="relative flex max-h-[80vh] flex-col rounded-t-3xl bg-white px-5 pt-4 shadow-2xl">
        <div className="mx-auto mb-4 h-1 w-10 flex-shrink-0 rounded-full bg-ink-900/10" />

        <h2 className="mb-4 flex-shrink-0 text-lg font-bold text-ink-900">장바구니</h2>

        {items.length === 0 ? (
          <div className="pb-6 py-12 text-center text-ink-900/40">
            <p className="mb-2 text-3xl">🛒</p>
            <p>장바구니가 비어있습니다</p>
          </div>
        ) : (
          <>
            {/* 아이템 목록 — 스크롤 가능 */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.menuId}
                  data-testid="cart-item"
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#faf8f6] p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink-900">{item.name}</p>
                    <p data-testid="item-price" className="text-sm text-brand-600">
                      {(item.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decreaseQty(item.menuId)}
                      className="h-7 w-7 rounded-full bg-white text-ink-900 ring-1 ring-ink-900/10"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQty(item.menuId)}
                      className="h-7 w-7 rounded-full bg-white text-ink-900 ring-1 ring-ink-900/10"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.menuId)}
                    className="text-xs text-ink-900/30 underline"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            {/* 합계 + 버튼 — 항상 하단 고정 */}
            <div className="flex-shrink-0 border-t border-ink-900/10 pb-6 pt-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-ink-900/50">합계</span>
                <span data-testid="cart-total" className="text-xl font-bold text-ink-900">
                  {totalAmount.toLocaleString()}원
                </span>
              </div>

              <button
                disabled={items.length === 0}
                onClick={onProceedToOrder}
                className="w-full rounded-2xl bg-brand-500 py-4 text-base font-semibold text-white transition hover:bg-brand-600 disabled:bg-ink-900/10 disabled:text-ink-900/30"
              >
                주문하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
