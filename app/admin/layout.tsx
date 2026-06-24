"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useNewOrderNotification } from "@/hooks/useNewOrderNotification";
import { OrderNotificationBadge, OrderNotificationToast, OrderAlertModal } from "@/components/ui/Notification";
import { api } from "@/trpc/react";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", icon: "📊", showBadge: true },
  { href: "/admin/orders/search", label: "주문 조회", icon: "🔍" },
  { href: "/admin/menus", label: "메뉴 관리", icon: "🍜" },
  { href: "/admin/categories", label: "카테고리", icon: "📂" },
  { href: "/admin/delivery", label: "배달비 설정", icon: "🛵" },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { pendingCount, showToast, toastMessage, dismissToast, showModal, newOrderCount, dismissModal } =
    useNewOrderNotification();

  const logout = api.auth.logout.useMutation({
    onSuccess: () => {
      router.push("/admin/login");
      router.refresh();
    },
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <aside className="flex w-56 flex-col bg-white shadow-sm ring-1 ring-gray-100">
        {/* 로고 */}
        <div className="border-b border-gray-100 px-6 py-5">
          <h1 className="text-lg font-bold text-gray-900">사미반점</h1>
          <p className="text-xs text-gray-400">관리자 페이지</p>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-red-50 font-semibold text-red-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.showBadge && (
                  <OrderNotificationBadge count={pendingCount} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 하단: 매장 정보 + 로그아웃 */}
        <div className="border-t border-gray-100 px-4 py-4 space-y-2">
          <p className="text-xs text-gray-400">본점 · 미사2호점</p>
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="w-full rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {logout.isPending ? "로그아웃 중..." : "로그아웃"}
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* 실시간 주문 알림 토스트 (하단 우측 작은 알림) */}
      <OrderNotificationToast
        message={toastMessage}
        show={showToast}
        onDismiss={dismissToast}
      />

      {/* 신규 주문 모달 (중앙 팝업) */}
      <OrderAlertModal
        show={showModal}
        newOrderCount={newOrderCount}
        onDismiss={dismissModal}
      />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 로그인 페이지는 사이드바 없이 단독으로 표시 (인증 전이라 폴링 훅도 호출하지 않음)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
