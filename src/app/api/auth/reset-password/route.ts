import { hash } from "bcrypt";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data = {
      token: formData.get("token"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const result = resetPasswordSchema.safeParse(data);
    if (!result.success) {
      return Response.json(
        { error: result.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 },
      );
    }

    const passwordReset = await db.passwordReset.findFirst({
      where: {
        token: result.data.token,
        expires: { gt: new Date() },
        used: false,
      },
      include: { user: true },
    });

    if (!passwordReset) {
      return Response.json(
        { error: "Invalid or expired token" },
        { status: 400 },
      );
    }

    const hashedPassword = await hash(result.data.password, 10);
    await db.$transaction([
      db.user.update({
        where: { id: passwordReset.userId },
        data: { password: hashedPassword },
      }),
      db.passwordReset.update({
        where: { id: passwordReset.id },
        data: { used: true },
      }),
    ]);

    return Response.redirect(new URL("/auth/signin", req.url));
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
