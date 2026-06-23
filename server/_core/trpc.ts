import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "../../shared/const.js";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { verifyFirebaseToken } from "./firebase-verify";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

/**
 * Requires a valid Firebase ID token in the `Authorization: Bearer <token>`
 * header. Used by procedures consumed by the mobile app (which authenticates
 * with Firebase, not the Manus OAuth session). Adds `firebaseUser` to ctx.
 */
export const firebaseProtectedProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;

    const authHeader = ctx.req.headers.authorization;
    const token =
      typeof authHeader === "string" && authHeader.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length).trim()
        : null;

    if (!token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Missing Firebase ID token",
      });
    }

    try {
      const firebaseUser = await verifyFirebaseToken(token);
      return next({ ctx: { ...ctx, firebaseUser } });
    } catch (error) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid or expired Firebase ID token",
        cause: error,
      });
    }
  }),
);
