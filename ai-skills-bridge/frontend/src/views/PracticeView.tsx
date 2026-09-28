import React, { useEffect, useState } from "react";
import { 
  Code2, Play, CheckCircle2, AlertCircle, Sparkles, 
  HelpCircle, RefreshCw, Award, ArrowRight, ScanSearch, AlertTriangle
} from "lucide-react";
import { api } from "../services/api";
import { fireCelebrationConfetti } from "../components/Confetti";

interface PracticeViewProps {
  gapSkills?: string[];
  onNavigate?: (view: string) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({ gapSkills = [], onNavigate }) => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [userCode, setUserCode] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasGapSkills = gapSkills.length > 0;

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const list = await api.getPracticeChallenges();

      // Sort: gap-skill challenges first, then others
      const gapSet = new Set(gapSkills.map((s) => s.toLowerCase()));
      const sorted = [
        ...list.filter((c: any) => gapSet.has((c.skill || "").toLowerCase())),
        ...list.filter((c: any) => !gapSet.has((c.skill || "").toLowerCase())),
      ];

      setChallenges(sorted);
      if (sorted.length > 0) {
        setSelectedChallenge(sorted[0]);
        setUserCode(sorted[0].starter_code || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [gapSkills.join(",")]); // Re-sort when gap skills change

  const handleSelect = (ch: any) => {
    setSelectedChallenge(ch);
    setUserCode(ch.starter_code || "");
    setEvaluation(null);
    setShowHint(false);
  };

  const handleSubmit = async () => {
    if (!selectedChallenge || !userCode.trim() || evaluating) return;
    try {
      setEvaluating(true);
      const res = await api.submitPracticeAnswer(selectedChallenge.id, userCode);
      setEvaluation(res);
      if (res.score >= 70) {
        fireCelebrationConfetti();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading || !selectedChallenge) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>Loading Interactive Practice Challenges...</span>
      </div>
    );
  }

  const gapSet = new Set(gapSkills.map((s) => s.toLowerCase()));
  const gapChallenges = challenges.filter((c) => gapSet.has((c.skill || "").toLowerCase()));
  const otherChallenges = challenges.filter((c) => !gapSet.has((c.skill || "").toLowerCase()));
  const isCurrentChallengeGap = gapSet.has((selectedChallenge.skill || "").toLowerCase());

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Step 2 of 3: PRACTICE</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-medium border border-indigo-500/30">
              Interactive AI Grader
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Hands-On Code & Query Practice</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Solve LeetCode-style SQL and Python challenges with automatic correctness and efficiency evaluation.
          </p>
        </div>
      </div>

      {/* Resume-not-scanned prompt */}
      {!hasGapSkills && onNavigate && (
        <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ScanSearch className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Scan your resume to get personalized challenges</p>
              <p className="text-xs text-slate-400 mt-0.5">Showing all challenges. Scan your resume to see your gap-skill challenges highlighted first.</p>
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

      {/* Personalization banner */}
      {hasGapSkills && (
        <div className="p-3.5 bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-amber-300">Personalized for your resume gaps</span>
            <span className="text-slate-400"> — challenges for </span>
            <span className="text-amber-200 font-semibold">{gapSkills.join(", ")}</span>
            <span className="text-slate-400"> are shown first.</span>
          </div>
        </div>
      )}

      {/* Challenge list pills — split into gap vs other */}
      <div className="space-y-3">
        {hasGapSkills && gapChallenges.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">⚠ Recommended — Your Gap Skills</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">{gapChallenges.length} challenges</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {gapChallenges.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleSelect(ch)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    selectedChallenge.id === ch.id
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-amber-900/40 text-amber-300 border border-amber-600/40 hover:bg-amber-800/50"
                  }`}
                >
                  <span>⚠</span>
                  {ch.skill} ({ch.difficulty})
                </button>
              ))}
            </div>
          </div>
        )}

        {otherChallenges.length > 0 && (
          <div>
            {hasGapSkills && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Other Challenges</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {otherChallenges.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleSelect(ch)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedChallenge.id === ch.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {ch.skill} ({ch.difficulty})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fallback: no gap skills, show all together */}
        {!hasGapSkills && (
          <div className="flex flex-wrap gap-2">
            {challenges.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleSelect(ch)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedChallenge.id === ch.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {ch.skill} ({ch.difficulty})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Split Layout: Prompt vs Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Challenge Specs */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                selectedChallenge.difficulty === "Easy"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : selectedChallenge.difficulty === "Medium"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}>
                {selectedChallenge.difficulty} • {selectedChallenge.type}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-semibold">{selectedChallenge.skill}</span>
                {isCurrentChallengeGap && (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">GAP SKILL</span>
                )}
              </div>
            </div>

            <h2 className="text-lg font-bold text-white">{selectedChallenge.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{selectedChallenge.prompt}</p>

            {/* Expected Concept */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Core Expectation</div>
              <p className="text-slate-300">{selectedChallenge.expected_concept}</p>
            </div>

            {/* Sample Table / Data Preview */}
            {selectedChallenge.sample_data && Array.isArray(selectedChallenge.sample_data) && selectedChallenge.sample_data.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sample Records</div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-36">
                  <pre>{JSON.stringify(selectedChallenge.sample_data, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Expandable Hints */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? "Hide Hints" : "Show Algorithmic Hints"}</span>
            </button>

            {showHint && (
              <ul className="space-y-1 text-xs text-slate-400 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                {selectedChallenge.hints?.map((h: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-400">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: Code Editor & AI Grader */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-400" />
                Solution Editor ({selectedChallenge.type})
              </span>
              <button
                onClick={() => setUserCode(selectedChallenge.starter_code || "")}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Reset Starter Code
              </button>
            </div>

            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              placeholder="Write your query or code here..."
              rows={12}
              className="w-full flex-1 p-4 bg-slate-950 font-mono text-xs text-blue-300 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none selection:bg-indigo-600"
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400">Submissions scored by deterministic AI evaluator</span>
            <button
              onClick={handleSubmit}
              disabled={evaluating || !userCode.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {evaluating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Code...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run & Submit with AI Grader</span>
                </>
              )}
            </button>
          </div>

          {/* AI Evaluation Result Card */}
          {evaluation && (
            <div className="p-4 bg-slate-900 border border-indigo-500/30 rounded-xl space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-extrabold text-sm flex items-center justify-center">
                    {evaluation.score}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Practice Evaluation Score</h4>
                    <span className="text-[10px] text-emerald-400 font-semibold">+75 XP Earned</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Correctness</div>
                    <div className="font-bold text-white">{evaluation.correctness_score}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Concept</div>
                    <div className="font-bold text-white">{evaluation.concept_score}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Efficiency</div>
                    <div className="font-bold text-white">{evaluation.efficiency_score}%</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-lg text-xs text-slate-300 space-y-1 border border-slate-800">
                <p className="font-medium text-blue-300">{evaluation.feedback}</p>
                <p className="text-slate-400 text-[11px] pt-1">{evaluation.explanation}</p>
              </div>

              {/* Next step CTA after passing */}
              {evaluation.score >= 70 && onNavigate && (
                <div className="flex items-center justify-between p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                  <span className="text-xs text-emerald-300 font-semibold">✓ Challenge passed! Ready for a real project?</span>
                  <button
                    onClick={() => onNavigate("do")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <span>Industry Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
