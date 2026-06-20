/**
 * 초기 데이터 입력 스크립트
 * 실행: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // 매장 생성 (하남 본점 단독 운영)
  const main_store = await db.store.upsert({
    where: { slug: "main" },
    update: {},
    create: {
      name: "하남 본점",
      slug: "main",
      address: "경기도 하남시 조정대로45 미사센텀비즈 R134,135,136",
      phone: "031-5175-3255",
    },
  });

  // 2. 카테고리 생성
  const categoryNames = [
    { name: "면류", sortOrder: 0 },
    { name: "밥류", sortOrder: 1 },
    { name: "탕수육류", sortOrder: 2 },
    { name: "사이드", sortOrder: 3 },
  ];

  const categories: Record<string, string> = {};
  for (const c of categoryNames) {
    const created = await db.category.create({ data: c });
    categories[c.name] = created.id;
  }

  // 3. 메뉴 생성 (본점 기준)
  const menus = [
    { name: "짜장면", price: 7000, category: "면류" },
    { name: "짬뽕", price: 8000, category: "면류" },
    { name: "사미돌판짜장", price: 9500, category: "면류" },
    { name: "사미연길냉면", price: 10000, category: "면류" },
    { name: "볶음밥", price: 7500, category: "밥류" },
    { name: "잡채밥", price: 8500, category: "밥류" },
    { name: "탕수육(소)", price: 18000, category: "탕수육류" },
    { name: "숙주탕수육", price: 19000, category: "탕수육류" },
    { name: "군만두", price: 5000, category: "사이드" },
  ];

  for (const m of menus) {
    await db.menu.create({
      data: {
        name: m.name,
        price: m.price,
        categoryId: categories[m.category],
        storeId: main_store.id,
      },
    });
  }

  console.log("✅ 시드 데이터 입력 완료");
  console.log(`   매장: ${main_store.name}`);
  console.log(`   카테고리: ${categoryNames.length}개`);
  console.log(`   메뉴: ${menus.length}개`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
