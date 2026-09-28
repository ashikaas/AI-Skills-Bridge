import React, { useEffect, useState } from "react";
import { Grid, Filter, RefreshCw, Sparkles, ShieldAlert, ArrowRight } from "lucide-react";
import { api } from "../services/api";

export const TpoHeatmapView: React.FC = () => {
  const [heatmap, setHeatmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadHeatmap = async () => {
    try {
      setLoading(true);
      const res = await api.getTpoHeatmap();
      setHeatmap(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeatmap();
  }, []);

  if (loading || !heatmap) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-purple-500" />
        <span>Loading Department Skill Matrix Heatmap...</span>
      </div>
    );
  }

  const getCellColor = (score: number) => {
    if (score >= 75) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    if (score >= 50) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    return "bg-rose-500/20 text-rose-300 border-rose-500/30";
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Cohort Matrix</span>
          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium border border-purple-500/30">
            55 Candidates Evaluated
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Department × Skill Competency Heatmap</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Pinpoint academic curriculum blind spots across departments to deploy focused batch training interventions.
        </p>
      </div>

      {/* Heatmap Matrix Table */}
      <div className="glass-card p-6 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Average Skill Competence by Branch</h3>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Strong (≥75)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Moderate (50-74)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Critical Gap (&lt;50)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 text-left">Department</th>
                {heatmap.skills.map((skill: string) => (
                  <th key={skill} className="py-3 px-4 uppercase tracking-wider text-[11px] font-bold">
                    {skill}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-semibold">
              {heatmap.matrix.map((row: any) => (
                <tr key={row.department} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-4 text-left font-extrabold text-white text-sm">
                    {row.department}
                  </td>
                  {heatmap.skills.map((skill: string) => {
                    const val = row[skill] || 0;
                    return (
                      <td key={skill} className="py-3 px-3">
                        <div className={`p-2.5 rounded-xl border font-bold text-sm ${getCellColor(val)}`}>
                          {val}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Heatmap Takeaways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Bottleneck #1: Cloud</span>
          <h4 className="font-bold text-white">Universal Cloud Literacy Deficit</h4>
          <p className="text-slate-400 leading-relaxed">
            All 4 departments average under 42% on Cloud deployments (AWS/GCP), while 44% of market postings require cloud staging.
          </p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Strength #1: Python</span>
          <h4 className="font-bold text-white">Strong Algorithmic Foundation</h4>
          <p className="text-slate-400 leading-relaxed">
            AIML (88%) and CSE (82%) demonstrate healthy code fluency in Python, meeting baseline screening cutoffs.
          </p>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Opportunity: GenAI</span>
          <h4 className="font-bold text-white">Emerging GenAI Gap</h4>
          <p className="text-slate-400 leading-relaxed">
            Market demand for prompt engineering and LLM tools surged +43%, but average student exposure remains under 30%.
          </p>
        </div>
      </div>
    </div>
  );
};
