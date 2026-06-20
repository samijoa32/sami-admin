"use client";

import { useState, useEffect } from "react";

type Category = { id: string; name: string };

type MenuFormData = {
  name: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  description?: string;
};

type Props = {
  initialData?: {
    name: string;
    price: number;
    categoryId: string;
    imageUrl?: string | null;
    description?: string | null;
  } | null;
  categories: Category[];
  onSubmit: (data: MenuFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
};

export function MenuForm({ initialData, categories, onSubmit, onCancel, isLoading }: Props) {
  const [form, setForm] = useState<MenuFormData>({
    name: "",
    price: 0,
    categoryId: categories[0]?.id ?? "",
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
        imageUrl: initialData.imageUrl ?? "",
        description: initialData.description ?? "",
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "메뉴명을 입력하세요.";
    if (!form.price || form.price <= 0) newErrors.price = "올바른 가격을 입력하세요.";
    if (!form.categoryId) newErrors.categoryId = "카테고리를 선택하세요.";
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

      {/* 이미지 URL */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">이미지 URL</label>
        <input
          type="text"
          placeholder="https://..."
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className={inputClass("imageUrl")}
        />
        <p className="mt-1 text-xs text-gray-400">이미지 업로드는 추후 지원 예정입니다.</p>
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
