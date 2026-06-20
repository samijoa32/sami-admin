"use client";

/**
 * useNewOrderNotification
 * - 폴링 방식으로 신규 주문(pending) 개수를 5초마다 확인
 * - 이전보다 주문이 늘었으면 토스트 알림 + 알림음 재생
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/trpc/react";

type NotificationState = {
  pendingCount: number;           // 현재 접수 대기 주문 수
  showToast: boolean;             // 토스트 표시 여부
  toastMessage: string;          // 토스트 메시지
  dismissToast: () => void;      // 토스트 닫기
};

export function useNewOrderNotification(): NotificationState {
  const prevCountRef = useRef<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { data } = api.admin.getPendingOrderCount.useQuery(undefined, {
    refetchInterval: 5000, // 5초마다 폴링
    refetchIntervalInBackground: true,
    retry: false, // 인증 안 된 상태에서는 재시도하지 않음
  });

  const pendingCount = data?.count ?? 0;

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext 미지원 환경 무시
    }
  }, []);

  useEffect(() => {
    if (prevCountRef.current === null) {
      prevCountRef.current = pendingCount;
      return;
    }

    const newOrders = pendingCount - prevCountRef.current;
    if (newOrders > 0) {
      const msg = newOrders === 1
        ? "새로운 주문이 1건 들어왔습니다!"
        : `새로운 주문이 ${newOrders}건 들어왔습니다!`;
      setToastMessage(msg);
      setShowToast(true);
      playNotificationSound();

      // 5초 후 자동 닫기
      setTimeout(() => setShowToast(false), 5000);
    }

    prevCountRef.current = pendingCount;
  }, [pendingCount, playNotificationSound]);

  const dismissToast = useCallback(() => setShowToast(false), []);

  return { pendingCount, showToast, toastMessage, dismissToast };
}
