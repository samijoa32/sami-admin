"use client";

import { useState } from "react";
import { CartProvider } from "@/components/customer/CartContext";
import { StoreSelectScreen } from "@/components/customer/StoreSelectScreen";
import { MenuScreen } from "@/components/customer/MenuScreen";
import { CartDrawer } from "@/components/customer/CartDrawer";
import { OrderTypeScreen } from "@/components/customer/OrderTypeScreen";
import { OrderStatusScreen } from "@/components/customer/OrderStatusScreen";

type Step = "store" | "menu" | "orderType" | "status";

export default function HomePage() {
  const [step, setStep] = useState<Step>("store");
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>("");
  const [cartOpen, setCartOpen] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string | null>(null);

  return (
    <CartProvider>
      <div className="min-h-screen bg-[#faf8f6]">
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
              setStep("store");
              setCompletedOrderNumber(null);
            }}
          />
        )}
      </div>
    </CartProvider>
  );
}
