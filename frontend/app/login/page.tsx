"use client";

import { useState } from "react";
import { loginUser, registerUser } from "@/lib/api";
import { motion } from "framer-motion";
import { Lock, Mail, User, ArrowRight, Zap } from "lucide-react";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (isLogin) {
                const user = await loginUser({ email: formData.email, password: formData.password });
                localStorage.setItem("user", JSON.stringify(user));
                window.location.reload();
            } else {
                const user = await registerUser(formData);
                localStorage.setItem("user", JSON.stringify(user));
                window.location.reload();
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-full flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-10 flex flex-col items-center gap-4"
            >
                <div className="p-4 bg-brand-primary rounded-[2rem] shadow-[0_0_40px_rgba(99,102,241,0.3)]">
                    <Zap className="text-white h-12 w-12 fill-white" />
                </div>
                <div className="text-center">
                    <h2 className="text-4xl font-black italic tracking-tighter text-white">MAX <span className="text-brand-primary">RATE</span></h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">Next-Gen Traffic Control</p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-brand-card p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl shadow-brand-primary/5"
            >
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-black text-white mb-2">{isLogin ? "Authentication" : "Registration"}</h1>
                    <p className="text-slate-500 font-medium text-sm italic">Secure access to your deployment cluster.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand-primary" />
                                <input
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-brand-primary transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand-primary" />
                            <input
                                type="email"
                                required
                                placeholder="name@company.com"
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-brand-primary transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand-primary" />
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-brand-primary transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && <div className="text-brand-error text-sm text-center bg-brand-error/10 py-2 rounded-lg border border-brand-error/20">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2"
                    >
                        {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
                        {!loading && <ArrowRight className="h-5 w-5" />}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-slate-400 hover:text-white transition-colors"
                        type="button"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
