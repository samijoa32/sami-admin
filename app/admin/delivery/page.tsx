"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Toast } from "@/components/ui/Notification";

export default function DeliverySettingPage() {
  const [deliveryFee, setDeliveryFee] = useState("");
  const [freeThreshold, setFreeThreshold] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const utils = api.useUtils();
  const { data: setting, isLoading } = api.deliverySetting.get.useQuery();

  useEffect(() => {
    if (setting) {
      setDeliveryFee(String(setting.deliveryFee));
      setFreeThreshold(String(setting.freeThreshold));
    }
  }, [setting]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateSetting = api.deliverySetting.update.useMutation({
    onSuccess: () => {
      utils.deliverySetting.get.invalidate();
      showToast("배달비 설정이 저장되었습니다.", "success");
    },
    onError: () => showToast("저장에 실패했습니다.", "error"),
  });

  const handleSave = () => {
    const fee = Number(deliveryFee);
    const threshold = Number(freeThreshold);

    if (isNaN(fee) || fee < 0) {
      showToast("배달비를 올바르게 입력해주세요.", "error");
      return;
    }
    if (isNaN(threshold) || threshold < 0) {
      showToast("무료배달 기준 금액을 올바르게 입력해주세요.", "error");
      return;
    }

    updateSetting.mutate({ deliveryFee: fee, freeThreshold: threshold });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">배달비 설정</h1>
        <p className="mt-1 text-sm text-gray-500">
          배달 주문 시 적용되는 배달비와 무료배달 기준을 설정합니다.
        </p>
      </div>

      <div className="max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                기본 배달비
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                무료배달 기준 금액
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={freeThreshold}
                  onChange={(e) => setFreeThreshold(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                0원으로 설정하면 항상 배달비가 부과됩니다.
              </p>
            </div>

            {/* 미리보기 */}
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              <p className="font-medium text-gray-700">적용 예시</p>
              <p className="mt-1.5">
                주문금액 {Number(freeThreshold || 0).toLocaleString()}원 미만 →
                배달비 <strong>{Number(deliveryFee || 0).toLocaleString()}원</strong>
              </p>
              <p>
                주문금액 {Number(freeThreshold || 0).toLocaleString()}원 이상 →
                <strong className="text-brand-600"> 무료배달</strong>
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={updateSetting.isPending}
              className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {updateSetting.isPending ? "저장 중..." : "저장"}
            </button>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
