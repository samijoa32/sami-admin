"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const login = api.auth.login.useMutation({
    onSuccess: () => {
      const raw = searchParams.get("redirect") ?? "/admin";
      // 외부 URL 리다이렉트 방지: 반드시 /로 시작하고 //로 시작하지 않아야 함
      const safeRedirect = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/admin";
      router.push(safeRedirect);
      router.refresh();
    },
    onError: (err) => {
      setError(err.message || "로그인에 실패했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate({ password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-900">사미반점</h1>
          <p className="mt-1 text-sm text-gray-500">관리자 로그인</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={login.isPending || !password}
            className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {login.isPending ? "확인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
