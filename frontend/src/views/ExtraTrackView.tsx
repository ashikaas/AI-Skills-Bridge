import React, { useEffect, useState } from "react";
import { 
  Compass, CheckCircle2, Circle, ArrowRight, BookOpen, 
  Code2, Briefcase, Sparkles, RefreshCw, Zap, Clock 
} from "lucide-react";
import { api } from "../services/api";
import { fireCelebrationConfetti } from "../components/Confetti";

interface ExtraTrackViewProps {
  onNavigate: (view: string) => void;
  targetRole?: string;
  roleVersion?: number;
}

export const ExtraTrackView: React.FC<ExtraTrackViewProps> = ({ onNavigate, targetRole, roleVersion }) => {
  const [trackData, setTrackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadTrack = async () => {
    try {
      setLoading(true);
      const res = await api.getCurrentTrack();
      setTrackData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrack();
  }, [targetRole, roleVersion]);

  const handleToggleModule = async (moduleId: string) => {
    try {
      setUpdatingId(moduleId);
      const res = await api.completeModule(moduleId);
      if (res.is_completed) {
        fireCelebrationConfetti();
      }
      await loadTrack();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading || !trackData) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>Loading Dynamic Extra Track...</span>
      </div>
    );
  }

  const { track, weeks } = trackData;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/50 p-6 rounded-2xl border border-blue-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Dynamic Extra Track</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">
              Personalized for Ashwin
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{track.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Target Role: <strong className="text-white">{track.target_role}</strong> • 4 Weeks • 12 Agile Micro-Modules
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Progress:</span>
            <strong className="text-lg font-bold text-blue-400">{track.overall_progress}%</strong>
            <span className="text-slate-500">({track.completed_modules}/{track.total_modules} Completed)</span>
          </div>
          <div className="w-48 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${track.overall_progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Jump Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800 text-xs">
        <span className="text-slate-400 font-semibold px-2">Jump to Phase:</span>
        <button
          onClick={() => onNavigate("learn")}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-all"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span>Interactive Lessons (LEARN)</span>
        </button>
        <button
          onClick={() => onNavigate("practice")}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-all"
        >
          <Code2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Practice Challenges (PRACTICE)</span>
        </button>
        <button
          onClick={() => onNavigate("do")}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-all"
        >
          <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
          <span>Industry Project (DO)</span>
        </button>
      </div>

      {/* 4-Week Accordion / Timeline */}
      <div className="space-y-6">
        {weeks.map((w: any) => (
          <div key={w.week} className="glass-card rounded-2xl overflow-hidden border border-slate-800">
            {/* Week Header */}
            <div className="bg-slate-900/80 p-4 px-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-extrabold text-sm flex items-center justify-center">
                  W{w.week}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">{w.theme}</h3>
                  <div className="text-[11px] text-slate-400">
                    Week {w.week} of 4 • 3 Mastery Modules (Learn, Practice, Do)
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                {w.modules.filter((m: any) => m.is_completed).length} of {w.modules.length} Done
              </div>
            </div>

            {/* Modules Grid */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {w.modules.map((mod: any) => {
                const isCompleted = mod.is_completed;
                return (
                  <div
                    key={mod.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                      isCompleted
                        ? "bg-emerald-950/15 border-emerald-500/30 text-slate-200"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wider ${
                          mod.type === "LEARN"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : mod.type === "PRACTICE"
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}>
                          {mod.type}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {mod.estimated_minutes}m
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-xs leading-snug">{mod.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          if (mod.type === "LEARN") onNavigate("learn");
                          else if (mod.type === "PRACTICE") onNavigate("practice");
                          else onNavigate("do");
                        }}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                      >
                        <span>Open {mod.type}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleToggleModule(mod.id)}
                        disabled={updatingId === mod.id}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isCompleted
                            ? "bg-emerald-500/20 hover:bg-rose-500/20 text-emerald-400 hover:text-rose-300 border border-emerald-500/30"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Done (+100 XP)</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5" />
                            <span>Mark Complete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
