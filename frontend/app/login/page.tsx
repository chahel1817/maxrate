"use client";

import { useState, useEffect } from "react";
import { loginUser, registerUser, checkEmail } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, User, ArrowRight, Zap, X, AlertTriangle, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

// ─── Validation Modal ─────────────────────────────────────────────
function ValidationModal({ messages, onClose }: { messages: string[]; onClose: () => void }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 350 }}
                    className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-red-500/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-500/15 rounded-xl">
                                <AlertTriangle className="h-6 w-6 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Hold On!</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <X className="h-5 w-5 text-slate-400" />
                        </button>
                    </div>

                    <p className="text-slate-400 text-sm mb-5">Please fix the following before proceeding:</p>

                    <div className="space-y-3">
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className="flex items-start gap-3 bg-red-500/5 border border-red-500/15 p-3.5 rounded-xl"
                            >
                                <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-red-200 font-medium">{msg}</span>
                            </motion.div>
                        ))}
                    </div>

                    <button
                        onClick={onClose}
                        className="mt-7 w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3.5 rounded-xl transition-all"
                    >
                        Got it, let me fix it
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Inline validation helpers ────────────────────────────────────
function validateEmail(email: string): string | null {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email";
    return null;
}

function validatePassword(password: string): string | null {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
}

function validateName(name: string): string | null {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return null;
}

// ─── Input Field Component ────────────────────────────────────────
function InputField({
    label, type, placeholder, icon: Icon, value, onChange, error, onBlur, suffix
}: {
    label: string;
    type: string;
    placeholder: string;
    icon: any;
    value: string;
    onChange: (v: string) => void;
    error?: string | null;
    onBlur?: () => void;
    suffix?: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300 ml-1">{label}</label>
            <div className="relative group">
                <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${error ? "text-red-400" : "text-slate-500 group-focus-within:text-brand-primary"}`} />
                <input
                    type={type}
                    required
                    placeholder={placeholder}
                    className={`w-full bg-slate-900 border text-white rounded-xl py-3.5 pl-11 pr-${suffix ? "12" : "4"} outline-none transition-all ${error ? "border-red-500/60 focus:border-red-400" : "border-slate-700 focus:border-brand-primary"}`}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                />
                {suffix && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {suffix}
                    </div>
                )}
            </div>
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-400 ml-1 font-medium"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Password Strength Indicator ──────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
    const checks = [
        { label: "6+ characters", met: password.length >= 6 },
        { label: "Uppercase letter", met: /[A-Z]/.test(password) },
        { label: "Number", met: /[0-9]/.test(password) },
    ];

    if (!password) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex gap-3 mt-1 ml-1"
        >
            {checks.map((check, i) => (
                <div key={i} className="flex items-center gap-1">
                    {check.met ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                        <XCircle className="h-3.5 w-3.5 text-slate-600" />
                    )}
                    <span className={`text-[11px] font-medium ${check.met ? "text-green-400" : "text-slate-600"}`}>{check.label}</span>
                </div>
            ))}
        </motion.div>
    );
}

// ─── Main Login Page ──────────────────────────────────────────────
export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalMessages, setModalMessages] = useState<string[] | null>(null);

    // Inline field errors (shown below each input)
    const [fieldErrors, setFieldErrors] = useState<{ name?: string | null; email?: string | null; password?: string | null }>({});

    // Reset errors when switching modes
    useEffect(() => {
        setFieldErrors({});
        setModalMessages(null);
    }, [isLogin]);

    const handleFieldBlur = (field: "name" | "email" | "password") => {
        let err: string | null = null;
        if (field === "name" && !isLogin) err = validateName(formData.name);
        if (field === "email") err = validateEmail(formData.email);
        if (field === "password") err = validatePassword(formData.password);
        setFieldErrors((prev) => ({ ...prev, [field]: err }));
    };

    const runClientValidation = (): string[] => {
        const errors: string[] = [];
        if (!isLogin) {
            const nameErr = validateName(formData.name);
            if (nameErr) errors.push(nameErr);
        }
        const emailErr = validateEmail(formData.email);
        if (emailErr) errors.push(emailErr);
        const passErr = validatePassword(formData.password);
        if (passErr) errors.push(passErr);
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation first
        const clientErrors = runClientValidation();
        if (clientErrors.length > 0) {
            setModalMessages(clientErrors);
            return;
        }

        setLoading(true);
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
            // Structured error from backend
            if (err?.messages && Array.isArray(err.messages)) {
                setModalMessages(err.messages);
            } else if (err?.error) {
                setModalMessages([err.error]);
            } else if (err?.message) {
                setModalMessages([err.message]);
            } else {
                setModalMessages(["An unexpected error occurred. Please try again."]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggleMode = async () => {
        // Smart toggle: if user types email in login but account doesn't exist, suggest register
        setIsLogin(!isLogin);
        setFormData((prev) => ({ ...prev, name: "", password: "" }));
    };

    return (
        <div className="flex h-full flex-col items-center justify-center p-4">
            {/* ── Validation Modal ── */}
            {modalMessages && (
                <ValidationModal messages={modalMessages} onClose={() => setModalMessages(null)} />
            )}

            {/* ── Brand Header ── */}
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

            {/* ── Auth Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-brand-card p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl shadow-brand-primary/5"
            >
                <div className="mb-10 text-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? "login" : "register"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h1 className="text-3xl font-black text-white mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h1>
                            <p className="text-slate-500 font-medium text-sm italic">
                                {isLogin ? "Sign in to access your dashboard." : "Register to start rate-limiting your APIs."}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    {/* ── Name Field (Register only) ── */}
                    <AnimatePresence>
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                            >
                                <InputField
                                    label="Full Name"
                                    type="text"
                                    placeholder="John Doe"
                                    icon={User}
                                    value={formData.name}
                                    onChange={(v) => {
                                        setFormData({ ...formData, name: v });
                                        if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: null }));
                                    }}
                                    error={fieldErrors.name}
                                    onBlur={() => handleFieldBlur("name")}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Email Field ── */}
                    <InputField
                        label="Email Address"
                        type="email"
                        placeholder="name@company.com"
                        icon={Mail}
                        value={formData.email}
                        onChange={(v) => {
                            setFormData({ ...formData, email: v });
                            if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: null }));
                        }}
                        error={fieldErrors.email}
                        onBlur={() => handleFieldBlur("email")}
                    />

                    {/* ── Password Field ── */}
                    <div>
                        <InputField
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            icon={Lock}
                            value={formData.password}
                            onChange={(v) => {
                                setFormData({ ...formData, password: v });
                                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: null }));
                            }}
                            error={fieldErrors.password}
                            onBlur={() => handleFieldBlur("password")}
                            suffix={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-slate-500 hover:text-slate-300 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            }
                        />
                        {!isLogin && <PasswordStrength password={formData.password} />}
                    </div>

                    {/* ── Submit Button ── */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.015 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            <>
                                {isLogin ? "Sign In" : "Create Account"}
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </motion.button>
                </form>

                {/* ── Toggle Mode ── */}
                <div className="mt-8 text-center">
                    <button
                        onClick={handleToggleMode}
                        className="text-slate-400 hover:text-white transition-colors text-sm"
                        type="button"
                    >
                        {isLogin ? (
                            <>Don&apos;t have an account? <span className="text-brand-primary font-semibold">Sign Up</span></>
                        ) : (
                            <>Already have an account? <span className="text-brand-primary font-semibold">Sign In</span></>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
