import { postRouter } from "~/server/api/routers/post";
import { userRouter } from "~/server/api/routers/user";
import { petRouter } from "~/server/api/routers/pet";
import { bookingRouter } from "~/server/api/routers/booking";
import { facilityRouter } from "~/server/api/routers/facility";
import { paymentRouter } from "~/server/api/routers/payment";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  pet: petRouter,
  booking: bookingRouter,
  facility: facilityRouter,
  payment: paymentRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
