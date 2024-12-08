import Link from "next/link";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export default async function Home() {
  const session = await auth();
  const facility = await api.facility.get.query();

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to{" "}
            <span className="text-indigo-600">Pet Boarding</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
            Professional pet care services in a comfortable and safe environment.
            Book your pet's stay with us today!
          </p>
          <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
            {session ? (
              <Link href="/bookings/new">
                <Button size="lg">Book Now</Button>
              </Link>
            ) : (
              <Link href="/auth/signin">
                <Button size="lg">Sign In to Book</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader
              title="Professional Care"
              description="Our experienced staff provides 24/7 care for your pets"
            />
            <CardContent>
              <p className="text-gray-500">
                Your pets are in good hands with our certified pet care professionals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Modern Facilities"
              description={`Capacity for ${facility.capacity} pets with comfortable accommodations`}
            />
            <CardContent>
              <p className="text-gray-500">
                Clean, spacious, and climate-controlled environment for your pets.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Easy Booking"
              description="Simple online booking system with real-time availability"
            />
            <CardContent>
              <p className="text-gray-500">
                Book your pet's stay online and manage your reservations with ease.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-500">
            Join us today and give your pet the care they deserve.
          </p>
          <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
            {session ? (
              <div className="space-x-4">
                <Link href="/pets">
                  <Button variant="secondary">Manage Pets</Button>
                </Link>
                <Link href="/bookings">
                  <Button>View Bookings</Button>
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link href="/auth/signin">
                  <Button>Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="secondary">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
