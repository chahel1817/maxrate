"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Settings,
    FileText,
    Key,
    Activity,
    Zap,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const sidebarLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/rate-limits", label: "Rate Limits", icon: Settings },
    { href: "/logs", label: "Logs", icon: FileText },
    { href: "/api-keys", label: "API Keys", icon: Key },
];

export default function Sidebar() {
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    return (
        <aside className="w-64 bg-brand-card border-r border-slate-800 flex flex-col">
            <div className="p-6 flex items-center gap-3">
                <div className="p-2 bg-brand-primary rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    <Zap className="text-white h-5 w-5 fill-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white italic uppercase tracking-tighter">
                    MAX <span className="text-brand-primary">RATE</span>
                </span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href || (pathname === '/' && link.href === '/dashboard');
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300",
                                isActive ? "bg-slate-800 text-brand-primary font-medium" : "text-slate-400 hover:text-brand-text hover:bg-slate-800/50"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 w-1 h-6 bg-brand-primary rounded-r-lg"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            )}
                            <link.icon className={cn("h-5 w-5", isActive ? "text-brand-primary" : "text-slate-500 group-hover:text-slate-300")} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 mt-auto space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-brand-secondary" />
                        <span className="text-xs font-semibold text-slate-300 uppercase">System Status</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-brand-secondary animate-pulse" />
                        <span className="text-sm text-slate-400">All services online</span>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
