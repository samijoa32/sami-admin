import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { cookies } from "next/headers";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ input }) => {
      const correctPassword = process.env.ADMIN_PASSWORD;

      if (!correctPassword) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "관리자 비밀번호가 서버에 설정되지 않았습니다.",
        });
      }

      if (input.password !== correctPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "비밀번호가 일치하지 않습니다.",
        });
      }

      const cookieStore = await cookies();
      cookieStore.set("sami_admin_auth", "verified", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 8, // 8시간
        path: "/",
      });

      return { success: true };
    }),

  logout: publicProcedure.mutation(async () => {
    const cookieStore = await cookies();
    cookieStore.delete("sami_admin_auth");
    return { success: true };
  }),
});
