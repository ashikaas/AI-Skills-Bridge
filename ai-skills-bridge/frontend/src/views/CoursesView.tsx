import React, { useState, useMemo } from "react";
import { 
  GraduationCap, ExternalLink, Sparkles, Search, Filter, 
  CheckCircle2, AlertTriangle, BookOpen, Star, Clock, 
  Award, ArrowRight, ScanSearch, BookmarkCheck
} from "lucide-react";

interface CourseItem {
  id: string;
  skill: string;
  title: string;
  platform: "Coursera" | "NPTEL" | "Udemy" | "edX" | "YouTube" | "Google Cloud" | "Microsoft";
  provider: string;
  duration: string;
  rating: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  url: string;
  description: string;
  keyTopics: string[];
  isNptelVerified?: boolean;
}

const RECOMMENDED_COURSES: CourseItem[] = [
  // ── Cloud Skills ────────────────────────────────────────────────────────
  {
    id: "c1",
    skill: "Cloud",
    title: "Google Cloud Data Engineering Professional Certificate",
    platform: "Coursera",
    provider: "Google Cloud Training",
    duration: "2 Months (5 hrs/week)",
    rating: "4.8 ★",
    level: "Intermediate",
    url: "https://www.coursera.org/professional-certificates/gcp-data-engineering",
    description: "Build production data pipelines with BigQuery, Dataflow, Cloud Storage, and IAM access controls.",
    keyTopics: ["BigQuery", "Dataflow (Beam)", "GCS Storage", "Cloud IAM"]
  },
  {
    id: "c2",
    skill: "Cloud",
    title: "NPTEL: Cloud Computing (IIT Kharagpur)",
    platform: "NPTEL",
    provider: "Prof. Soumya Kanti Ghosh, IIT Kharagpur",
    duration: "12 Weeks (Proctored Exam)",
    rating: "4.9 ★",
    level: "Intermediate",
    url: "https://onlinecourses.nptel.ac.in/noc24_cs17/preview",
    description: "Official NPTEL government certification covering distributed systems, virtualization, AWS/GCP architecture.",
    keyTopics: ["Virtualization", "Cloud Security", "Distributed Storage", "SLA Models"],
    isNptelVerified: true
  },
  {
    id: "c3",
    skill: "Cloud",
    title: "Ultimate AWS Certified Solutions Architect Associate",
    platform: "Udemy",
    provider: "Stephane Maarek",
    duration: "27 Hours Video",
    rating: "4.7 ★",
    level: "Intermediate",
    url: "https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/",
    description: "Comprehensive hands-on training for AWS S3, EC2, RDS, Lambda, DynamoDB, and CloudFront.",
    keyTopics: ["AWS S3 & EC2", "IAM Policies", "Serverless Lambda", "VPC Networking"]
  },

  // ── Generative AI ───────────────────────────────────────────────────────
  {
    id: "g1",
    skill: "Generative AI",
    title: "Generative AI with Large Language Models",
    platform: "Coursera",
    provider: "DeepLearning.AI & AWS (Andrew Ng)",
    duration: "3 Weeks",
    rating: "4.9 ★",
    level: "Intermediate",
    url: "https://www.coursera.org/learn/generative-ai-with-llms",
    description: "Master Transformer architectures, RLHF, prompt engineering, and RAG (Retrieval Augmented Generation).",
    keyTopics: ["Transformers", "Prompt Chaining", "Vector DBs", "RAG Pipelines"]
  },
  {
    id: "g2",
    skill: "Generative AI",
    title: "NPTEL: Applied Natural Language Processing (IIT Madras)",
    platform: "NPTEL",
    provider: "Prof. Ramaseshan, IIT Madras",
    duration: "12 Weeks (NPTEL Exam)",
    rating: "4.8 ★",
    level: "Advanced",
    url: "https://nptel.ac.in/courses/106106211",
    description: "In-depth NLP from Word2Vec embeddings to BERT, Attention mechanisms, and modern LLM fine-tuning.",
    keyTopics: ["Word Embeddings", "Attention Mechanisms", "BERT & GPT", "Fine-Tuning"],
    isNptelVerified: true
  },
  {
    id: "g3",
    skill: "Generative AI",
    title: "LangChain & LLM Application Development",
    platform: "YouTube",
    provider: "FreeCodeCamp & Harrison Chase",
    duration: "4.5 Hours",
    rating: "4.9 ★",
    level: "Beginner",
    url: "https://www.youtube.com/watch?v=aywZrzNaKjs",
    description: "Build production AI agents, document QA bots, and autonomous workflows using LangChain and OpenAI/Gemini APIs.",
    keyTopics: ["LangChain", "ChromaDB", "Agentic Tools", "API Integration"]
  },

  // ── A/B Testing & Statistics ────────────────────────────────────────────
  {
    id: "s1",
    skill: "A/B Testing",
    title: "Google A/B Testing & Statistical Experimentation",
    platform: "Coursera",
    provider: "Google Analytics Academy",
    duration: "4 Weeks",
    rating: "4.8 ★",
    level: "Intermediate",
    url: "https://www.coursera.org/learn/ab-testing",
    description: "Learn how Google designs, executes, and evaluates large-scale web and mobile A/B experiments.",
    keyTopics: ["Sample Size Calculation", "P-Value & Alpha", "Chi-Square Test", "Novelty Effect"]
  },
  {
    id: "s2",
    skill: "Statistics",
    title: "NPTEL: Data Analysis & Decision Making (IIT Kanpur)",
    platform: "NPTEL",
    provider: "Prof. Raghu Nandan Sengupta, IIT Kanpur",
    duration: "12 Weeks",
    rating: "4.8 ★",
    level: "Intermediate",
    url: "https://onlinecourses.nptel.ac.in/noc24_mg08/preview",
    description: "Rigorous statistical inference, hypothesis testing, ANOVA, multivariate regression, and decision trees.",
    keyTopics: ["Hypothesis Testing", "ANOVA", "Multivariate Regression", "Confidence Intervals"],
    isNptelVerified: true
  },
  {
    id: "s3",
    skill: "Statistics",
    title: "HarvardX: Data Science Probability & Inference",
    platform: "edX",
    provider: "Harvard University (Prof. Rafael Irizarry)",
    duration: "8 Weeks",
    rating: "4.9 ★",
    level: "Beginner",
    url: "https://www.edx.org/learn/probability/harvard-university-data-science-probability",
    description: "Foundational probability theory, random variables, Monte Carlo simulations, and Central Limit Theorem.",
    keyTopics: ["Probability Distributions", "Central Limit Theorem", "Monte Carlo", "Bayesian Stats"]
  },

  // ── Power BI & Data Visualization ───────────────────────────────────────
  {
    id: "p1",
    skill: "Power BI",
    title: "Microsoft Power BI Data Analyst Professional Certificate",
    platform: "Microsoft",
    provider: "Microsoft Official Training",
    duration: "1.5 Months",
    rating: "4.8 ★",
    level: "Intermediate",
    url: "https://www.coursera.org/professional-certificates/microsoft-power-bi-data-analyst",
    description: "Official preparation for PL-300 Microsoft Power BI Data Analyst certification exam.",
    keyTopics: ["Star Schema Modeling", "DAX Context Transition", "Row-Level Security", "Power BI Service"]
  },
  {
    id: "p2",
    skill: "Power BI",
    title: "Microsoft Power BI Desktop for Business Intelligence",
    platform: "Udemy",
    provider: "Maven Analytics (Chris Dutton)",
    duration: "15 Hours Video",
    rating: "4.8 ★",
    level: "Beginner",
    url: "https://www.udemy.com/course/microsoft-power-bi-up-and-running-with-power-bi-desktop/",
    description: "Complete hands-on masterclass covering ETL in Power Query, relationships, DAX formulas, and executive dashboards.",
    keyTopics: ["Power Query M-Code", "DAX Measures", "Interactive Visuals", "Publishing Reports"]
  },

  // ── SQL & Data Warehousing ──────────────────────────────────────────────
  {
    id: "sq1",
    skill: "SQL",
    title: "NPTEL: Database Management System (IIT Kharagpur)",
    platform: "NPTEL",
    provider: "Prof. Partha Pratim Das, IIT Kharagpur",
    duration: "8 Weeks",
    rating: "4.8 ★",
    level: "Intermediate",
    url: "https://onlinecourses.nptel.ac.in/noc24_cs21/preview",
    description: "Relational algebra, SQL query optimization, indexing (B+ trees), transaction ACID properties, and normalization.",
    keyTopics: ["SQL Window Functions", "B+ Tree Indexing", "ACID Transactions", "Normalization (3NF/BCNF)"],
    isNptelVerified: true
  },
  {
    id: "sq2",
    skill: "SQL",
    title: "PostgreSQL & Complex SQL Queries Masterclass",
    platform: "Coursera",
    provider: "University of Michigan",
    duration: "4 Weeks",
    rating: "4.7 ★",
    level: "Intermediate",
    url: "https://www.coursera.org/learn/postgresql-for-everybody",
    description: "Advanced PostgreSQL query tuning, window partition functions, CTEs (WITH clause), and JSONB indexing.",
    keyTopics: ["Window PARTITION BY", "Recursive CTEs", "JSONB Indexing", "Query Execution Plans"]
  },

  // ── Python & Data Science ───────────────────────────────────────────────
  {
    id: "py1",
    skill: "Python",
    title: "NPTEL: Data Science for Engineers (IIT Madras)",
    platform: "NPTEL",
    provider: "Prof. Ragunathan Rengasamy, IIT Madras",
    duration: "8 Weeks",
    rating: "4.9 ★",
    level: "Intermediate",
    url: "https://onlinecourses.nptel.ac.in/noc24_cs68/preview",
    description: "Python data structures, Pandas DataFrames, NumPy linear algebra, and statistical modeling for engineering data.",
    keyTopics: ["Pandas GroupBy", "Vectorized NumPy", "Linear Regression", "Optimization"],
    isNptelVerified: true
  },
  {
    id: "py2",
    skill: "Python",
    title: "Python for Data Science and Machine Learning Bootcamp",
    platform: "Udemy",
    provider: "Jose Portilla",
    duration: "25 Hours Video",
    rating: "4.7 ★",
    level: "Beginner",
    url: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
    description: "Complete toolkit: NumPy, Pandas, Matplotlib, Seaborn, Scikit-Learn, and Plotly interactive charts.",
    keyTopics: ["Data Manipulation", "Exploratory Data Analysis", "Scikit-Learn ML", "Plotly Charts"]
  },

  // ── Machine Learning & Deep Learning ────────────────────────────────────
  {
    id: "ml1",
    skill: "Machine Learning",
    title: "Machine Learning Specialization (Andrew Ng)",
    platform: "Coursera",
    provider: "DeepLearning.AI & Stanford University",
    duration: "3 Months",
    rating: "4.9 ★",
    level: "Intermediate",
    url: "https://www.coursera.org/specializations/machine-learning-introduction",
    description: "The gold standard ML course: Supervised learning, Neural Networks, Decision Trees, and Unsupervised Clustering.",
    keyTopics: ["Gradient Descent", "Random Forests", "Neural Networks", "Bias-Variance Tradeoff"]
  },
  {
    id: "ml2",
    skill: "Deep Learning",
    title: "NPTEL: Deep Learning (IIT Madras)",
    platform: "NPTEL",
    provider: "Prof. Mitesh M. Khapra, IIT Madras",
    duration: "12 Weeks",
    rating: "4.9 ★",
    level: "Advanced",
    url: "https://nptel.ac.in/courses/106106184",
    description: "Backpropagation math, Convolutional Neural Networks (CNNs), Recurrent Networks (RNN/LSTM), and PyTorch implementation.",
    keyTopics: ["Backprop Calculus", "CNN Architectures", "PyTorch Tensors", "Optimizers (Adam)"],
    isNptelVerified: true
  },

  // ── DevOps, Docker & Kubernetes ────────────────────────────────────────
  {
    id: "dk1",
    skill: "Docker",
    title: "Docker & Kubernetes: The Complete Guide",
    platform: "Udemy",
    provider: "Stephen Grider",
    duration: "22 Hours Video",
    rating: "4.8 ★",
    level: "Intermediate",
    url: "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
    description: "Build, test, and deploy Docker container pipelines and multi-node Kubernetes clusters.",
    keyTopics: ["Dockerfile Multi-Stage", "Docker Compose", "Kubernetes Pods", "Helm Deployment"]
  },
  {
    id: "dk2",
    skill: "Docker",
    title: "Introduction to Cloud Infrastructure & Containers",
    platform: "edX",
    provider: "The Linux Foundation",
    duration: "6 Weeks",
    rating: "4.7 ★",
    level: "Beginner",
    url: "https://www.edx.org/learn/cloud-computing/the-linux-foundation-introduction-to-cloud-infrastructure-technologies",
    description: "Official Linux Foundation course covering cloud native architectures, OCI container standards, and DevOps CI/CD.",
    keyTopics: ["Container Runtime", "Microservices", "CI/CD Automation", "Linux Networking"]
  }
];

interface CoursesViewProps {
  gapSkills?: string[];
  targetRole?: string;
  onNavigate?: (view: string) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({ 
  gapSkills = [], 
  targetRole = "Data Analyst",
  onNavigate 
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [selectedSkill, setSelectedSkill] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [savedCourses, setSavedCourses] = useState<string[]>([]);
  const [showGapsOnly, setShowGapsOnly] = useState<boolean>(gapSkills.length > 0);

  const hasGapSkills = gapSkills.length > 0;

  // Toggle bookmarked courses
  const toggleSaveCourse = (id: string) => {
    setSavedCourses((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filtered and sorted course list
  const filteredCourses = useMemo(() => {
    return RECOMMENDED_COURSES.filter((course) => {
      // Platform filter
      if (selectedPlatform !== "All" && course.platform !== selectedPlatform) return false;
      
      // Skill filter
      if (selectedSkill !== "All" && course.skill !== selectedSkill) return false;

      // Show Gaps Only filter
      if (showGapsOnly && hasGapSkills) {
        const isGap = gapSkills.some(g => g.toLowerCase().includes(course.skill.toLowerCase()) || course.skill.toLowerCase().includes(g.toLowerCase()));
        if (!isGap) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = course.title.toLowerCase().includes(q);
        const matchProvider = course.provider.toLowerCase().includes(q);
        const matchSkill = course.skill.toLowerCase().includes(q);
        const matchTopics = course.keyTopics.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchProvider && !matchSkill && !matchTopics) return false;
      }

      return true;
    }).sort((a, b) => {
      // Prioritize gap skills to top
      const aIsGap = gapSkills.some(g => g.toLowerCase().includes(a.skill.toLowerCase()));
      const bIsGap = gapSkills.some(g => g.toLowerCase().includes(b.skill.toLowerCase()));
      if (aIsGap && !bIsGap) return -1;
      if (!aIsGap && bIsGap) return 1;

      // Prioritize NPTEL verified courses
      if (a.isNptelVerified && !b.isNptelVerified) return -1;
      if (!a.isNptelVerified && b.isNptelVerified) return 1;

      return 0;
    });
  }, [selectedPlatform, selectedSkill, searchQuery, showGapsOnly, gapSkills]);

  // Extract unique platforms and skills for dropdown filters
  const platforms = ["All", "NPTEL", "Coursera", "Udemy", "edX", "YouTube", "Google Cloud", "Microsoft"];
  const availableSkills = ["All", ...Array.from(new Set(RECOMMENDED_COURSES.map(c => c.skill)))];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#131B2E] to-blue-950/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Target Role Upskilling</span>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-medium border border-blue-500/30">
              NPTEL • Coursera • Udemy • edX
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Recommended Skill Courses for <span className="text-blue-400">{targetRole}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hand-picked government (NPTEL) & top-tier global university certifications mapped directly to your candidate profile.
          </p>
        </div>

        {hasGapSkills && (
          <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-xl text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold">Detected Role Gaps:</div>
              <div className="text-[11px] text-amber-200">{gapSkills.join(" • ")}</div>
            </div>
          </div>
        )}
      </div>

      {/* Resume Scan Prompt if no gaps detected yet */}
      {!hasGapSkills && onNavigate && (
        <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ScanSearch className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Want tailored recommendations for your missing skills?</p>
              <p className="text-xs text-slate-400 mt-0.5">Scan your resume to instantly match courses against your missing ATS keywords.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("resume")}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
          >
            <span>Scan Resume Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="glass-card p-4 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course title, provider, tech stack or topic..."
              className="w-full bg-slate-900 border border-slate-700 text-white text-xs pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>

          {/* Toggle: Gap Skills Only */}
          {hasGapSkills && (
            <button
              onClick={() => setShowGapsOnly(!showGapsOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                showGapsOnly
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <span>⚠ Missing Gap Skills Only</span>
              <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1.5 py-0.2 rounded font-mono">
                {gapSkills.length}
              </span>
            </button>
          )}
        </div>

        {/* Category & Platform Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
          {/* Platform Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" /> Platform:
            </span>
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedPlatform === p
                    ? p === "NPTEL"
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 text-white"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                }`}
              >
                {p === "NPTEL" ? "🇮🇳 NPTEL (Govt)" : p}
              </button>
            ))}
          </div>

          {/* Skill Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Skill Filter:</span>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {availableSkills.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Saved counter */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Showing <strong className="text-white">{filteredCourses.length} Recommended Courses</strong></span>
        {savedCourses.length > 0 && (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <BookmarkCheck className="w-3.5 h-3.5" />
            {savedCourses.length} Courses Saved to Study Plan
          </span>
        )}
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => {
          const isGapSkill = gapSkills.some(g => g.toLowerCase().includes(course.skill.toLowerCase()) || course.skill.toLowerCase().includes(g.toLowerCase()));
          const isSaved = savedCourses.includes(course.id);

          return (
            <div
              key={course.id}
              className={`glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between space-y-4 relative transition-all ${
                isGapSkill 
                  ? "border-amber-500/40 bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-900" 
                  : "border-slate-800"
              }`}
            >
              {/* Top Tags & Badges */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Platform Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      course.platform === "NPTEL"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : course.platform === "Coursera"
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        : course.platform === "Udemy"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                        : "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                    }`}>
                      {course.platform}
                    </span>

                    {/* NPTEL Government Verified Tag */}
                    {course.isNptelVerified && (
                      <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                        🇮🇳 Govt Certified
                      </span>
                    )}
                  </div>

                  {/* Missing Skill Priority Badge */}
                  {isGapSkill && (
                    <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                      <span>⚠ Gap Skill</span>
                    </span>
                  )}
                </div>

                {/* Course Title */}
                <h3 className="font-bold text-white text-base leading-snug group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h3>

                {/* Provider / Instructor */}
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {course.provider}
                </p>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mt-2.5 line-clamp-3">
                  {course.description}
                </p>
              </div>

              {/* Course Meta Info & Key Topics */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                {/* Duration & Rating */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {course.rating}
                  </span>
                </div>

                {/* Key Topics Covered Chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {course.keyTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  {/* Official External Link Button */}
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
                  >
                    <span>View Course</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Bookmark / Save to Study Plan */}
                  <button
                    onClick={() => toggleSaveCourse(course.id)}
                    title={isSaved ? "Saved to study plan" : "Save to study plan"}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                      isSaved
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    <BookmarkCheck className={`w-4 h-4 ${isSaved ? "text-emerald-400" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12 glass-card rounded-2xl border border-slate-800 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-white font-bold text-base">No courses found matching your filter</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting your search query or switching your platform filter to "All".
          </p>
          <button
            onClick={() => { setSelectedPlatform("All"); setSelectedSkill("All"); setSearchQuery(""); setShowGapsOnly(false); }}
            className="px-4 py-2 bg-slate-800 text-xs font-bold text-blue-400 rounded-xl hover:bg-slate-700"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
