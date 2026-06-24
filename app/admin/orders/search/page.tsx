"use client";

import { Fragment, useState, useMemo } from "react";
import { api } from "@/trpc/react";

type OrderStatus = "pending" | "cooking" | "done" | "all";

type OrderItem = { name: string; quantity: number; price: number };

type OrderRow = {
  id: string;
  orderNumber: string;
  storeName: string;
  orderType: string;
  phone: string;
  pickupTime: string | null;
  address: string | null;
  paymentMethod: string | null;
  status: string;
  totalAmount: number;
  deliveryFee: number;
  createdAt: string | Date;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data, isLoading } = api.admin.searchOrders.useQuery({
    status: appliedFilters.status === "all" ? undefined : appliedFilters.status,
    startDate: appliedFilters.startDate || undefined,
    endDate: appliedFilters.endDate || undefined,
    searchTerm: appliedFilters.searchTerm || undefined,
  });
  const orders: OrderRow[] = data ?? [];

  const stats = useMemo(() => {
    const takeout = orders.filter((o) => o.orderType === "takeout");
    const delivery = orders.filter((o) => o.orderType === "delivery");
    return {
      count: orders.length,
      total: orders.reduce((s, o) => s + o.totalAmount, 0),
      takeoutCount: takeout.length,
      takeoutRevenue: takeout.reduce((s, o) => s + o.totalAmount, 0),
      deliveryCount: delivery.length,
      deliveryRevenue: delivery.reduce((s, o) => s + o.totalAmount, 0),
      avgAmount: orders.length > 0
        ? Math.round(orders.reduce((s, o) => s + o.totalAmount, 0) / orders.length)
        : 0,
    };
  }, [orders]);

  const handleSearch = () =>
    setAppliedFilters({ status, startDate, endDate, searchTerm });

  const handleReset = () => {
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
    setAppliedFilters({ status: "all", startDate: "", endDate: "", searchTerm: "" });
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exportCSV = () => {
    const BOM = "﻿";
    const headers = [
      "주문번호", "매장", "주문타입", "연락처", "상세정보",
      "메뉴내역", "결제방법", "상태", "금액(원)", "배달비(원)", "주문시각",
    ];
    const rows = orders.map((o) => [
      `#${o.orderNumber}`,
      o.storeName,
      o.orderType === "takeout" ? "포장" : "배달",
      o.phone,
      o.orderType === "takeout"
        ? (o.pickupTime ? `픽업 ${o.pickupTime}` : "")
        : (o.address ?? ""),
      o.items.map((i) => `${i.name} x${i.quantity}(${(i.price * i.quantity).toLocaleString()}원)`).join(" / "),
      o.paymentMethod === "card" ? "카드" : o.paymentMethod === "cash" ? "현금" : "-",
      STATUS_LABELS[o.status] ?? o.status,
      o.totalAmount,
      o.deliveryFee,
      new Date(o.createdAt).toLocaleString("ko-KR"),
    ]);

    const csv =
      BOM +
      [headers, ...rows]
        .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const label = appliedFilters.startDate
      ? `${appliedFilters.startDate}~${appliedFilters.endDate || "오늘"}`
      : new Date().toISOString().slice(0, 10);
    a.download = `주문이력_${label}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">주문 조회</h1>
          <p className="mt-1 text-sm text-gray-500">주문 이력을 검색하고 통계를 확인합니다.</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={orders.length === 0}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40"
        >
          📥 CSV 내보내기
        </button>
      </div>

      {/* 필터 패널 */}
      <div className="mb-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">주문 상태</label>
            <div className="flex gap-1.5">
              {(["all", "pending", "cooking", "done"] as OrderStatus[]).map((s) => (
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

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">주문번호 / 전화번호 / 주소</label>
            <input
              type="text"
              placeholder="검색어 입력"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>
        </div>

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

      {/* 통계 카드 */}
      {!isLoading && orders.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon="📋"
            label="총 주문"
            value={`${stats.count.toLocaleString()}건`}
            sub={`합계 ${stats.total.toLocaleString()}원`}
            color="gray"
          />
          <StatCard
            icon="🥡"
            label="포장"
            value={`${stats.takeoutCount.toLocaleString()}건`}
            sub={`${stats.takeoutRevenue.toLocaleString()}원`}
            color="blue"
          />
          <StatCard
            icon="🛵"
            label="배달"
            value={`${stats.deliveryCount.toLocaleString()}건`}
            sub={`${stats.deliveryRevenue.toLocaleString()}원`}
            color="orange"
          />
          <StatCard
            icon="💰"
            label="주문당 평균"
            value={`${stats.avgAmount.toLocaleString()}원`}
            sub={`전체 ${stats.count}건 기준`}
            color="green"
          />
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
          <>
            <p className="border-b border-gray-100 px-5 py-3 text-xs text-gray-400">
              총 <strong className="text-gray-700">{orders.length}</strong>건 — 행을 클릭하면 메뉴 상세가 펼쳐집니다
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">주문번호</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">매장</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">타입</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">연락처</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">픽업/주소</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">상태</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">금액</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">시각</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const expanded = expandedRows.has(order.id);
                    const menuTotal = order.items.reduce(
                      (s, i) => s + i.price * i.quantity,
                      0
                    );

                    return (
                      <Fragment key={order.id}>
                        {/* 주문 행 */}
                        <tr
                          onClick={() => toggleRow(order.id)}
                          className={`cursor-pointer border-b border-gray-50 transition hover:bg-red-50/30 ${
                            expanded ? "bg-red-50/20" : ""
                          }`}
                        >
                          <td className="px-4 py-3 text-xs font-mono text-gray-500">
                            #{order.orderNumber}
                            <span className="ml-1 text-gray-300">{expanded ? "▲" : "▼"}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{order.storeName}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {order.orderType === "takeout" ? "포장" : "배달"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{order.phone}</td>
                          <td className="max-w-[180px] truncate px-4 py-3 text-sm text-gray-500">
                            {order.orderType === "takeout"
                              ? order.pickupTime
                                ? `픽업 ${order.pickupTime}`
                                : "-"
                              : order.address ?? "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {STATUS_LABELS[order.status] ?? order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                            {order.totalAmount.toLocaleString()}원
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleString("ko-KR", {
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>

                        {/* 펼쳐진 메뉴 상세 */}
                        {expanded && (
                          <tr className="border-b border-gray-100 bg-gray-50">
                            <td colSpan={8} className="px-8 pb-4 pt-2">
                              <p className="mb-2 text-xs font-semibold text-gray-400">주문 메뉴</p>
                              <div className="space-y-1.5">
                                {order.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-gray-700">
                                      {item.name}
                                      <span className="ml-2 text-gray-400">× {item.quantity}</span>
                                    </span>
                                    <span className="font-medium text-gray-900">
                                      {(item.price * item.quantity).toLocaleString()}원
                                    </span>
                                  </div>
                                ))}

                                {order.deliveryFee > 0 && (
                                  <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-1.5 text-sm text-gray-500">
                                    <span>배달비</span>
                                    <span>{order.deliveryFee.toLocaleString()}원</span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between border-t border-gray-200 pt-1.5 text-sm font-bold text-gray-900">
                                  <span>합계</span>
                                  <span>{order.totalAmount.toLocaleString()}원</span>
                                </div>

                                {order.orderType === "delivery" && order.paymentMethod && (
                                  <p className="text-xs text-gray-400">
                                    결제: {order.paymentMethod === "card" ? "카드결제" : "현금결제"}
                                    {order.address && ` · ${order.address}`}
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>

                {/* 합계 행 */}
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td colSpan={6} className="px-4 py-3 text-xs font-semibold text-gray-500">
                      합계 ({orders.length}건)
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                      {stats.total.toLocaleString()}원
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  color: "gray" | "blue" | "orange" | "green";
}) {
  const bg = { gray: "bg-white", blue: "bg-blue-50", orange: "bg-orange-50", green: "bg-green-50" }[color];
  const text = {
    gray: "text-gray-900",
    blue: "text-blue-700",
    orange: "text-orange-700",
    green: "text-green-700",
  }[color];

  return (
    <div className={`rounded-2xl p-4 shadow-sm ring-1 ring-gray-100 ${bg}`}>
      <p className="mb-1 text-lg">{icon}</p>
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className={`mt-0.5 text-xl font-bold ${text}`}>{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}
