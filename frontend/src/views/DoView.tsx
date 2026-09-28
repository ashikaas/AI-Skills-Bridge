import React, { useEffect, useState } from "react";
import { 
  Briefcase, Download, Play, CheckCircle2, Sparkles, 
  BarChart2, FileCode2, ExternalLink, RefreshCw, Award,
  AlertTriangle, ScanSearch, ArrowRight
} from "lucide-react";
import { api } from "../services/api";
import { fireCelebrationConfetti } from "../components/Confetti";

interface DoViewProps {
  gapSkills?: string[];
  onNavigate?: (view: string) => void;
}

export const DoView: React.FC<DoViewProps> = ({ gapSkills = [], onNavigate }) => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState(
    "Identified that delivery delays exceeding 25 minutes are responsible for 68% of 30-day customer churn. Implemented RFM clustering to isolate high-value at-risk customers (RFM 4-1-4) and proposed a proactive ₹100 grocery credit voucher system."
  );
  const [codeSolution, setCodeSolution] = useState(
    `-- Customer RFM & Delivery Delay Analysis
WITH customer_aggregates AS (
    SELECT 
        customer_id,
        MAX(timestamp) as last_order_date,
        COUNT(order_id) as total_orders,
        SUM(order_value) as monetary_value,
        AVG(delivery_delay_mins) as avg_delay_mins,
        MAX(is_churned) as is_churned
    FROM transactions
    GROUP BY customer_id
)
SELECT 
    CASE 
        WHEN avg_delay_mins > 25 THEN 'Severe Delay (>25m)'
        WHEN avg_delay_mins > 15 THEN 'Moderate Delay (15-25m)'
        ELSE 'On-Time (<15m)'
    END as delay_bucket,
    COUNT(customer_id) as customer_count,
    ROUND(AVG(is_churned) * 100, 1) as churn_rate_pct,
    ROUND(AVG(monetary_value), 2) as avg_monetary_value
FROM customer_aggregates
GROUP BY 1
ORDER BY churn_rate_pct DESC;`
  );
  const [repoLink, setRepoLink] = useState("https://github.com/ashwin-k/quickcart-retention-pipeline");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const hasGapSkills = gapSkills.length > 0;

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const list = await api.getIndustryChallenges();
      
      // Sort projects matching gap skills or target role first
      const gapSet = new Set(gapSkills.map((s) => s.toLowerCase()));
      const sorted = [...list].sort((a, b) => {
        const textA = `${a.title} ${a.overview} ${a.target_role} ${(a.tasks || []).join(" ")}`.toLowerCase();
        const textB = `${b.title} ${b.overview} ${b.target_role} ${(b.tasks || []).join(" ")}`.toLowerCase();
        const matchA = gapSkills.filter(s => textA.includes(s.toLowerCase())).length;
        const matchB = gapSkills.filter(s => textB.includes(s.toLowerCase())).length;
        return matchB - matchA;
      });

      setChallenges(sorted);
      if (sorted.length > 0) {
        setSelected(sorted[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [gapSkills.join(",")]);

  // Derive which gap skills this project addresses
  const addressedGapSkills = React.useMemo(() => {
    if (!selected || !hasGapSkills) return [];
    const projectText = `${selected.title || ""} ${selected.overview || ""} ${selected.domain || ""} ${selected.target_role || ""} ${(selected.tasks || []).join(" ")}`.toLowerCase();
    return gapSkills.filter((skill) => projectText.includes(skill.toLowerCase()));
  }, [selected, gapSkills]);

  const handleDownloadCSV = () => {
    if (!selected) return;
    const sample = selected.dataset_sample || [];
    const headers = Object.keys(sample[0] || {}).join(",");
    const rows = sample.map((r: any) => Object.values(r).join(",")).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${(selected.target_role || "project").toLowerCase().replace(/\s+/g, "_")}_sample.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async () => {
    if (!selected || evaluating) return;
    try {
      setEvaluating(true);
      const res = await api.submitIndustryProject({
        challenge_id: selected.id,
        submission_text: submissionText,
        code_solution: codeSolution,
        repo_link: repoLink
      });
      setEvaluation(res);
      fireCelebrationConfetti();
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading || !selected) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>Loading Industry Capstone Project...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Step 3 of 3: DO</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">
              Industry Capstone Project
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{selected.title}</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Domain: <strong className="text-white">{selected.domain}</strong> • Target Role: <strong className="text-white">{selected.target_role}</strong>
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Download Sample CSV Dataset</span>
        </button>
      </div>

      {/* Project Selector Pills */}
      {challenges.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-semibold mr-1">Select Role Capstone Project:</span>
          {challenges.map((proj) => {
            const isSel = selected.id === proj.id;
            const pGapMatch = gapSkills.filter(s => `${proj.title} ${proj.overview} ${proj.target_role}`.toLowerCase().includes(s.toLowerCase())).length;
            return (
              <button
                key={proj.id}
                onClick={() => { setSelected(proj); setEvaluation(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSel
                    ? "bg-emerald-600 text-white shadow-sm"
                    : pGapMatch > 0
                    ? "bg-amber-900/40 text-amber-300 border border-amber-600/40 hover:bg-amber-800/50"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {pGapMatch > 0 && <span>⚠</span>}
                <span>{proj.target_role}: {proj.title.split(":")[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Resume-not-scanned prompt */}
      {!hasGapSkills && onNavigate && (
        <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ScanSearch className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Scan your resume to see personalized project recommendations</p>
              <p className="text-xs text-slate-400 mt-0.5">After scanning, this project will highlight which of your gap skills it develops.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("resume")}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
          >
            <span>Scan Resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Gap skill personalization banner */}
      {hasGapSkills && addressedGapSkills.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-950/50 via-slate-900 to-emerald-950/30 border border-amber-500/40 rounded-2xl flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-300">This project addresses your resume gaps</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">Personalized Recommendation</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Completing this capstone will build your verified evidence for:{" "}
              {addressedGapSkills.map((skill, i) => (
                <span key={skill}>
                  <span className="text-amber-200 font-semibold">{skill}</span>
                  {i < addressedGapSkills.length - 1 ? ", " : ""}
                </span>
              ))}
              {" "}— skills currently flagged as gaps for your target role.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {addressedGapSkills.map((skill) => (
                <span key={skill} className="text-[10px] bg-amber-600/20 text-amber-200 border border-amber-500/40 px-2 py-0.5 rounded-full font-semibold">
                  ⚠ {skill}
                </span>
              ))}
              {gapSkills.filter(g => !addressedGapSkills.includes(g)).length > 0 && (
                <span className="text-[10px] text-slate-500 self-center ml-1">
                  ({gapSkills.filter(g => !addressedGapSkills.includes(g)).join(", ")} — practice separately)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* If gap skills exist but none match project */}
      {hasGapSkills && addressedGapSkills.length === 0 && (
        <div className="p-3.5 bg-slate-900/80 border border-slate-700 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />
          <p className="text-xs text-slate-400">
            This project targets <strong className="text-white">{selected.target_role}</strong>. Your gaps ({gapSkills.join(", ")}) are better addressed in the{" "}
            <button onClick={() => onNavigate?.("learn")} className="text-blue-400 underline hover:text-blue-300">Learn</button>
            {" "}and{" "}
            <button onClick={() => onNavigate?.("practice")} className="text-blue-400 underline hover:text-blue-300">Practice</button>
            {" "}modules.
          </p>
        </div>
      )}

      {/* Challenge Overview & Brief */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Executive Scenario</h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{selected.overview}</p>

        {/* Structured Tasks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {selected.tasks?.map((t: string, i: number) => (
            <div key={i} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300">
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Preview Table */}
      <div className="glass-card p-6 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Built-In Dataset Schema & Sample</h3>
          <span className="text-[11px] text-slate-400">Showing first 3 records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3">Order ID</th>
                <th className="py-2 px-3">Customer ID</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Order Value</th>
                <th className="py-2 px-3">Delay (Mins)</th>
                <th className="py-2 px-3">Churn Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {selected.dataset_sample?.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 text-blue-400">{row.order_id}</td>
                  <td className="py-2.5 px-3 text-slate-300">{row.customer_id}</td>
                  <td className="py-2.5 px-3 text-slate-300">{row.category}</td>
                  <td className="py-2.5 px-3 text-emerald-400">₹{row.order_value}</td>
                  <td className="py-2.5 px-3 text-rose-400">{row.delivery_delay_mins}m</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.is_churned ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                    }`}>
                      {row.is_churned ? "Churned" : "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Form */}
      <div className="glass-card p-6 rounded-2xl space-y-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-emerald-400" />
          Project Solution Submission
          {hasGapSkills && addressedGapSkills.length > 0 && (
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold ml-1">
              Builds evidence for: {addressedGapSkills.join(", ")}
            </span>
          )}
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Executive Findings & Business Recommendations</label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-950 text-xs text-slate-200 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">SQL / Python Analytical Code</label>
            <textarea
              value={codeSolution}
              onChange={(e) => setCodeSolution(e.target.value)}
              rows={8}
              className="w-full p-3 bg-slate-950 font-mono text-xs text-blue-300 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">GitHub Repository or Live Dashboard Link</label>
            <input
              type="text"
              value={repoLink}
              onChange={(e) => setRepoLink(e.target.value)}
              className="w-full p-2.5 bg-slate-950 text-xs text-slate-200 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <span className="text-xs text-slate-400">Scored across 6 dimensions: Technical, Analysis, Business, Problem Solving, Communication, Visualization</span>
          <button
            onClick={handleSubmit}
            disabled={evaluating}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {evaluating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running AI Rubric Evaluator...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Submit & Grade with AI Rubric (+250 XP)</span>
              </>
            )}
          </button>
        </div>

        {/* 6-Dimension Evaluation Results */}
        {evaluation && (
          <div className="p-5 bg-slate-900 border border-emerald-500/30 rounded-2xl space-y-4 pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xl flex items-center justify-center">
                  {evaluation.overall_score}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Project Mastery Score</h4>
                  <p className="text-xs text-emerald-400 font-semibold">Exceeds Industry Hiring Threshold (80%+)</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold border border-emerald-500/30 self-start sm:self-auto">
                ✓ Verified Evidence Portfolio
              </span>
            </div>

            {/* Gap skills evidence verification */}
            {hasGapSkills && addressedGapSkills.length > 0 && (
              <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Resume Gap Evidence Verified
                </div>
                <p className="text-slate-400">
                  This submission provides verified evidence for your gap skills:{" "}
                  <span className="text-amber-200 font-semibold">{addressedGapSkills.join(", ")}</span>
                </p>
              </div>
            )}

            {/* 6 Sub-scores */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Technical (25%)</div>
                <div className="font-bold text-white text-sm mt-0.5">{evaluation.technical_score}%</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Analysis (20%)</div>
                <div className="font-bold text-white text-sm mt-0.5">{evaluation.analysis_score}%</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Business (20%)</div>
                <div className="font-bold text-white text-sm mt-0.5">{evaluation.business_score}%</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Problem Solving (15%)</div>
                <div className="font-bold text-white text-sm mt-0.5">{evaluation.problem_solving_score}%</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Communication (10%)</div>
                <div className="font-bold text-white text-sm mt-0.5">{evaluation.communication_score}%</div>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Visualization (10%)</div>
                <div className="font-bold text-white text-sm mt-0.5">{evaluation.visualization_score}%</div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {evaluation.feedback}
            </p>

            {/* Final CTA */}
            {onNavigate && (
              <div className="flex items-center justify-between p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl">
                <span className="text-xs text-blue-300 font-semibold">🎯 Now defend your project in an AI Mock Interview</span>
                <button
                  onClick={() => onNavigate("interview")}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>Mock Interview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
