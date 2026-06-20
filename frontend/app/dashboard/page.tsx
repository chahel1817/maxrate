"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
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
    BarChart3,
} from "lucide-react";

import { getStatsSummary, getLogs, getAllRateLimits, getTrafficData } from "@/lib/api";

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState([
        { id: 'reqs', label: "Total Requests", value: "0", increase: "+0%", icon: Zap, color: "text-brand-primary" },
        { id: 'users', label: "Unique IPs", value: "0", increase: "0%", icon: Users, color: "text-brand-secondary" },
        { id: 'limited', label: "Rate Limited", value: "0", increase: "+0%", icon: ShieldAlert, color: "text-brand-error" },
        { id: 'success', label: "Success Rate", value: "100%", icon: ShieldCheck, color: "text-brand-secondary" },
    ]);

    const [logs, setLogs] = useState<any[]>([]);
    const [rules, setRules] = useState<any[]>([]);
    const [chartData, setChartData] = useState<{ time: string; requests: number; blocked: number }[]>([]);
    const [chartMode, setChartMode] = useState<'requests' | 'blocked'>('requests');

    const fetchData = useCallback(async (userId: number) => {
        try {
            const [summary, logsData, rulesData, trafficData] = await Promise.all([
                getStatsSummary(userId),
                getLogs(userId),
                getAllRateLimits(userId),
                getTrafficData(userId),
            ]);

            const totalReqs = summary.totalRequests || 0;
            const limitedCount = summary.rateLimitedCount || 0;
            const successCount = totalReqs - limitedCount;
            const successRate = totalReqs > 0 ? Math.round((successCount / totalReqs) * 100) : 100;
            const uniqueIPs = new Set(logsData.map((l: any) => l.ipAddress)).size;

            setStats(prev => {
                const updated = [...prev];
                updated[0] = { ...updated[0], value: totalReqs.toLocaleString() };
                updated[1] = { ...updated[1], value: uniqueIPs.toString() };
                updated[2] = { ...updated[2], value: limitedCount.toLocaleString() };
                updated[3] = { ...updated[3], value: `${successRate}%` };
                return updated;
            });

            setLogs(logsData.slice(0, 8).map((l: any) => ({
                id: l.id,
                method: l.method,
                path: l.endpoint,
                ip: l.ipAddress || "127.0.0.1",
                status: l.status === 429 ? "LIMITED" : "SUCCESS",
                code: l.status,
                time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            })));

            setRules(rulesData.slice(0, 3));

            // Set real traffic chart data
            if (Array.isArray(trafficData) && trafficData.length > 0) {
                setChartData(trafficData.map((p: any) => ({
                    time: new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    requests: p.requests || 0,
                    blocked: p.blocked || 0,
                })));
            }

        } catch (err: any) {
            console.error("Dashboard refresh failed", err);
        }
    }, []);

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
        }, 5000);

        return () => clearInterval(interval);
    }, [fetchData]);

    // Compute max value for chart scaling
    const activeChartValues = chartData.map(d => chartMode === 'requests' ? d.requests : d.blocked);
    const maxVal = Math.max(...activeChartValues, 1);

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
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" /> Traffic Overview
                                </h3>
                                <p className="text-slate-500 text-sm mt-1 font-medium italic">Real traffic data from the last 35 minutes (5-min buckets)</p>
                            </div>
                            <div className="flex items-center gap-3 p-1.5 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                                <button
                                    onClick={() => setChartMode('requests')}
                                    className={`px-4 py-1.5 text-[10px] font-bold rounded-xl tracking-widest uppercase transition-colors ${chartMode === 'requests' ? 'text-white bg-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Requests
                                </button>
                                <button
                                    onClick={() => setChartMode('blocked')}
                                    className={`px-4 py-1.5 text-[10px] font-bold rounded-xl tracking-widest uppercase transition-colors ${chartMode === 'blocked' ? 'text-white bg-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Blocked
                                </button>
                            </div>
                        </div>

                        {chartData.length > 0 ? (
                            <div className="h-[280px] w-full relative">
                                {/* Bar chart */}
                                <div className="flex items-end justify-between h-[240px] gap-3 px-2">
                                    {chartData.map((d, i) => {
                                        const val = chartMode === 'requests' ? d.requests : d.blocked;
                                        const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                                        const barColor = chartMode === 'requests'
                                            ? 'bg-brand-primary'
                                            : 'bg-brand-error';
                                        const glowColor = chartMode === 'requests'
                                            ? 'shadow-brand-primary/30'
                                            : 'shadow-brand-error/30';

                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                                                {/* Value label */}
                                                <motion.span
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-[10px] font-black text-slate-400 group-hover/bar:text-white transition-colors"
                                                >
                                                    {val}
                                                </motion.span>
                                                {/* Bar */}
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${Math.max(heightPct, 2)}%` }}
                                                    transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                                                    className={`w-full rounded-xl ${barColor} shadow-lg ${glowColor} group-hover/bar:opacity-100 opacity-80 transition-opacity relative min-h-[4px]`}
                                                    style={{ maxHeight: '100%' }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Time labels */}
                                <div className="flex justify-between mt-4 px-2">
                                    {chartData.map((d, i) => (
                                        <span key={i} className="flex-1 text-center text-[9px] font-bold text-slate-600 uppercase tracking-widest">{d.time}</span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-[280px] w-full flex flex-col items-center justify-center text-slate-600">
                                <BarChart3 className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-sm font-bold">No traffic data yet</p>
                                <p className="text-xs text-slate-700 mt-1">Make some API calls to see real-time traffic here</p>
                            </div>
                        )}
                    </motion.div>

                    <div className="bg-brand-card border border-slate-800/60 rounded-[2.5rem] overflow-hidden shadow-xl">
                        <div className="px-10 py-8 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/10">
                            <div>
                                <h3 className="text-xl font-bold text-white">Live Request Stream</h3>
                                <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.25em] mt-1">Latest API traffic — auto-refreshes every 5s</p>
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
                                        <th className="px-10 py-5">Time</th>
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
                                                    <span className="text-[11px] font-mono text-slate-500">{log.time}</span>
                                                </td>
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
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-10 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3 text-slate-600">
                                                    <Activity className="h-8 w-8 opacity-20" />
                                                    <p className="text-sm font-bold">No requests yet</p>
                                                    <p className="text-xs text-slate-700">Use your API key to make requests and see them here in real-time</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
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
