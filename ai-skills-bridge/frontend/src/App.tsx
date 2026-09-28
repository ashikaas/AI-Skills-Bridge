import React, { useState } from "react";
import { UserRole } from "./types";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { CareerCopilot } from "./components/CareerCopilot";

// Views
import { LandingView } from "./views/LandingView";
import { DashboardView } from "./views/DashboardView";
import { ProfileView } from "./views/ProfileView";
import { ResumeView } from "./views/ResumeView";
import { MarketView } from "./views/MarketView";
import { CoursesView } from "./views/CoursesView";
import { LearnView } from "./views/LearnView";
import { PracticeView } from "./views/PracticeView";
import { DoView } from "./views/DoView";
import { InterviewView } from "./views/InterviewView";
import { JobMatchView } from "./views/JobMatchView";
import { TpoDashboardView } from "./views/TpoDashboardView";
import { TpoHeatmapView } from "./views/TpoHeatmapView";
import { TpoInterventionView } from "./views/TpoInterventionView";
import { TpoStudentsView } from "./views/TpoStudentsView";
import { SimulatorView } from "./views/SimulatorView";
import { LoginModal } from "./views/LoginModal";

import { api } from "./services/api";

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>("student");
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [targetRole, setTargetRole] = useState<string>("Data Analyst");
  const [roleVersion, setRoleVersion] = useState<number>(0);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  // Global resume gap skills state — populated after resume scan
  const [resumeGapSkills, setResumeGapSkills] = useState<string[]>([]);

  const handleRoleSwitch = (role: UserRole) => {
    setCurrentRole(role);
    if (role === "student") {
      setCurrentView("dashboard");
    } else {
      setCurrentView("tpo-dashboard");
    }
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTargetRoleChange = async (newRole: string) => {
    setTargetRole(newRole);
    try {
      await api.updateTargetRole(newRole);
      setRoleVersion((prev) => prev + 1);
      const res = await api.analyzeResume(null, true, newRole);
      if (res && res.extracted_skills) {
        const gaps: string[] = res.extracted_skills
          .filter((s: any) => s.status === "Missing" || s.status === "Developing" || s.score < 60)
          .map((s: any) => s.name as string);
        setResumeGapSkills(gaps);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case "landing":
        return (
          <LandingView
            onStartStudentDemo={() => {
              setCurrentRole("student");
              setCurrentView("dashboard");
            }}
            onStartTpoDemo={() => {
              setCurrentRole("tpo");
              setCurrentView("tpo-dashboard");
            }}
            onNavigate={handleNavigate}
          />
        );
      case "dashboard":
        return <DashboardView key={`dash-${targetRole}-${roleVersion}`} targetRole={targetRole} roleVersion={roleVersion} onNavigate={handleNavigate} />;
      case "profile":
        return <ProfileView />;
      case "resume":
        return (
          <ResumeView
            onResumeAnalyzed={(skills) => setResumeGapSkills(skills)}
            onNavigate={handleNavigate}
          />
        );
      case "market":
        return <MarketView key={`mkt-${targetRole}-${roleVersion}`} targetRole={targetRole} roleVersion={roleVersion} />;
      case "courses":
        return <CoursesView gapSkills={resumeGapSkills} targetRole={targetRole} onNavigate={handleNavigate} />;
      case "learn":
        return <LearnView gapSkills={resumeGapSkills} onNavigate={handleNavigate} />;
      case "practice":
        return <PracticeView gapSkills={resumeGapSkills} onNavigate={handleNavigate} />;
      case "do":
        return <DoView gapSkills={resumeGapSkills} onNavigate={handleNavigate} />;
      case "interview":
        return <InterviewView key={`int-${targetRole}-${roleVersion}`} targetRole={targetRole} roleVersion={roleVersion} onNavigate={handleNavigate} />;
      case "jobs":
        return <JobMatchView key={`job-${targetRole}-${roleVersion}`} targetRole={targetRole} roleVersion={roleVersion} onNavigate={handleNavigate} />;
      case "tpo-dashboard":
        return <TpoDashboardView onNavigate={handleNavigate} />;
      case "tpo-heatmap":
        return <TpoHeatmapView />;
      case "tpo-interventions":
        return <TpoInterventionView />;
      case "tpo-students":
        return <TpoStudentsView />;
      case "simulator":
        return <SimulatorView />;
      default:
        return <DashboardView key={`dash-${targetRole}-${roleVersion}`} targetRole={targetRole} roleVersion={roleVersion} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentRole}
        onRoleSwitch={handleRoleSwitch}
        onNavigate={handleNavigate}
        targetRole={targetRole}
        onTargetRoleChange={handleTargetRoleChange}
      />

      {/* Main Body */}
      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <Sidebar
          currentRole={currentRole}
          currentView={currentView}
          onNavigate={handleNavigate}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {renderView()}
        </main>
      </div>

      {/* Floating AI Career Copilot for Student */}
      {currentRole === "student" && <CareerCopilot />}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(role) => handleRoleSwitch(role)}
      />
    </div>
  );
};

export default App;
