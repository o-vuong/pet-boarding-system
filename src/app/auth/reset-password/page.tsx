import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Form, FormField, FormSection } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

export const metadata: Metadata = {
  title: "Reset Password - Pet Boarding",
  description: "Create a new password",
};

interface Props {
  searchParams: {
    token?: string;
  };
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  if (!searchParams.token) {
    redirect("/auth/forgot-password");
  }

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader
          title="Reset Password"
          description="Enter your new password below."
        />
        <CardContent>
          <Form action="/api/auth/reset-password" method="POST">
            <input type="hidden" name="token" value={searchParams.token} />
            <FormSection>
              <FormField>
                <Input
                  label="New Password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </FormField>
              <FormField>
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </FormField>
              <Button type="submit" className="w-full">
                Reset Password
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
