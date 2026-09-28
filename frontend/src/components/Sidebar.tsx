import React from "react";
import { 
  LayoutDashboard, User, FileText, TrendingUp, 
  BookOpen, Code2, Briefcase, Mic, Building2, Sparkles, 
  Grid, ShieldAlert, Users, Layers, HelpCircle, GraduationCap
} from "lucide-react";
import { UserRole } from "../types";

interface SidebarProps {
  currentRole: UserRole;
  currentView: string;
  onNavigate: (view: string) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  currentView,
  onNavigate
}) => {
  const studentItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "My Profile", icon: User },
    { id: "resume", label: "Resume Analyzer", icon: FileText, badge: "ATS 84" },
    { id: "market", label: "Market-Sync", icon: TrendingUp, badge: "112 JDs" },
    { id: "courses", label: "Recommended Courses", icon: GraduationCap, badge: "NPTEL/Coursera" },
    { id: "learn", label: "Learn Module", icon: BookOpen },
    { id: "practice", label: "Practice Challenges", icon: Code2 },
    { id: "do", label: "Do / Industry Project", icon: Briefcase, badge: "Live" },
    { id: "interview", label: "AI Mock Interview", icon: Mic, badge: "Adaptive" },
    { id: "jobs", label: "Job Matching", icon: Building2 },
    { id: "simulator", label: "Impact Simulator", icon: Sparkles, highlight: true }
  ];

  const tpoItems = [
    { id: "tpo-dashboard", label: "Cohort Overview", icon: LayoutDashboard },
    { id: "tpo-heatmap", label: "Skill Heatmap", icon: Grid, badge: "4 Depts" },
    { id: "tpo-interventions", label: "Intervention Engine", icon: ShieldAlert, badge: "Active" },
    { id: "tpo-students", label: "Cohort Directory", icon: Users, badge: "55" },
    { id: "market", label: "Market Intelligence", icon: TrendingUp },
    { id: "simulator", label: "Readiness Simulator", icon: Sparkles, highlight: true }
  ];

  const items = currentRole === "student" ? studentItems : tpoItems;

  return (
    <aside className="w-64 bg-[#0D1322] border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] p-3">
      <div className="space-y-6">
        <div className="px-3 pt-2">
          <div className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
            {currentRole === "student" ? "Career Mastery Engine" : "TPO Placement Administration"}
          </div>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? item.highlight
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                      : "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? (item.highlight ? "text-amber-400" : "text-blue-400") : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isActive ? "bg-blue-500/20 text-blue-300" : "bg-slate-800 text-slate-400"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between text-slate-300 font-semibold">
          <span>SIH Demo Mode</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <p className="text-[10px] text-slate-400 leading-snug">
          Deterministic AI Fallback + Live Database active. Ready for judge demonstration.
        </p>
      </div>
    </aside>
  );
};
