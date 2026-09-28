import React, { useState } from "react";
import { 
  Mic, MicOff, Send, Sparkles, RefreshCw, CheckCircle2, 
  HelpCircle, AlertCircle, Award, BarChart2, ShieldCheck, ArrowRight 
} from "lucide-react";
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, ResponsiveContainer 
} from "recharts";
import { api } from "../services/api";
import { fireCelebrationConfetti } from "../components/Confetti";

interface InterviewViewProps {
  onNavigate: (view: string) => void;
  targetRole?: string;
  roleVersion?: number;
}

export const InterviewView: React.FC<InterviewViewProps> = ({ onNavigate, targetRole = "Data Analyst" }) => {
  const [interviewType, setInterviewType] = useState("Project Defense");
  const [difficulty, setDifficulty] = useState("Standard");
  const [session, setSession] = useState<any>(null);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const startSession = async () => {
    try {
      setEvaluating(true);
      const res = await api.startInterview({
        interview_type: interviewType,
        difficulty: difficulty,
        target_role: targetRole
      });
      setSession(res);
      setStudentAnswer("");
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleToggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice input is not supported in this browser. Please type your answer.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setStudentAnswer((prev) => (prev ? prev + " " + transcript : transcript));
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!session || !studentAnswer.trim() || evaluating) return;
    try {
      setEvaluating(true);
      const res = await api.answerInterviewTurn(session.interview_id, studentAnswer);
      setSession((prev: any) => ({
        ...prev,
        ...res
      }));
      setStudentAnswer("");
      setShowHint(false);

      if (res.is_completed) {
        fireCelebrationConfetti();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">AI Mock Interview</span>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-medium border border-purple-500/30">
              Adaptive Dialogue Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Interactive Interview & Resume Defense</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Multi-turn technical evaluation that challenges your knowledge, communication, and real project architectures.
          </p>
        </div>

        {/* Setup Modes (if not started or completed) */}
        {(!session || session.is_completed) && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500"
            >
              <option value="Project Defense">Defend My Resume (Project Defense)</option>
              <option value="Technical">Technical (SQL / Python / Stats)</option>
              <option value="Behavioral">Behavioral (STAR Method)</option>
              <option value="Mixed">Mixed Comprehensive</option>
            </select>

            <button
              onClick={startSession}
              disabled={evaluating}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{session?.is_completed ? "Start New Interview" : "Launch AI Mock Interview"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Interview Session Flow */}
      {session && !session.is_completed && (
        <div className="glass-card p-6 rounded-2xl space-y-6">
          {/* Progress Tracker */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-400 uppercase tracking-wider">{session.interview_type}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-semibold">
                Question {session.current_turn} of {session.total_turns}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">Target Skill: <strong className="text-blue-400">{session.expected_skill}</strong></span>
          </div>

          {/* AI Question Box */}
          <div className="p-5 bg-gradient-to-r from-purple-950/30 via-slate-900 to-slate-900 rounded-2xl border border-purple-500/30 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI Technical Interviewer</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {session.question || session.next_question}
            </p>

            {/* Hint toggle */}
            {(session.hint || session.turn_evaluation?.follow_up_hint) && (
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-slate-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? "Hide Strategy Hint" : "Need a Hint / Structure?"}</span>
                </button>
                {showHint && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 mt-2">
                    💡 {session.hint || session.turn_evaluation?.follow_up_hint}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Previous Turn Feedback (if applicable) */}
          {session.turn_evaluation && (
            <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
                {session.turn_evaluation.score}
              </span>
              <div>
                <span className="font-semibold text-white">Feedback on Previous Question:</span>
                <p className="text-slate-300 mt-0.5">{session.turn_evaluation.feedback}</p>
              </div>
            </div>
          )}

          {/* Answer Input Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Your Response:</span>
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isRecording
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-purple-400" />}
                <span>{isRecording ? "Listening (Tap to stop)..." : "Voice Input (Speech-to-Text)"}</span>
              </button>
            </div>

            <textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="Structure your answer clearly: state definition, technical mechanism, and business example..."
              rows={5}
              className="w-full p-4 bg-slate-950 text-xs text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">Evaluates: Technical Accuracy, Relevance, Completeness, Communication</span>
              <button
                onClick={handleAnswerSubmit}
                disabled={evaluating || !studentAnswer.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Response...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Turn & Continue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Interview Comprehensive Report */}
      {session?.is_completed && session.report && (
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Interview Completed</span>
              <h2 className="text-xl font-bold text-white mt-0.5">AI Interview Performance Report</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-emerald-400">{session.report.overall_score}%</span>
              <span className="text-xs text-slate-400">Overall Readiness (+200 XP)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Radar Chart */}
            <div className="lg:col-span-6 glass-card p-4 rounded-xl flex flex-col items-center justify-center">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Candidate Competence Radar vs Industry Benchmark
              </h4>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={session.report.radar_data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="dimension" stroke="#94A3B8" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                    <Radar name="Candidate" dataKey="score" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
                    <Radar name="Benchmark" dataKey="benchmark" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-purple-500"></span> Candidate Score</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-sky-400"></span> Industry Benchmark</span>
              </div>
            </div>

            {/* Right: Strengths & Weaknesses */}
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Key Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {session.report.strengths?.map((st: string, i: number) => (
                    <li key={i} className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                      {st}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Areas for Polish
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {session.report.weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white">Recommended Next Focus:</div>
              <p className="text-xs text-slate-400 mt-0.5">{session.report.practice_recommendations?.[0]}</p>
            </div>
            <button
              onClick={() => onNavigate("practice")}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <span>Practice Weak Areas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
