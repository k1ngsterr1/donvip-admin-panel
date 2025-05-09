import type React from "react";
import { Inter } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";
import { AuthGuard } from "@/lib/auth-guard";
import { PopupProvider } from "@/shared";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Admin Panel",
  description: "Admin panel for managing your application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <AuthGuard>
            {children}
            <PopupProvider />
          </AuthGuard>
        </Providers>
      </body>
    </html>
  );
}
