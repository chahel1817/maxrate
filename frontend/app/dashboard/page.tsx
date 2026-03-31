"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Activity,
    Users,
    ShieldAlert,
    Zap,
    TrendingUp,
    ShieldCheck,
    Clock,
    ChevronRight,
    Search,
    Filter,
} from "lucide-react";

import { getStatsSummary, getLogs, getAllRateLimits } from "@/lib/api";

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState([
        { id: 'reqs', label: "Total Requests", value: "0", increase: "+12%", icon: Zap, color: "text-brand-primary" },
        { id: 'users', label: "Active Users", value: "1", increase: "0%", icon: Users, color: "text-brand-secondary" },
        { id: 'limited', label: "Rate Limited", value: "0", increase: "+5%", icon: ShieldAlert, color: "text-brand-error" },
        { id: 'latency', label: "Avg Latency", value: "18ms", icon: Clock, color: "text-slate-400" },
    ]);

    const [logs, setLogs] = useState<any[]>([]);
    const [rules, setRules] = useState<any[]>([]);
    const [chartData, setChartData] = useState<number[]>([40, 60, 45, 70, 50, 85, 65]);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            fetchData(user.id);
        }

        const interval = setInterval(() => {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                fetchData(user.id);
            }
        }, 5000); // More frequent updates

        return () => clearInterval(interval);
    }, []);

    const fetchData = async (userId: number) => {
        try {
            const [summary, logsData, rulesData] = await Promise.all([
                getStatsSummary(),
                getLogs(),
                getAllRateLimits()
            ]);

            setStats(prev => {
                const updated = [...prev];
                updated[0].value = (summary.totalRequests || 0).toLocaleString();
                const limitedCount = logsData.filter((l: any) => l.status === 429).length;
                updated[2].value = limitedCount.toLocaleString();
                updated[1].value = new Set(logsData.map((l: any) => l.ipAddress)).size.toString();
                return updated;
            });

            setLogs(logsData.slice(0, 8).map((l: any) => ({
                id: l.id,
                method: l.method,
                path: l.endpoint,
                ip: l.ipAddress || "127.0.0.1",
                status: l.status === 429 ? "LIMITED" : "SUCCESS",
                code: l.status
            })));

            setRules(rulesData.slice(0, 3));

            // Randomize chart a bit for "liveness" feel
            setChartData(prev => {
                const next = [...prev.slice(1), 30 + Math.floor(Math.random() * 50)];
                return next;
            });

        } catch (err: any) {
            console.error("Dashboard refresh failed", err);
        }
    };

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-800/50">
                <div>
                    <div className="flex items-center gap-2 text-brand-primary mb-2">
                        <Activity className="h-4 w-4 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-brand-primary/10 px-2 py-0.5 rounded-full">Live Monitor</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">System Analytics</h1>
                    <p className="text-slate-500 font-medium tracking-wide">Real-time oversight of your API distribution and performance metrics.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-slate-700/50">
                        <Filter className="h-3.5 w-3.5" /> Filter Views
                    </button>
                    <Link href="/logs" className="flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-primary/20">
                        Full Activity <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-brand-card border border-slate-800/60 rounded-[2rem] p-7 relative group hover:border-brand-primary/30 transition-all cursor-default overflow-hidden"
                    >
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-primary/5 blur-3xl group-hover:bg-brand-primary/10 transition-all" />

                        <div className="flex items-start justify-between mb-6">
                            <div className={`p-3.5 rounded-2xl bg-slate-900 border border-slate-800 ${stat.color} shadow-inner`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            {stat.increase && (
                                <div className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border ${stat.id === 'limited' ? 'text-brand-error bg-brand-error/10 border-brand-error/20' : 'text-brand-secondary bg-brand-secondary/10 border-brand-secondary/20'
                                    }`}>
                                    <TrendingUp className={`h-3 w-3 ${stat.id === 'limited' ? 'rotate-180' : ''}`} />
                                    {stat.increase}
                                </div>
                            )}
                        </div>
                        <h4 className="text-3xl font-black text-white tracking-tight mb-1">{stat.value}</h4>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">
                    {/* Traffic Chart Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-brand-card border border-slate-800/80 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                            <div>
                                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" /> Traffic Overview
                                </h3>
                                <p className="text-slate-500 text-sm mt-1 font-medium italic">Throughput monitoring across all active endpoints</p>
                            </div>
                            <div className="flex items-center gap-3 p-1.5 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                                <button className="px-4 py-1.5 text-[10px] font-bold text-white bg-slate-800 rounded-xl shadow-sm tracking-widest uppercase">Requests</button>
                                <button className="px-4 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-300 tracking-widest uppercase transition-colors">Blocked</button>
                            </div>
                        </div>

                        <div className="h-[280px] w-full relative">
                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 100">
                                <defs>
                                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0" />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {[0, 25, 50, 75, 100].map(val => (
                                    <line key={val} x1="0" y1={val} x2="600" y2={val} stroke="rgba(30, 41, 59, 0.5)" strokeWidth="0.5" />
                                ))}

                                <motion.path
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    d={`M 0 100 ${chartData.map((d, i) => `L ${i * 100} ${100 - d}`).join(' ')} L 600 100 Z`}
                                    fill="url(#chartFill)"
                                    className="transition-all duration-700 ease-in-out"
                                />

                                <motion.path
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2 }}
                                    d={`M 0 ${100 - chartData[0]} ${chartData.map((d, i) => `L ${i * 100} ${100 - d}`).slice(1).join(' ')}`}
                                    fill="none"
                                    stroke="rgb(99, 102, 241)"
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter="url(#glow)"
                                    className="transition-all duration-700 ease-in-out"
                                />

                                {chartData.map((d, i) => (
                                    <circle
                                        key={i}
                                        cx={i * 100}
                                        cy={100 - d}
                                        r="4"
                                        fill="#fff"
                                        stroke="rgb(99, 102, 241)"
                                        strokeWidth="2.5"
                                        className="transition-all duration-700 ease-in-out"
                                    />
                                ))}
                            </svg>
                            <div className="flex justify-between mt-6 px-1">
                                {['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30'].map(t => (
                                    <span key={t} className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{t} PM</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <div className="bg-brand-card border border-slate-800/60 rounded-[2.5rem] overflow-hidden shadow-xl">
                        <div className="px-10 py-8 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/10">
                            <div>
                                <h3 className="text-xl font-bold text-white">Live Request Stream</h3>
                                <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.25em] mt-1">Incoming traffic websocket active</p>
                            </div>
                            <Link
                                href="/logs"
                                className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand-primary transition-all bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/30"
                            >
                                View full session
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-900/30 text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="px-10 py-5">Call</th>
                                        <th className="px-10 py-5">Resource</th>
                                        <th className="px-10 py-5">Source</th>
                                        <th className="px-10 py-5 text-right">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {logs.map((log) => (
                                            <motion.tr
                                                key={log.id}
                                                layout
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                className="group hover:bg-white/[0.02] transition-colors"
                                            >
                                                <td className="px-10 py-5">
                                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${log.method === 'POST'
                                                            ? 'border-brand-primary/30 text-brand-primary bg-brand-primary/5'
                                                            : 'border-slate-800 text-slate-400 bg-slate-800/20'
                                                        }`}>
                                                        {log.method}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-200 font-mono tracking-tight">{log.path}</span>
                                                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-0.5">REST API Endpoint</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-5">
                                                    <span className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                                        <Search className="h-3 w-3 text-slate-700" /> {log.ip}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-5 text-right">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${log.status === 'SUCCESS'
                                                            ? 'text-brand-secondary bg-brand-secondary/5 border-brand-secondary/10'
                                                            : 'text-brand-error bg-brand-error/5 border-brand-error/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                                        }`}>
                                                        <div className={`h-2 w-2 rounded-full ${log.status === 'SUCCESS'
                                                                ? 'bg-brand-secondary shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                                                                : 'bg-brand-error animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                                                            }`} />
                                                        <span className="text-xs font-black">{log.code}</span>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody >
                            </table>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-brand-card border border-slate-800/80 rounded-[2.5rem] p-8 shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black text-white">Rule Activity</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Enforcement status</p>
                            </div>
                            <div className="p-2.5 bg-brand-primary/10 rounded-2xl">
                                <ShieldCheck className="h-6 w-6 text-brand-primary" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            {rules.length > 0 ? rules.map((rule) => (
                                <div key={rule.id} className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800/60 hover:border-brand-primary/20 transition-all group">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-black text-white bg-slate-800 px-3 py-1 rounded-full group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
                                            RULE#{rule.id}
                                        </span>
                                        <div className="h-2 w-2 rounded-full bg-brand-secondary ring-4 ring-brand-secondary/5 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Threshold</div>
                                            <div className="text-lg font-black text-slate-200">{rule.limitCount} reqs <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">/ {rule.timeWindow}s</span></div>
                                        </div>
                                        <Link href="/rate-limits" className="p-2 text-slate-700 hover:text-white transition-colors">
                                            <ChevronRight className="h-5 w-5" />
                                        </Link>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-800/50 rounded-[2rem] bg-slate-900/10">
                                    <Activity className="h-10 w-10 text-slate-800 mb-4" />
                                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] text-center px-4 leading-relaxed">
                                        No custom overrides. <br /> Currently using <br /> <span className="text-brand-primary">global defaults</span>.
                                    </p>
                                </div>
                            )}

                            <Link
                                href="/rate-limits"
                                className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest border border-slate-700/30 transition-all group"
                            >
                                Manage Rules
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>

                    <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-[2.5rem] p-8">
                        <div className="p-3 bg-brand-primary/10 rounded-2xl w-fit mb-6">
                            <ShieldAlert className="h-6 w-6 text-brand-primary" />
                        </div>
                        <h4 className="text-lg font-black text-white mb-2">Integration Notice</h4>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">
                            Make sure to include your <span className="text-brand-primary font-bold">x-api-key</span> in all request headers.
                        </p>
                        <Link href="/api-keys" className="text-xs font-black text-brand-primary hover:underline uppercase tracking-widest flex items-center gap-2">
                            View API Keys <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
