import React, { useState } from "react";
import { Lock, Mail, Sparkles, User, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";
import { api } from "../services/api";
import { UserRole } from "../types";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState("student@skillsbridge.demo");
  const [password, setPassword] = useState("student123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.role as UserRole);
      onClose();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: "student" | "tpo") => {
    const demoEmail = role === "student" ? "student@skillsbridge.demo" : "tpo@skillsbridge.demo";
    const demoPass = role === "student" ? "student123" : "tpo123";
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError("");
    try {
      const res = await api.login(demoEmail, demoPass);
      onLoginSuccess(res.role as UserRole);
      onClose();
    } catch (err: any) {
      setError(err.message || "Quick demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0F172A] border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[60px] rounded-full pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>SIH ED083 Instant Demo Access</span>
          </div>
          <h2 className="text-2xl font-black text-white">Sign In to Skills-Bridge</h2>
          <p className="text-xs text-slate-400">Select a one-click persona or enter credentials below</p>
        </div>

        {/* Quick Demo One-Click Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleQuickDemo("student")}
            disabled={loading}
            className="p-3.5 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/40 hover:border-blue-400 rounded-2xl text-left transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-blue-300">Student Demo</span>
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-[10px] text-slate-400">Ashwin Kumar • Data Analyst</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemo("tpo")}
            disabled={loading}
            className="p-3.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 hover:border-purple-400 rounded-2xl text-left transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-purple-300">TPO Demo</span>
              <ShieldAlert className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-[10px] text-slate-400">Dr. Ramesh • Placement Cell</div>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="h-px flex-1 bg-slate-800"></div>
          <span>OR SIGN IN MANUALLY</span>
          <div className="h-px flex-1 bg-slate-800"></div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 text-white text-xs rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 text-white text-xs rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? "Authenticating..." : "Sign In with Credentials"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-xs text-slate-400 hover:text-white"
        >
          Cancel & Close
        </button>
      </div>
    </div>
  );
};
