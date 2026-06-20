"use client";

type Menu = {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  categoryName: string;
  imageUrl: string | null;
  soldOut: boolean;
  description: string | null;
};

type Props = {
  menus: Menu[];
  onEdit: (menu: Menu) => void;
  onDelete: (id: string) => void;
  onToggleSoldOut: (id: string, soldOut: boolean) => void;
};

export function MenuTable({ menus, onEdit, onDelete, onToggleSoldOut }: Props) {
  if (menus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-3 text-5xl">🍜</div>
        <p className="text-gray-500">등록된 메뉴가 없습니다.</p>
        <p className="mt-1 text-sm text-gray-400">우측 상단 버튼으로 메뉴를 추가해 보세요.</p>
      </div>
    );
  }

  // 카테고리별 그룹핑
  const grouped = menus.reduce<Record<string, Menu[]>>((acc, menu) => {
    const key = menu.categoryName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(menu);
    return acc;
  }, {});

  return (
    <div className="overflow-hidden rounded-2xl">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          {/* 카테고리 헤더 */}
          <div className="bg-gray-50 px-6 py-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              {category}
            </span>
            <span className="ml-2 text-xs text-gray-300">({items.length})</span>
          </div>

          {/* 메뉴 행 */}
          {items.map((menu, idx) => (
            <div
              key={menu.id}
              data-testid="menu-row"
              className={`flex items-center gap-4 px-6 py-4 transition hover:bg-gray-50/50 ${
                idx !== items.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              {/* 이미지 */}
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {menu.imageUrl ? (
                  <img
                    src={menu.imageUrl}
                    alt={menu.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl">🍽️</div>
                )}
              </div>

              {/* 메뉴 정보 */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{menu.name}</span>
                  {menu.soldOut && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                      품절
                    </span>
                  )}
                </div>
                {menu.description && (
                  <p className="mt-0.5 truncate text-xs text-gray-400">{menu.description}</p>
                )}
              </div>

              {/* 가격 */}
              <div className="text-right">
                <span className="font-semibold text-gray-900">
                  {menu.price.toLocaleString()}원
                </span>
              </div>

              {/* 품절 토글 */}
              <SoldOutToggle
                soldOut={menu.soldOut}
                onChange={(val) => onToggleSoldOut(menu.id, val)}
              />

              {/* 액션 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(menu)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete(menu.id)}
                  className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// 품절 토글 컴포넌트
function SoldOutToggle({
  soldOut,
  onChange,
}: {
  soldOut: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!soldOut)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        soldOut ? "bg-red-500" : "bg-gray-200"
      }`}
      title={soldOut ? "품절 해제" : "품절 처리"}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          soldOut ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}
