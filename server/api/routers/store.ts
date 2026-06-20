import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const storeRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.store.findMany({ orderBy: { createdAt: "asc" } });
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.store.findUnique({ where: { slug: input.slug } });
    }),
});
