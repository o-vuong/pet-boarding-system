import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  staffProcedure,
} from "~/server/api/trpc";

const petCreateSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.string().min(1).max(50),
  breed: z.string().min(1).max(50),
  age: z.number().int().min(0),
  ownerId: z.string().optional(), // Optional for staff to create for existing users
});

const petUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50).optional(),
  type: z.string().min(1).max(50).optional(),
  breed: z.string().min(1).max(50).optional(),
  age: z.number().int().min(0).optional(),
});

export const petRouter = createTRPCRouter({
  create: protectedProcedure
    .input(petCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.pet.create({
        data: {
          ...input,
          ownerId: input.ownerId ?? ctx.session.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(petUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      // Verify ownership or staff status
      const pet = await ctx.db.pet.findUnique({
        where: { id },
        select: { ownerId: true },
      });

      if (!pet) {
        throw new Error("Pet not found");
      }

      if (
        pet.ownerId !== ctx.session.user.id &&
        ctx.session.user.role === "CUSTOMER"
      ) {
        throw new Error("Not authorized");
      }

      return ctx.db.pet.update({
        where: { id },
        data: updateData,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership or staff status
      const pet = await ctx.db.pet.findUnique({
        where: { id: input.id },
        select: { ownerId: true },
      });

      if (!pet) {
        throw new Error("Pet not found");
      }

      if (
        pet.ownerId !== ctx.session.user.id &&
        ctx.session.user.role === "CUSTOMER"
      ) {
        throw new Error("Not authorized");
      }

      return ctx.db.pet.delete({
        where: { id: input.id },
      });
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const pet = await ctx.db.pet.findUnique({
        where: { id: input.id },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
            },
          },
          bookings: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              status: true,
            },
          },
        },
      });

      if (!pet) {
        throw new Error("Pet not found");
      }

      // Only allow owner or staff to view details
      if (
        pet.ownerId !== ctx.session.user.id &&
        ctx.session.user.role === "CUSTOMER"
      ) {
        throw new Error("Not authorized");
      }

      return pet;
    }),

  all: staffProcedure.query(async ({ ctx }) => {
    return ctx.db.pet.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }),

  myPets: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.pet.findMany({
      where: {
        ownerId: ctx.session.user.id,
      },
      include: {
        bookings: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });
  }),
});
