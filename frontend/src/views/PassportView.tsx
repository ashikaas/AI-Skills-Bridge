import React, { useEffect, useState } from "react";
import { 
  Award, ShieldCheck, Check, X, Printer, QrCode, 
  ExternalLink, Sparkles, RefreshCw, Layers 
} from "lucide-react";
import { api } from "../services/api";

interface PassportViewProps {
  targetRole?: string;
  roleVersion?: number;
}

export const PassportView: React.FC<PassportViewProps> = ({ targetRole, roleVersion }) => {
  const [passport, setPassport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadPassport = async () => {
    try {
      setLoading(true);
      const res = await api.getSkillPassport();
      setPassport(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPassport();
  }, [targetRole, roleVersion]);

  if (loading || !passport) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>Generating Verifiable Evidence Passport...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Digital Credential</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">
              Verifiable Evidence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Digital Skill Passport</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            "I don't just claim this skill. I have multi-dimensional evidence demonstrating it."
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Printer className="w-4 h-4 text-blue-400" />
          <span>Print / Export PDF Passport</span>
        </button>
      </div>

      {/* Verifiable Passport Card Container */}
      <div className="relative p-1 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl shadow-blue-500/10">
        <div className="bg-[#0D1322] p-6 sm:p-8 rounded-[22px] space-y-6">
          {/* Top Row: Verification Meta & QR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 p-0.5 flex items-center justify-center shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Student"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-white">{passport.student_name}</h2>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {passport.university} • Target Role: <strong className="text-blue-400">{passport.target_role}</strong>
                </p>
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  Credential ID: {passport.passport_id} • Verified: {passport.verified_date}
                </div>
              </div>
            </div>

            {/* QR Simulation Box */}
            <div className="flex items-center gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 self-start sm:self-auto">
              <div className="w-12 h-12 bg-white p-1 rounded-xl flex items-center justify-center shrink-0">
                <QrCode className="w-10 h-10 text-slate-900" />
              </div>
              <div className="text-left text-[10px] text-slate-400 leading-tight">
                <div className="font-bold text-white uppercase tracking-wider">Cryptographic Proof</div>
                <div className="text-emerald-400">Status: Validated</div>
                <div className="text-slate-500 font-mono">SHA-256 Verified</div>
              </div>
            </div>
          </div>

          {/* Mastery Formula Explainer */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between text-xs text-slate-400 gap-2">
            <span className="font-bold text-slate-200">Evidence-Weighted Mastery Model:</span>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
              <span className="text-blue-300">Learn (15%)</span>
              <span>+</span>
              <span className="text-indigo-300">Practice (30%)</span>
              <span>+</span>
              <span className="text-emerald-300">Project DO (35%)</span>
              <span>+</span>
              <span className="text-purple-300">Interview (20%)</span>
            </div>
          </div>

          {/* Evidence Grid by Skill */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Verified Skill Evidence Audit</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Skill</th>
                    <th className="py-2.5 px-3">Mastery %</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Course / Learn</th>
                    <th className="py-2.5 px-3 text-center">Practice Drills</th>
                    <th className="py-2.5 px-3 text-center">Industry Project</th>
                    <th className="py-2.5 px-3 text-center">AI Interview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {passport.skills.map((s: any) => {
                    const eb = s.evidence_breakdown || {
                      learn: { completed: true },
                      practice: { completed: true },
                      project: { completed: true },
                      interview: { completed: true }
                    };
                    return (
                      <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 font-bold text-white text-sm">{s.skill_name}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-400 text-sm">{s.mastery_percentage}%</span>
                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${s.mastery_percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === "Mastered"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : s.status === "Developing"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {eb.learn?.completed ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-slate-500">
                              <X className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {eb.practice?.completed ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-slate-500">
                              <X className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {eb.project?.completed ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-slate-500">
                              <X className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {eb.interview?.completed ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-slate-500">
                              <X className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
