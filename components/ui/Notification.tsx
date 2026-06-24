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
   OrderAlertModal
   신규 주문 발생 시 화면 중앙에 뜨는 팝업 모달
─────────────────────────────────────────── */
type AlertModalProps = {
  show: boolean;
  newOrderCount: number;
  onDismiss: () => void;
};

export function OrderAlertModal({ show, newOrderCount, onDismiss }: AlertModalProps) {
  useEffect(() => {
    if (!show) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") onDismiss();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [show, onDismiss]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* 모달 카드 */}
      <div className="relative mx-4 w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl text-center animate-modal-in">
        {/* 벨 아이콘 (흔들림 애니메이션) */}
        <div className="mb-4 flex justify-center">
          <span className="text-6xl animate-bell">🔔</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">새 주문 알림!</h2>
        <p className="text-gray-500 text-sm mb-1">
          {newOrderCount === 1
            ? "새로운 주문이 1건 들어왔습니다."
            : `새로운 주문이 ${newOrderCount}건 들어왔습니다.`}
        </p>
        <p className="text-gray-400 text-xs mb-6">대시보드에서 주문을 확인하고 상태를 변경해주세요.</p>

        <button
          onClick={onDismiss}
          className="w-full rounded-2xl bg-red-600 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 active:scale-95"
          autoFocus
        >
          확인
        </button>
      </div>

      <style jsx>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.85) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in {
          animation: modal-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes bell {
          0%, 100% { transform: rotate(0deg); }
          15%       { transform: rotate(-20deg); }
          30%       { transform: rotate(20deg); }
          45%       { transform: rotate(-15deg); }
          60%       { transform: rotate(15deg); }
          75%       { transform: rotate(-8deg); }
          90%       { transform: rotate(8deg); }
        }
        .animate-bell {
          display: inline-block;
          animation: bell 0.8s ease-in-out 2;
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
