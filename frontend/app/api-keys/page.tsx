"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Plus, Key, Eye, EyeOff, LayoutPanelLeft, MoreVertical, RefreshCw, Trash2, ArrowRight, Shield, Copy, Check, ShieldAlert } from "lucide-react";
import { getApiKey, regenerateApiKey } from "@/lib/api";

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<any[]>([]);
    const [showKey, setShowKey] = useState<number | null>(null);
    const [copied, setCopied] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            fetchKey(user.id);
        }
    }, []);

    const fetchKey = async (userId: number) => {
        try {
            const data = await getApiKey(userId);
            setKeys([{
                id: 1,
                name: "Default API Key",
                key: data.apiKey,
                status: "Active",
                created: "N/A",
                lastUsed: "Just now"
            }]);
        } catch (err: any) {
            console.error("Failed to fetch API key", err);
        }
    };

    const handleRegenerateKey = async () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        setLoading(true);
        setIsConfirmOpen(false);
        try {
            const data = await regenerateApiKey(user.id);
            setKeys(prev => [{ ...prev[0], key: data.apiKey }]);
            setStatusMessage({ type: 'success', text: "New API key generated successfully!" });
            setTimeout(() => setStatusMessage(null), 3000);
        } catch (err) {
            setStatusMessage({ type: 'error', text: "Failed to regenerate key" });
            setTimeout(() => setStatusMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (id: number, text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 relative">
            {/* Status Message Toast */}
            <AnimatePresence>
                {statusMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 20, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className={`fixed top-0 left-1/2 z-[100] px-6 py-3 rounded-2xl font-bold shadow-2xl border ${statusMessage.type === 'success'
                            ? 'bg-brand-secondary text-white border-white/20'
                            : 'bg-brand-error text-white border-white/20'
                            }`}
                    >
                        {statusMessage.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {isConfirmOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsConfirmOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-brand-card border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl text-center"
                        >
                            <div className="p-4 bg-brand-error/10 w-fit mx-auto rounded-2xl mb-6">
                                <ShieldAlert className="h-8 w-8 text-brand-error" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Revoke Key?</h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8">
                                This will immediately invalidate your current API key. All applications using it will lose access until updated.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleRegenerateKey}
                                    className="w-full bg-brand-error hover:bg-brand-error/90 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-brand-error/20"
                                >
                                    Yes, Regenerate
                                </button>
                                <button
                                    onClick={() => setIsConfirmOpen(false)}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">API Keys</h1>
                    <p className="text-slate-400">Manage access keys for your applications and services.</p>
                </div>
                <button
                    onClick={() => setIsConfirmOpen(true)}
                    disabled={loading}
                    className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                >
                    <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
                    {loading ? "Generating..." : "Generate New Key"}
                </button>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {keys.map((key, idx) => (
                    <motion.div
                        key={key.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-brand-card border border-slate-800 rounded-3xl overflow-hidden group"
                    >
                        <div className="p-8 border-b border-slate-800">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-brand-primary/10 transition-colors">
                                        <Key className="h-6 w-6 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{key.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="h-2 w-2 rounded-full bg-brand-secondary ring-4 ring-brand-secondary/10" />
                                            <span className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">{key.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                                <div className="flex-1 min-w-0 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-1.5 flex items-center">
                                    <div className="flex-1 px-4 py-2 font-mono text-lg text-slate-300 truncate">
                                        {showKey === key.id ? key.key : "••••••••••••••••••••••••••••••••"}
                                    </div>
                                    <div className="flex items-center gap-1 pr-1">
                                        <button
                                            onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                                            className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                                        >
                                            {showKey === key.id ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                        <button
                                            onClick={() => copyToClipboard(key.id, key.key)}
                                            className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${copied === key.id ? "bg-brand-secondary/10 text-brand-secondary" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                                        >
                                            {copied === key.id ? (
                                                <>
                                                    <Check className="h-5 w-5" />
                                                    <span className="text-xs font-bold md:hidden lg:inline">Copied!</span>
                                                </>
                                            ) : (
                                                <Copy className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 bg-slate-900/20">
                            {[
                                { label: "Created", value: key.created, icon: Plus },
                                { label: "Last Used", value: key.lastUsed, icon: RefreshCw },
                                { label: "Usage Permission", value: "Full Access", icon: Shield }
                            ].map((item, i) => (
                                <div key={i} className="p-6 flex items-center gap-4">
                                    <item.icon className="h-5 w-5 text-slate-600" />
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{item.label}</p>
                                        <p className="text-sm font-semibold text-slate-300">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
