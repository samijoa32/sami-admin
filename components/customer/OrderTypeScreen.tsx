"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useCart } from "@/components/customer/CartContext";

type OrderType = "takeout" | "delivery";
type PaymentMethod = "card" | "cash";

type Props = {
  storeId: string;
  onBack: () => void;
  onOrderComplete: (orderNumber: string) => void;
};

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  takeout: "포장",
  delivery: "배달",
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: "카드결제",
  cash: "현금결제",
};

const STORE_OPEN_HOUR = 11;
const STORE_CLOSE_HOUR = 21;

type PickupOption = { value: string; label: string };

// 픽업 가능 시간 옵션 생성
// - 현재가 영업시간(11:00~21:00) 안이면: 지금부터 +20분 이후, 10분 단위로 오늘 마감시간까지
// - 현재가 영업시간 밖(마감 후 또는 오픈 전)이면: 다음 영업일 11:00부터 10분 단위로 생성
function generatePickupTimeOptions(): { options: PickupOption[]; isClosedNow: boolean } {
  const now = new Date();
  const options: PickupOption[] = [];

  const isWithinBusinessHours =
    now.getHours() >= STORE_OPEN_HOUR && now.getHours() < STORE_CLOSE_HOUR;

  let cursor: Date;
  let baseDate: Date;

  if (isWithinBusinessHours) {
    cursor = new Date(now.getTime() + 20 * 60 * 1000);
    cursor.setMinutes(Math.ceil(cursor.getMinutes() / 10) * 10, 0, 0);
    baseDate = now;
  } else {
    // 마감 후라면 다음날, 오픈 전(자정~11시)이라면 오늘 11시부터
    baseDate = new Date(now);
    if (now.getHours() >= STORE_CLOSE_HOUR) {
      baseDate.setDate(baseDate.getDate() + 1);
    }
    cursor = new Date(baseDate);
    cursor.setHours(STORE_OPEN_HOUR, 0, 0, 0);
  }

  const isToday = baseDate.toDateString() === now.toDateString();
  const dayLabel = isToday ? "오늘" : "내일";

  for (let i = 0; i < 60; i++) {
    const t = new Date(cursor.getTime() + i * 10 * 60 * 1000);
    if (t.getHours() >= STORE_CLOSE_HOUR) break;
    if (t.getDate() !== cursor.getDate()) break; // 날짜 넘어가면 중단
    const hh = String(t.getHours()).padStart(2, "0");
    const mm = String(t.getMinutes()).padStart(2, "0");
    options.push({ value: `${dayLabel} ${hh}:${mm}`, label: `${dayLabel} ${hh}:${mm}` });
  }

  return { options, isClosedNow: !isWithinBusinessHours };
}


export function OrderTypeScreen({ storeId, onBack, onOrderComplete }: Props) {
  const [orderType, setOrderType] = useState<OrderType>("takeout");
  const [phone, setPhone] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [error, setError] = useState("");
  const { items, totalAmount, clearCart } = useCart();

  const { data: deliverySetting } = api.deliverySetting.get.useQuery();
  const { options: pickupTimeOptions, isClosedNow } = generatePickupTimeOptions();

  const deliveryFee =
    orderType === "delivery" && deliverySetting
      ? deliverySetting.freeThreshold > 0 && totalAmount >= deliverySetting.freeThreshold
        ? 0
        : deliverySetting.deliveryFee
      : 0;

  const finalAmount = totalAmount + deliveryFee;

  const createOrder = api.order.create.useMutation({
    onSuccess: (order) => {
      clearCart();
      onOrderComplete(order.orderNumber);
    },
    onError: (err) => {
      setError(err.message || "주문 접수에 실패했습니다.");
    },
  });

  const handleConfirm = () => {
    setError("");

    if (!phone.trim()) {
      setError("전화번호를 입력해주세요.");
      return;
    }
    if (orderType === "takeout" && !pickupTime) {
      setError("픽업 예정시간을 선택해주세요.");
      return;
    }
    if (orderType === "delivery" && !address.trim()) {
      setError("배달 주소를 입력해주세요.");
      return;
    }
    if (orderType === "delivery" && !paymentMethod) {
      setError("결제 방법을 선택해주세요.");
      return;
    }

    createOrder.mutate({
      storeId,
      orderType,
      phone,
      pickupTime: orderType === "takeout" ? pickupTime : undefined,
      address: orderType === "delivery" ? address : undefined,
      paymentMethod: orderType === "delivery" ? (paymentMethod as PaymentMethod) : undefined,
      items: items.map((i) => ({ menuId: i.menuId, quantity: i.quantity })),
    });
  };

  return (
    <div className="flex min-h-screen flex-col px-5 py-6">
      <button onClick={onBack} className="mb-4 self-start text-sm text-ink-900/50">
        ← 장바구니로
      </button>

      <h1 className="mb-6 text-xl font-bold text-ink-900">주문 방식을 선택해주세요</h1>

      {/* 주문 타입 선택 */}
      <div className="mb-6 grid grid-cols-2 gap-2">
        {(Object.keys(ORDER_TYPE_LABELS) as OrderType[]).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`rounded-xl py-4 text-sm font-medium transition ${
              orderType === type
                ? "bg-brand-500 text-white"
                : "bg-white text-ink-900/60 ring-1 ring-ink-900/10"
            }`}
          >
            {ORDER_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* 전화번호 (공통) */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-ink-900/70">
          연락받을 전화번호
        </label>
        <input
          type="tel"
          placeholder="010-0000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-ink-900/10 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {/* 포장: 픽업 예정시간 */}
      {orderType === "takeout" && (
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-ink-900/70">
            픽업 예정시간
          </label>
          {isClosedNow && (
            <p className="mb-2 text-xs text-brand-600">
              지금은 영업시간(11:00~21:00)이 아니에요. 가장 빠른 영업 시작 시간으로 예약됩니다.
            </p>
          )}
          <select
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="w-full rounded-xl border border-ink-900/10 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            <option value="">시간 선택</option>
            {pickupTimeOptions.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* 배달: 주소 + 결제방법 */}
      {orderType === "delivery" && (
        <>
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium text-ink-900/70">
              배달 주소
            </label>
            <input
              type="text"
              placeholder="도로명 주소, 동/호수까지 입력해주세요"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-ink-900/10 px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium text-ink-900/70">
              결제 방법
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-xl py-3 text-sm font-medium transition ${
                    paymentMethod === method
                      ? "bg-brand-500 text-white"
                      : "bg-white text-ink-900/60 ring-1 ring-ink-900/10"
                  }`}
                >
                  {PAYMENT_LABELS[method]}
                </button>
              ))}
            </div>
          </div>

          {/* 배달비 안내 */}
          {deliverySetting && (
            <div className="mb-5 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
              {deliveryFee === 0 ? (
                <span>🎉 무료배달 적용 (주문금액 {deliverySetting.freeThreshold.toLocaleString()}원 이상)</span>
              ) : (
                <span>
                  배달비 {deliveryFee.toLocaleString()}원이 추가됩니다.
                  {deliverySetting.freeThreshold > 0 && (
                    <> ({deliverySetting.freeThreshold.toLocaleString()}원 이상 주문 시 무료)</>
                  )}
                </span>
              )}
            </div>
          )}
        </>
      )}

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* 주문 요약 */}
      <div className="mb-6 rounded-2xl bg-white p-4 ring-1 ring-ink-900/5">
        <p className="mb-2 text-sm font-medium text-ink-900/50">주문 요약</p>
        {items.map((item) => (
          <div key={item.menuId} className="flex justify-between py-1 text-sm">
            <span>{item.name} × {item.quantity}</span>
            <span>{(item.price * item.quantity).toLocaleString()}원</span>
          </div>
        ))}
        {orderType === "delivery" && (
          <div className="flex justify-between py-1 text-sm text-ink-900/60">
            <span>배달비</span>
            <span>{deliveryFee === 0 ? "무료" : `${deliveryFee.toLocaleString()}원`}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-ink-900/10 pt-2 font-semibold">
          <span>합계</span>
          <span>{finalAmount.toLocaleString()}원</span>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={createOrder.isPending}
        className="mt-auto w-full rounded-2xl bg-brand-500 py-4 text-base font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {createOrder.isPending ? "접수 중..." : "주문 확인"}
      </button>
    </div>
  );
}
