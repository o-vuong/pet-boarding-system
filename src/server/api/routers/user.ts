import { z } from "zod";
import { hash } from "bcrypt";

import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { Role } from "@prisma/client";

const userCreateSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role).default(Role.CUSTOMER),
  staffLevel: z.number().optional(),
});

const userUpdateSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  role: z.nativeEnum(Role).optional(),
  staffLevel: z.number().optional(),
});

export const userRouter = createTRPCRouter({
  create: adminProcedure
    .input(userCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await hash(input.password, 10);
      return ctx.db.user.create({
        data: {
          ...input,
          hashedPassword,
        },
        select: {
          id: true,
          email: true,
          role: true,
          staffLevel: true,
        },
      });
    }),

  update: adminProcedure
    .input(userUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      return ctx.db.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          role: true,
          staffLevel: true,
        },
      });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.delete({
        where: { id: input.id },
      });
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        staffLevel: true,
        pets: {
          select: {
            id: true,
            name: true,
            type: true,
            breed: true,
            age: true,
          },
        },
      },
    });
  }),

  all: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        staffLevel: true,
      },
    });
  }),
});
