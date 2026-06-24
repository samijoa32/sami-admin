import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";

export const adminRouter = createTRPCRouter({
  // 최근 주문 (대시보드)
  getRecentOrders: adminProcedure
    .input(z.object({ limit: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.order.findMany({
        include: { store: true, items: { include: { menu: true } } },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });
    }),

  // 주문 상태 변경 (접수 → 조리중 → 완료)
  updateOrderStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pending", "cooking", "done"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.order.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  // 신규(접수) 주문 개수 — 알림 배지/토스트용 폴링
  getPendingOrderCount: adminProcedure.query(async ({ ctx }) => {
    const count = await ctx.db.order.count({ where: { status: "pending" } });
    return { count };
  }),

  // 주문 검색/필터링
  searchOrders: adminProcedure
    .input(
      z.object({
        status: z.enum(["pending", "cooking", "done"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        searchTerm: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { status, startDate, endDate, searchTerm } = input;

      const orders = await ctx.db.order.findMany({
        where: {
          ...(status ? { status } : {}),
          ...(startDate || endDate
            ? {
                createdAt: {
                  ...(startDate ? { gte: new Date(startDate) } : {}),
                  ...(endDate ? { lte: new Date(endDate + "T23:59:59") } : {}),
                },
              }
            : {}),
          ...(searchTerm
            ? {
                OR: [
                  { orderNumber: { contains: searchTerm } },
                  { phone: { contains: searchTerm } },
                  { address: { contains: searchTerm } },
                ],
              }
            : {}),
        },
        include: { store: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      });

      // 클라이언트가 다루기 쉬운 평탄화된 형태로 반환
      return orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        storeName: o.store.name,
        orderType: o.orderType,
        phone: o.phone,
        pickupTime: o.pickupTime,
        address: o.address,
        paymentMethod: o.paymentMethod,
        status: o.status,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt,
      }));
    }),
});
