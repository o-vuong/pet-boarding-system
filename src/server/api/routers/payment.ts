import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { PaymentStatus } from "@prisma/client";
import Stripe from "stripe";

import {
  createTRPCRouter,
  protectedProcedure,
  staffProcedure,
} from "~/server/api/trpc";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2023-10-16",
});

export const paymentRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ bookingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.db.booking.findUnique({
        where: { id: input.bookingId },
        include: {
          pet: true,
          payment: true,
        },
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Booking not found",
        });
      }

      if (booking.payment) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment already exists for this booking",
        });
      }

      // Get facility pricing
      const facility = await ctx.db.facility.findFirst();
      if (!facility) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Facility configuration not found",
        });
      }

      // Calculate number of days
      const days = Math.ceil(
        (booking.endDate.getTime() - booking.startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const amount = facility.pricing.toNumber() * days;

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          bookingId: booking.id,
          petId: booking.petId,
          userId: ctx.session.user.id,
        },
      });

      // Create payment record
      const payment = await ctx.db.payment.create({
        data: {
          bookingId: booking.id,
          amount: amount,
          status: PaymentStatus.INITIATED,
          stripeId: paymentIntent.id,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        payment,
      };
    }),

  getStatus: protectedProcedure
    .input(z.object({ bookingId: z.string() }))
    .query(async ({ ctx, input }) => {
      const payment = await ctx.db.payment.findUnique({
        where: { bookingId: input.bookingId },
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found",
        });
      }

      return payment;
    }),

  refund: staffProcedure
    .input(z.object({ bookingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.db.payment.findUnique({
        where: { bookingId: input.bookingId },
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found",
        });
      }

      if (payment.status !== PaymentStatus.COMPLETED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment must be completed before refunding",
        });
      }

      if (!payment.stripeId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe payment ID not found",
        });
      }

      // Process refund through Stripe
      await stripe.refunds.create({
        payment_intent: payment.stripeId,
      });

      // Update payment status
      return ctx.db.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.REFUNDED,
        },
      });
    }),
});
