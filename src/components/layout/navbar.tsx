import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Role } from "@prisma/client";

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
  >
    {children}
  </Link>
);

export function Navbar() {
  const { data: session } = useSession();
  const userRole = session?.user?.role as Role | undefined;

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-white">Pet Boarding</span>
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink href="/">Home</NavLink>
              {session ? (
                <>
                  {userRole === Role.CUSTOMER && (
                    <>
                      <NavLink href="/pets">My Pets</NavLink>
                      <NavLink href="/bookings">My Bookings</NavLink>
                    </>
                  )}
                  {[Role.STAFF, Role.MANAGER, Role.ADMIN].includes(userRole!) && (
                    <>
                      <NavLink href="/dashboard">Dashboard</NavLink>
                      <NavLink href="/bookings/manage">Manage Bookings</NavLink>
                    </>
                  )}
                  {[Role.MANAGER, Role.ADMIN].includes(userRole!) && (
                    <NavLink href="/facility">Facility</NavLink>
                  )}
                  {userRole === Role.ADMIN && (
                    <NavLink href="/admin">Admin</NavLink>
                  )}
                </>
              ) : null}
            </div>
          </div>
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">
                  {session.user?.name ?? session.user?.email}
                </span>
                <button
                  onClick={() => void signOut()}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => void signIn()}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
