import { createTRPCRouter } from "@/server/api/trpc";
import { storeRouter } from "@/server/api/routers/store";
import { menuRouter } from "@/server/api/routers/menu";
import { categoryRouter } from "@/server/api/routers/category";
import { orderRouter } from "@/server/api/routers/order";
import { adminRouter } from "@/server/api/routers/admin";
import { authRouter } from "@/server/api/routers/auth";
import { deliverySettingRouter } from "@/server/api/routers/deliverySetting";

export const appRouter = createTRPCRouter({
  store: storeRouter,
  menu: menuRouter,
  category: categoryRouter,
  order: orderRouter,
  admin: adminRouter,
  auth: authRouter,
  deliverySetting: deliverySettingRouter,
});

export type AppRouter = typeof appRouter;
