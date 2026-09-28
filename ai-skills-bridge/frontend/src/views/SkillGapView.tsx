import React, { useEffect, useState } from "react";
import { 
  GitFork, Sparkles, ArrowRight, AlertTriangle, CheckCircle2, 
  HelpCircle, RefreshCw, BarChart3, Layers
} from "lucide-react";
import { api } from "../services/api";

interface SkillGapViewProps {
  onNavigate: (view: string) => void;
  targetRole?: string;
  roleVersion?: number;
}

export const SkillGapView: React.FC<SkillGapViewProps> = ({ onNavigate, targetRole, roleVersion }) => {
  const [gapData, setGapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadGaps = async () => {
    try {
      setLoading(true);
      const res = await api.getSkillGaps();
      setGapData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGaps();
  }, [targetRole, roleVersion]);

  if (loading || !gapData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>Computing Skill Gap Priority Model...</span>
      </div>
    );
  }

  // Filter buckets
  const criticalGaps = gapData.gaps?.filter((g: any) => g.category === "Critical Gap" || g.category === "High Gap") || [];
  const developingSkills = gapData.gaps?.filter((g: any) => g.category === "Developing") || [];
  const strongSkills = gapData.gaps?.filter((g: any) => g.category === "Strong") || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">AI Skill-Gap Engine</span>
            <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-medium border border-rose-500/30">
              Gap Priority Model
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Targeted Skill Gap Analysis</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compares your verified competence against real-time market hiring requirements for <strong className="text-white">{gapData.target_role}</strong>.
          </p>
        </div>

        <button
          onClick={() => onNavigate("extra-track")}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate Dynamic Extra Track</span>
        </button>
      </div>

      {/* AI Narrative Diagnosis Card */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-blue-950/40 border border-rose-500/30 p-5 rounded-2xl flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <span>AI Diagnostic Synthesis</span>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">High Priority</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{gapData.summary_narrative}</p>
        </div>
      </div>

      {/* Mathematical Priority Algorithm Explainer Card */}
      <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between text-xs text-slate-400 gap-3 border border-slate-800">
        <div>
          <span className="font-bold text-slate-200">Objective Priority Formula:</span>
          <span className="font-mono text-blue-300 ml-2">Priority = Round(Market Demand × (Skill Gap / 100) × Role Importance × 1.35)</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> 71–100: Critical</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 41–70: High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 21–40: Developing</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 0–20: Strong</span>
        </div>
      </div>

      {/* Side-by-Side Comparison & Prioritized Gaps */}
      <div className="glass-card p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Student Skill Level vs. Market Requirement</h3>
            <p className="text-xs text-slate-400">Visual comparison across evaluated technical dimensions</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-slate-300 font-medium">Ashwin's Verified Level</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-slate-600"></div>
              <span className="text-slate-400">Market Hiring Demand</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {gapData.gaps?.map((g: any, idx: number) => (
            <div key={idx} className="space-y-2 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span className="text-sm">{g.skill}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                    g.category === "Critical Gap"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : g.category === "High Gap"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : g.category === "Developing"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}>
                    {g.category} (Priority {g.priority_score})
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Student: <strong className="text-blue-400">{g.student_score}%</strong> | Market: <strong className="text-slate-200">{g.market_demand}%</strong> | Gap: <span className="text-rose-400 font-bold">-{g.raw_gap} pts</span>
                </div>
              </div>

              {/* Dual bar: Student vs Market */}
              <div className="space-y-1">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${g.student_score}%` }}></div>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: `${g.market_demand}%` }}></div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                💡 {g.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
