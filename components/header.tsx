"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthService } from "@/services";

export function Header() {
  const router = useRouter();
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setUserIdentifier(AuthService.getUserIdentifier());
    setUserRole(AuthService.getUserRole());
  }, []);

  const handleLogout = () => {
    AuthService.clearTokens();
    router.push("/login");
  };

  const getInitials = () => {
    if (!userIdentifier) return "U";

    // If it's an email, use the first letter of the email
    if (userIdentifier.includes("@")) {
      return userIdentifier.charAt(0).toUpperCase();
    }

    // Otherwise use the first two characters
    return userIdentifier.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-white px-4 lg:px-6">
      <div className="w-full flex-1 md:grow-0 lg:hidden">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Toggle menu</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </div>
    </header>
  );
}
