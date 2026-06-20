import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure } from "@/server/api/trpc";

const SETTING_ID = "delivery_setting";

export const deliverySettingRouter = createTRPCRouter({
  // 고객 화면에서도 배달비 계산을 위해 조회해야 하므로 public
  get: publicProcedure.query(async ({ ctx }) => {
    const setting = await ctx.db.deliverySetting.upsert({
      where: { id: SETTING_ID },
      update: {},
      create: { id: SETTING_ID }, // 없으면 기본값(3000원/15000원)으로 생성
    });
    return setting;
  }),

  update: adminProcedure
    .input(
      z.object({
        deliveryFee: z.number().min(0),
        freeThreshold: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.deliverySetting.upsert({
        where: { id: SETTING_ID },
        update: input,
        create: { id: SETTING_ID, ...input },
      });
    }),
});
