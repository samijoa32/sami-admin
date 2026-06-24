"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/trpc/react";

type NotificationState = {
  pendingCount: number;
  showToast: boolean;
  toastMessage: string;
  dismissToast: () => void;
  showModal: boolean;
  newOrderCount: number;
  dismissModal: () => void;
};

export function useNewOrderNotification(): NotificationState {
  const prevCountRef = useRef<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);

  const { data } = api.admin.getPendingOrderCount.useQuery(undefined, {
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    retry: false,
  });

  const pendingCount = data?.count ?? 0;

  const playAlarm = useCallback(() => {
    try {
      const ctx = new AudioContext();

      const beep = (startTime: number, freq: number, duration: number, volume = 0.5) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const t = ctx.currentTime;
      // 딩-딩-딩! 3회 연속 울림
      beep(t,       880, 0.18, 0.6);
      beep(t + 0.25, 880, 0.18, 0.6);
      beep(t + 0.50, 1100, 0.30, 0.7);
      // 0.9초 후 한 번 더
      beep(t + 0.9,  880, 0.18, 0.6);
      beep(t + 1.15, 880, 0.18, 0.6);
      beep(t + 1.40, 1100, 0.35, 0.7);
    } catch {
      // AudioContext 미지원 환경 무시
    }
  }, []);

  useEffect(() => {
    if (prevCountRef.current === null) {
      prevCountRef.current = pendingCount;
      return;
    }

    const diff = pendingCount - prevCountRef.current;
    if (diff > 0) {
      const msg =
        diff === 1
          ? "새로운 주문이 1건 들어왔습니다!"
          : `새로운 주문이 ${diff}건 들어왔습니다!`;

      // 토스트 (하단 우측)
      setToastMessage(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 6000);

      // 중앙 모달 팝업
      setNewOrderCount(diff);
      setShowModal(true);

      // 알람 2회 반복
      playAlarm();
    }

    prevCountRef.current = pendingCount;
  }, [pendingCount, playAlarm]);

  const dismissToast = useCallback(() => setShowToast(false), []);
  const dismissModal = useCallback(() => setShowModal(false), []);

  return { pendingCount, showToast, toastMessage, dismissToast, showModal, newOrderCount, dismissModal };
}
