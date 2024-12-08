import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
  managerProcedure,
} from "~/server/api/trpc";

const facilityUpdateSchema = z.object({
  capacity: z.number().int().min(1).optional(),
  pricing: z.number().min(0).optional(),
});

export const facilityRouter = createTRPCRouter({
  update: managerProcedure
    .input(facilityUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const facility = await ctx.db.facility.findFirst();

      if (!facility) {
        return ctx.db.facility.create({
          data: {
            capacity: input.capacity ?? 10,
            pricing: input.pricing ?? 50.00,
          },
        });
      }

      return ctx.db.facility.update({
        where: { id: facility.id },
        data: input,
      });
    }),

  get: protectedProcedure.query(async ({ ctx }) => {
    const facility = await ctx.db.facility.findFirst();

    if (!facility) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Facility configuration not found",
      });
    }

    return facility;
  }),

  availability: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const facility = await ctx.db.facility.findFirst();
      if (!facility) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Facility configuration not found",
        });
      }

      const bookings = await ctx.db.booking.findMany({
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
            in: ["PENDING", "APPROVED", "CHECKED_IN"],
          },
        },
      });

      const dates = [];
      let currentDate = new Date(input.startDate);
      while (currentDate <= input.endDate) {
        const bookingsOnDate = bookings.filter((booking) => {
          const bookingStart = new Date(booking.startDate);
          const bookingEnd = new Date(booking.endDate);
          return currentDate >= bookingStart && currentDate <= bookingEnd;
        });

        dates.push({
          date: new Date(currentDate),
          available: facility.capacity - bookingsOnDate.length,
          total: facility.capacity,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return dates;
    }),
});
