"use client";

import { api } from "@/trpc/react";

type Props = {
  orderNumber: string;
  onNewOrder: () => void;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "접수",
  cooking: "조리중",
  done: "완료",
};

const STATUS_STEPS = ["pending", "cooking", "done"];

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  menu: { name: string };
};

type OrderDetail = {
  orderNumber: string;
  status: string;
  orderType: string;
  deliveryFee: number;
  totalAmount: number;
  items: OrderItem[];
};

export function OrderStatusScreen({ orderNumber, onNewOrder }: Props) {
  const { data, isLoading } = api.order.getStatus.useQuery(
    { orderNumber },
    { refetchInterval: 4000 } // 4초마다 폴링
  );
  const order = data as OrderDetail | undefined;

  if (isLoading || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p data-testid="order-number" className="mb-1 text-sm text-ink-900/40">
        주문번호 #{order.orderNumber}
      </p>
      <h1 data-testid="order-status" className="mb-8 text-2xl font-bold text-ink-900">
        {STATUS_LABELS[order.status]}
      </h1>

      {/* 진행 단계 표시 */}
      <div className="mb-10 flex w-full max-w-xs items-center justify-between">
        {STATUS_STEPS.map((step, idx) => (
          <div key={step} className="flex flex-1 items-center">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition ${
                idx <= currentStepIndex
                  ? "bg-brand-500 text-white"
                  : "bg-ink-900/10 text-ink-900/30"
              }`}
            >
              {idx + 1}
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 transition ${
                  idx < currentStepIndex ? "bg-brand-500" : "bg-ink-900/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* 주문 내역 */}
      <div className="mb-8 w-full max-w-xs rounded-2xl bg-white p-4 text-left ring-1 ring-ink-900/5">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between py-1 text-sm">
            <span>{item.menu.name} × {item.quantity}</span>
            <span>{(item.price * item.quantity).toLocaleString()}원</span>
          </div>
        ))}
        {order.orderType === "delivery" && (
          <div className="flex justify-between py-1 text-sm text-ink-900/60">
            <span>배달비</span>
            <span>{order.deliveryFee === 0 ? "무료" : `${order.deliveryFee.toLocaleString()}원`}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-ink-900/10 pt-2 font-semibold">
          <span>합계</span>
          <span>{order.totalAmount.toLocaleString()}원</span>
        </div>
      </div>

      <button onClick={onNewOrder} className="text-sm text-ink-900/40 underline">
        새 주문하기
      </button>
    </div>
  );
}
