import React, { useEffect, useState } from "react";
import { 
  Sparkles, ArrowRight, TrendingUp, Flame, Zap, Award, 
  CheckCircle2, AlertTriangle, Play, FileText, Mic, 
  Code2, Briefcase, RefreshCw
} from "lucide-react";
import { api } from "../services/api";

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  targetRole?: string;
  roleVersion?: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, targetRole, roleVersion }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [targetRole, roleVersion]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>Loading Placement Intelligence Dashboard...</span>
      </div>
    );
  }

  // Circular gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.placement_readiness / 100) * circumference;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#131B2E] to-blue-950/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Candidate Workspace</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">
              Placement Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, <span className="text-blue-400">Ashwin</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Target Role: <strong className="text-slate-200 uppercase tracking-wide">{data.target_role}</strong> • Indian Institute of Technology & Management
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate("practice")}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Practice Challenges</span>
          </button>
          <button
            onClick={() => onNavigate("interview")}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Mic className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Mock Interview</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid: Circular Readiness + 4 Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Placement Readiness Circular Gauge */}
        <div className="lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Placement Readiness Index
          </div>

          <div className="relative flex items-center justify-center">
            <svg className="w-44 h-44 transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r={radius}
                stroke="#1E293B"
                strokeWidth="14"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r={radius}
                stroke="url(#gradient-blue-purple)"
                strokeWidth="14"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient-blue-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {Math.round(data.placement_readiness)}%
              </span>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mt-0.5">
                Top 15% Cohort
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Composite score derived from market demand alignment, project execution evidence, and adaptive interview scores.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Market Alignment */}
          <div className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Market Alignment</span>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                112 JDs
              </span>
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-white">{data.market_alignment}%</div>
              <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.market_alignment}%` }}></div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">8 of 10 required market core skills verified</p>
          </div>

          {/* Skill Mastery */}
          <div className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Skill Mastery</span>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Weighted
              </span>
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-white">{data.skill_mastery}%</div>
              <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${data.skill_mastery}%` }}></div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Learn (15%) + Practice (30%) + Do (35%) + Interview (20%)</p>
          </div>

          {/* Project Readiness */}
          <div className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Project Readiness</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                2 Flagship
              </span>
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-white">{data.project_readiness}%</div>
              <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.project_readiness}%` }}></div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">E-commerce Analytics & AI Analyst Assistant verified</p>
          </div>

          {/* Interview Readiness */}
          <div className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Interview Readiness</span>
              <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Current Bottleneck
              </span>
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-white">{data.interview_readiness}%</div>
              <div className="h-2 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${data.interview_readiness}%` }}></div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Practice project defense to unlock 85%+ readiness</p>
          </div>
        </div>
      </div>

      {/* Live Market Alert Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Market-Sync Intelligence Alert</span>
              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded font-mono">+17% Shift</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{data.market_update}</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate("market")}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 transition-all hover:bg-blue-600/20"
        >
          <span>View Market Scan</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Bottom 2 Columns: AI Recommendations & Gamification Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Recommendations */}
        <div className="lg:col-span-8 glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Your AI Recommendations</h3>
              <p className="text-xs text-slate-400">Prioritized by industry hiring demand and your verified evidence</p>
            </div>
            <button
              onClick={() => onNavigate("practice")}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>Explore Practice Challenges</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {data.ai_recommendations?.map((rec: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 p-4 rounded-xl space-y-2 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    rec.priority === "High Priority"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : rec.priority === "Medium Priority"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  }`}>
                    {rec.priority}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{rec.tag}</span>
                </div>
                <h4 className="font-bold text-white text-sm">{rec.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{rec.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Gamification & Badges */}
        <div className="lg:col-span-4 glass-card p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Career Gamification</h3>
            <span className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Level {data.level}
            </span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Level 7 — Career Builder</span>
              <span className="text-purple-300 font-bold">{data.xp_points} / 4,000 XP</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                style={{ width: `${(data.xp_points / 4000) * 100}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1 text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                {data.streak_days} Day Streak
              </span>
              <span>Next: Interview Master (Level 8)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-400">Earned Badges</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">SQL Warrior</div>
                  <div className="text-[10px] text-slate-400">25+ Queries</div>
                </div>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">Dashboard Pro</div>
                  <div className="text-[10px] text-slate-400">RFM Cohort</div>
                </div>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">Data Storyteller</div>
                  <div className="text-[10px] text-slate-400">Executive Report</div>
                </div>
              </div>
              <div className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">Interview Ready</div>
                  <div className="text-[10px] text-slate-400">70%+ Adaptive</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
