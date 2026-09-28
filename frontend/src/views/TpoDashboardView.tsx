import React, { useEffect, useState } from "react";
import { 
  Users, TrendingUp, ShieldAlert, Award, AlertTriangle, 
  ArrowRight, Sparkles, RefreshCw, BarChart2, CheckCircle2 
} from "lucide-react";
import { api } from "../services/api";

interface TpoDashboardViewProps {
  onNavigate: (view: string) => void;
}

export const TpoDashboardView: React.FC<TpoDashboardViewProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getTpoDashboard();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-purple-500" />
        <span>Loading TPO Placement Intelligence...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 p-6 rounded-2xl border border-purple-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Placement Directorate</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium border border-purple-500/30">
              Cohort Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">University Placement Intelligence</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time cohort oversight across CSE, AIML, IT, and ECE engineering departments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate("tpo-heatmap")}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            Inspect Skill Heatmap
          </button>
          <button
            onClick={() => onNavigate("tpo-interventions")}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Launch Batch Intervention</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400">Total Cohort</span>
          <div className="text-3xl font-extrabold text-white mt-1">{data.total_students}</div>
          <span className="text-[10px] text-slate-400">Enrolled Students</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400">Placement Ready</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">{data.placement_ready_pct}%</div>
          <span className="text-[10px] text-slate-400">Readiness Score ≥ 75%</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400">Market Aligned</span>
          <div className="text-3xl font-extrabold text-blue-400 mt-1">{data.market_aligned_pct}%</div>
          <span className="text-[10px] text-slate-400">Core Stack Fit</span>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400">Avg. Skill Score</span>
          <div className="text-3xl font-extrabold text-indigo-400 mt-1">{data.average_skill_score}</div>
          <span className="text-[10px] text-slate-400">Across All Disciplines</span>
        </div>

        <div className="glass-card p-5 rounded-2xl col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-slate-400">Students At Risk</span>
          <div className="text-3xl font-extrabold text-rose-400 mt-1">{data.students_at_risk}</div>
          <span className="text-[10px] text-rose-300">Readiness &lt; 50%</span>
        </div>
      </div>

      {/* Middle Grid: Department Breakdown & Readiness Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Readiness Table */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Department Readiness Comparison</h3>
            <span className="text-xs text-slate-400">Class of 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Candidates</th>
                  <th className="py-2.5 px-3">Ready %</th>
                  <th className="py-2.5 px-3">Avg Readiness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {data.department_breakdown?.map((dept: any) => (
                  <tr key={dept.department} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-white text-sm">{dept.department}</td>
                    <td className="py-3 px-3 text-slate-300">{dept.total_students} students</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {dept.ready_percentage}% Ready
                      </span>
                    </td>
                    <td className="py-3 px-3 text-blue-400 font-bold text-sm">
                      {dept.average_readiness}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Readiness Distribution Bars */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white">Placement Readiness Distribution</h3>

          <div className="space-y-3 pt-1">
            {data.readiness_distribution?.map((item: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.range}</span>
                  <span className="font-bold text-white">{item.count} Candidates</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0
                        ? "bg-rose-500"
                        : idx === 1
                        ? "bg-amber-500"
                        : idx === 2
                        ? "bg-blue-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${(item.count / data.total_students) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Interventions Summary */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Active University Interventions</h3>
            <p className="text-xs text-slate-400">Curriculum tracks deployed to address widespread cohort gaps</p>
          </div>
          <button
            onClick={() => onNavigate("tpo-interventions")}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
          >
            <span>Manage All Interventions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.active_interventions?.map((intv: any) => (
            <div key={intv.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {intv.target_department} • {intv.target_skill}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">+{intv.expected_readiness_boost}% Impact</span>
              </div>
              <h4 className="font-bold text-white text-xs leading-snug">{intv.title}</h4>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>{intv.affected_students_count} Students Enrolled</span>
                <span>{intv.curriculum_weeks} Weeks</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
