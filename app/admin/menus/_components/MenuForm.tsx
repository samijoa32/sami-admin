"use client";

import { useState, useEffect } from "react";

type Category = { id: string; name: string };
type Store = { id: string; name: string };

type MenuFormData = {
  name: string;
  price: number;
  categoryId: string;
  storeId: string;
  imageUrl?: string;
  description?: string;
};

type Props = {
  initialData?: {
    name: string;
    price: number;
    categoryId: string;
    storeId?: string;
    imageUrl?: string | null;
    description?: string | null;
  } | null;
  categories: Category[];
  stores: Store[];
  onSubmit: (data: MenuFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
};

export function MenuForm({ initialData, categories, stores, onSubmit, onCancel, isLoading }: Props) {
  const [form, setForm] = useState<MenuFormData>({
    name: "",
    price: 0,
    categoryId: categories[0]?.id ?? "",
    storeId: stores[0]?.id ?? "",
    imageUrl: "",
    description: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof MenuFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        price: initialData.price,
        categoryId: initialData.categoryId,
        storeId: initialData.storeId ?? stores[0]?.id ?? "",
        imageUrl: initialData.imageUrl ?? "",
        description: initialData.description ?? "",
      });
    }
  }, [initialData, stores]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "메뉴명을 입력하세요.";
    if (!form.price || form.price <= 0) newErrors.price = "올바른 가격을 입력하세요.";
    if (!form.categoryId) newErrors.categoryId = "카테고리를 선택하세요.";
    if (!form.storeId) newErrors.storeId = "매장을 선택하세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  const inputClass = (field: keyof MenuFormData) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
      errors[field]
        ? "border-red-400 focus:ring-red-200"
        : "border-gray-200 focus:border-red-400 focus:ring-red-100"
    }`;

  return (
    <div className="space-y-4">
      {/* 메뉴명 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">메뉴명 *</label>
        <input
          type="text"
          placeholder="예) 짜장면"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass("name")}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* 매장 */}
      {stores.length > 1 && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">매장 *</label>
          <select
            value={form.storeId}
            onChange={(e) => setForm({ ...form, storeId: e.target.value })}
            className={inputClass("storeId")}
          >
            <option value="">매장 선택</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.storeId && <p className="mt-1 text-xs text-red-500">{errors.storeId}</p>}
        </div>
      )}

      {/* 카테고리 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">카테고리 *</label>
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className={inputClass("categoryId")}
        >
          <option value="">카테고리 선택</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
      </div>

      {/* 가격 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">가격 *</label>
        <div className="relative">
          <input
            type="number"
            placeholder="0"
            value={form.price || ""}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className={`${inputClass("price")} pr-8`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
        </div>
        {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
      </div>

      {/* 이미지 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">메뉴 이미지</label>

        {/* 미리보기 */}
        {form.imageUrl && (
          <div className="mb-2 flex items-center gap-3">
            <img
              src={form.imageUrl}
              alt="미리보기"
              className="h-16 w-16 rounded-xl object-cover ring-1 ring-gray-200"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <button
              type="button"
              onClick={() => setForm({ ...form, imageUrl: "" })}
              className="text-xs text-gray-400 underline"
            >
              이미지 제거
            </button>
          </div>
        )}

        {/* URL 입력 */}
        <input
          type="text"
          placeholder="https://... (이미지 URL 직접 입력)"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className={inputClass("imageUrl")}
        />

        {/* 파일 업로드 */}
        <div className="mt-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50">
            📷 내 컴퓨터에서 사진 선택
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                if (file.size > 2 * 1024 * 1024) {
                  setErrors({ ...errors, imageUrl: "이미지 크기는 2MB 이하로 올려주세요." });
                  return;
                }

                const reader = new FileReader();
                reader.onload = () => {
                  setForm({ ...form, imageUrl: reader.result as string });
                  setErrors({ ...errors, imageUrl: undefined });
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>
        {errors.imageUrl && <p className="mt-1 text-xs text-red-500">{errors.imageUrl}</p>}
      </div>

      {/* 설명 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">메뉴 설명</label>
        <textarea
          placeholder="메뉴에 대한 간단한 설명을 입력하세요."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          취소
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {isLoading ? "저장 중..." : initialData ? "수정 완료" : "추가"}
        </button>
      </div>
    </div>
  );
}
