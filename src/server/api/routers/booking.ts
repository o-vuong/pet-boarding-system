import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { BookingStatus } from "@prisma/client";

import {
  createTRPCRouter,
  protectedProcedure,
  staffProcedure,
  managerProcedure,
} from "~/server/api/trpc";

const bookingCreateSchema = z.object({
  petId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
});

const bookingUpdateSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(BookingStatus),
});

export const bookingRouter = createTRPCRouter({
  create: protectedProcedure
    .input(bookingCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify pet ownership
      const pet = await ctx.db.pet.findUnique({
        where: { id: input.petId },
        select: { ownerId: true },
      });

      if (!pet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pet not found",
        });
      }

      if (
        pet.ownerId !== ctx.session.user.id &&
        ctx.session.user.role === "CUSTOMER"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized",
        });
      }

      // Verify dates
      if (input.startDate >= input.endDate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End date must be after start date",
        });
      }

      // Check facility capacity for the dates
      const overlappingBookings = await ctx.db.booking.count({
        where: {
          OR: [
            {
              startDate: {
                lte: input.endDate,
              },
              endDate: {
                gte: input.startDate,
              },
            },
          ],
          status: {
            in: [
              BookingStatus.PENDING,
              BookingStatus.APPROVED,
              BookingStatus.CHECKED_IN,
            ],
          },
        },
      });

      const facility = await ctx.db.facility.findFirst();
      if (!facility) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Facility configuration not found",
        });
      }

      if (overlappingBookings >= facility.capacity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Facility is at capacity for the selected dates",
        });
      }

      return ctx.db.booking.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
          status: BookingStatus.PENDING,
        },
        include: {
          pet: true,
        },
      });
    }),

  update: staffProcedure
    .input(bookingUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.id },
        include: {
          pet: true,
          user: true,
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      // Only managers can approve/cancel bookings
      if (
        (input.status === BookingStatus.APPROVED ||
          input.status === BookingStatus.CANCELED) &&
        ctx.session.user.role !== "MANAGER" &&
        ctx.session.user.role !== "ADMIN"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only managers can approve or cancel bookings",
        });
      }

      return ctx.db.booking.update({
        where: { id: input.id },
        data: {
          status: input.status,
        },
        include: {
          pet: true,
          user: true,
        },
      });
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.id },
        include: {
          pet: true,
          user: true,
          payment: true,
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      // Only allow owner or staff to view details
      if (
        booking.userId !== ctx.session.user.id &&
        ctx.session.user.role === "CUSTOMER"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized",
        });
      }

      return booking;
    }),

  all: staffProcedure.query(async ({ ctx }) => {
    return ctx.db.booking.findMany({
      include: {
        pet: true,
        user: true,
        payment: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });
  }),

  myBookings: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.booking.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        pet: true,
        payment: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });
  }),

  upcoming: staffProcedure.query(async ({ ctx }) => {
    return ctx.db.booking.findMany({
      where: {
        startDate: {
          gte: new Date(),
        },
        status: {
          in: [BookingStatus.APPROVED, BookingStatus.PENDING],
        },
      },
      include: {
        pet: true,
        user: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });
  }),
});
