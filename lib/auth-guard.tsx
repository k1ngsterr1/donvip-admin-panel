"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthService } from "@/services";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/login") {
      setChecking(false);
      return;
    }

    // Check if user is authenticated
    const isAuthenticated = AuthService.isAuthenticated();

    // Check if token is expired
    const isTokenExpired = AuthService.isCurrentTokenExpired();

    if (!isAuthenticated || isTokenExpired) {
      // Clear tokens if expired
      if (isTokenExpired) {
        AuthService.clearTokens();
      }
      router.push("/login");
    } else {
      setChecking(false);
    }
  }, [pathname, router]);

  // Show loading state while checking auth
  if (checking && pathname !== "/login") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Проверка авторизации...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
