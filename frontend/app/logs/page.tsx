"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Search, Filter, Download, ArrowUpDown, ChevronLeft, ChevronRight, Activity, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { getLogs } from "@/lib/api";

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchLogs = async () => {
        try {
            const data = await getLogs();
            setLogs(data.map((l: any) => ({
                id: l.id,
                method: l.method,
                path: l.endpoint,
                status: getStatusType(l.status),
                code: l.status,
                ip: l.ipAddress || "127.0.0.1",
                time: new Date(l.timestamp).toLocaleString(),
            })));
        } catch (err: any) {
            if (err.message.includes("404") || err.message.includes("403")) {
                localStorage.removeItem("user");
                window.location.href = "/";
            }
            console.error("Failed to fetch logs", err);
        }
    };

    const getStatusType = (code: number) => {
        if (code >= 200 && code < 300) return "SUCCESS";
        if (code === 429) return "RATE_LIMITED";
        if (code >= 400 && code < 500) return "CLIENT_ERROR";
        return "CRITICAL";
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "SUCCESS": return "text-brand-secondary bg-brand-secondary/5 border-brand-secondary/20";
            case "RATE_LIMITED": return "text-amber-400 bg-amber-400/5 border-amber-400/20";
            case "CLIENT_ERROR": return "text-brand-primary bg-brand-primary/5 border-brand-primary/20";
            case "CRITICAL": return "text-brand-error bg-brand-error/5 border-brand-error/20";
            default: return "text-slate-400 bg-slate-400/5 border-slate-400/20";
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.path.toLowerCase().includes(searchTerm.toLowerCase()) || log.ip.includes(searchTerm);
        const matchesStatus = statusFilter === "all" || log.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Request Logs</h1>
                    <p className="text-slate-400">Real-time monitoring of all API traffic and rate-limit events.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-700 transition-all border border-slate-700">
                        <Download className="h-4 w-4" /> Export CSV
                    </button>
                    <div className="h-10 w-px bg-slate-800 mx-2" />
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        <button className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">1h</button>
                        <button className="px-3 py-1.5 text-xs font-bold text-white bg-slate-800 rounded-lg shadow-sm">24h</button>
                        <button className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">7d</button>
                    </div>
                </div>
            </header>

            <div className="bg-brand-card border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="p-6 border-b border-slate-800 bg-slate-900/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by path or IP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-brand-primary transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-900 border border-slate-800 text-slate-300 text-sm rounded-xl py-2.5 px-4 outline-none focus:border-brand-primary transition-all cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="SUCCESS">Success (2xx)</option>
                            <option value="RATE_LIMITED">Rate Limited (429)</option>
                            <option value="CLIENT_ERROR">Client Error (4xx)</option>
                            <option value="CRITICAL">Critical (5xx)</option>
                        </select>
                        <button className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
                            <ArrowUpDown className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">
                            <tr>
                                <th className="px-8 py-5">Timestamp</th>
                                <th className="px-8 py-5">Method / Endpoint</th>
                                <th className="px-8 py-5">Origin IP</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Code</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            <AnimatePresence mode="popLayout">
                                {filteredLogs.map((log, idx) => (
                                    <motion.tr
                                        key={log.id || idx}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-slate-800/20 transition-colors group"
                                    >
                                        <td className="px-8 py-5 text-sm text-slate-400 font-medium whitespace-nowrap">
                                            {log.time}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${log.method === 'POST' ? 'border-brand-primary/30 text-brand-primary bg-brand-primary/5' : 'border-slate-700 text-slate-400 bg-slate-800/50'}`}>
                                                    {log.method}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-100 font-mono group-hover:text-brand-primary transition-colors">{log.path}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
                                                <Activity className="h-3 w-3 opacity-30" />
                                                {log.ip}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold ${getStatusStyle(log.status)}`}>
                                                {log.status === 'SUCCESS' && <CheckCircle2 className="h-3 w-3" />}
                                                {log.status === 'RATE_LIMITED' && <ShieldAlert className="h-3 w-3" />}
                                                {log.status === 'CRITICAL' && <AlertCircle className="h-3 w-3" />}
                                                {log.status.replace('_', ' ')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right font-mono text-sm font-bold text-slate-400">
                                            {log.code}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <Search className="h-8 w-8 opacity-20" />
                                            <p>No matching logs found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/10 flex items-center justify-between">
                    <p className="text-xs text-slate-500">Showing <span className="text-slate-300 font-bold">{filteredLogs.length}</span> entries</p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-500 hover:text-white disabled:opacity-30" disabled><ChevronLeft className="h-5 w-5" /></button>
                        <div className="flex gap-1 text-xs">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-primary text-white font-bold">1</button>
                        </div>
                        <button className="p-2 text-slate-500 hover:text-white disabled:opacity-30" disabled><ChevronRight className="h-5 w-5" /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}
