"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { MenuForm } from "./_components/MenuForm";
import { MenuTable } from "./_components/MenuTable";
import { Toast } from "@/components/ui/Notification";

export default function MenuManagePage() {
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const utils = api.useUtils();

  const { data: menusData, isLoading } = api.menu.getAll.useQuery();
  const { data: categoriesData } = api.category.getAll.useQuery();
  const { data: storesData } = api.store.getAll.useQuery();
  const menus: Menu[] = menusData ?? [];
  const categories: { id: string; name: string }[] = categoriesData ?? [];
  const stores: { id: string; name: string }[] = storesData ?? [];

  const createMenu = api.menu.create.useMutation({
    onSuccess: () => {
      utils.menu.getAll.invalidate();
      setShowForm(false);
      showToast("메뉴가 추가되었습니다.", "success");
    },
    onError: () => showToast("메뉴 추가에 실패했습니다.", "error"),
  });

  const updateMenu = api.menu.update.useMutation({
    onSuccess: () => {
      utils.menu.getAll.invalidate();
      setEditingMenu(null);
      setShowForm(false);
      showToast("메뉴가 수정되었습니다.", "success");
    },
    onError: () => showToast("메뉴 수정에 실패했습니다.", "error"),
  });

  const deleteMenu = api.menu.delete.useMutation({
    onSuccess: () => {
      utils.menu.getAll.invalidate();
      showToast("메뉴가 삭제되었습니다.", "success");
    },
    onError: () => showToast("메뉴 삭제에 실패했습니다.", "error"),
  });

  const toggleSoldOut = api.menu.toggleSoldOut.useMutation({
    onSuccess: () => {
      utils.menu.getAll.invalidate();
    },
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteMenu.mutate({ id });
    }
  };

  const handleFormSubmit = (data: MenuFormData) => {
    if (editingMenu) {
      updateMenu.mutate({ id: editingMenu.id, ...data });
    } else {
      createMenu.mutate(data);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingMenu(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">메뉴 관리</h1>
          <p className="mt-1 text-sm text-gray-500">
            총 {menus.length}개 메뉴
          </p>
        </div>
        <button
          onClick={() => { setEditingMenu(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
        >
          <span className="text-lg leading-none">+</span>
          메뉴 추가
        </button>
      </div>

      {/* 메뉴 테이블 */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        ) : (
          <MenuTable
            menus={menus}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleSoldOut={(id, soldOut) => toggleSoldOut.mutate({ id, soldOut })}
          />
        )}
      </div>

      {/* 메뉴 추가/수정 모달 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-6 text-lg font-bold text-gray-900">
              {editingMenu ? "메뉴 수정" : "메뉴 추가"}
            </h2>
            <MenuForm
              initialData={editingMenu}
              categories={categories}
              stores={stores}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
              isLoading={createMenu.isPending || updateMenu.isPending}
            />
          </div>
        </div>
      )}

      {/* 토스트 알림 */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

// 타입 정의
type Menu = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  categoryName: string;
  storeId?: string;
  storeName?: string;
  imageUrl: string | null;
  soldOut: boolean;
  description: string | null;
};

type MenuFormData = {
  name: string;
  price: number;
  categoryId: string;
  storeId: string;
  imageUrl?: string;
  description?: string;
};
