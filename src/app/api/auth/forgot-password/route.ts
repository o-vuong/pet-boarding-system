import { randomBytes } from "crypto";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data = {
      email: formData.get("email"),
    };

    const result = forgotPasswordSchema.safeParse(data);
    if (!result.success) {
      return Response.json(
        { error: result.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where: { email: result.data.email },
    });

    if (!user) {
      // Don't reveal that the email doesn't exist
      return Response.json(
        { message: "If an account exists with this email, you will receive a password reset link" },
        { status: 200 },
      );
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

    await db.passwordReset.create({
      data: {
        token,
        expires,
        userId: user.id,
      },
    });

    // TODO: Send email with reset link
    // For now, just redirect to the reset page with the token
    return Response.redirect(
      new URL(`/auth/reset-password?token=${token}`, req.url),
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
