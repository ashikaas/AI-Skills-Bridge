import React, { useState } from "react";
import { 
  Sparkles, Flame, Zap, Bell, User, ChevronDown, CheckCircle2, 
  ArrowRight, Award, ShieldAlert, BookOpen, Layers
} from "lucide-react";
import { UserRole } from "../types";

interface NavbarProps {
  currentRole: UserRole;
  onRoleSwitch: (role: UserRole) => void;
  onNavigate: (view: string) => void;
  targetRole: string;
  onTargetRoleChange: (role: string) => void;
  unreadCount?: number;
}

const ROLES = [
  "Data Analyst",
  "Software Engineer",
  "Machine Learning Engineer",
  "Product Manager",
  "Business Analyst",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Engineer",
  "Cybersecurity Analyst",
  "UI/UX Designer",
];

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleSwitch,
  onNavigate,
  targetRole,
  onTargetRoleChange,
  unreadCount = 3
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* SIH Demo Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border-b border-blue-500/20 px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded border border-blue-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            AI SKILLS-BRIDGE PLATFORM
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate("simulator")}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 transition-all hover:bg-amber-500/20"
          >
            ⚡ Impact Simulator
          </button>
          <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-md border border-slate-700">
            <button
              onClick={() => onRoleSwitch("student")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                currentRole === "student"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Student Demo
            </button>
            <button
              onClick={() => onRoleSwitch("tpo")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                currentRole === "tpo"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              TPO Demo
            </button>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate(currentRole === "student" ? "dashboard" : "tpo-dashboard")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0D1322] rounded-[10px] flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">AI SKILLS-BRIDGE</span>
              <span className="text-[10px] uppercase font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">AI Live</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">Learn. Practice. Do. Get Hired.</p>
          </div>
        </div>

        {/* Center / Role Picker (for student) */}
        {currentRole === "student" && (
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs px-3 py-1.5 rounded-lg text-slate-200 transition-all"
              >
                <span className="text-slate-400">Target Role:</span>
                <span className="font-semibold text-blue-400">{targetRole}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute left-0 mt-1 w-48 bg-[#131B2E] border border-slate-700 rounded-lg shadow-2xl py-1 z-50">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">Select Role</div>
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        onTargetRoleChange(r);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-blue-600/20 hover:text-blue-300 transition-colors ${
                        targetRole === r ? "bg-blue-500/20 text-blue-400 font-semibold" : "text-slate-300"
                      }`}
                    >
                      {r}
                      {targetRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {currentRole === "student" ? (
            <>
              {/* Gamification streak & XP */}
              <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full text-xs">
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  14d Streak
                </span>
                <span className="text-slate-700">•</span>
                <span className="flex items-center gap-1 text-purple-400 font-semibold">
                  <Zap className="w-3.5 h-3.5 fill-purple-400" />
                  3,450 XP (Lvl 7)
                </span>
              </div>

              {/* Quick Resume CTA */}
              <button
                onClick={() => onNavigate("resume")}
                className="hidden lg:flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg font-medium transition-all"
              >
                Scan Resume
                <ArrowRight className="w-3 h-3" />
              </button>
            </>
          ) : (
            /* TPO view header badge */
            <div className="hidden sm:flex items-center gap-2 bg-purple-950/40 border border-purple-800/40 px-3 py-1 rounded-full text-xs text-purple-300 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              University Placement Cell • 55 Cohort Candidates
            </div>
          )}

          {/* User profile pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <img
              src={
                currentRole === "student"
                  ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
              }
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-slate-700 object-cover"
            />
            <div className="hidden sm:block text-left text-xs leading-tight">
              <div className="font-semibold text-white">
                {currentRole === "student" ? "Ashwin Kumar" : "Dr. Ramesh Sharma"}
              </div>
              <div className="text-[10px] text-slate-400">
                {currentRole === "student" ? "AIML • 3rd Year" : "Placement Director"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
