import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

// 주문번호 생성: 0001, 0002 ... (매일 자정 기준으로 리셋하지 않고 누적 — 단순화)
async function generateOrderNumber(db: typeof import("@/server/db").db) {
  const count = await db.order.count();
  return String(count + 1).padStart(4, "0");
}

export const orderRouter = createTRPCRouter({
  // 주문 접수 (고객 화면)
  create: publicProcedure
    .input(
      z.object({
        storeId: z.string(),
        orderType: z.enum(["dine_in", "takeout", "delivery"]),
        tableNumber: z.string().optional(),
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
      // 홀 주문인데 테이블 번호가 없으면 거부
      if (input.orderType === "dine_in" && !input.tableNumber?.trim()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "테이블 번호를 입력해주세요.",
        });
      }

      // 메뉴 정보 조회 (가격 검증 + 품절 확인)
      const menuIds = input.items.map((i) => i.menuId);
      const menus = await ctx.db.menu.findMany({
        where: { id: { in: menuIds } },
      });

      const soldOutMenu = menus.find((m: any) => m.soldOut);
      if (soldOutMenu) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${soldOutMenu.name}은 품절된 메뉴입니다.`,
        });
      }

      const menuMap = new Map<string, { name: string; price: number; soldOut: boolean }>(
        menus.map((m: any) => [m.id, m])
      );
      let totalAmount = 0;
      const orderItemsData = input.items.map((item) => {
        const menu = menuMap.get(item.menuId);
        if (!menu) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "존재하지 않는 메뉴입니다." });
        }
        totalAmount += menu.price * item.quantity;
        return {
          menuId: item.menuId,
          quantity: item.quantity,
          price: menu.price,
        };
      });

      const orderNumber = await generateOrderNumber(ctx.db);

      const order = await ctx.db.order.create({
        data: {
          orderNumber,
          storeId: input.storeId,
          orderType: input.orderType,
          tableNumber: input.tableNumber,
          totalAmount,
          items: { create: orderItemsData },
        },
        include: { items: { include: { menu: true } } },
      });

      return order;
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
