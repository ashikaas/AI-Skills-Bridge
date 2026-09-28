import React, { useState } from "react";
import { 
  Upload, ShieldCheck, Check, Clock, RefreshCw, Sparkles, ChevronDown, ArrowRight, GraduationCap
} from "lucide-react";
import { api } from "../services/api";

const PIPELINE_STAGES = [
  "Reading Resume Document",
  "Extracting Technical & Soft Skills",
  "Analyzing Project & Work Experience",
  "Comparing with 112 Market Job Descriptions",
  "Generating Verified Evidence Profile"
];

const TARGET_ROLES = [
  "Data Analyst",
  "Software Engineer",
  "Machine Learning Engineer",
  "Product Manager",
  "Business Analyst",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Engineer",
  "Cybersecurity Analyst",
  "UI/UX Designer",
];

interface ResumeViewProps {
  onResumeAnalyzed?: (gapSkills: string[]) => void;
  onNavigate?: (view: string) => void;
}

export const ResumeView: React.FC<ResumeViewProps> = ({ onResumeAnalyzed, onNavigate }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Data Analyst");
  const [lastAnalyzed, setLastAnalyzed] = useState<{ useDemo: boolean; role: string } | null>(null);
  const [gapSkillNames, setGapSkillNames] = useState<string[]>([]);

  const targetRoleRef = React.useRef(targetRole);
  targetRoleRef.current = targetRole;

  const handleAnalyze = async (useDemo = true, fileToUpload?: File | null, forceRole?: string) => {
    const roleSnapshot = forceRole ?? targetRoleRef.current;
    setAnalyzing(true);
    setResult(null);

    const file = fileToUpload !== undefined ? fileToUpload : selectedFile;

    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      setCurrentStage(i);
      await new Promise((r) => setTimeout(r, 450));
    }

    try {
      const res = await api.analyzeResume(file, useDemo, roleSnapshot);
      setResult(res);
      setLastAnalyzed({ useDemo, role: roleSnapshot });

      // Extract gap skills: Missing or Developing (score < 60)
      const gaps: string[] = (res.extracted_skills || [])
        .filter((s: any) => s.status === "Missing" || s.status === "Developing" || s.score < 60)
        .map((s: any) => s.name as string);

      setGapSkillNames(gaps);
      if (onResumeAnalyzed) onResumeAnalyzed(gaps);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  // Auto re-analyze when role changes
  const handleRoleChange = (newRole: string) => {
    setTargetRole(newRole);
    if (lastAnalyzed && !analyzing) {
      const useDemo = lastAnalyzed.useDemo;
      setTimeout(() => handleAnalyze(useDemo, useDemo ? null : selectedFile, newRole), 0);
    }
  };

  const getAtsGrade = (score: number) => {
    if (score >= 85) return { grade: "A+", color: "text-emerald-400" };
    if (score >= 75) return { grade: "A",  color: "text-emerald-400" };
    if (score >= 65) return { grade: "B+", color: "text-blue-400" };
    if (score >= 55) return { grade: "B",  color: "text-blue-400" };
    if (score >= 45) return { grade: "C+", color: "text-amber-400" };
    if (score >= 35) return { grade: "C",  color: "text-amber-400" };
    return { grade: "D", color: "text-rose-400" };
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 45) return "bg-blue-500";
    if (score >= 25) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">ATS &amp; Evidence Scanner</span>
          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-medium border border-blue-500/30">
            AI Semantic Parser
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Resume Evidence Analyzer</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Extracts verifiable skill evidence and maps claims directly to real-world job market requirements.
        </p>
      </div>

      {/* Target Role Selector */}
      <div className="glass-card p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white mb-0.5">Target Job Role</h3>
            <p className="text-xs text-slate-400">Switch roles to instantly re-analyze — ATS scores, skills &amp; recommendations all update automatically.</p>
          </div>
          <div className="relative min-w-[220px]">
            <select
              value={targetRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={analyzing}
              className="w-full appearance-none bg-slate-800 border border-slate-600 text-white text-sm font-semibold rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-blue-500 cursor-pointer disabled:opacity-50"
            >
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

      </div>

      {/* Upload / Demo Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 glass-card p-6 rounded-2xl border-dashed border-2 border-slate-700 hover:border-blue-500/50 transition-all flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Upload Resume (PDF, DOCX, or TXT)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Drag and drop your resume file or test with pre-seeded demo profile</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all">
              <span>Browse File</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    const f = e.target.files[0];
                    setSelectedFile(f);
                    handleAnalyze(false, f);
                  }
                }}
              />
            </label>
            <button
              onClick={() => handleAnalyze(true)}
              disabled={analyzing}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Demo Resume (Ashwin Kumar)</span>
            </button>
          </div>
          {selectedFile && (
            <div className="text-xs text-blue-300 font-medium">Selected: {selectedFile.name}</div>
          )}
        </div>

        {/* Info Card */}
        <div className="md:col-span-4 glass-card p-6 rounded-2xl space-y-3">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Why Evidence Matters
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standard ATS scanners only look for buzzwords. Skills-Bridge extracts <strong className="text-slate-200">contextual proof</strong>—actions, code libraries, and business results that prove genuine competence to hiring managers.
          </p>
          <div className="pt-2 text-[11px] text-slate-400 space-y-1.5 border-t border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>Cites project code and architectures</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>Identifies missing market requirements</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>Personalizes Learn, Practice &amp; Do for your gaps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Scanning Pipeline */}
      {analyzing && (
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
            <h3 className="text-sm font-bold text-white">AI Evidence Pipeline Running...</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
            {PIPELINE_STAGES.map((stage, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs transition-all ${
                  idx === currentStage
                    ? "bg-blue-600/20 border-blue-500 text-white font-semibold"
                    : idx < currentStage
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase font-bold">
                  {idx < currentStage ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : idx === currentStage ? (
                    <Clock className="w-3 h-3 text-blue-400 animate-spin" />
                  ) : (
                    <span>Stage {idx + 1}</span>
                  )}
                  <span>Stage {idx + 1}</span>
                </div>
                <div>{stage}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      {result && (
        <div className="space-y-6">
          {/* Role badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">Analyzing for:</span>
            <span className="text-xs font-bold text-blue-300 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full">
              {result.target_role || targetRole}
            </span>
            <span className="text-[10px] text-slate-500 italic">
              ATS score, skill set &amp; recommendations are specific to this role
            </span>
          </div>

          {/* Gap Skills Action Banner */}
          {gapSkillNames.length > 0 && onNavigate && (
            <div className="p-4 bg-gradient-to-r from-amber-950/50 via-slate-900 to-rose-950/40 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">⚠ Skill Gaps Detected</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-500/30">
                    {gapSkillNames.length} skills need attention
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your <strong className="text-white">Learn lessons</strong>, <strong className="text-white">Practice challenges</strong>, and <strong className="text-white">Industry project</strong> have been personalized for:{" "}
                  <span className="text-amber-300 font-semibold">{gapSkillNames.slice(0, 4).join(", ")}{gapSkillNames.length > 4 ? ` +${gapSkillNames.length - 4} more` : ""}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  onClick={() => onNavigate("courses")}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Suggested Courses</span>
                </button>
                <button
                  onClick={() => onNavigate("learn")}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>Start Learning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate("practice")}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>Practice Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Top Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">ATS Compatibility</span>
                <div className={`text-3xl font-black mt-1 ${getAtsGrade(result.ats_compatibility_score).color}`}>
                  {result.ats_compatibility_score}%
                </div>
                <span className="text-[10px] text-slate-400">vs {result.target_role} job descriptions</span>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-sm ${getAtsGrade(result.ats_compatibility_score).color}`}>
                {getAtsGrade(result.ats_compatibility_score).grade}
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">Resume Quality Score</span>
                <div className="text-3xl font-black text-blue-400 mt-1">{result.resume_quality_score}%</div>
                <span className="text-[10px] text-slate-400">Readability, action verbs &amp; structure</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-lg">
                {result.resume_quality_score >= 75 ? "✓" : result.resume_quality_score >= 50 ? "~" : "!"}
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">Skill Evidence Score</span>
                <div className="text-3xl font-black text-purple-400 mt-1">{result.skill_evidence_score}%</div>
                <span className="text-[10px] text-slate-400">Substantiated by projects &amp; repos</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-extrabold text-sm">
                ✦
              </div>
            </div>
          </div>

          {/* Extracted Skills with Proof */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-white">Extracted Skills &amp; Quoted Evidence</h3>
                <p className="text-xs text-slate-400">
                  Skills shown are specific to <span className="text-blue-300 font-semibold">{result.target_role}</span> — each backed by lines extracted from the resume
                </p>
              </div>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                {result.extracted_skills.length} Skills Analyzed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Skill</th>
                    <th className="py-2.5 px-3">Proficiency</th>
                    <th className="py-2.5 px-3 min-w-[130px]">Score</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Extracted Resume Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.extracted_skills.map((s: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                        {s.name}
                        {(s.status === "Missing" || s.status === "Developing" || s.score < 60) && (
                          <span className="ml-1.5 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">GAP</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap ${
                          s.level === "Advanced"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : s.level === "Intermediate"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : s.level === "Beginner"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}>
                          {s.level}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${getScoreBarColor(s.score)}`}
                              style={{ width: `${s.score}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-300 w-8">{s.score}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[11px] font-bold whitespace-nowrap ${
                          s.status === "Mastered" ? "text-emerald-400"
                          : s.status === "Developing" ? "text-amber-400"
                          : "text-rose-400"
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 italic text-xs max-w-sm">
                        {s.evidence}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
              <Sparkles className="w-4 h-4 text-blue-400" />
              AI Improvement Recommendations
              <span className="text-xs font-normal text-slate-400">for {result.target_role}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {result.recommendations?.map((rec: string, i: number) => (
                <div key={i} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
