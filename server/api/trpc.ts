import { TRPCError, initTRPC } from "@trpc/server";
import { cookies } from "next/headers";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@/server/db";

/**
 * tRPC 컨텍스트
 * 모든 요청에서 DB 클라이언트에 접근할 수 있게 해줍니다.
 */
export const createTRPCContext = async () => {
  return { db };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

/** 누구나 호출 가능한 procedure (고객 화면용) */
export const publicProcedure = t.procedure;

/**
 * 관리자만 호출 가능한 procedure
 * sami_admin_auth 쿠키가 "verified"인지 서버에서 직접 검증합니다.
 * (미들웨어만 믿지 않고 tRPC 레이어에서도 재검증 — API 직접 호출 공격 방지)
 */
const enforceAdmin = t.middleware(async ({ next }) => {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("sami_admin_auth");

  if (!authCookie || authCookie.value !== "verified") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "관리자 인증이 필요합니다.",
    });
  }

  return next();
});

export const adminProcedure = t.procedure.use(enforceAdmin);
