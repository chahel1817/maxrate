"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, ShieldCheck, Clock, Users, ArrowRight, X, ShieldAlert } from "lucide-react";
import { createRateLimit, getAllRateLimits, updateRateLimit, deleteRateLimit } from "@/lib/api";

export default function RateLimitsPage() {
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [ruleToDelete, setRuleToDelete] = useState<number | null>(null);
    const [editingRule, setEditingRule] = useState<any>(null);
    const [newLimit, setNewLimit] = useState("100");
    const [newWindow, setNewWindow] = useState("60");
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const data = await getAllRateLimits();
            setRules(data.map((r: any) => ({
                id: r.id,
                name: "API Rule " + r.id,
                limit: r.limitCount,
                window: r.timeWindow,
                target: r.user?.name || "USER_" + (r.user?.id || "N/A"),
                userId: r.user?.id,
                active: true
            })));
        } catch (err: any) {
            console.error("Failed to fetch rules", err);
        }
    };

    const handleOpenModal = (rule: any = null) => {
        if (rule) {
            setEditingRule(rule);
            setNewLimit(rule.limit.toString());
            setNewWindow(rule.window.toString());
        } else {
            setEditingRule(null);
            setNewLimit("100");
            setNewWindow("60");
        }
        setIsModalOpen(true);
    };

    const handleUpdateLimit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        setLoading(true);
        try {
            if (editingRule) {
                await updateRateLimit(editingRule.id, {
                    limitCount: parseInt(newLimit),
                    timeWindow: parseInt(newWindow)
                });
                setStatusMessage({ type: 'success', text: "Rule updated successfully!" });
            } else {
                await createRateLimit(user.id, {
                    limitCount: parseInt(newLimit),
                    timeWindow: parseInt(newWindow)
                });
                setStatusMessage({ type: 'success', text: "Rule created successfully!" });
            }
            fetchRules();
            setIsModalOpen(false);
            setTimeout(() => setStatusMessage(null), 3000);
        } catch (err) {
            setStatusMessage({ type: 'error', text: "Failed to save rate limit" });
            setTimeout(() => setStatusMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id: number) => {
        setRuleToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteRule = async () => {
        if (!ruleToDelete) return;
        setLoading(true);
        try {
            await deleteRateLimit(ruleToDelete);
            setStatusMessage({ type: 'success', text: "Rule deleted successfully!" });
            fetchRules();
            setIsDeleteModalOpen(false);
            setTimeout(() => setStatusMessage(null), 3000);
        } catch (err) {
            setStatusMessage({ type: 'error', text: "Failed to delete rule" });
            setTimeout(() => setStatusMessage(null), 3000);
        } finally {
            setLoading(false);
            setRuleToDelete(null);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12 relative">
            {/* Status Message */}
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

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm bg-brand-card border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl text-center"
                        >
                            <div className="p-4 bg-brand-error/10 w-fit mx-auto rounded-2xl mb-6">
                                <Trash2 className="h-8 w-8 text-brand-error" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Delete Rule?</h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8">
                                This action cannot be undone. Default global limits will apply to the affected user.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDeleteRule}
                                    disabled={loading}
                                    className="w-full bg-brand-error hover:bg-brand-error/90 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-brand-error/20"
                                >
                                    {loading ? "Deleting..." : "Yes, Delete Rule"}
                                </button>
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
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
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Rate Limit Rules</h1>
                    <p className="text-slate-400">Configure request thresholds for different user groups.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                >
                    <Plus className="h-5 w-5" />
                    Create New Rule
                </button>
            </header>

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-brand-card border border-slate-800 rounded-3xl p-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-white">
                                    {editingRule ? "Edit Rule" : "Create Rule"}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateLimit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Request Limit</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-all"
                                        value={newLimit}
                                        onChange={(e) => setNewLimit(e.target.value)}
                                        placeholder="e.g. 100"
                                    />
                                    <p className="text-[10px] text-slate-500 ml-1 italic">Total requests allowed before blocking.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Time Window (Seconds)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 outline-none focus:border-brand-primary transition-all"
                                        value={newWindow}
                                        onChange={(e) => setNewWindow(e.target.value)}
                                        placeholder="e.g. 60"
                                    />
                                    <p className="text-[10px] text-slate-500 ml-1 italic">The period (in seconds) the limit resets over.</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                                >
                                    {loading ? "Saving..." : (editingRule ? "Update Rule" : "Save Rule Configuration")}
                                    {!loading && <ShieldCheck className="h-5 w-5" />}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {rules.length === 0 ? (
                <div className="bg-brand-card/30 border-2 border-dashed border-slate-800 rounded-3xl p-20 flex flex-col items-center text-center">
                    <div className="p-4 bg-slate-800/50 rounded-full mb-6">
                        <ShieldCheck className="h-10 w-10 text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No active rules found</h3>
                    <p className="text-slate-500 max-w-sm mb-8">Start by creating your first rate limiting rule to protect your API endpoints.</p>
                    <button className="flex items-center gap-2 text-brand-primary font-bold hover:gap-3 transition-all">
                        Create your first rule <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {rules.map((rule: any, idx: number) => (
                        <motion.div
                            key={rule.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`bg-brand-card border rounded-2xl p-6 group relative overflow-hidden ${rule.active ? "border-slate-800" : "border-slate-800/50 opacity-60"
                                }`}
                        >
                            {rule.active && (
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="h-2 w-2 rounded-full bg-brand-secondary ring-4 ring-brand-secondary/20 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-white mb-6 pr-6">{rule.name}</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <ShieldCheck className="h-5 w-5 text-brand-primary" />
                                    <span className="font-mono text-white text-lg">{rule.limit} reqs</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Clock className="h-5 w-5 text-brand-primary" />
                                    <span>Window: <span className="text-slate-200 font-medium">{rule.window} seconds</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Users className="h-5 w-5 text-brand-primary" />
                                    <span className="bg-slate-800/50 px-2 py-0.5 rounded text-xs border border-slate-700">{rule.target}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-6 border-t border-slate-800/50">
                                <button
                                    onClick={() => handleOpenModal(rule)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => confirmDelete(rule.id)}
                                    className="flex items-center justify-center py-2.5 px-3 rounded-lg bg-slate-800 text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
