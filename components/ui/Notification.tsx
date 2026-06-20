"use client";

import { useEffect, useState } from "react";

/* ───────────────────────────────────────────
   OrderNotificationBadge
   사이드바 메뉴 옆 숫자 배지
─────────────────────────────────────────── */
type BadgeProps = {
  count: number;
  className?: string;
};

export function OrderNotificationBadge({ count, className = "" }: BadgeProps) {
  if (count === 0) return null;

  return (
    <span
      data-testid="pending-badge"
      className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white leading-none ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/* ───────────────────────────────────────────
   OrderNotificationToast
   화면 우하단 고정 토스트
─────────────────────────────────────────── */
type ToastProps = {
  message: string;
  show: boolean;
  onDismiss: () => void;
};

export function OrderNotificationToast({ message, show, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // 마운트 직후 애니메이션 트리거
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [show]);

  if (!show && !visible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-start gap-3 rounded-2xl bg-gray-900 px-5 py-4 shadow-2xl transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
      style={{ minWidth: 280, maxWidth: 360 }}
    >
      {/* 아이콘 */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-base">
        🔔
      </div>

      {/* 텍스트 */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">새 주문 알림</p>
        <p className="mt-0.5 text-xs text-gray-300">{message}</p>
      </div>

      {/* 닫기 */}
      <button
        onClick={onDismiss}
        className="mt-0.5 flex-shrink-0 text-gray-400 transition hover:text-white"
      >
        ✕
      </button>

      {/* 프로그레스 바 (5초) */}
      <div className="absolute bottom-0 left-0 h-1 overflow-hidden rounded-b-2xl w-full">
        <div
          className="h-full bg-red-500"
          style={{
            animation: show ? "shrink 5s linear forwards" : "none",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

/* ───────────────────────────────────────────
   Toast (범용)
   showToast 유틸에서 사용하는 단순 토스트
─────────────────────────────────────────── */
type SimpleToastProps = {
  message: string;
  type: "success" | "error";
};

export function Toast({ message, type }: SimpleToastProps) {
  const bg = type === "success" ? "bg-gray-900" : "bg-red-600";
  const icon = type === "success" ? "✓" : "✕";

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium text-white shadow-2xl ${bg} animate-slide-up`}
    >
      <span className="font-bold">{icon}</span>
      {message}

      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
