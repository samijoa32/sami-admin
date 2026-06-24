import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "@/server/api/trpc";

export const categoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { menus: true } } },
    });
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      sortOrder: c.sortOrder,
      menuCount: c._count.menus,
    }));
  }),

  create: adminProcedure
    .input(z.object({ name: z.string().min(1), sortOrder: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.create({ data: input });
    }),

  update: adminProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const menuCount = await ctx.db.menu.count({
        where: { categoryId: input.id },
      });
      if (menuCount > 0) {
        throw new Error("메뉴가 있는 카테고리는 삭제할 수 없습니다.");
      }
      return ctx.db.category.delete({ where: { id: input.id } });
    }),

  reorder: adminProcedure
    .input(z.object({ id: z.string(), sortOrder: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.category.update({
        where: { id: input.id },
        data: { sortOrder: input.sortOrder },
      });
    }),
});
