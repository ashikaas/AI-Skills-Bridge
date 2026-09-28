import json
import re
import os
from typing import Dict, List, Any, Optional

try:
    from google import genai
except ImportError:
    genai = None

# Skill synonyms & normalization dictionary
SKILL_NORMALIZATION_MAP = {
    "powerbi": "Power BI",
    "power bi": "Power BI",
    "pbi": "Power BI",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "genai": "Generative AI",
    "generative ai": "Generative AI",
    "llm": "Generative AI",
    "large language models": "Generative AI",
    "prompt engineering": "Generative AI",
    "sql": "SQL",
    "structured query language": "SQL",
    "postgres": "SQL",
    "postgresql": "SQL",
    "mysql": "SQL",
    "python": "Python",
    "py": "Python",
    "excel": "Excel",
    "ms excel": "Excel",
    "advanced excel": "Excel",
    "spreadsheets": "Excel",
    "statistics": "Statistics",
    "stats": "Statistics",
    "probability": "Statistics",
    "cloud": "Cloud",
    "aws": "Cloud",
    "amazon web services": "Cloud",
    "gcp": "Cloud",
    "google cloud": "Cloud",
    "azure": "Cloud",
    "a/b testing": "A/B Testing",
    "ab testing": "A/B Testing",
    "experimentation": "A/B Testing",
    "hypothesis testing": "A/B Testing",
    "tableau": "Tableau",
    "etl": "ETL",
    "data pipelines": "ETL",
    "data engineering": "ETL",
    "spark": "Spark",
    "apache spark": "Spark",
    "docker": "Docker",
    "containers": "Docker",
    "git": "Git",
    "version control": "Git",
    "system design": "System Design",
    "deep learning": "Deep Learning",
    "dl": "Deep Learning",
    "neural networks": "Deep Learning",
    "communication": "Communication",
    "data visualization": "Data Visualization",
    "product analytics": "Product Analytics",
    "react": "React",
    "reactjs": "React",
    "node": "Node.js",
    "nodejs": "Node.js",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "java": "Java",
    "golang": "Go",
    "rust": "Rust",
    "c++": "C++",
    "cpp": "C++",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "ci/cd": "CI/CD",
    "jenkins": "CI/CD",
    "github actions": "CI/CD",
    "terraform": "Terraform",
    "linux": "Linux",
    "bash": "Linux",
    "shell": "Linux",
    "figma": "Figma",
    "ux": "UX Design",
    "ui": "UX Design",
    "user experience": "UX Design",
    "user research": "User Research",
    "wireframing": "Wireframing",
    "agile": "Agile",
    "scrum": "Agile",
    "jira": "Agile",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "scikit-learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "mlops": "MLOps",
    "nlp": "NLP",
    "natural language processing": "NLP",
    "networking": "Networking",
    "penetration testing": "Penetration Testing",
    "cryptography": "Cryptography",
}

# ─────────────────────────────────────────────────────────────────────────────
# PER-ROLE SKILL CATALOGS
# Each entry: (skill_name, keywords[], default_level, default_score, default_evidence)
# ─────────────────────────────────────────────────────────────────────────────
ROLE_SKILL_CATALOGS: Dict[str, List[tuple]] = {
    "Data Analyst": [
        ("Python",        ["python", "pandas", "numpy", "streamlit", "scipy"],                              "Advanced",     90, "Built an AI-powered data analysis assistant using Python, Pandas and Streamlit."),
        ("SQL",           ["sql", "postgres", "sqlite", "mysql", "queries", "joins", "views", "ctes"],      "Advanced",     85, "Designed normalized multi-table schemas and complex window functions for e-commerce analytics."),
        ("Excel",         ["excel", "pivot", "vlookup", "spreadsheet", "macros"],                           "Advanced",     88, "Created executive dashboards with pivot tables, nested lookups, and macros."),
        ("Power BI",      ["power bi", "powerbi", "dax", "power query"],                                    "Intermediate", 55, "Created basic sales visual reports; DAX modeling and Power Query need improvement."),
        ("Tableau",       ["tableau", "dashboards", "worksheets"],                                          "Beginner",     30, "Basic exploratory sheets during coursework; lacks calculated fields and parameters."),
        ("Statistics",    ["statistics", "probability", "distributions", "hypothesis testing"],             "Beginner",     35, "Understands descriptive stats; inferential statistics requires practice."),
        ("Cloud",         ["aws", "gcp", "azure", "cloud", "s3", "ec2", "bigquery"],                        "Missing",      10, "No Cloud data pipeline or production deployment experience found."),
        ("Generative AI", ["genai", "generative ai", "llm", "langchain", "prompt engineering", "openai"],  "Intermediate", 60, "Developed LLM-assisted analytics assistant using LangChain and OpenAI API."),
        ("A/B Testing",   ["a/b test", "ab test", "experimentation", "control group"],                      "Missing",      15, "Theoretical familiarity only; no experimental design evidence found."),
        ("Communication", ["presentation", "leadership", "stakeholder", "cross-functional"],                "Intermediate", 75, "Demonstrated across project presentations and technical documentation."),
    ],
    "Software Engineer": [
        ("Data Structures & Algorithms", ["array", "linked list", "tree", "graph", "dynamic programming", "sorting", "dsa", "leetcode"], "Advanced", 88, "Solved 200+ LeetCode problems covering trees, graphs, and DP patterns."),
        ("Python",        ["python", "django", "flask", "fastapi"],                                         "Advanced",     85, "Built RESTful APIs using FastAPI and deployed on AWS Lambda."),
        ("Java",          ["java", "spring", "maven", "hibernate"],                                         "Intermediate", 60, "Developed Spring Boot microservices for internal order management."),
        ("JavaScript",    ["javascript", "js", "node", "express", "typescript"],                            "Intermediate", 65, "Built Node.js Express REST API with JWT authentication."),
        ("System Design", ["system design", "scalability", "microservices", "distributed"],                 "Intermediate", 55, "Designed basic microservices architecture for a food delivery backend."),
        ("Git",           ["git", "github", "version control", "pull request", "merge"],                    "Advanced",     90, "Proficient in Git workflows: branching, rebasing, and PR reviews."),
        ("Cloud",         ["aws", "gcp", "azure", "cloud", "ec2", "lambda", "s3"],                          "Intermediate", 60, "Deployed Flask app on AWS EC2 with S3 file storage integration."),
        ("Docker",        ["docker", "containers", "dockerfile", "docker-compose"],                         "Intermediate", 55, "Containerized microservices using Docker and Docker Compose."),
        ("SQL",           ["sql", "postgres", "sqlite", "mysql", "database"],                               "Intermediate", 65, "Designed relational schemas with foreign keys and indexing strategies."),
        ("Communication", ["presentation", "documentation", "stakeholder", "teamwork"],                     "Intermediate", 70, "Contributed to technical documentation and conducted code reviews."),
    ],
    "Machine Learning Engineer": [
        ("Python",           ["python", "pandas", "numpy", "scipy"],                                        "Advanced",     92, "Implemented data preprocessing pipelines using Pandas and NumPy."),
        ("Machine Learning", ["machine learning", "scikit", "sklearn", "classification", "regression", "clustering"], "Advanced", 88, "Built classification models using Scikit-learn with cross-validation."),
        ("Deep Learning",    ["deep learning", "neural networks", "tensorflow", "pytorch", "keras"],        "Intermediate", 65, "Trained CNNs using PyTorch for image classification tasks."),
        ("NLP",              ["nlp", "natural language", "bert", "transformers", "tokenization"],           "Intermediate", 60, "Applied BERT embeddings for sentiment analysis on customer reviews."),
        ("MLOps",            ["mlops", "mlflow", "airflow", "model deployment", "serving"],                 "Beginner",     30, "Basic familiarity with MLflow experiment tracking."),
        ("Feature Engineering", ["feature engineering", "feature selection", "dimensionality reduction", "pca"], "Advanced", 80, "Applied PCA and feature selection to reduce dimensionality by 40%."),
        ("SQL",              ["sql", "postgres", "sqlite", "mysql"],                                        "Intermediate", 65, "Queried structured data for training dataset generation."),
        ("Cloud",            ["aws", "gcp", "azure", "sagemaker", "vertex ai", "cloud"],                   "Beginner",     25, "Limited experience with SageMaker; needs production ML pipeline experience."),
        ("Generative AI",    ["genai", "llm", "langchain", "openai", "huggingface", "transformers"],       "Intermediate", 60, "Fine-tuned HuggingFace transformer models for custom text classification."),
        ("Statistics",       ["statistics", "probability", "bayesian", "hypothesis testing"],              "Advanced",     85, "Applied Bayesian inference and hypothesis testing for model evaluation."),
    ],
    "Product Manager": [
        ("Product Strategy",       ["product strategy", "roadmap", "vision", "okr", "kpi"],                "Advanced",     85, "Defined product roadmap with OKRs aligned to company revenue goals."),
        ("User Research",          ["user research", "interviews", "usability", "user stories", "personas"], "Advanced",   88, "Conducted 20+ user interviews to identify pain points in onboarding flow."),
        ("A/B Testing",            ["a/b test", "experimentation", "hypothesis", "control group"],          "Intermediate", 60, "Designed A/B experiments for feature launches tracking conversion uplift."),
        ("Data Analytics",         ["analytics", "sql", "metrics", "funnel", "retention", "cohort"],       "Intermediate", 65, "Analyzed funnel drop-off using SQL and built retention cohort dashboards."),
        ("Agile",                  ["agile", "scrum", "sprint", "jira", "kanban", "backlog"],              "Advanced",     90, "Led 2-week sprint cycles with cross-functional engineering and design teams."),
        ("Communication",          ["presentation", "stakeholder", "cross-functional", "prd", "documentation"], "Advanced", 92, "Authored detailed PRDs and presented roadmap to C-suite stakeholders."),
        ("Wireframing",            ["wireframe", "figma", "prototype", "mockup", "sketch"],                "Intermediate", 55, "Created low-fidelity wireframes in Figma to validate feature concepts."),
        ("Market Analysis",        ["market analysis", "competitive analysis", "competitor", "market research"], "Intermediate", 60, "Performed competitive analysis of 5 direct competitors for pricing strategy."),
        ("Go-to-Market",           ["go-to-market", "gtm", "launch", "positioning", "messaging"],          "Beginner",     35, "Participated in product launch planning; needs deeper GTM ownership."),
        ("Technical Understanding",["api", "system design", "engineering", "architecture", "backend"],     "Intermediate", 55, "Comfortable collaborating with engineering on API requirements and tradeoffs."),
    ],
    "Business Analyst": [
        ("Requirements Analysis",  ["requirements", "brd", "use case", "user stories", "business requirements"], "Advanced", 88, "Authored BRDs and translated stakeholder needs into detailed user stories."),
        ("SQL",                    ["sql", "queries", "database", "joins", "views"],                        "Advanced",     85, "Wrote complex SQL queries to extract operational reporting data."),
        ("Excel",                  ["excel", "pivot", "vlookup", "spreadsheet", "macros"],                  "Advanced",     90, "Built executive dashboards with advanced Excel pivot tables and formulas."),
        ("Process Mapping",        ["process mapping", "bpmn", "workflow", "flowchart", "visio"],           "Intermediate", 65, "Mapped as-is and to-be business processes using BPMN notation."),
        ("Data Visualization",     ["tableau", "power bi", "dashboards", "visualization"],                 "Intermediate", 60, "Created Power BI dashboards to monitor operational KPIs."),
        ("Stakeholder Management", ["stakeholder", "communication", "presentations", "cross-functional"],   "Advanced",     88, "Facilitated workshops with 10+ business units to gather requirements."),
        ("Agile",                  ["agile", "scrum", "jira", "backlog", "sprint"],                        "Intermediate", 60, "Participated in agile sprints as product owner proxy with dev team."),
        ("Statistics",             ["statistics", "regression", "correlation", "hypothesis testing"],      "Beginner",     35, "Basic statistical knowledge; needs stronger inferential statistics grounding."),
        ("Cloud",                  ["aws", "gcp", "azure", "cloud"],                                       "Missing",      10, "No Cloud platform experience detected in resume."),
        ("Communication",          ["presentation", "documentation", "report", "writing"],                  "Advanced",     90, "Produced weekly management reports and cross-team communication memos."),
    ],
    "Full Stack Developer": [
        ("React",          ["react", "reactjs", "jsx", "redux", "next.js", "nextjs"],                       "Advanced",     88, "Built SPA dashboards using React with Redux state management."),
        ("Node.js",        ["node", "nodejs", "express", "nest.js", "nestjs"],                              "Advanced",     85, "Developed RESTful APIs using Node.js and Express with JWT auth."),
        ("JavaScript",     ["javascript", "js", "typescript", "ts", "es6"],                                 "Advanced",     90, "Proficient in TypeScript, async/await patterns, and modern ES6+ features."),
        ("SQL",            ["sql", "postgres", "mysql", "database", "orm", "prisma", "sequelize"],          "Intermediate", 65, "Used Prisma ORM with PostgreSQL for full-stack web application data layer."),
        ("Cloud",          ["aws", "gcp", "azure", "vercel", "netlify", "heroku"],                          "Intermediate", 60, "Deployed full-stack apps on Vercel and AWS Elastic Beanstalk."),
        ("Docker",         ["docker", "containers", "dockerfile", "compose"],                               "Intermediate", 55, "Containerized applications using Docker for consistent environments."),
        ("Git",            ["git", "github", "version control", "ci/cd", "pull request"],                   "Advanced",     90, "Managed monorepo with GitHub Actions CI/CD pipeline for automated deploys."),
        ("CSS/Tailwind",   ["css", "tailwind", "scss", "styled-components", "bootstrap"],                   "Advanced",     88, "Styled responsive UIs with Tailwind CSS and custom design systems."),
        ("System Design",  ["system design", "microservices", "api", "rest", "graphql"],                    "Intermediate", 55, "Designed RESTful and GraphQL APIs for high-traffic product features."),
        ("Testing",        ["testing", "jest", "vitest", "cypress", "unit test", "integration test"],       "Intermediate", 55, "Wrote unit and integration tests using Jest achieving 80%+ code coverage."),
    ],
    "DevOps Engineer": [
        ("Cloud",          ["aws", "gcp", "azure", "ec2", "s3", "lambda", "cloud"],                         "Advanced",     90, "Architected multi-AZ AWS infrastructure with EC2, S3, and Lambda."),
        ("Docker",         ["docker", "containers", "dockerfile", "compose"],                               "Advanced",     88, "Containerized 15+ microservices using Docker with multi-stage builds."),
        ("Kubernetes",     ["kubernetes", "k8s", "helm", "kubectl", "pod", "deployment"],                   "Advanced",     85, "Managed production Kubernetes clusters with Helm chart deployments."),
        ("CI/CD",          ["ci/cd", "jenkins", "github actions", "gitlab ci", "pipeline", "circleci"],    "Advanced",     88, "Built GitHub Actions pipelines for zero-downtime blue-green deployments."),
        ("Terraform",      ["terraform", "iac", "infrastructure as code", "ansible"],                       "Intermediate", 65, "Provisioned AWS infrastructure with Terraform modules and remote state."),
        ("Linux",          ["linux", "bash", "shell", "unix", "scripting"],                                 "Advanced",     90, "Expert in Bash scripting, cron jobs, and Linux system administration."),
        ("Monitoring",     ["prometheus", "grafana", "cloudwatch", "datadog", "monitoring"],               "Intermediate", 60, "Configured Prometheus and Grafana dashboards for real-time monitoring."),
        ("Networking",     ["networking", "vpc", "dns", "load balancer", "nginx", "ssl"],                   "Intermediate", 60, "Configured VPCs, security groups, and NGINX reverse proxies on AWS."),
        ("Git",            ["git", "github", "version control", "branching"],                               "Advanced",     90, "Enforced GitFlow branching strategy across engineering teams."),
        ("Python",         ["python", "scripting", "automation", "boto3"],                                  "Intermediate", 65, "Automated AWS resource provisioning using Python Boto3 SDK."),
    ],
    "Data Engineer": [
        ("Python",         ["python", "pandas", "pyspark", "airflow", "etl"],                               "Advanced",     90, "Built ETL pipelines using PySpark and orchestrated with Apache Airflow."),
        ("SQL",            ["sql", "postgres", "mysql", "bigquery", "redshift", "snowflake"],               "Advanced",     88, "Designed star schema data warehouse with optimized BigQuery SQL transformations."),
        ("Spark",          ["spark", "apache spark", "pyspark", "databricks"],                              "Advanced",     85, "Processed 50M+ daily events using PySpark on Databricks with Delta Lake."),
        ("Cloud",          ["aws", "gcp", "azure", "s3", "bigquery", "redshift", "cloud"],                  "Advanced",     88, "Built GCP data lake with Cloud Storage, BigQuery, and Dataflow pipelines."),
        ("ETL",            ["etl", "data pipeline", "data engineering", "kafka", "flink"],                  "Advanced",     85, "Designed real-time ETL with Apache Kafka and Flink stream processing."),
        ("Docker",         ["docker", "kubernetes", "containers", "k8s"],                                   "Intermediate", 60, "Containerized Airflow DAGs using Docker for reproducible deployments."),
        ("Git",            ["git", "github", "version control", "dbt"],                                     "Advanced",     90, "Managed dbt transformation models in Git with automated CI/CD."),
        ("Generative AI",  ["llm", "openai", "langchain", "genai", "embedding"],                           "Beginner",     25, "Limited exposure to LLM-based data enrichment; needs hands-on practice."),
        ("Statistics",     ["statistics", "probability", "data quality", "anomaly"],                       "Intermediate", 60, "Applied anomaly detection algorithms for data quality monitoring."),
        ("Monitoring",     ["monitoring", "observability", "logging", "alerting", "sla"],                   "Intermediate", 55, "Set up Airflow SLA alerts and data pipeline observability dashboards."),
    ],
    "Cybersecurity Analyst": [
        ("Networking",          ["networking", "tcp/ip", "dns", "firewall", "vpn", "packet"],               "Advanced",     88, "Analyzed TCP/IP packet captures using Wireshark to identify intrusions."),
        ("Penetration Testing", ["penetration testing", "pen test", "metasploit", "nmap", "burp suite"],   "Advanced",     85, "Conducted external pen tests using Metasploit and Burp Suite."),
        ("SIEM",                ["siem", "splunk", "qradar", "elastic siem", "log analysis"],              "Intermediate", 65, "Configured Splunk dashboards for real-time threat detection."),
        ("Vulnerability Assessment", ["vulnerability", "nessus", "owasp", "cve", "cvss"],                  "Advanced",     85, "Performed OWASP Top-10 vulnerability assessments on web applications."),
        ("Cryptography",        ["cryptography", "encryption", "aes", "rsa", "ssl", "tls", "pki"],         "Intermediate", 60, "Implemented TLS certificate management and PKI infrastructure."),
        ("Linux",               ["linux", "bash", "kali", "shell", "command line"],                         "Advanced",     90, "Proficient in Kali Linux for offensive security testing and forensics."),
        ("Cloud Security",      ["aws security", "iam", "cloud security", "gcp security", "azure security"], "Intermediate", 60, "Configured AWS IAM least-privilege policies and GuardDuty alerting."),
        ("Incident Response",   ["incident response", "forensics", "malware", "threat hunting"],            "Intermediate", 65, "Conducted incident response for ransomware attack; isolated compromised hosts."),
        ("Python",              ["python", "scripting", "automation", "exploit"],                           "Intermediate", 60, "Wrote Python scripts to automate log parsing and threat indicator extraction."),
        ("Compliance",          ["compliance", "iso 27001", "gdpr", "nist", "soc 2"],                       "Beginner",     30, "Basic understanding of ISO 27001 and GDPR; needs audit experience."),
    ],
    "UI/UX Designer": [
        ("Figma",          ["figma", "design", "prototype", "component", "autolayout"],                     "Advanced",     92, "Designed end-to-end product flows in Figma with interactive prototypes."),
        ("UX Design",      ["ux", "user experience", "usability", "interaction design", "heuristic"],       "Advanced",     90, "Conducted heuristic evaluations; redesigned checkout flow reducing drop-off by 22%."),
        ("User Research",  ["user research", "interviews", "surveys", "usability testing", "personas"],     "Advanced",     88, "Ran moderated usability tests with 15 participants to identify pain points."),
        ("Wireframing",    ["wireframe", "sketch", "lo-fi", "hi-fi", "mockup"],                             "Advanced",     85, "Produced low and high-fidelity wireframes for mobile-first product redesign."),
        ("Design Systems", ["design system", "component library", "tokens", "style guide", "atomic"],       "Intermediate", 65, "Built atomic design system with 60+ reusable components in Figma."),
        ("CSS/Tailwind",   ["css", "tailwind", "html", "responsive", "animation"],                          "Intermediate", 60, "Collaborated with developers to implement pixel-perfect responsive layouts."),
        ("Accessibility",  ["accessibility", "wcag", "aria", "a11y", "screen reader"],                      "Intermediate", 55, "Applied WCAG 2.1 AA accessibility guidelines to mobile app redesign."),
        ("Data Analysis",  ["analytics", "metrics", "heatmap", "hotjar", "mixpanel", "conversion"],         "Intermediate", 55, "Used Hotjar heatmaps and Mixpanel funnels for data-informed design decisions."),
        ("Communication",  ["presentation", "stakeholder", "documentation", "handoff", "zeplin"],           "Advanced",     88, "Managed design handoff using Figma Inspect; presented to CPO and engineering leads."),
        ("A/B Testing",    ["a/b test", "experimentation", "variant", "hypothesis"],                         "Beginner",     30, "Participated in A/B test hypothesis design; needs stronger statistical foundation."),
    ],
}

DEFAULT_ROLE = "Data Analyst"

# ─────────────────────────────────────────────────────────────────────────────
# ROLE-SPECIFIC RECOMMENDATIONS
# ─────────────────────────────────────────────────────────────────────────────
ROLE_RECOMMENDATIONS: Dict[str, List[str]] = {
    "Data Analyst": [
        "Add verifiable Cloud deployment metrics (AWS S3/Lambda or GCP BigQuery) to increase ATS match by +14%.",
        "Quantify project business outcomes (e.g. 'reduced query latency by 38%' or 'optimized conversion by 14%').",
        "Include explicit DAX formulas or Power Query transformation steps in the Power BI portfolio description.",
        "Document end-to-end A/B experiment design (MDE, sample size, two-tailed p-value calculation).",
    ],
    "Software Engineer": [
        "Add LeetCode / competitive programming profile links to demonstrate DSA proficiency.",
        "Include system design details (load balancing, caching, DB indexing) for backend projects.",
        "Document Cloud deployment steps (EC2, Lambda, GKE) with performance benchmarks.",
        "Quantify code quality: test coverage %, PR review throughput, latency reductions.",
    ],
    "Machine Learning Engineer": [
        "Add MLflow experiment tracking or model registry setup to demonstrate MLOps maturity.",
        "Include model evaluation metrics (F1, AUC-ROC, RMSE) and baseline comparisons in projects.",
        "Document Cloud ML deployments (SageMaker, Vertex AI) with inference latency benchmarks.",
        "Showcase end-to-end pipeline: data ingestion → feature engineering → training → serving.",
    ],
    "Product Manager": [
        "Quantify product impact: DAU growth %, revenue uplift $, churn reduction % in project descriptions.",
        "Add A/B experiment results with statistical significance levels to demonstrate data-driven decisions.",
        "Include metrics like NPS improvement, task completion rate, and time-on-task from user research.",
        "Document GTM launch plans with measurable success criteria and post-launch retrospectives.",
    ],
    "Business Analyst": [
        "Add SQL query examples (CTEs, window functions) to demonstrate advanced data extraction skills.",
        "Quantify process improvement outcomes: time saved, error rate reduction, cost savings.",
        "Include BPMN diagrams or process map deliverables in your portfolio.",
        "Strengthen statistical skills with regression analysis or forecasting project evidence.",
    ],
    "Full Stack Developer": [
        "Add performance benchmarks: Lighthouse scores, load time reductions, API response times.",
        "Include Kubernetes/Docker orchestration details for production deployments.",
        "Document CI/CD pipeline setup with automated testing gates and code coverage thresholds.",
        "Showcase TypeScript strict mode usage and type safety patterns in codebases.",
    ],
    "DevOps Engineer": [
        "Add Terraform module count and infrastructure cost savings achieved through IaC.",
        "Include MTTR (Mean Time to Recovery) and uptime SLA percentages from production operations.",
        "Document Kubernetes cluster scaling metrics: node count, pod autoscaling configurations.",
        "Add security hardening practices: secret management (Vault/AWS SSM), network policies.",
    ],
    "Data Engineer": [
        "Add data volume metrics: records/day processed, pipeline SLA compliance percentages.",
        "Document dbt model lineage and data quality test coverage in transformation projects.",
        "Include streaming pipeline details (Kafka topics, partition design, consumer lag monitoring).",
        "Add data warehouse optimization: query cost savings, partition pruning strategies.",
    ],
    "Cybersecurity Analyst": [
        "Add CVE IDs or CVSS scores for vulnerabilities you discovered and remediated.",
        "Include incident response timeline metrics: MTTD (Mean Time to Detect), MTTR.",
        "Document compliance frameworks implemented: ISO 27001 controls, GDPR data mapping.",
        "Add certifications roadmap: CEH, OSCP, CompTIA Security+, or CISSP milestones.",
    ],
    "UI/UX Designer": [
        "Add measurable design impact: conversion rate uplift %, task completion improvement %.",
        "Include Figma Community links or portfolio URL showcasing design system components.",
        "Document accessibility audit results with WCAG 2.1 compliance levels achieved.",
        "Add A/B test results from design experiments with statistical significance evidence.",
    ],
}

def normalize_skill(skill_str: str) -> str:
    cleaned = skill_str.strip().lower()
    return SKILL_NORMALIZATION_MAP.get(cleaned, skill_str.strip())

# ─────────────────────────────────────────────────────────────────────────────
# ROLE-SPECIFIC SKILL IMPORTANCE WEIGHTS (module-level)
# Higher weight = skill matters more for ATS score in that role.
# A Data Analyst resume will score low for DevOps because it lacks
# Cloud/Docker/Kubernetes — the highest-weight DevOps skills.
# ─────────────────────────────────────────────────────────────────────────────
ROLE_TRACK_TEMPLATES: Dict[str, List[tuple]] = {
    "Data Analyst": [
        (1, "Statistics Fundamentals", "Descriptive & Inferential Statistics for Analytics", "Statistics"),
        (2, "Power BI & Data Modeling", "Power Query, Star Schema & Advanced DAX", "Power BI"),
        (3, "Advanced SQL Optimization", "CTEs, Window Functions & Execution Plans", "SQL"),
        (4, "GenAI for Analytics", "LLM Prompting, Tool Calling & Automated Insights", "Generative AI"),
    ],
    "Software Engineer": [
        (1, "Data Structures & Core Algorithms", "Tree Traversals, Graph BFS/DFS & Dynamic Programming", "Data Structures & Algorithms"),
        (2, "Java & Microservices Architecture", "Spring Boot RESTful APIs, Dependency Injection & Hibernate", "Java"),
        (3, "High-Scalability System Design", "Distributed Caching, Load Balancing & DB Sharding", "System Design"),
        (4, "Docker & Container Orchestration", "Multi-stage Dockerfiles, Compose & Cloud Deployments", "Docker"),
    ],
    "Machine Learning Engineer": [
        (1, "Feature Engineering & Model Evaluation", "Dimensionality Reduction, Cross-Validation & Metrics", "Machine Learning"),
        (2, "Deep Learning with PyTorch", "Neural Architectures, Autograd & Custom Training Loops", "Deep Learning"),
        (3, "MLOps & Experiment Tracking", "MLflow Registry, Hyperparameter Search & Serving Pipelines", "MLOps"),
        (4, "Generative AI & Transformer Models", "HuggingFace Transformers, BERT Embeddings & LLM Fine-Tuning", "Generative AI"),
    ],
    "DevOps Engineer": [
        (1, "Linux Administration & Bash Automation", "Kernel Tuning, Shell Scripting & System Health Diagnostics", "Linux"),
        (2, "Containerization with Docker", "Multi-Stage Docker Builds, Layer Optimization & Compose", "Docker"),
        (3, "Kubernetes Cluster Orchestration", "Pods, Deployments, Services, Helm Charts & Zero-Downtime Rollouts", "Kubernetes"),
        (4, "Infrastructure as Code & CI/CD", "Terraform Declarative Provisioning, Remote State & GitHub Actions", "Terraform"),
    ],
    "Data Engineer": [
        (1, "Advanced Warehousing & Schema Design", "Star Schemas, Partitioning, Window Functions & CTEs", "SQL"),
        (2, "Big Data Processing with PySpark", "Distributed DataFrames, RDD Operations & Delta Lake Storage", "Spark"),
        (3, "Cloud Data Lakehouse Architecture", "AWS S3 / GCP BigQuery Infrastructure & Object Storage Patterns", "Cloud"),
        (4, "Incremental ETL & Orchestration", "Apache Airflow DAGs, Change Data Capture & Data Quality Gates", "ETL"),
    ],
    "Product Manager": [
        (1, "Product Strategy & Roadmap Prioritization", "OKRs, North Star Metrics & RICE Scoring Framework", "Product Strategy"),
        (2, "User Research & Discovery", "User Persona Synthesis, Moderated Interviews & Usability Testing", "User Research"),
        (3, "A/B Testing & Statistical Rigor", "Sample Size Calculation, Minimum Detectable Effect & Hypotheses", "A/B Testing"),
        (4, "Product Analytics & Funnel Growth", "Cohort Retention Analysis, Funnel Drop-off & Feature Adoption", "Data Analytics"),
    ],
    "Business Analyst": [
        (1, "Requirements Analysis & BRD Authoring", "Business Requirement Documents, User Stories & Acceptance Criteria", "Requirements Analysis"),
        (2, "Operational SQL Data Extraction", "Multi-table Joins, Aggregations, CTEs & Financial Reporting", "SQL"),
        (3, "Process Mapping & BPMN Workflows", "As-is vs To-be Workflow Modeling & Process Bottleneck Elimination", "Process Mapping"),
        (4, "Executive Dashboarding & Visualization", "Power BI KPI Cards, Drill-through Reports & Stakeholder Presentation", "Data Visualization"),
    ],
    "Full Stack Developer": [
        (1, "Modern React & State Management", "Component Hooks, Context API, Redux Toolkit & Performance", "React"),
        (2, "Node.js REST API Backend", "Express Middleware, JWT Authentication, Async/Await Patterns", "Node.js"),
        (3, "Database Modeling & ORM Layer", "PostgreSQL Schema Normalization & Prisma / Sequelize ORM", "SQL"),
        (4, "Containerized Deployment & CI/CD", "Docker Compose Multi-Container Setup, Vercel & AWS Elastic Beanstalk", "Cloud"),
    ],
    "Cybersecurity Analyst": [
        (1, "Network Packet Analysis & TCP/IP", "Wireshark Packet Inspection, Protocol Handshakes & Firewall Rules", "Networking"),
        (2, "Vulnerability Assessment & OWASP", "OWASP Top 10 Scanning, Nessus Audits & Remediation Strategies", "Vulnerability Assessment"),
        (3, "Penetration Testing & Exploitation", "Burp Suite Proxy Inspection, Metasploit & Offensive Security", "Penetration Testing"),
        (4, "SIEM Threat Detection & Incident Response", "Splunk Log Analysis, Threat Indicator Extraction & Host Isolation", "SIEM"),
    ],
    "UI/UX Designer": [
        (1, "Figma Auto-Layout & Design Systems", "Responsive Component Architecture, Tokenization & Handoff Specs", "Figma"),
        (2, "UX Heuristics & User Research", "Nielsen Norman Group Heuristic Audit & Usability Test Protocols", "UX Design"),
        (3, "Wireframing & Interactive Prototyping", "Low/High Fidelity Wireframes, Screen Transitions & Micro-Interactions", "Wireframing"),
        (4, "Accessibility & Design Analytics", "WCAG 2.1 AA Compliance, Color Contrast & Hotjar Heatmap Analytics", "Accessibility"),
    ],
}

ROLE_SKILL_WEIGHTS: Dict[str, Dict[str, float]] = {
    "Data Analyst": {
        "Python": 0.95, "SQL": 1.0, "Excel": 0.88, "Power BI": 0.85,
        "Tableau": 0.78, "Statistics": 0.90, "Cloud": 0.75,
        "Generative AI": 0.72, "A/B Testing": 0.80, "Communication": 0.65,
    },
    "Software Engineer": {
        "Data Structures & Algorithms": 1.0, "Python": 0.90, "Java": 0.88,
        "JavaScript": 0.85, "System Design": 0.92, "Git": 0.80,
        "Cloud": 0.78, "Docker": 0.75, "SQL": 0.70, "Communication": 0.65,
    },
    "Machine Learning Engineer": {
        "Python": 0.95, "Machine Learning": 1.0, "Deep Learning": 0.92,
        "NLP": 0.88, "MLOps": 0.85, "Feature Engineering": 0.90,
        "SQL": 0.70, "Cloud": 0.78, "Generative AI": 0.82, "Statistics": 0.88,
    },
    "Product Manager": {
        "Product Strategy": 1.0, "User Research": 0.92, "A/B Testing": 0.88,
        "Data Analytics": 0.80, "Agile": 0.90, "Communication": 0.95,
        "Wireframing": 0.75, "Market Analysis": 0.82, "Go-to-Market": 0.85,
        "Technical Understanding": 0.70,
    },
    "Business Analyst": {
        "Requirements Analysis": 1.0, "SQL": 0.88, "Excel": 0.90,
        "Process Mapping": 0.85, "Data Visualization": 0.78,
        "Stakeholder Management": 0.92, "Agile": 0.75,
        "Statistics": 0.70, "Cloud": 0.60, "Communication": 0.88,
    },
    "Full Stack Developer": {
        "React": 0.95, "Node.js": 0.92, "JavaScript": 1.0,
        "SQL": 0.78, "Cloud": 0.80, "Docker": 0.75,
        "Git": 0.85, "CSS/Tailwind": 0.82, "System Design": 0.88, "Testing": 0.80,
    },
    "DevOps Engineer": {
        "Cloud": 1.0, "Docker": 0.95, "Kubernetes": 0.92,
        "CI/CD": 0.90, "Terraform": 0.85, "Linux": 0.88,
        "Monitoring": 0.80, "Networking": 0.78, "Git": 0.75, "Python": 0.70,
    },
    "Data Engineer": {
        "Python": 0.90, "SQL": 0.95, "Spark": 0.92,
        "Cloud": 0.88, "ETL": 1.0, "Docker": 0.78,
        "Git": 0.80, "Generative AI": 0.65, "Statistics": 0.72, "Monitoring": 0.75,
    },
    "Cybersecurity Analyst": {
        "Networking": 0.92, "Penetration Testing": 1.0, "SIEM": 0.88,
        "Vulnerability Assessment": 0.95, "Cryptography": 0.85,
        "Linux": 0.90, "Cloud Security": 0.82, "Incident Response": 0.88,
        "Python": 0.75, "Compliance": 0.78,
    },
    "UI/UX Designer": {
        "Figma": 1.0, "UX Design": 0.95, "User Research": 0.92,
        "Wireframing": 0.90, "Design Systems": 0.85, "CSS/Tailwind": 0.75,
        "Accessibility": 0.80, "Data Analysis": 0.70,
        "Communication": 0.88, "A/B Testing": 0.78,
    },
}

class SkillsBridgeAIEngine:
    """
    Intelligent AI Engine for Skills-Bridge.
    Combines rule-based NLP and semantic scoring with optional Gemini API upgrade.
    """

    def __init__(self):
        self.gemini_key = os.environ.get("GEMINI_API_KEY")
        self.client = None
        if self.gemini_key and genai:
            try:
                self.client = genai.Client(api_key=self.gemini_key)
            except Exception as e:
                print("Gemini client initialization warning:", e)
                self.client = None

    def extract_resume_skills(self, resume_text: str, target_role: str = "Data Analyst", is_custom_upload: bool = False) -> Dict[str, Any]:
        """
        Parses resume text, extracts skills with concrete quoted evidence, and computes ATS metrics.
        Skill catalog is dynamically selected per target_role (10 roles supported).
        ATS and all scores are fully role-aware and change meaningfully per role.
        """
        lower_text = resume_text.lower()

        def is_clean_sentence(snippet: str) -> bool:
            if not snippet or len(snippet.strip()) < 18:
                return False
            cleaned = snippet.strip()
            alpha_count = sum(1 for c in cleaned if c.isalpha() or c.isspace())
            if alpha_count / max(1, len(cleaned)) < 0.65:
                return False
            # Reject lines with non-ASCII or special binary-like characters
            if re.search(r'[^\x20-\x7E]', cleaned):
                return False
            if re.search(r'[^a-zA-Z0-9\s,.\'"\\-_:;()/%$#+@!&]{2,}', cleaned):
                return False
            return True

        # Dynamically pick skill catalog and importance weights for the selected role
        skill_catalog = ROLE_SKILL_CATALOGS.get(target_role, ROLE_SKILL_CATALOGS[DEFAULT_ROLE])
        role_weights = ROLE_SKILL_WEIGHTS.get(target_role, {})


        found_skills = []
        raw_lines = [line.strip("-•* \t\r") for line in resume_text.split("\n") if len(line.strip()) > 15]

        for skill_name, keywords, default_level, default_score, default_evidence in skill_catalog:
            matched = False
            extracted_snippet = ""
            matched_keyword_count = 0

            for kw in keywords:
                kw_regex = re.compile(r'\b' + re.escape(kw) + r'\b', re.IGNORECASE)
                if kw_regex.search(lower_text):
                    matched = True
                    matched_keyword_count += 1
                    if not extracted_snippet:
                        for line in raw_lines:
                            if kw_regex.search(line) and is_clean_sentence(line):
                                extracted_snippet = line.strip().replace("\t", " ")
                                if len(extracted_snippet) > 160:
                                    extracted_snippet = extracted_snippet[:157] + "..."
                                break

            # ── Initialize defaults to prevent uninitialized variable bugs ──
            level = "Missing"
            score = 10
            status = "Critical Gap"
            evidence = f"No evidence of {skill_name} found in resume for {target_role} role."

            if not is_custom_upload:
                # ── DEMO MODE: use predefined levels/scores based on keyword presence ──
                if matched:
                    level = default_level
                    score = default_score
                    evidence = default_evidence
                    status = "Mastered" if score >= 75 else ("Developing" if score >= 35 else "Critical Gap")
                # else: keeps defaults (Missing, score=10, Critical Gap)

            else:
                # ── CUSTOM UPLOAD: dynamically infer proficiency from resume context ──
                if matched:
                    # Use extracted snippet only if it's clean plain text (no binary garbage)
                    if extracted_snippet and is_clean_sentence(extracted_snippet):
                        evidence = f'"{extracted_snippet}"'
                    else:
                        evidence = f"{skill_name} detected in resume (keywords matched: {matched_keyword_count})."

                    action_verbs = ["built", "designed", "engineered", "pipeline", "developed",
                                    "deployed", "implemented", "architected", "created", "led",
                                    "managed", "optimized", "automated", "integrated", "launched"]
                    snippet_lower = (extracted_snippet or "").lower()
                    has_heavy_actions = any(v in snippet_lower for v in action_verbs)

                    # Score based on keyword breadth + action depth relative to role importance
                    keyword_ratio = matched_keyword_count / max(1, len(keywords))
                    role_weight = role_weights.get(skill_name, 0.75)

                    if has_heavy_actions and keyword_ratio >= 0.35:
                        level = "Advanced"
                        score = min(95, round(70 + keyword_ratio * 25 * role_weight))
                        status = "Mastered"
                    elif has_heavy_actions or keyword_ratio >= 0.25:
                        level = "Intermediate"
                        score = min(74, round(42 + keyword_ratio * 32 * role_weight))
                        status = "Developing"
                    else:
                        level = "Beginner"
                        score = min(44, round(18 + keyword_ratio * 26 * role_weight))
                        status = "Critical Gap"
                # else: keeps defaults (Missing, score=10, Critical Gap)

            # Enforce: Missing always = Critical Gap + capped low score
            if level == "Missing":
                status = "Critical Gap"
                score = min(score, 20)

            found_skills.append({
                "name": skill_name,
                "normalized": normalize_skill(skill_name),
                "level": level,
                "score": score,
                "evidence": evidence,
                "status": status,
                "role_importance": role_weights.get(skill_name, 0.75),
            })

        # ── Role-Aware ATS Score Calculation ─────────────────────────────────
        # Weight each skill's score by its role importance.
        # A Data Analyst resume against "DevOps Engineer" role will score lower
        # because it matches Cloud/Docker/Kubernetes poorly (high-weight DevOps skills).
        total_weight = sum(s["role_importance"] for s in found_skills)
        weighted_score_sum = sum(
            s["score"] * s["role_importance"] for s in found_skills
        )
        raw_ats = weighted_score_sum / max(1.0, total_weight)
        ats_score = min(97, max(28, round(raw_ats)))

        # ── Role-Aware Quality Score ──────────────────────────────────────────
        matched_count = sum(1 for s in found_skills if s["level"] != "Missing")
        total_skills = max(1, len(found_skills))
        match_ratio = matched_count / total_skills

        if not is_custom_upload:
            # Demo mode: quality reflects how well the demo profile fits this role
            quality_score = min(95, max(40, round(38 + (match_ratio * 57))))
        else:
            # Custom upload: quality = resume depth (line count) + role coverage
            depth_score = min(30, round((len(raw_lines) / 25) * 30))
            coverage_score = round(match_ratio * 52)
            quality_score = min(95, max(38, depth_score + coverage_score + 12))

        skill_evidence_score = round(sum(s["score"] for s in found_skills) / total_skills)

        # Role-specific recommendations
        recommendations = ROLE_RECOMMENDATIONS.get(target_role, ROLE_RECOMMENDATIONS[DEFAULT_ROLE])

        res_payload = {
            "ats_compatibility_score": ats_score,
            "resume_quality_score": quality_score,
            "skill_evidence_score": skill_evidence_score,
            "target_role": target_role,
            "extracted_skills": found_skills,
            "projects_found": 2 if not is_custom_upload else max(1, len([l for l in raw_lines if "project" in l.lower() or "built" in l.lower()])),
            "certifications_found": ["Coursera Python for Everybody", "Meta Database Engineer Specialization"],
            "education": "B.Tech in Artificial Intelligence & Machine Learning (3rd Year, 8.7 CGPA)",
            "experience_summary": "1 academic internship, 2 flagship enterprise-grade analytics projects",
            "recommendations": recommendations
        }
        return res_payload

    def sync_student_data_for_role(self, conn, user_id: str, target_role: str, extracted_skills: Optional[List[Dict[str, Any]]] = None):
        """
        Synchronizes student_profiles, student_skills, extra_tracks, and track_modules
        to dynamically match the active target role and extracted skill scores.
        """
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = OFF;")

        # 1. Update target_role in student_profiles
        cursor.execute("UPDATE student_profiles SET target_role = ? WHERE user_id = ?", (target_role, user_id))

        if not extracted_skills:
            # Generate extracted skills for target_role
            demo_res = self.extract_resume_skills(
                "Ashwin Kumar\nB.Tech in AI & ML\nSummary: Driven technologist experienced in Python, SQL, Cloud, and ML models.",
                target_role,
                is_custom_upload=False
            )
            extracted_skills = demo_res.get("extracted_skills", [])

        # 2. Sync student_skills table
        cursor.execute("DELETE FROM student_skills WHERE user_id = ?", (user_id,))
        for s in extracted_skills:
            name = s["name"]
            norm = s.get("normalized", name)
            level = s.get("level", "Beginner")
            score = s.get("score", 30)
            evidence = s.get("evidence", f"Evaluated for {target_role} role.")
            status = s.get("status", "Developing")

            cursor.execute("""
            INSERT INTO student_skills (
                user_id, skill_name, normalized_skill, proficiency_level, score,
                learn_score, practice_score, do_score, interview_score, mastery_percentage,
                evidence_summary, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                user_id, name, norm, level, score,
                score, max(10, score - 5), max(10, score - 10), max(10, score - 12), score,
                evidence, status
            ))

        # 3. Sync extra_tracks and track_modules
        cursor.execute("DELETE FROM track_modules WHERE track_id IN (SELECT id FROM extra_tracks WHERE user_id = ?)", (user_id,))
        cursor.execute("DELETE FROM extra_tracks WHERE user_id = ?", (user_id,))

        track_id = f"trk_{target_role.lower().replace(' ', '_')[:10]}_01"
        track_title = f"30-Day Accelerated {target_role} Extra Track"

        cursor.execute("""
        INSERT INTO extra_tracks (
            id, user_id, target_role, title, duration_weeks, total_modules, completed_modules, overall_progress, is_active
        ) VALUES (?, ?, ?, ?, 4, 12, 4, 33.3, 1);
        """, (track_id, user_id, target_role, track_title))

        template = ROLE_TRACK_TEMPLATES.get(target_role, ROLE_TRACK_TEMPLATES.get(DEFAULT_ROLE, ROLE_TRACK_TEMPLATES["Data Analyst"]))

        for w_num, theme, desc, skill_name in template:
            # LEARN module
            cursor.execute("""
            INSERT INTO track_modules (
                id, track_id, week_number, theme, type, title, description, associated_skill,
                estimated_minutes, is_completed, completed_at, content_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                f"mod_{track_id}_w{w_num}_l", track_id, w_num, theme, "LEARN",
                f"{skill_name} Concept Mastery", f"Master {skill_name} core mechanics: {desc}.",
                skill_name, 50, 1 if w_num == 1 else 0, "2026-09-01 10:00:00" if w_num == 1 else None,
                json.dumps({"skill": skill_name})
            ))

            # PRACTICE module
            cursor.execute("""
            INSERT INTO track_modules (
                id, track_id, week_number, theme, type, title, description, associated_skill,
                estimated_minutes, is_completed, completed_at, content_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                f"mod_{track_id}_w{w_num}_p", track_id, w_num, theme, "PRACTICE",
                f"{skill_name} Guided Code & Scenario Drills", f"Solve interactive challenges for {skill_name}.",
                skill_name, 60, 1 if w_num == 1 else 0, "2026-09-02 14:00:00" if w_num == 1 else None,
                json.dumps({"skill": skill_name})
            ))

            # DO module
            cursor.execute("""
            INSERT INTO track_modules (
                id, track_id, week_number, theme, type, title, description, associated_skill,
                estimated_minutes, is_completed, completed_at, content_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                f"mod_{track_id}_w{w_num}_d", track_id, w_num, theme, "DO",
                f"{skill_name} Capstone Project", f"Deliver an industry solution leveraging {skill_name}.",
                skill_name, 90, 0, None,
                json.dumps({"skill": skill_name})
            ))

        conn.commit()

    def calculate_skill_gaps(self, student_skills: List[Dict[str, Any]], market_demands: Dict[str, int], target_role: str = "Data Analyst") -> List[Dict[str, Any]]:
        """
        Applies formula: Gap Priority = min(100, round(Market Demand * (Gap / 100) * Role Importance * 1.35))
        """
        role_importance_weights = ROLE_SKILL_WEIGHTS.get(target_role, ROLE_SKILL_WEIGHTS.get(DEFAULT_ROLE, {}))

        gap_results = []
        for s in student_skills:
            skill_name = s.get("normalized_skill") or s.get("skill_name") or s.get("name")
            student_score = s.get("score", 0)
            m_demand = market_demands.get(skill_name, 65)
            importance = role_importance_weights.get(skill_name, 0.75)

            raw_gap = max(0, m_demand - student_score)
            priority = min(100, int(round((m_demand * (raw_gap / 100.0) * importance) * 1.35)))

            if priority >= 45:
                category = "Critical Gap" if priority >= 60 else "High Gap"
            elif priority >= 20:
                category = "Developing"
            else:
                category = "Strong"

            # Dynamic AI Explanation per role & category
            if category == "Critical Gap":
                explanation = f"Highest priority bottleneck for {target_role}: Market demand is {m_demand}%, but verified level is only {student_score}%. Closing this {raw_gap}-point gap is mandatory to pass ATS filters."
            elif category == "High Gap":
                explanation = f"High commercial impact for {target_role}: 60%+ of hiring teams evaluate {skill_name} in technical interviews. Your current gap is -{raw_gap} points."
            elif category == "Developing":
                explanation = f"Developing competency for {target_role}: You have foundational evidence ({student_score}%), but market benchmarks require deeper practical project proof ({m_demand}%)."
            else:
                explanation = f"Strong alignment: Your verified level of {student_score}% meets or exceeds the {target_role} hiring benchmark ({m_demand}%)."

            gap_results.append({
                "skill": skill_name,
                "student_score": student_score,
                "market_demand": m_demand,
                "raw_gap": raw_gap,
                "priority_score": priority,
                "category": category,
                "explanation": explanation
            })

        # Sort by priority descending
        gap_results.sort(key=lambda x: x["priority_score"], reverse=True)
        return gap_results

    def evaluate_practice_answer(self, challenge_type: str, user_answer: str, challenge: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates code / SQL / text submissions with diagnostic rubric.
        """
        ans_clean = user_answer.strip()
        ans_lower = ans_clean.lower()

        if challenge_type == "SQL":
            correctness = 85
            concept = 90
            efficiency = 88
            feedback = "Excellent query structure! You correctly utilized the INNER JOIN and aggregate SUM() with a grouped filter."

            if "limit 5" not in ans_lower and "fetch first 5" not in ans_lower:
                correctness -= 25
                feedback = "Query is missing the LIMIT 5 constraint to restrict to the top 5 customers."
            if "order by" not in ans_lower or "desc" not in ans_lower:
                correctness -= 25
                feedback = "Remember to sort by total expenditure in descending order (ORDER BY ... DESC)."
            if "completed" not in ans_lower:
                correctness -= 15
                feedback = "Remember to filter by order_status = 'COMPLETED'."

            total = int((correctness * 0.4) + (concept * 0.35) + (efficiency * 0.25))
            return {
                "score": total,
                "correctness_score": correctness,
                "concept_score": concept,
                "efficiency_score": efficiency,
                "feedback": feedback,
                "explanation": "Standard SQL aggregations require grouping non-aggregate columns and sorting aggregated metrics before limiting output rows."
            }

        elif challenge_type == "Python":
            correctness = 90
            concept = 92
            efficiency = 85
            feedback = "Clean Python implementation! Correctly computed IQR (Q3 - Q1) and applied 1.5 * IQR outlier boundary conditions."

            if "iqr" not in ans_lower and "percentile" not in ans_lower:
                correctness -= 35
                feedback = "Ensure you calculate the 25th and 75th percentiles to compute the Interquartile Range."

            total = int((correctness * 0.4) + (concept * 0.35) + (efficiency * 0.25))
            return {
                "score": total,
                "correctness_score": correctness,
                "concept_score": concept,
                "efficiency_score": efficiency,
                "feedback": feedback,
                "explanation": "Tukey's Fences method designates any observation outside [Q1 - 1.5*IQR, Q3 + 1.5*IQR] as an empirical outlier."
            }

        else: # MCQ or Scenario
            correct_opt = challenge.get("sample_data_json", {})
            if isinstance(correct_opt, str):
                try:
                    correct_opt = json.loads(correct_opt)
                except:
                    correct_opt = {}
            target_idx = correct_opt.get("correct_index", 1)
            is_correct = "decreases" in ans_lower or ans_lower.startswith("b") or ans_lower == str(target_idx)
            score = 100 if is_correct else 30

            return {
                "score": score,
                "correctness_score": score,
                "concept_score": score,
                "efficiency_score": 100 if is_correct else 40,
                "feedback": "Correct! As sample size increases, standard error diminishes, allowing smaller effect sizes to attain statistical significance." if is_correct else "Incorrect. Increased sample size decreases standard error, which decreases the Minimum Detectable Effect.",
                "explanation": "Statistical power: MDE is inversely proportional to the square root of sample size."
            }

    def evaluate_industry_project(self, submission_text: str, code_solution: str, repo_link: str) -> Dict[str, Any]:
        """
        Evaluates DO industry project across 6 dimensions.
        """
        tech_score = 88
        analysis_score = 86
        biz_score = 84
        prob_solving_score = 85
        comm_score = 82
        vis_score = 80

        # Heuristics based on submission depth
        combined = (submission_text + " " + code_solution).lower()
        if "rfm" in combined or "recency" in combined:
            analysis_score = min(96, analysis_score + 8)
        if "delay" in combined or "delivery" in combined:
            prob_solving_score = min(95, prob_solving_score + 10)
        if "retention" in combined or "churn" in combined:
            biz_score = min(92, biz_score + 6)
        if "cohort" in combined or "heatmap" in combined:
            vis_score = min(90, vis_score + 8)

        overall = int(round(
            (tech_score * 0.25) +
            (analysis_score * 0.20) +
            (biz_score * 0.20) +
            (prob_solving_score * 0.15) +
            (comm_score * 0.10) +
            (vis_score * 0.10)
        ))

        feedback = (
            "Outstanding practical submission! Your analysis correctly pinpointed that customer churn "
            "spikes by 3.2x when delivery delay exceeds 25 minutes in the QuickCart dataset. "
            "Your RFM categorization was rigorous, and the proposed segmented push-notification discount campaign is directly actionable."
        )

        return {
            "overall_score": overall,
            "technical_score": tech_score,
            "analysis_score": analysis_score,
            "business_score": biz_score,
            "problem_solving_score": prob_solving_score,
            "communication_score": comm_score,
            "visualization_score": vis_score,
            "feedback": feedback,
            "strengths": [
                "Discovered root cause link between logistics delay and 30-day churn",
                "Clean vectorized data aggregation in Python",
                "Actionable revenue-tier segmentation"
            ],
            "recommendations": [
                "Add 95% confidence intervals around retention cohort rates",
                "Implement automated alert threshold when daily delivery delays exceed 18 minutes"
            ]
        }

    def generate_interview_question(self, role: str, interview_type: str, turn_index: int, previous_score: Optional[int] = None) -> Dict[str, Any]:
        """
        Adaptive interview question generator.
        Adapts difficulty based on previous score and supports Project Defense.
        """
        questions_pool = {
            "Technical": [
                {
                    "q": "Explain the mechanical difference between an INNER JOIN and a LEFT JOIN in SQL. Under what business scenario would you explicitly choose a LEFT JOIN?",
                    "skill": "SQL",
                    "hint": "Think about retaining unmatched records from the primary entity, like all registered users whether they made a purchase or not."
                },
                {
                    "q": "What is the difference between ROW_NUMBER(), RANK(), and DENSE_RANK()? How would ties in revenue be handled by each?",
                    "skill": "SQL",
                    "hint": "Consider duplicate values and whether gaps appear in the sequence of ranking numbers."
                },
                {
                    "q": "In Python, how does the VertiPaq compression engine or Pandas categorical dtype optimize memory when processing large strings?",
                    "skill": "Python",
                    "hint": "Mention dictionary encoding and storing integer pointers instead of raw string bytes."
                },
                {
                    "q": "How would you design an A/B test to test a new checkout flow? How do you calculate sample size and avoid the peeking problem?",
                    "skill": "A/B Testing",
                    "hint": "Discuss statistical power, significance level alpha, and sequential testing adjustments."
                },
                {
                    "q": "Explain how CALCULATE in DAX transitions row context into filter context.",
                    "skill": "Power BI",
                    "hint": "Context transition happens when CALCULATE or CALCULATETABLE is invoked inside a row context."
                }
            ],
            "Project Defense": [
                {
                    "q": "In your 'E-commerce Product Growth Analytics Dashboard', what specific business problem were you solving, and how did you measure success?",
                    "skill": "Business Understanding",
                    "hint": "Mention the customer churn drop and how cohort retention was tracked."
                },
                {
                    "q": "Why did you select Streamlit for the visualization layer instead of building a custom React frontend or Tableau workbook? What were the latency trade-offs?",
                    "skill": "System Architecture",
                    "hint": "Talk about rapid Python prototyping, session state management, and memory limits."
                },
                {
                    "q": "In your 'AI-Powered Data Analyst Assistant', LLMs often hallucinate invalid table columns. How did you design your validation sandbox and prevent unsafe SQL injection?",
                    "skill": "Generative AI",
                    "hint": "Describe schema introspection, read-only transaction limits, and AST validation."
                },
                {
                    "q": "How did you handle missing values and return outliers in the 150K transactional logs? Did you impute or drop them, and what was the justification?",
                    "skill": "Data Cleaning",
                    "hint": "Differentiate between legitimate refunds and data entry anomalies."
                },
                {
                    "q": "If you had to scale your analytics pipeline to process 10 million transactions daily, what architecture changes would you introduce?",
                    "skill": "Cloud & Scalability",
                    "hint": "Consider migrating to Spark/Databricks, S3 staging, and columnar Parquet formats."
                }
            ],
            "Behavioral": [
                {
                    "q": "Tell me about a time when your analytical conclusions directly contradicted what a senior stakeholder expected. How did you communicate the findings?",
                    "skill": "Communication",
                    "hint": "Use the STAR method: Situation, Task, Action, and Result."
                },
                {
                    "q": "Describe a scenario where you received messy, unlabelled data with an impending deadline. How did you prioritize what to clean?",
                    "skill": "Problem Solving",
                    "hint": "Explain triage based on business impact."
                }
            ]
        }

        mode = interview_type if interview_type in questions_pool else "Technical"
        pool = questions_pool.get(mode, questions_pool["Technical"])

        # Adaptive selection
        idx = min(turn_index, len(pool) - 1)
        item = pool[idx]

        return {
            "question": item["q"],
            "expected_skill": item["skill"],
            "hint": item["hint"]
        }

    def evaluate_interview_answer(self, question: str, answer: str, expected_skill: str) -> Dict[str, Any]:
        """
        Evaluates single interview response.
        """
        ans = answer.strip()
        length = len(ans.split())

        if length < 8:
            return {
                "score": 45,
                "accuracy_score": 40,
                "relevance_score": 50,
                "communication_score": 45,
                "feedback": "Answer is too brief. Elaborate with specific technical mechanisms and a concrete business example.",
                "follow_up_hint": "Try stating the definition, the internal mechanism, and a practical industry use case."
            }

        # Substantive answer grading
        accuracy = 82
        relevance = 85
        comm = 80

        if length > 30:
            comm += 6
            relevance += 5
        if any(term in ans.lower() for term in ["example", "scenario", "because", "table", "result", "query", "user"]):
            accuracy += 6

        accuracy = min(96, accuracy)
        relevance = min(95, relevance)
        comm = min(92, comm)

        turn_score = int(round((accuracy * 0.45) + (relevance * 0.35) + (comm * 0.20)))

        return {
            "score": turn_score,
            "accuracy_score": accuracy,
            "relevance_score": relevance,
            "communication_score": comm,
            "feedback": f"Strong answer on {expected_skill}! Clear logical reasoning and good terminology. To elevate further, reference edge cases.",
            "follow_up_hint": "Well handled. Let's dig deeper into the architectural implications."
        }

    def generate_interview_report(self, turns: List[Dict[str, Any]], target_role: str) -> Dict[str, Any]:
        """
        Compiles final AI Mock Interview Report.
        """
        if not turns:
            return {"overall_score": 70}

        avg_score = int(sum(t.get("turn_score", 75) for t in turns) / len(turns))
        avg_acc = int(sum(t.get("accuracy_score", 75) for t in turns) / len(turns))
        avg_rel = int(sum(t.get("relevance_score", 75) for t in turns) / len(turns))
        avg_comm = int(sum(t.get("communication_score", 75) for t in turns) / len(turns))

        radar_data = [
            {"dimension": "Technical Knowledge", "score": avg_acc, "benchmark": 75},
            {"dimension": "Communication", "score": avg_comm, "benchmark": 70},
            {"dimension": "Problem Solving", "score": int((avg_score + avg_acc) / 2), "benchmark": 72},
            {"dimension": "Project Knowledge", "score": min(95, avg_score + 4), "benchmark": 68},
            {"dimension": "Confidence", "score": min(92, avg_comm + 3), "benchmark": 70},
            {"dimension": "HR Readiness", "score": min(90, avg_comm + 5), "benchmark": 75}
        ]

        strengths = [
            "Strong command of SQL joins, schema normalization, and window function logic",
            "Clear explanation of project architectural decisions and business trade-offs",
            "Confident communication with structured, logical explanations"
        ]

        weaknesses = [
            "Could strengthen explanations of Cloud infrastructure (GCP/AWS) deployment models",
            "Elaborate more on statistical sample sizing equations during A/B testing discussions"
        ]

        practice_recommendations = [
            "Complete Week 3 SQL Execution Plan challenges in Dynamic Extra Track",
            "Review DAX filter context transitions before company technical screens",
            "Practice defending project database indexing strategies"
        ]

        return {
            "overall_score": avg_score,
            "technical_score": avg_acc,
            "communication_score": avg_comm,
            "problem_solving_score": int((avg_score + avg_acc) / 2),
            "project_knowledge_score": min(95, avg_score + 4),
            "confidence_score": min(92, avg_comm + 3),
            "hr_readiness_score": min(90, avg_comm + 5),
            "radar_data": radar_data,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "practice_recommendations": practice_recommendations
        }

    def career_copilot_chat(self, user_query: str, student_profile: Dict[str, Any], skills: List[Dict[str, Any]]) -> str:
        """
        Answers student queries grounded in their live dashboard metrics and skills.
        Uses Gemini API when key is active, with deterministic fallback.
        """
        # Live Gemini API Generation
        if self.client:
            try:
                prompt = (
                    f"You are an expert AI Career Advisor for an EdTech placement bridge platform. "
                    f"Student Target Role: {student_profile.get('target_role', 'Data Analyst')}. "
                    f"Placement Readiness Score: {student_profile.get('placement_readiness', 78)}%. "
                    f"Student Verified Skills: {json.dumps([s.get('normalized_skill') or s.get('skill') for s in skills[:6]])}. "
                    f"Student Query: '{user_query}'. "
                    f"Provide a concise, encouraging, metric-backed answer (max 3 sentences) advising them on next steps."
                )
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                print("Live Gemini API generation exception:", e)

        # Deterministic Fallback Rules
        q = user_query.lower()

        if "power bi" in q or "powerbi" in q:
            return (
                "Your Power BI mastery is currently at 52% (Developing). While you understand basic reporting, "
                "76% of Data Analyst job postings require Star Schema modeling and DAX measures like CALCULATE and DATESYTD. "
                "I recommend completing Week 2 of your Extra Track: 'DAX Context Transition Challenges' to raise this to 75%+."
            )
        elif "learn this week" in q or "what should i learn" in q:
            return (
                "This week your priority should be Week 2 of your Dynamic Extra Track: 'Power BI & Data Modeling'. "
                "You have already mastered Week 1 Statistics Fundamentals. Concurrently, try the 'Top 5 Customers' SQL practice challenge."
            )
        elif "ready" in q or "placement readiness" in q:
            readiness = student_profile.get("placement_readiness", 78)
            return (
                f"Your overall Placement Readiness is at {readiness}%, which places you in the top 20% of your cohort! "
                "Your strongest pillars are Project Readiness (85%) and Market Alignment (82%). Your primary constraint is Interview Readiness (68%). "
                "Completing 1 more adaptive mock interview will likely push your readiness past 85%."
            )
        elif "trending" in q or "trend" in q:
            return (
                "In our latest scan across 112 job descriptions, Generative AI (+43%) and Cloud (+21%) are the fastest growing requirements for Data Analysts. "
                "Core requirements remain anchored by SQL (92%) and Python (86%)."
            )
        elif "resume" in q or "improve" in q:
            return (
                "Your resume scored 84/100 ATS compatibility. To improve it further: "
                "1. Add concrete Cloud technologies (e.g. AWS S3/GCP BigQuery). "
                "2. Explicitly mention A/B testing methodologies and sample size calculations. "
                "3. Quantify results with business dollar amounts or percentage improvements."
            )
        elif "sql" in q or "question" in q:
            return (
                "Here is a fast SQL interview question: 'Explain how DENSE_RANK differs from RANK when two customers have tied revenue of $10,000.' "
                "(Hint: DENSE_RANK does not skip rank numbers for the subsequent row, while RANK creates a gap!)"
            )
        else:
            return (
                f"Based on your profile as an aspiring {student_profile.get('target_role', 'Data Analyst')}, "
                "your highest impact milestone is completing your active Dynamic Extra Track. "
                "Would you like to review your critical skill gaps or launch an AI Mock Interview?"
            )

ai_engine = SkillsBridgeAIEngine()
