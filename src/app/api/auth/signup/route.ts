import { hash } from "bcrypt";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
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
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const result = signUpSchema.safeParse(data);
    if (!result.success) {
      return Response.json(
        { error: result.error.issues[0]?.message ?? "Invalid data" },
        { status: 400 },
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: result.data.email },
    });

    if (existingUser) {
      return Response.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await hash(result.data.password, 10);
    await db.user.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    return Response.redirect(new URL("/auth/signin", req.url));
  } catch (error) {
    console.error("Sign up error:", error);
    return Response.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
