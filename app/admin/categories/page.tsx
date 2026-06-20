"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Toast } from "@/components/ui/Notification";

type Category = {
  id: string;
  name: string;
  sortOrder: number;
  menuCount: number;
};

export default function CategoryManagePage() {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const utils = api.useUtils();
  const { data, isLoading } = api.category.getAll.useQuery();
  const categories: Category[] = data ?? [];

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const createCategory = api.category.create.useMutation({
    onSuccess: () => {
      utils.category.getAll.invalidate();
      setNewName("");
      showToast("카테고리가 추가되었습니다.", "success");
    },
    onError: () => showToast("카테고리 추가에 실패했습니다.", "error"),
  });

  const updateCategory = api.category.update.useMutation({
    onSuccess: () => {
      utils.category.getAll.invalidate();
      setEditingId(null);
      showToast("카테고리가 수정되었습니다.", "success");
    },
    onError: () => showToast("카테고리 수정에 실패했습니다.", "error"),
  });

  const deleteCategory = api.category.delete.useMutation({
    onSuccess: () => {
      utils.category.getAll.invalidate();
      showToast("카테고리가 삭제되었습니다.", "success");
    },
    onError: () => showToast("메뉴가 있는 카테고리는 삭제할 수 없습니다.", "error"),
  });

  const reorderCategory = api.category.reorder.useMutation({
    onSuccess: () => utils.category.getAll.invalidate(),
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCategory.mutate({
      name: newName.trim(),
      sortOrder: categories.length,
    });
  };

  const handleEditStart = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleEditSave = () => {
    if (!editingId || !editingName.trim()) return;
    updateCategory.mutate({ id: editingId, name: editingName.trim() });
  };

  const handleDelete = (cat: Category) => {
    if (cat.menuCount > 0) {
      showToast(`이 카테고리에 메뉴 ${cat.menuCount}개가 있어 삭제할 수 없습니다.`, "error");
      return;
    }
    if (confirm(`'${cat.name}' 카테고리를 삭제하시겠습니까?`)) {
      deleteCategory.mutate({ id: cat.id });
    }
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const target = categories[idx];
    const prev = categories[idx - 1];
    reorderCategory.mutate({ id: target.id, sortOrder: prev.sortOrder });
    reorderCategory.mutate({ id: prev.id, sortOrder: target.sortOrder });
  };

  const handleMoveDown = (idx: number) => {
    if (idx === categories.length - 1) return;
    const target = categories[idx];
    const next = categories[idx + 1];
    reorderCategory.mutate({ id: target.id, sortOrder: next.sortOrder });
    reorderCategory.mutate({ id: next.id, sortOrder: target.sortOrder });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
        <p className="mt-1 text-sm text-gray-500">메뉴판에 표시되는 카테고리 순서와 이름을 관리합니다.</p>
      </div>

      {/* 카테고리 추가 */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">새 카테고리 추가</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="카테고리명 (예: 면류, 밥류, 튀김류)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim() || createCategory.isPending}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            추가
          </button>
        </div>
      </div>

      {/* 카테고리 목록 */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-2">📂</p>
            <p>등록된 카테고리가 없습니다.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((cat, idx) => (
              <li key={cat.id} data-testid="category-row" className="flex items-center gap-4 px-6 py-4">
                {/* 순서 조절 */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="rounded text-gray-300 transition hover:text-gray-600 disabled:opacity-20"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === categories.length - 1}
                    className="rounded text-gray-300 transition hover:text-gray-600 disabled:opacity-20"
                  >
                    ▼
                  </button>
                </div>

                {/* 순서 번호 */}
                <span className="w-6 text-center text-sm font-medium text-gray-300">
                  {idx + 1}
                </span>

                {/* 카테고리명 (편집 모드) */}
                <div className="flex-1">
                  {editingId === cat.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditSave();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="w-full rounded-lg border border-red-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-red-100"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{cat.name}</span>
                      <span className="text-xs text-gray-400">메뉴 {cat.menuCount}개</span>
                    </div>
                  )}
                </div>

                {/* 버튼 */}
                <div className="flex gap-2">
                  {editingId === cat.id ? (
                    <>
                      <button
                        onClick={handleEditSave}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditStart(cat)}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={cat.menuCount > 0}
                        className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        title={cat.menuCount > 0 ? "메뉴가 있는 카테고리는 삭제 불가" : ""}
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
