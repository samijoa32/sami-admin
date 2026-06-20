"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useCart } from "@/components/customer/CartContext";

type OrderType = "dine_in" | "takeout" | "delivery";

type Props = {
  storeId: string;
  onBack: () => void;
  onOrderComplete: (orderNumber: string) => void;
};

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  dine_in: "홀 식사",
  takeout: "포장",
  delivery: "배달",
};

export function OrderTypeScreen({ storeId, onBack, onOrderComplete }: Props) {
  const [orderType, setOrderType] = useState<OrderType>("dine_in");
  const [tableNumber, setTableNumber] = useState("");
  const [error, setError] = useState("");
  const { items, totalAmount, clearCart } = useCart();

  const { data: deliverySetting } = api.deliverySetting.get.useQuery();

  const deliveryFee =
    orderType === "delivery" && deliverySetting
      ? deliverySetting.freeThreshold > 0 && totalAmount >= deliverySetting.freeThreshold
        ? 0
        : deliverySetting.deliveryFee
      : 0;

  const finalAmount = totalAmount + deliveryFee;

  const createOrder = api.order.create.useMutation({
    onSuccess: (order) => {
      clearCart();
      onOrderComplete(order.orderNumber);
    },
    onError: (err) => {
      setError(err.message || "주문 접수에 실패했습니다.");
    },
  });

  const handleConfirm = () => {
    setError("");

    if (orderType === "dine_in" && !tableNumber.trim()) {
      setError("테이블 번호를 입력해주세요.");
      return;
    }

    createOrder.mutate({
      storeId,
      orderType,
      tableNumber: orderType === "dine_in" ? tableNumber : undefined,
      items: items.map((i) => ({ menuId: i.menuId, quantity: i.quantity })),
    });
  };

  return (
    <div className="flex min-h-screen flex-col px-5 py-6">
      <button onClick={onBack} className="mb-4 self-start text-sm text-ink-900/50">
        ← 장바구니로
      </button>

      <h1 className="mb-6 text-xl font-bold text-ink-900">주문 방식을 선택해주세요</h1>

      {/* 주문 타입 선택 */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        {(Object.keys(ORDER_TYPE_LABELS) as OrderType[]).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`rounded-xl py-4 text-sm font-medium transition ${
              orderType === type
                ? "bg-brand-500 text-white"
                : "bg-white text-ink-900/60 ring-1 ring-ink-900/10"
            }`}
          >
            {ORDER_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* 테이블 번호 (홀 식사일 때만) */}
      {orderType === "dine_in" && (
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-ink-900/70">
            테이블 번호
          </label>
          <input
            type="text"
            placeholder="테이블 번호"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full rounded-xl border border-ink-900/10 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      )}

      {/* 배달비 안내 (배달 선택 시) */}
      {orderType === "delivery" && deliverySetting && (
        <div className="mb-6 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
          {deliveryFee === 0 ? (
            <span>🎉 무료배달 적용 (주문금액 {deliverySetting.freeThreshold.toLocaleString()}원 이상)</span>
          ) : (
            <span>
              배달비 {deliveryFee.toLocaleString()}원이 추가됩니다.
              {deliverySetting.freeThreshold > 0 && (
                <> ({deliverySetting.freeThreshold.toLocaleString()}원 이상 주문 시 무료)</>
              )}
            </span>
          )}
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {/* 주문 요약 */}
      <div className="mb-6 rounded-2xl bg-white p-4 ring-1 ring-ink-900/5">
        <p className="mb-2 text-sm font-medium text-ink-900/50">주문 요약</p>
        {items.map((item) => (
          <div key={item.menuId} className="flex justify-between py-1 text-sm">
            <span>{item.name} × {item.quantity}</span>
            <span>{(item.price * item.quantity).toLocaleString()}원</span>
          </div>
        ))}
        {orderType === "delivery" && (
          <div className="flex justify-between py-1 text-sm text-ink-900/60">
            <span>배달비</span>
            <span>{deliveryFee === 0 ? "무료" : `${deliveryFee.toLocaleString()}원`}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-ink-900/10 pt-2 font-semibold">
          <span>합계</span>
          <span>{finalAmount.toLocaleString()}원</span>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={createOrder.isPending}
        className="mt-auto w-full rounded-2xl bg-brand-500 py-4 text-base font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {createOrder.isPending ? "접수 중..." : "주문 확인"}
      </button>
    </div>
  );
}
