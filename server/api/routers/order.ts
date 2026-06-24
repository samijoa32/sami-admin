import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

// 주문번호 생성: 가장 큰 기존 번호 + 1 (count 대신 max 사용해 삭제/동시성 문제 방지)
async function generateOrderNumber(db: typeof import("@/server/db").db): Promise<string> {
  const last = await db.order.findFirst({
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  const next = last ? Number(last.orderNumber) + 1 : 1;
  return String(next).padStart(4, "0");
}

export const orderRouter = createTRPCRouter({
  // 주문 접수 (고객 화면)
  create: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        orderType: z.enum(["takeout", "delivery"]),
        phone: z.string().min(1, "전화번호를 입력해주세요."),
        pickupTime: z.string().optional(), // 포장 주문
        address: z.string().optional(), // 배달 주문
        paymentMethod: z.enum(["card", "cash"]).optional(), // 배달 주문
        items: z
          .array(
            z.object({
              menuId: z.string(),
              quantity: z.number().min(1),
            })
          )
          .min(1, "장바구니가 비어있습니다."),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 포장 주문: 픽업 예정시간 필수
      if (input.orderType === "takeout" && !input.pickupTime?.trim()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "픽업 예정시간을 선택해주세요.",
        });
      }

      // 배달 주문: 주소·결제방법 필수
      if (input.orderType === "delivery") {
        if (!input.address?.trim()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "배달 주소를 입력해주세요." });
        }
        if (!input.paymentMethod) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "결제 방법을 선택해주세요." });
        }
      }

      // 메뉴 정보 조회 (가격 검증 + 품절 확인)
      const menuIds = input.items.map((i) => i.menuId);
      const menus = await ctx.db.menu.findMany({
        where: { id: { in: menuIds } },
      });

      const soldOutMenu = menus.find((m) => m.soldOut);
      if (soldOutMenu) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${soldOutMenu.name}은 품절된 메뉴입니다.`,
        });
      }

      const menuMap = new Map<string, { name: string; price: number; soldOut: boolean }>(
        menus.map((m) => [m.id, m])
      );
      let menuTotal = 0;
      const orderItemsData = input.items.map((item) => {
        const menu = menuMap.get(item.menuId);
        if (!menu) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "존재하지 않는 메뉴입니다." });
        }
        menuTotal += menu.price * item.quantity;
        return {
          menuId: item.menuId,
          quantity: item.quantity,
          price: menu.price,
        };
      });

      // 배달 주문일 때만 배달비 계산 (기준 금액 이상이면 무료)
      let deliveryFee = 0;
      if (input.orderType === "delivery") {
        const setting = await ctx.db.deliverySetting.upsert({
          where: { id: "delivery_setting" },
          update: {},
          create: { id: "delivery_setting" },
        });
        const isFreeDelivery =
          setting.freeThreshold > 0 && menuTotal >= setting.freeThreshold;
        deliveryFee = isFreeDelivery ? 0 : setting.deliveryFee;
      }

      const totalAmount = menuTotal + deliveryFee;

      // 동시 주문으로 인한 orderNumber 충돌 시 최대 5회 재시도
      let order;
      for (let attempt = 0; attempt < 5; attempt++) {
        const orderNumber = await generateOrderNumber(ctx.db);
        try {
          order = await ctx.db.order.create({
            data: {
              orderNumber,
              storeId: input.storeId,
              orderType: input.orderType,
              phone: input.phone,
              pickupTime: input.orderType === "takeout" ? input.pickupTime : undefined,
              address: input.orderType === "delivery" ? input.address : undefined,
              paymentMethod: input.orderType === "delivery" ? input.paymentMethod : undefined,
              deliveryFee,
              totalAmount,
              items: { create: orderItemsData },
            },
            include: { items: { include: { menu: true } } },
          });
          break;
        } catch (e: unknown) {
          const isUniqueViolation =
            typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002";
          if (!isUniqueViolation || attempt === 4) throw e;
        }
      }

      return order!;
    }),

  // 주문 현황 조회 (고객 화면 — 폴링용)
  getStatus: publicProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { orderNumber: input.orderNumber },
        include: { items: { include: { menu: true } } },
      });
      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "주문을 찾을 수 없습니다." });
      }
      return order;
    }),
});
