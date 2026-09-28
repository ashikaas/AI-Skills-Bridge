import React, { useEffect, useState } from "react";
import { 
  ShieldAlert, Sparkles, Plus, CheckCircle2, ArrowRight, 
  Calendar, Users, TrendingUp, RefreshCw 
} from "lucide-react";
import { api } from "../services/api";
import { fireCelebrationConfetti } from "../components/Confetti";

export const TpoInterventionView: React.FC = () => {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getTpoDashboard();
      setInterventions(res.active_interventions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeployRecommendation = async () => {
    try {
      setDeploying(true);
      await api.createIntervention({
        title: "Campus AWS & Cloud Data Warehouse Sprint",
        target_department: "IT & ECE",
        target_skill: "Cloud",
        affected_students_count: 28,
        market_demand_pct: 78,
        curriculum_weeks: 4,
        expected_readiness_boost: 24.5
      });
      fireCelebrationConfetti();
      setSuccessMessage("Curriculum track deployed to 28 candidates across IT & ECE!");
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setDeploying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-purple-500" />
        <span>Loading University Intervention Engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Intervention Engine</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium border border-purple-500/30">
              Batch Curriculum Deployment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">University-Wide Interventions</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Bridge large-scale cohort gaps by deploying standardized 4-week Extra Tracks to targeted branches.
          </p>
        </div>

        <button
          onClick={handleDeployRecommendation}
          disabled={deploying}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy Recommended Track</span>
        </button>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Flagship Recommendation Spotlight */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/40 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            AI Algorithmic Policy Recommendation
          </span>
          <span className="text-xs bg-rose-500/20 text-rose-300 px-2.5 py-0.5 rounded-full font-bold border border-rose-500/30">
            Critical Action Needed
          </span>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white">
            "42% of AIML & IT candidates have a critical Cloud skill gap"
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
            Market scan reveals that 44% of Data Analyst and 78% of Data Engineer positions require AWS S3/GCP BigQuery staging. A centralized 4-week bootcamp will uplift cohort placement readiness by an estimated +22.4%.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400">Affected Candidates</span>
            <div className="font-bold text-white text-base mt-0.5">38 Students</div>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400">Market Demand</span>
            <div className="font-bold text-purple-400 text-base mt-0.5">78% Listings</div>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400">Track Duration</span>
            <div className="font-bold text-white text-base mt-0.5">4 Weeks</div>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400">Expected Uplift</span>
            <div className="font-bold text-emerald-400 text-base mt-0.5">+22.4% Readiness</div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={handleDeployRecommendation}
            disabled={deploying}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all"
          >
            <span>Create & Deploy Training Track</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Interventions Table */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white">Active Curriculum Tracks</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-3">Intervention Track</th>
                <th className="py-3 px-3">Branch</th>
                <th className="py-3 px-3">Target Skill</th>
                <th className="py-3 px-3">Enrolled</th>
                <th className="py-3 px-3">Duration</th>
                <th className="py-3 px-3">Predicted Impact</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {interventions.map((intv) => (
                <tr key={intv.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-bold text-white text-xs">{intv.title}</td>
                  <td className="py-3 px-3 text-slate-300">{intv.target_department}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {intv.target_skill}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{intv.affected_students_count} Candidates</td>
                  <td className="py-3 px-3 text-slate-400">{intv.curriculum_weeks} Weeks</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">+{intv.expected_readiness_boost}%</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      intv.status === "Active"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}>
                      {intv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
