"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamically set title based on the project name
    document.title = "MAXRATE | Next-Gen Rate Limiting";

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else if (pathname !== "/") {
      // Redirect to login if trying to access dashboard routes without session
      window.location.href = "/";
    }
    setLoading(false);
  }, [pathname]);

  const showSidebar = !!user && pathname !== "/";

  return (
    <html lang="en">
      <body className={`${inter.className} bg-brand-bg text-brand-text overflow-hidden`}>
        {loading ? (
          <div className="flex h-screen w-screen items-center justify-center bg-brand-bg">
            <div className="text-white text-3xl font-black italic tracking-tighter">MAX <span className="text-brand-primary">RATE</span></div>
          </div>
        ) : (
          <div className="flex h-screen w-screen">
            {showSidebar && <Sidebar />}
            <main className="flex-1 overflow-y-auto p-8">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  );
}
