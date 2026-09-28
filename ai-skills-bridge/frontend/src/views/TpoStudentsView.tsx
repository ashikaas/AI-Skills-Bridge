import React, { useEffect, useState } from "react";
import { Users, Search, AlertTriangle, CheckCircle2, Filter, RefreshCw } from "lucide-react";
import { api } from "../services/api";

export const TpoStudentsView: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [department, setDepartment] = useState("All");
  const [atRiskOnly, setAtRiskOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getCohortStudents(department, atRiskOnly);
      setStudents(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [department, atRiskOnly]);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.target_role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Candidate Directory</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium border border-purple-500/30">
              55 Cohort Records
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Student Cohort Directory</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track individual candidate readiness, identify students needing academic support, and review skills.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or role..."
              className="pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 text-white text-xs rounded-xl focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500"
          >
            <option value="All">All Departments</option>
            <option value="AIML">AIML</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
          </select>

          <button
            onClick={() => setAtRiskOnly(!atRiskOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              atRiskOnly
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-slate-900 text-slate-300 border border-slate-700 hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>At Risk Only</span>
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filtered.length} Candidate Profiles</span>
          <span>Class of 2026</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400 gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
            <span>Filtering candidate records...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Candidate Name</th>
                  <th className="py-2.5 px-3">Branch</th>
                  <th className="py-2.5 px-3">Target Role</th>
                  <th className="py-2.5 px-3">Readiness</th>
                  <th className="py-2.5 px-3">Market Alignment</th>
                  <th className="py-2.5 px-3">Interview Score</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filtered.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-white text-xs">{st.name}</td>
                    <td className="py-3 px-3 text-slate-300 font-semibold">{st.department}</td>
                    <td className="py-3 px-3 text-blue-400">{st.target_role}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-white text-sm">{st.readiness_score}%</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{st.market_alignment}%</td>
                    <td className="py-3 px-3 text-purple-300">{st.interview_score}%</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        st.placement_ready
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : st.is_at_risk
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}>
                        {st.placement_ready ? "Placement Ready" : st.is_at_risk ? "At Risk" : "In Progress"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
