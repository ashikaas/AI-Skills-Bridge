import React, { useState } from "react";
import { 
  Sparkles, ArrowRight, CheckCircle2, TrendingUp, Award, 
  Layers, Gauge, ShieldCheck, RefreshCw 
} from "lucide-react";
import { fireCelebrationConfetti } from "../components/Confetti";

export const SimulatorView: React.FC = () => {
  const [mode, setMode] = useState<"before" | "after">("after");

  const beforeMetrics = {
    marketAlignment: 46,
    skillCoverage: 51,
    projectReadiness: 38,
    interviewReadiness: 42,
    overallReadiness: 44,
    placementRate: 20
  };

  const afterMetrics = {
    marketAlignment: 82,
    skillCoverage: 86,
    projectReadiness: 89,
    interviewReadiness: 81,
    overallReadiness: 85,
    placementRate: 90
  };

  const current = mode === "before" ? beforeMetrics : afterMetrics;

  const handleToggle = (newMode: "before" | "after") => {
    setMode(newMode);
    if (newMode === "after") {
      fireCelebrationConfetti();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">SIH ED083 Impact Engine</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium border border-amber-500/30">
              Interactive Simulation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Placement Readiness Simulator</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Toggle between the standard academic baseline and post-Skills-Bridge 4-week Dynamic Extra Track outcomes.
          </p>
        </div>

        {/* Big Switcher */}
        <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto shadow-xl">
          <button
            onClick={() => handleToggle("before")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === "before"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            BEFORE Skills-Bridge (20%)
          </button>
          <button
            onClick={() => handleToggle("after")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === "after"
                ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-lg shadow-emerald-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            AFTER Extra Track (90%)
          </button>
        </div>
      </div>

      {/* Hero Impact Card */}
      <div className={`p-8 rounded-3xl border transition-all duration-700 ${
        mode === "before"
          ? "bg-gradient-to-br from-slate-900 via-[#191118] to-slate-950 border-rose-500/30 shadow-2xl shadow-rose-500/10"
          : "bg-gradient-to-br from-slate-900 via-[#0E1E2E] to-blue-950 border-emerald-500/40 shadow-2xl shadow-emerald-500/15"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
              mode === "before" ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
            }`}>
              {mode === "before" ? "Academic Baseline Status" : "Skills-Bridge Extra Track Status"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              {mode === "before" ? "44% Overall Placement Readiness" : "85% Overall Placement Readiness"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {mode === "before"
                ? "Candidate relies purely on general university syllabus. Lacks production Cloud deployments, modern DAX modeling, and project defense communication."
                : "Candidate completed 4 weeks of targeted Learn → Practice → Do modules, resolved top 3 critical gaps, and passed an adaptive AI mock interview."}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-slate-950/70 rounded-2xl border border-slate-800 text-center shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated Placement Rate</span>
            <div className={`text-5xl font-black mt-1 ${mode === "before" ? "text-rose-400" : "text-emerald-400"}`}>
              {current.placementRate}%
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Class of 2026 Simulation</span>
          </div>
        </div>

        {/* 5 Core Dimension Comparison Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-8 border-t border-slate-800/80 mt-8">
          <div className="space-y-1.5 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Market Alignment</div>
            <div className="text-2xl font-black text-white">{current.marketAlignment}%</div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${current.marketAlignment}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-500">{mode === "before" ? "Baseline 46%" : "Uplift +36%"}</div>
          </div>

          <div className="space-y-1.5 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Skill Coverage</div>
            <div className="text-2xl font-black text-white">{current.skillCoverage}%</div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${current.skillCoverage}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-500">{mode === "before" ? "Baseline 51%" : "Uplift +35%"}</div>
          </div>

          <div className="space-y-1.5 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Project Readiness</div>
            <div className="text-2xl font-black text-white">{current.projectReadiness}%</div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${current.projectReadiness}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-500">{mode === "before" ? "Baseline 38%" : "Uplift +51%"}</div>
          </div>

          <div className="space-y-1.5 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Interview Readiness</div>
            <div className="text-2xl font-black text-white">{current.interviewReadiness}%</div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-700"
                style={{ width: `${current.interviewReadiness}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-500">{mode === "before" ? "Baseline 42%" : "Uplift +39%"}</div>
          </div>

          <div className="space-y-1.5 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold">Overall Readiness</div>
            <div className="text-2xl font-black text-white">{current.overallReadiness}%</div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${current.overallReadiness}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-500">{mode === "before" ? "Baseline 44%" : "Uplift +41%"}</div>
          </div>
        </div>
      </div>

      {/* Disclaimers & Methodology */}
      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
        <span className="font-bold text-slate-300">Hackathon Prototype Note:</span>
        <p>
          This simulator illustrates the mathematical potential of closing targeted gaps using the 3-step mastery loop. It models how individual student placement conversion rises from 20% to 90% as skill coverage and verified project evidence align with market benchmarks.
        </p>
      </div>
    </div>
  );
};
