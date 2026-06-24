import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "@/server/api/trpc";

export const menuRouter = createTRPCRouter({
  // 고객 화면: 매장별 메뉴 조회 (카테고리 포함)
  getByStore: publicProcedure
    .input(z.object({ storeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const menus = await ctx.db.menu.findMany({
        where: { storeId: input.storeId },
        include: { category: true },
        orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
      });
      return menus.map((m) => ({
        id: m.id,
        name: m.name,
        price: m.price,
        imageUrl: m.imageUrl,
        description: m.description,
        soldOut: m.soldOut,
        categoryId: m.categoryId,
        categoryName: m.category.name,
      }));
    }),

  // 관리자 화면: 전체 메뉴 조회
  getAll: adminProcedure.query(async ({ ctx }) => {
    const menus = await ctx.db.menu.findMany({
      include: { category: true, store: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    });
    return menus.map((m) => ({
      id: m.id,
      name: m.name,
      price: m.price,
      imageUrl: m.imageUrl,
      description: m.description,
      soldOut: m.soldOut,
      categoryId: m.categoryId,
      categoryName: m.category.name,
      storeName: m.store.name,
    }));
  }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        price: z.number().positive(),
        categoryId: z.string(),
        storeId: z.string(),
        imageUrl: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.menu.create({ data: input });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        price: z.number().positive().optional(),
        categoryId: z.string().optional(),
        storeId: z.string().optional(),
        imageUrl: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.menu.update({ where: { id }, data });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.menu.delete({ where: { id: input.id } });
    }),

  toggleSoldOut: adminProcedure
    .input(z.object({ id: z.string(), soldOut: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.menu.update({
        where: { id: input.id },
        data: { soldOut: input.soldOut },
      });
    }),
});
