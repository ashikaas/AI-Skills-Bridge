import React, { useEffect, useState } from "react";
import { 
  Building2, MapPin, Briefcase, ArrowRight, CheckCircle2, 
  AlertCircle, Sparkles, RefreshCw, Layers, Globe, Search, 
  ExternalLink, ShieldCheck, X, Check
} from "lucide-react";
import { api } from "../services/api";

interface JobMatchViewProps {
  onNavigate: (view: string) => void;
}

const PRESET_URLS = [
  {
    label: "Google - Cloud BI Specialist",
    url: "https://careers.google.com/jobs/results/123-cloud-bi-specialist/"
  },
  {
    label: "Razorpay - Growth Data Analyst",
    url: "https://razorpay.com/careers/growth-data-analyst/"
  },
  {
    label: "Swiggy - Analytics Engineer",
    url: "https://careers.swiggy.com/analytics-engineer-delivery/"
  }
];

export const JobMatchView: React.FC<JobMatchViewProps> = ({ onNavigate, targetRole, roleVersion }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [urlInput, setUrlInput] = useState("");
  const [urlScraping, setUrlScraping] = useState(false);
  const [scrapedResult, setScrapedResult] = useState<any>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await api.getRecommendedJobs();
      setJobs(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeUrl = async (targetUrl?: string) => {
    const url = targetUrl || urlInput;
    if (!url.trim()) return;
    try {
      setUrlScraping(true);
      setErrorNotice(null);
      const res = await api.scrapeJobUrl(url);
      setScrapedResult(res);
    } catch (e: any) {
      setErrorNotice(e.message || "Failed to scrape job URL");
    } finally {
      setUrlScraping(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>Matching Profile with 112 Seeded Industry Jobs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Placement Matching Engine</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">
              Multi-Vector Fit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Recommended Job Matches</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Matched directly against your verified project portfolio, practice metrics, and mock interview ratings.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
          Showing <strong className="text-white">{jobs.length} Top Matched Opportunities</strong>
        </div>
      </div>

      {/* Live Job URL Scraper Box */}
      <div className="glass-card p-6 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-purple-950/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Scrape & Match Any External Job Listing</h3>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold border border-blue-500/30">
              Live Web Crawler
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Paste any LinkedIn, Indeed, or portal link</span>
        </div>

        {/* Input bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="e.g. https://careers.google.com/jobs/results/data-analyst"
              className="w-full bg-slate-900/90 border border-slate-700 text-white text-xs pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>
          <button
            onClick={() => handleScrapeUrl()}
            disabled={urlScraping || !urlInput.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${urlScraping ? "animate-spin" : ""}`} />
            <span>{urlScraping ? "Scraping..." : "Scrape & Analyze Fit"}</span>
          </button>
        </div>

        {/* 1-Click Demo Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 text-[11px] font-medium">1-Click Jury Presets:</span>
          {PRESET_URLS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUrlInput(p.url);
                handleScrapeUrl(p.url);
              }}
              disabled={urlScraping}
              className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-blue-300 text-[11px] font-semibold rounded-lg border border-slate-700 hover:border-blue-500/50 transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3 h-3 text-blue-400" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {errorNotice && (
          <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}
      </div>

      {/* Scraped Job Analysis Modal / Card */}
      {scrapedResult && (
        <div className="glass-card p-6 rounded-2xl border-2 border-emerald-500/40 bg-slate-900/90 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Live Scraped Job Result
                </span>
                <span className="text-xs text-slate-400">Scraped at {scrapedResult.scraped_at}</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">{scrapedResult.role}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                <span className="text-blue-400 font-bold">{scrapedResult.company}</span>
                <span>•</span>
                <span>{scrapedResult.location}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{scrapedResult.salary_range}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <div className="text-3xl font-black text-emerald-400">{scrapedResult.overall_fit}%</div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Overall Match</span>
              </div>
              <button
                onClick={() => setScrapedResult(null)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            "{scrapedResult.description}"
          </p>

          {/* Skills Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Verified Match from Your Resume & Portfolio ({scrapedResult.matched_skills.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {scrapedResult.matched_skills.map((m: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <span>{m.skill}</span>
                    <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.2 rounded font-bold">
                      {m.student_score}%
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Gaps */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Missing Skill Gaps for this Role ({scrapedResult.missing_skills.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {scrapedResult.missing_skills.map((m: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <span>{m.skill}</span>
                    <span className="text-[10px] bg-rose-500/20 px-1.5 py-0.2 rounded font-bold">
                      Critical Gap
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tailored Resume & Interview Advice */}
          <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-blue-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>AI ATS Resume Tailoring Recommendations for {scrapedResult.company}</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              {scrapedResult.tailored_advice.map((advice: string, i: number) => (
                <li key={i} className="leading-relaxed">{advice}</li>
              ))}
            </ul>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={() => setScrapedResult(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
            >
              Dismiss
            </button>
            <button
              onClick={() => onNavigate("track")}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <span>Bridge Missing Gaps in 4-Week Track</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Jobs Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Top Row: Company, Role & Match Score */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">{job.role}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="text-blue-400 font-semibold">{job.company}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <div className="text-2xl font-black text-emerald-400">{job.overall_match}%</div>
                  <span className="text-[10px] text-slate-400 font-medium">Overall Fit</span>
                </div>
              </div>

              {/* 4 Vector breakdown */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800 my-3 text-center text-xs">
                <div className="p-2 bg-slate-900/80 rounded-lg">
                  <div className="text-[10px] text-slate-400">Skill Fit</div>
                  <div className="font-bold text-white mt-0.5">{job.skill_match}%</div>
                </div>
                <div className="p-2 bg-slate-900/80 rounded-lg">
                  <div className="text-[10px] text-slate-400">Experience</div>
                  <div className="font-bold text-white mt-0.5">{job.experience_match}%</div>
                </div>
                <div className="p-2 bg-slate-900/80 rounded-lg">
                  <div className="text-[10px] text-slate-400">Projects</div>
                  <div className="font-bold text-white mt-0.5">{job.project_match}%</div>
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{job.description}</p>

              {/* Missing Skills Warning */}
              {job.missing_skills && job.missing_skills.length > 0 && (
                <div className="pt-2 flex items-center gap-2 text-xs">
                  <span className="text-rose-400 font-semibold flex items-center gap-1 text-[11px]">
                    <AlertCircle className="w-3 h-3" />
                    Missing:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {job.missing_skills.map((ms: string, i: number) => (
                      <span key={i} className="text-[10px] bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded border border-rose-500/20">
                        {ms}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-400">{job.salary_range}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate("interview")}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                >
                  Prepare Interview
                </button>
                <button
                  onClick={() => onNavigate("practice")}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <span>Practice Drills</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
