"use client";

import { api } from "@/trpc/react";

const STATUS_LABELS: Record<string, string> = {
  pending: "접수",
  cooking: "조리중",
  done: "완료",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  cooking: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

const ORDER_TYPE_LABELS: Record<string, string> = {
  dine_in: "홀",
  takeout: "포장",
  delivery: "배달",
};

type RecentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  tableNumber: string | null;
  totalAmount: number;
  store: { name: string };
  items: { id: string; quantity: number; menu: { name: string } }[];
};

export default function AdminDashboardPage() {
  const utils = api.useUtils();

  const { data, isLoading } = api.admin.getRecentOrders.useQuery(
    { limit: 30 },
    { refetchInterval: 5000 }
  );
  const orders: RecentOrder[] = data ?? [];

  const updateStatus = api.admin.updateOrderStatus.useMutation({
    onSuccess: () => utils.admin.getRecentOrders.invalidate(),
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-500">최근 주문 현황을 확인하고 상태를 변경합니다.</p>
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="mb-2 text-4xl">📋</p>
            <p>아직 주문이 없습니다.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => (
              <div
                key={order.id}
                data-testid="order-row"
                className="flex items-center gap-4 px-6 py-4"
              >
                <span data-testid="order-number" className="w-16 text-xs font-mono text-gray-400">
                  #{order.orderNumber}
                </span>

                <div className="w-24 text-sm text-gray-600">{order.store.name}</div>

                <div className="w-16 text-sm text-gray-500">
                  {ORDER_TYPE_LABELS[order.orderType]}
                  {order.tableNumber && ` ${order.tableNumber}번`}
                </div>

                <div className="flex-1">
                  <p className="truncate text-sm text-gray-700">
                    {order.items.map((i) => `${i.menu.name} x${i.quantity}`).join(", ")}
                  </p>
                </div>

                <span className="w-24 text-right text-sm font-semibold text-gray-900">
                  {order.totalAmount.toLocaleString()}원
                </span>

                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>

                {/* 상태 변경 버튼 */}
                <div className="flex gap-1.5">
                  {order.status === "pending" && (
                    <button
                      onClick={() => updateStatus.mutate({ id: order.id, status: "cooking" })}
                      className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                    >
                      조리중
                    </button>
                  )}
                  {order.status === "cooking" && (
                    <button
                      onClick={() => updateStatus.mutate({ id: order.id, status: "done" })}
                      className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100"
                    >
                      완료
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
