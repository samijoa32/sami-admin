/**
 * 배포 후 헬스체크용 엔드포인트
 * GET /api/health → { status: "ok", db: "connected", timestamp }
 *
 * 적용 위치: app/api/health/route.ts
 */

import { NextResponse } from "next/server";
import { db } from "@/server/db"; // 기존 prisma client 경로에 맞게 조정

export async function GET() {
  try {
    // DB 연결 확인 (간단한 쿼리)
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        db: "disconnected",
        message: error instanceof Error ? error.message : "unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
