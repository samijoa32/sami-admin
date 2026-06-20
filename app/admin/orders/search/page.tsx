"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

type OrderStatus = "pending" | "cooking" | "done" | "all";

type OrderRow = {
  id: string;
  orderNumber: string;
  storeName: string;
  orderType: string;
  tableNumber: string | null;
  status: string;
  totalAmount: number;
  createdAt: string | Date;
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  all: "전체",
  pending: "접수",
  cooking: "조리중",
  done: "완료",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  cooking: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

export default function OrderSearchPage() {
  const [status, setStatus] = useState<OrderStatus>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    status: "all" as OrderStatus,
    startDate: "",
    endDate: "",
    searchTerm: "",
  });

  const { data, isLoading } = api.admin.searchOrders.useQuery({
    status: appliedFilters.status === "all" ? undefined : appliedFilters.status,
    startDate: appliedFilters.startDate || undefined,
    endDate: appliedFilters.endDate || undefined,
    searchTerm: appliedFilters.searchTerm || undefined,
  });
  const orders: OrderRow[] = data ?? [];

  const handleSearch = () => {
    setAppliedFilters({ status, startDate, endDate, searchTerm });
  };

  const handleReset = () => {
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setAppliedFilters({ status: "all", startDate: "", endDate: "", searchTerm: "" });
  };

  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">주문 조회</h1>
        <p className="mt-1 text-sm text-gray-500">주문 내역을 검색하고 필터링합니다.</p>
      </div>

      {/* 필터 패널 */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 상태 필터 */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">주문 상태</label>
            <div className="flex gap-1.5">
              {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
                    status === s
                      ? "bg-red-600 text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* 시작일 */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* 종료일 */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* 검색어 */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">주문번호 / 테이블</label>
            <input
              type="text"
              placeholder="주문번호 또는 테이블 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={handleReset}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-500 transition hover:bg-gray-50"
          >
            초기화
          </button>
          <button
            onClick={handleSearch}
            className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            검색
          </button>
        </div>
      </div>

      {/* 결과 요약 */}
      {!isLoading && (
        <div data-testid="result-count" className="mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            총 <strong className="text-gray-900">{orders.length}</strong>건
          </span>
          <span className="text-sm font-semibold text-gray-900">
            합계: {totalAmount.toLocaleString()}원
          </span>
        </div>
      )}

      {/* 주문 목록 */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="mb-2 text-4xl">🔍</p>
            <p>조건에 맞는 주문이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">주문번호</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">매장</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">타입</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">테이블</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">상태</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400">금액</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">시각</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3.5 text-xs font-mono text-gray-500">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-700">{order.storeName}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-500">
                      {order.orderType === "dine_in" ? "홀" : order.orderType === "takeout" ? "포장" : "배달"}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-500">
                      {order.tableNumber ?? "-"}
                    </td>
                    <td data-testid="order-status-cell" className="px-6 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[order.status] ?? ""}`}>
                        {STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold text-gray-900">
                      {order.totalAmount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-3.5 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleString("ko-KR", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
