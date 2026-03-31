"use client";

import { useEffect, useState } from "react";
import DashboardPage from "./dashboard/page";
import LoginPage from "./login/page";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const u = JSON.parse(savedUser);
      if (u.id) {
        setUser(u);
        window.location.href = "/dashboard";
      } else {
        localStorage.removeItem("user"); // Clear invalid session
      }
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return user ? <div className="text-white">Redirecting...</div> : <LoginPage />;
}
