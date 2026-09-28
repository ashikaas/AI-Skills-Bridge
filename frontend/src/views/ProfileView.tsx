import React, { useEffect, useState } from "react";
import { 
  User, Award, Briefcase, ExternalLink, GitBranch, CheckCircle2, 
  RefreshCw, Sparkles, Building2, BookOpen 
} from "lucide-react";
import { api } from "../services/api";

const ROLES = [
  "Data Analyst",
  "Data Scientist",
  "Data Engineer",
  "Business Analyst",
  "AI/ML Engineer",
  "Software Engineer",
  "Cloud Engineer",
  "Product Analyst"
];

export const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getProfile();
      setProfile(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleRoleChange = async (newRole: string) => {
    try {
      setUpdatingRole(true);
      await api.updateTargetRole(newRole);
      await loadProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingRole(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
        <span>Loading Student Portfolio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Profile Hero Card */}
      <div className="glass-card p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shrink-0 shadow-xl shadow-blue-500/10">
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{profile.name}</h1>
              <span className="text-xs bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-500/30">
                Verified Candidate
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {profile.degree} in {profile.branch} • Year {profile.year} (CGPA {profile.cgpa})
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{profile.university}</p>
          </div>
        </div>

        {/* Target role selector */}
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5 self-start sm:self-auto">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Primary Target Career Role
          </label>
          <select
            value={profile.target_role}
            disabled={updatingRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 font-semibold"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Flagship Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Flagship Industry Projects</h3>
            <p className="text-xs text-slate-400">Verified evidence cited during resume scanning and mock interview defense</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.projects?.map((prj: any) => (
            <div key={prj.id} className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-white text-sm">{prj.title}</h4>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    {prj.github_url && (
                      <a href={prj.github_url} target="_blank" rel="noreferrer" className="hover:text-white">
                        <GitBranch className="w-4 h-4" />
                      </a>
                    )}
                    {prj.live_demo_url && (
                      <a href={prj.live_demo_url} target="_blank" rel="noreferrer" className="hover:text-blue-400">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{prj.description}</p>

                <ul className="space-y-1 text-xs text-slate-400">
                  {prj.highlights?.map((hl: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                {prj.technologies?.map((tech: string, i: number) => (
                  <span key={i} className="text-[10px] bg-slate-800 text-blue-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges & Industry Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preferred Industries */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Target Industry Preferences</h3>
          <div className="flex flex-wrap gap-2 pt-1">
            {profile.preferred_industries?.map((ind: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-slate-900 text-slate-200 text-xs font-semibold rounded-lg border border-slate-800">
                {ind}
              </span>
            ))}
          </div>
        </div>

        {/* Unlocked Badges */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Unlocked Mastery Badges</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {profile.badges?.map((b: any) => (
              <div key={b.id} className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">{b.badge_title}</div>
                  <div className="text-[10px] text-slate-400">{b.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

