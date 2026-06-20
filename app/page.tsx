"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { CartProvider } from "@/components/customer/CartContext";
import { StoreSelectScreen } from "@/components/customer/StoreSelectScreen";
import { MenuScreen } from "@/components/customer/MenuScreen";
import { CartDrawer } from "@/components/customer/CartDrawer";
import { OrderTypeScreen } from "@/components/customer/OrderTypeScreen";
import { OrderStatusScreen } from "@/components/customer/OrderStatusScreen";

type Step = "loading" | "store" | "menu" | "orderType" | "status";

export default function HomePage() {
  const [step, setStep] = useState<Step>("loading");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>("");
  const [cartOpen, setCartOpen] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string | null>(null);

  const { data: stores } = api.store.getAll.useQuery();

  // 매장이 1곳뿐이면 선택 화면 없이 곧바로 메뉴판으로 이동
  // (나중에 지점이 늘어나면 자동으로 선택 화면이 다시 나타납니다)
  useEffect(() => {
    if (!stores) return;
    if (stores.length === 1) {
      setStoreId(stores[0].id);
      setStoreName(stores[0].name);
      setStep("menu");
    } else {
      setStep("store");
    }
  }, [stores]);

  return (
    <CartProvider>
      <div className="min-h-screen bg-[#faf8f6]">
        {step === "loading" && (
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        )}

        {step === "store" && (
          <StoreSelectScreen
            onSelect={(id, name) => {
              setStoreId(id);
              setStoreName(name);
              setStep("menu");
            }}
          />
        )}

        {step === "menu" && storeId && (
          <>
            <MenuScreen
              storeId={storeId}
              storeName={storeName}
              onOpenCart={() => setCartOpen(true)}
              onBack={() => setStep("store")}
              showBackButton={!!(stores && stores.length > 1)}
            />
            <CartDrawer
              open={cartOpen}
              onClose={() => setCartOpen(false)}
              onProceedToOrder={() => {
                setCartOpen(false);
                setStep("orderType");
              }}
            />
          </>
        )}

        {step === "orderType" && storeId && (
          <OrderTypeScreen
            storeId={storeId}
            onBack={() => setStep("menu")}
            onOrderComplete={(orderNumber) => {
              setCompletedOrderNumber(orderNumber);
              setStep("status");
            }}
          />
        )}

        {step === "status" && completedOrderNumber && (
          <OrderStatusScreen
            orderNumber={completedOrderNumber}
            onNewOrder={() => {
              setCompletedOrderNumber(null);
              if (stores && stores.length === 1) {
                setStep("menu");
              } else {
                setStep("store");
              }
            }}
          />
        )}
      </div>
    </CartProvider>
  );
}
