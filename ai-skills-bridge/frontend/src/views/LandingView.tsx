import React from "react";
import { 
  Sparkles, ArrowRight, TrendingUp, GitFork, Compass, 
  Briefcase, Mic, ShieldCheck, CheckCircle2, Award, Zap, Layers
} from "lucide-react";

interface LandingViewProps {
  onStartStudentDemo: () => void;
  onStartTpoDemo: () => void;
  onNavigate: (view: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartStudentDemo,
  onStartTpoDemo,
  onNavigate
}) => {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 text-center">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[250px] bg-purple-600/15 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Smart India Hackathon Prototype • Problem Statement ED083
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Bridge the gap between what students know and what{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              industry needs.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            AI Skills-Bridge continuously maps real-time industry demand to individual student skills and transforms critical skill gaps into personalized <strong className="text-white font-semibold">Learn → Practice → Do</strong> pathways.
          </p>

          {/* Transformation Visual: 20% -> 90% */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Placement Readiness Transformation</span>
                <span className="text-[10px] text-amber-400/90 lowercase italic">*Prototype Simulation</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm font-extrabold">
                <div className="flex flex-col items-start">
                  <span className="text-rose-400 text-2xl font-black">20%</span>
                  <span className="text-[10px] text-slate-400 font-normal">Standard Curriculum</span>
                </div>
                <div className="flex-1 flex items-center gap-1.5">
                  <div className="h-2 flex-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-emerald-400 text-2xl font-black">90%</span>
                  <span className="text-[10px] text-slate-400 font-normal">Skills-Bridge Track</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onStartStudentDemo}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 border border-blue-400/40 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Explore Candidate Workspace (Student Demo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onStartTpoDemo}
              className="px-6 py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold text-sm border border-purple-500/40 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Explore TPO Intelligence</span>
            </button>
            <button
              onClick={() => onNavigate("market")}
              className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-sm border border-slate-700 transition-all"
            >
              Explore 112 JDs
            </button>
          </div>
        </div>
      </section>

      {/* The Core Closed-Loop Pipeline */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How Skills-Bridge Works</h2>
          <p className="text-xs sm:text-sm text-slate-400">A continuous, closed-feedback loop connecting university talent directly to hiring demand.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl space-y-3 relative">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">1</div>
            <h3 className="font-bold text-white text-sm">Market-Sync Scanner</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scans job listings to calculate exact frequency percentages for tech stacks (e.g. SQL 98%, Power BI 76%, GenAI +43%).
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-3 relative">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">2</div>
            <h3 className="font-bold text-white text-sm">Resume & Market Diagnostics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compares candidate background against live market demand to pinpoint key target skills for career growth.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-3 relative">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">3</div>
            <h3 className="font-bold text-white text-sm">Learn → Practice → Do</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive lessons, SQL coding drills, and real-world industry projects to build domain expertise.
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-3 relative">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">4</div>
            <h3 className="font-bold text-white text-sm">AI Interview & Defense</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Adaptive multi-turn interviews and resume project defense questions to verify true mastery before job matching.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-900 via-[#111827] to-[#0D1322] border border-slate-800 p-8 rounded-3xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Enterprise Architecture</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">Core System Capabilities</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
            <div className="space-y-2">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                Adaptive Mock Interview
              </div>
              <p className="text-slate-400 leading-relaxed">
                Asks technical and project defense questions based on candidate's actual projects. Adjusts difficulty dynamically.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                Evidence-Based Skill Audit
              </div>
              <p className="text-slate-400 leading-relaxed">
                Calculates weighted mastery formula: Learn (15%) + Practice (30%) + Do (35%) + Interview (20%) with verifiable audit trail.
              </p>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                TPO Intervention Engine
              </div>
              <p className="text-slate-400 leading-relaxed">
                Detects cohort bottlenecks (e.g. 42% Cloud gap in AIML) and deploys batch training tracks with 1-click execution.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
