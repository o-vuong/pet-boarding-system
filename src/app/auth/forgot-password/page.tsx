import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Form, FormField, FormSection } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

export const metadata: Metadata = {
  title: "Forgot Password - Pet Boarding",
  description: "Reset your password",
};

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader
          title="Forgot Password"
          description="Enter your email address and we'll send you a link to reset your password."
        />
        <CardContent>
          <Form action="/api/auth/forgot-password" method="POST">
            <FormSection>
              <FormField>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </FormField>
              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>
            </FormSection>
          </Form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Remember your password?{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
