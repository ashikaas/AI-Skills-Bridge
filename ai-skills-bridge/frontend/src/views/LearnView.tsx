import React, { useState } from "react";
import { 
  BookOpen, Bot, Sparkles, CheckCircle2, Circle, ArrowRight, 
  ExternalLink, Code, Send, Loader2, AlertTriangle, ScanSearch
} from "lucide-react";
import { api } from "../services/api";
import { fireCelebrationConfetti } from "../components/Confetti";

// ─── Comprehensive topic library keyed by skill name ────────────────────────
const ALL_TOPICS = [
  {
    id: "sql_window",
    skill: "SQL",
    title: "Advanced SQL: Window Functions & Partitions",
    duration: "45 mins",
    overview: "Window functions perform calculations across a specific set of table rows that are related to the current row. Unlike GROUP BY, window functions retain individual row identities without collapsing results.",
    keyPoints: [
      "PARTITION BY divides rows into logical groups where the function calculates metrics independently.",
      "ORDER BY inside the OVER() clause defines the cumulative or sequential evaluation order.",
      "Common functions include ROW_NUMBER(), DENSE_RANK(), LAG(), LEAD(), and running SUM()."
    ],
    codeSnippet: `SELECT 
    employee_id, 
    department, 
    salary,
    DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank,
    AVG(salary) OVER (PARTITION BY department) as dept_avg_salary
FROM employees;`,
    resources: [
      { title: "PostgreSQL Official Tutorial: Window Functions", url: "https://www.postgresql.org/docs/current/tutorial-window.html" },
      { title: "Mode Analytics: Intermediate SQL Window Guide", url: "https://mode.com/sql-tutorial/sql-window-functions" }
    ]
  },
  {
    id: "python_pandas",
    skill: "Python",
    title: "Python for Data: Pandas & NumPy Mastery",
    duration: "50 mins",
    overview: "Pandas is the core library for data manipulation in Python. Understanding vectorized operations, groupby transforms, and merge strategies is essential for production data pipelines.",
    keyPoints: [
      "Use .groupby() with .agg() for multi-metric aggregations — avoid Python loops on DataFrames.",
      "pd.merge() supports inner, left, right, and outer joins mirroring SQL JOIN semantics.",
      "Always prefer vectorized NumPy operations over apply() for performance on large datasets."
    ],
    codeSnippet: `import pandas as pd

# Cohort retention analysis
df = pd.read_csv("transactions.csv")
cohort = df.groupby(["cohort_month", "order_month"]).agg(
    customers=("customer_id", "nunique"),
    revenue=("order_value", "sum")
).reset_index()
cohort["retention_rate"] = cohort["customers"] / cohort.groupby("cohort_month")["customers"].transform("first")`,
    resources: [
      { title: "Pandas Official User Guide", url: "https://pandas.pydata.org/docs/user_guide/index.html" },
      { title: "Real Python: Data Wrangling with Pandas", url: "https://realpython.com/pandas-dataframe/" }
    ]
  },
  {
    id: "power_bi_dax",
    skill: "Power BI",
    title: "Power BI: Star Schema & DAX Context Transition",
    duration: "55 mins",
    overview: "Context transition occurs when a row context is transformed into an equivalent filter context by invoking CALCULATE() or CALCULATETABLE(). This is the most crucial mental model for writing production DAX.",
    keyPoints: [
      "Filter context filters tables; row context iterates over rows one by one.",
      "CALCULATE evaluates its expression in an altered filter context modified by its arguments.",
      "Prefer Star Schemas with 1-to-many relationships to maximize VertiPaq engine columnar compression."
    ],
    codeSnippet: `Sales YTD = 
CALCULATE(
    [Total Revenue],
    DATESYTD('Calendar'[Date])
);`,
    resources: [
      { title: "SQLBI: Understanding Context Transition", url: "https://www.sqlbi.com/articles/understanding-context-transition/" },
      { title: "Microsoft Learn: DAX Basics in Power BI", url: "https://learn.microsoft.com/power-bi/transform-model/dax-basics" }
    ]
  },
  {
    id: "stats_hypothesis",
    skill: "Statistics",
    title: "Inferential Statistics: Hypothesis Testing & P-Values",
    duration: "50 mins",
    overview: "Hypothesis testing evaluates two mutually exclusive statements about a population to determine which statement is best supported by sample data. Essential for reliable A/B test decision making.",
    keyPoints: [
      "Null Hypothesis (H0) assumes no effect; Alternative Hypothesis (H1) assumes a genuine difference.",
      "The p-value is the probability of obtaining test results at least as extreme as observed data, assuming H0 is true.",
      "Standard threshold alpha is commonly 0.05 (5% risk of Type I false positive error)."
    ],
    codeSnippet: `from scipy import stats

t_stat, p_val = stats.ttest_ind(treatment_group, control_group)
if p_val < 0.05:
    print("Statistically significant difference detected (Reject H0)")`,
    resources: [
      { title: "StatQuest: P-values Clearly Explained", url: "https://statquest.org" },
      { title: "Khan Academy: Significance Tests", url: "https://www.khanacademy.org" }
    ]
  },
  {
    id: "cloud_fundamentals",
    skill: "Cloud",
    title: "Cloud Fundamentals: AWS/GCP Data Architecture",
    duration: "60 mins",
    overview: "Cloud platforms are the backbone of modern data infrastructure. Understanding storage (S3/GCS), compute (EC2/Cloud Run), and managed services (RDS/BigQuery) is non-negotiable for senior data roles.",
    keyPoints: [
      "S3/GCS object storage separates compute from storage — enabling elastic scaling without hardware management.",
      "Serverless functions (Lambda/Cloud Functions) handle event-driven ETL triggers without provisioning servers.",
      "Managed warehouses (BigQuery, Redshift) use columnar storage and massively parallel processing for analytics."
    ],
    codeSnippet: `import boto3

s3 = boto3.client("s3")
# Upload processed dataset to S3
s3.upload_file(
    "processed_data.parquet",
    "my-analytics-bucket",
    "processed/2024/data.parquet"
)
print("Upload successful — data available for BigQuery external table")`,
    resources: [
      { title: "AWS Cloud Practitioner Essentials (Free)", url: "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/" },
      { title: "Google Cloud: Data Engineering Path", url: "https://cloud.google.com/learn/training/data-engineering" }
    ]
  },
  {
    id: "ab_testing",
    skill: "A/B Testing",
    title: "A/B Testing: Experimental Design & Statistical Significance",
    duration: "45 mins",
    overview: "A/B testing is the gold standard for causal inference in product and marketing analytics. Correct experimental design prevents false positives that lead to bad product decisions.",
    keyPoints: [
      "Sample size calculation must be done before the experiment — running until p < 0.05 causes p-hacking.",
      "Novelty effects inflate short-term conversion rates; always run experiments for at least 2 full business cycles.",
      "Use Bonferroni correction when testing multiple variants simultaneously to control family-wise error rate."
    ],
    codeSnippet: `from scipy.stats import chi2_contingency
import numpy as np

# Conversion test: Control vs Variant
control = [1000, 120]   # [impressions, conversions]
variant = [1000, 155]

contingency = np.array([control, variant])
chi2, p_value, dof, expected = chi2_contingency(contingency)
print(f"p-value: {p_value:.4f} — {'Significant!' if p_value < 0.05 else 'Not significant'}") `,
    resources: [
      { title: "Evan Miller: A/B Test Sample Size Calculator", url: "https://www.evanmiller.org/ab-testing/sample-size.html" },
      { title: "Netflix Tech Blog: Experimentation Platform", url: "https://netflixtechblog.com/its-all-a-bout-testing-the-netflix-experimentation-platform-4e1ca458c15b" }
    ]
  },
  {
    id: "machine_learning",
    skill: "Machine Learning",
    title: "ML Fundamentals: Model Selection & Evaluation",
    duration: "55 mins",
    overview: "Choosing the right model and evaluating it correctly is more important than model complexity. The bias-variance tradeoff, cross-validation, and metric selection determine real-world ML success.",
    keyPoints: [
      "Always establish a baseline (majority class, mean prediction) before training any ML model.",
      "Use stratified k-fold cross-validation to ensure balanced class representation in every fold.",
      "For imbalanced datasets, prefer F1-score, AUC-ROC, or Precision-Recall curves over raw accuracy."
    ],
    codeSnippet: `from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.metrics import classification_report

clf = RandomForestClassifier(n_estimators=100, random_state=42)
cv_scores = cross_val_score(clf, X_train, y_train, cv=5, scoring="f1_weighted")
print(f"CV F1 Score: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")`,
    resources: [
      { title: "Scikit-learn: Model Evaluation Guide", url: "https://scikit-learn.org/stable/modules/model_evaluation.html" },
      { title: "StatQuest: Machine Learning Fundamentals", url: "https://www.youtube.com/@statquest" }
    ]
  },
  {
    id: "generative_ai",
    skill: "Generative AI",
    title: "GenAI for Analytics: Prompt Engineering & LLM Pipelines",
    duration: "50 mins",
    overview: "Generative AI is transforming analytics workflows — from text-to-SQL natural language querying to automated insight generation. Understanding prompt design and LLM integration is becoming a core analyst skill.",
    keyPoints: [
      "Few-shot prompting provides 2–5 solved examples in the prompt context to dramatically improve output accuracy.",
      "Chain-of-thought (CoT) prompting asks the model to 'think step by step', improving complex reasoning accuracy.",
      "Always implement output validation and human-in-the-loop review for production LLM pipelines."
    ],
    codeSnippet: `import google.generativeai as genai

model = genai.GenerativeModel("gemini-2.0-flash")

prompt = """
You are a SQL expert. Convert the business question to valid SQL.
Schema: orders(order_id, customer_id, product, revenue, date)

Question: What is the month-over-month revenue growth for each product?
SQL:"""

response = model.generate_content(prompt)
print(response.text)`,
    resources: [
      { title: "Google: Prompt Engineering Guide", url: "https://ai.google.dev/gemini-api/docs/prompting-intro" },
      { title: "DeepLearning.AI: Prompt Engineering for Developers", url: "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/" }
    ]
  },
  {
    id: "tableau_dashboards",
    skill: "Tableau",
    title: "Tableau: Dashboard Design & Calculated Fields",
    duration: "40 mins",
    overview: "Tableau is a leading BI tool used for interactive visual analytics. Mastering calculated fields, LOD expressions, and dashboard actions separates beginner from production-level analysts.",
    keyPoints: [
      "LOD (Level of Detail) expressions like FIXED allow computing aggregations at a different grain than the view.",
      "Dashboard actions — filter, highlight, and URL — connect sheets into interactive analytical narratives.",
      "Use container-based layouts instead of fixed pixel positions for responsive, presentation-ready dashboards."
    ],
    codeSnippet: `// Tableau Calculated Field: Customer Cohort Retention
{ FIXED [Cohort Month], [Order Month] : 
  COUNTD([Customer ID]) 
}
/
{ FIXED [Cohort Month] : 
  COUNTD([Customer ID]) 
}`,
    resources: [
      { title: "Tableau: LOD Expressions Deep Dive", url: "https://help.tableau.com/current/pro/desktop/en-us/calculations_calculatedfields_lod_overview.htm" },
      { title: "Tableau Public: Free Practice Datasets", url: "https://public.tableau.com/en-us/s/resources" }
    ]
  },
  {
    id: "etl_pipelines",
    skill: "ETL",
    title: "ETL Pipelines: Data Ingestion & Transformation Patterns",
    duration: "55 mins",
    overview: "ETL (Extract, Transform, Load) pipelines are the arteries of data infrastructure. Understanding orchestration, incremental loading, and data quality validation is foundational for data engineering roles.",
    keyPoints: [
      "Incremental loads (CDC — Change Data Capture) process only new/changed records, reducing compute costs 10–100x.",
      "Idempotency means running the same pipeline twice produces identical results — essential for safe retries.",
      "Data quality gates (null checks, range validation, referential integrity) should fail the pipeline, not silently pass bad data."
    ],
    codeSnippet: `# Apache Airflow DAG: Daily Incremental ETL
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

def extract_incremental(**context):
    execution_date = context["ds"]
    # Pull only new records since last run
    query = f"SELECT * FROM raw_events WHERE date = '{execution_date}'"
    return run_query(query)

with DAG("daily_etl", start_date=datetime(2024, 1, 1), schedule="@daily") as dag:
    extract = PythonOperator(task_id="extract", python_callable=extract_incremental)`,
    resources: [
      { title: "Apache Airflow: Official Tutorial", url: "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html" },
      { title: "dbt: Modern Data Transformation", url: "https://docs.getdbt.com/docs/introduction" }
    ]
  },
  {
    id: "docker_containers",
    skill: "Docker",
    title: "Docker: Containerization & Deployment Basics",
    duration: "45 mins",
    overview: "Docker containers package applications and their dependencies into portable, reproducible units. For data engineers and MLOps, containerization eliminates environment drift and enables consistent deployments.",
    keyPoints: [
      "A Dockerfile is a reproducible recipe — FROM sets the base image, RUN installs dependencies, CMD defines the entrypoint.",
      "Docker Compose orchestrates multi-container apps (e.g., API + database + Redis) with a single YAML file.",
      "Use multi-stage builds to keep production images lean — compile in a builder stage, copy artifacts to a minimal runtime."
    ],
    codeSnippet: `# Dockerfile: FastAPI ML model serving
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
    resources: [
      { title: "Docker: Getting Started Tutorial", url: "https://docs.docker.com/get-started/" },
      { title: "Play with Docker: Free Browser Lab", url: "https://labs.play-with-docker.com/" }
    ]
  },
  {
    id: "system_design",
    skill: "System Design",
    title: "System Design: Scalability & Architecture Patterns",
    duration: "65 mins",
    overview: "System design interviews test your ability to design large-scale distributed systems. Understanding CAP theorem, horizontal scaling, caching, and database sharding is essential for senior engineering roles.",
    keyPoints: [
      "Horizontal scaling (adding more servers) is preferred over vertical scaling (bigger servers) for fault tolerance.",
      "CDN (Content Delivery Network) reduces latency by serving static assets from geographically distributed edge nodes.",
      "Database read replicas offload SELECT queries from the primary write node, dramatically improving read throughput."
    ],
    codeSnippet: `# System Design: URL Shortener — Key Design Decisions
# 1. Hashing strategy: MD5(long_url)[:7] → 62^7 = 3.5T unique URLs
# 2. Database: Write to PostgreSQL, cache hot URLs in Redis (TTL=24h)  
# 3. Scaling: Horizontal API pods behind Load Balancer
# 4. Storage: 1M URLs/day × 500B = 500MB/day → S3 for cold archival

import hashlib, redis

cache = redis.Redis(host="redis", port=6379)

def shorten(long_url: str) -> str:
    short_code = hashlib.md5(long_url.encode()).hexdigest()[:7]
    cache.setex(short_code, 86400, long_url)  # Cache for 24h
    return f"https://short.ly/{short_code}"`,
    resources: [
      { title: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer" },
      { title: "ByteByteGo: System Design Newsletter", url: "https://blog.bytebytego.com/" }
    ]
  },
  {
    id: "excel_advanced",
    skill: "Excel",
    title: "Advanced Excel: Power Query & Pivot Analytics",
    duration: "40 mins",
    overview: "Excel remains the most widely used analytics tool in business. Power Query enables repeatable ETL inside Excel, while advanced pivot techniques allow multidimensional business analysis without SQL.",
    keyPoints: [
      "Power Query M-code lets you build repeatable, parameterized data transformation steps that refresh with one click.",
      "Pivot tables support multiple row/column groupings and calculated fields for ad-hoc multidimensional analysis.",
      "Dynamic arrays (SORT, FILTER, UNIQUE) introduced in Excel 365 eliminate the need for many VLOOKUP patterns."
    ],
    codeSnippet: `// Excel: Dynamic Sales Ranking with SORT + FILTER
=SORT(
  FILTER(
    SalesTable[[Region],[Product],[Revenue]],
    SalesTable[Revenue] > 10000
  ),
  3,    // Sort by Revenue column (3rd column)
  -1    // Descending
)`,
    resources: [
      { title: "Microsoft: Power Query Documentation", url: "https://learn.microsoft.com/en-us/power-query/" },
      { title: "ExcelJet: Formula Training", url: "https://exceljet.net/formulas" }
    ]
  },
  {
    id: "react_components",
    skill: "React",
    title: "React: Component Architecture & State Management",
    duration: "55 mins",
    overview: "React's component model and hooks enable building complex UIs from small, reusable pieces. Understanding the rendering lifecycle, state colocation, and context API is critical for production React apps.",
    keyPoints: [
      "Lift state only as high as necessary — keeping state close to where it's used reduces re-renders.",
      "useEffect with a dependency array controls when side effects run — empty [] = mount only, [dep] = on dep change.",
      "useMemo and useCallback prevent unnecessary recalculations and re-renders for expensive derived values."
    ],
    codeSnippet: `import { useState, useEffect, useMemo } from "react";

function SkillDashboard({ userId }: { userId: string }) {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    fetch(\`/api/skills/\${userId}\`)
      .then(r => r.json())
      .then(setSkills);
  }, [userId]); // Re-fetch only when userId changes

  const gapSkills = useMemo(
    () => skills.filter(s => s.score < 60),
    [skills] // Recompute only when skills changes
  );

  return <GapList gaps={gapSkills} />;
}`,
    resources: [
      { title: "React Official Docs: Thinking in React", url: "https://react.dev/learn/thinking-in-react" },
      { title: "Kent C. Dodds: State Colocation", url: "https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster" }
    ]
  },
  {
    id: "dsa_trees",
    skill: "Data Structures & Algorithms",
    title: "DSA: Trees, Graphs & Dynamic Programming",
    duration: "60 mins",
    overview: "Algorithmic problem solving forms the core of modern software engineering technical interviews. Tree traversals, BFS/DFS graph algorithms, and DP memoization patterns are essential.",
    keyPoints: [
      "Use BFS for shortest path in unweighted graphs; use DFS for topological sort and component exploration.",
      "Identify overlapping subproblems to transform exponential O(2^n) recursion into O(n) DP.",
      "Always analyze Time Complexity (Big-O) and Space Complexity during code defense."
    ],
    codeSnippet: `def maxPathSum(root):
    max_sum = float('-inf')
    def dfs(node):
        nonlocal max_sum
        if not node: return 0
        left = max(dfs(node.left), 0)
        right = max(dfs(node.right), 0)
        max_sum = max(max_sum, node.val + left + right)
        return node.val + max(left, right)
    dfs(root)
    return max_sum`,
    resources: [
      { title: "LeetCode Patterns & Solutions", url: "https://leetcode.com" },
      { title: "GeeksforGeeks: DSA Guide", url: "https://www.geeksforgeeks.org" }
    ]
  },
  {
    id: "deep_learning_pytorch",
    skill: "Deep Learning",
    title: "Deep Learning: PyTorch Neural Networks & Backprop",
    duration: "60 mins",
    overview: "PyTorch is the leading deep learning framework for production research and model development. Understanding autograd, custom Loss functions, and training loop optimization is vital for ML roles.",
    keyPoints: [
      "optimizer.zero_grad() must be called before loss.backward() to prevent gradient accumulation across batches.",
      "Use DataLoader with num_workers for parallel GPU memory streaming.",
      "Apply Learning Rate Schedulers (CosineAnnealing) to stabilize convergence on deep architectures."
    ],
    codeSnippet: `import torch
import torch.nn as nn

class ResNetBlock(nn.Module):
    def __init__(self, in_c, out_c):
        super().__init__()
        self.conv1 = nn.Conv2d(in_c, out_c, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(out_c)
        self.relu = nn.ReLU()
    def forward(self, x):
        return self.relu(self.bn1(self.conv1(x)) + x)`,
    resources: [
      { title: "PyTorch Official Tutorials", url: "https://pytorch.org/tutorials" },
      { title: "DeepLearning.AI: Deep Learning Specialization", url: "https://www.deeplearning.ai" }
    ]
  },
  {
    id: "mlops_architecture",
    skill: "MLOps",
    title: "MLOps: MLflow Model Tracking & Deployment",
    duration: "55 mins",
    overview: "MLOps bridges machine learning research and production software engineering. Tracking metrics, versioning datasets/models, and setting up automated CI/CD model pipelines ensures reliability.",
    keyPoints: [
      "Track hyperparameters, artifacts, and metrics for every training run using MLflow.",
      "Containerize model inference servers with FastAPI and Docker for auto-scaling.",
      "Monitor data drift and concept drift in production using Evidently AI alerts."
    ],
    codeSnippet: `import mlflow

mlflow.set_experiment("fraud_detection_v2")
with mlflow.start_run():
    mlflow.log_params({"n_estimators": 100, "max_depth": 10})
    mlflow.log_metric("f1_score", 0.942)
    mlflow.sklearn.log_model(model, "model")`,
    resources: [
      { title: "MLflow Official Documentation", url: "https://mlflow.org/docs/latest/index.html" },
      { title: "Full Stack Deep Learning MLOps", url: "https://fullstackdeeplearning.com" }
    ]
  },
  {
    id: "kubernetes_orchestration",
    skill: "Kubernetes",
    title: "Kubernetes: Container Orchestration & Helm Charts",
    duration: "65 mins",
    overview: "Kubernetes manages containerized workloads across multi-node clusters. Understanding Pods, Deployments, Services, Ingress controllers, and Helm charts is critical for DevOps and Cloud roles.",
    keyPoints: [
      "Deployments maintain target Pod counts and manage zero-downtime rolling updates.",
      "Services expose Pod endpoints via internal ClusterIP or external LoadBalancers.",
      "Helm charts package complex Kubernetes manifests into version-controlled templates."
    ],
    codeSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api
        image: myregistry/api:v2.1
        ports:
        - containerPort: 8080`,
    resources: [
      { title: "Kubernetes Official Documentation", url: "https://kubernetes.io/docs/home/" }
    ]
  },
  {
    id: "terraform_iac",
    skill: "Terraform",
    title: "Terraform: Infrastructure as Code (IaC) & State Management",
    duration: "50 mins",
    overview: "Terraform enables declarative cloud infrastructure provisioning across AWS, GCP, and Azure. Managing state files, modules, and plan execution prevents configuration drift.",
    keyPoints: [
      "Always store Terraform state in a remote bucket with S3 backend locking (DynamoDB).",
      "Use modules to encapsulate reusable infrastructure components like VPCs and DB clusters.",
      "Run terraform plan before applying to review diffs before mutating production infrastructure."
    ],
    codeSnippet: `resource "aws_s3_bucket" "data_lake" {
  bucket = "prod-analytics-lake-2025"
}
resource "aws_s3_bucket_versioning" "v" {
  bucket = aws_s3_bucket.data_lake.id
  versioning_configuration {
    status = "Enabled"
  }
}`,
    resources: [
      { title: "Terraform Official Documentation", url: "https://developer.hashicorp.com/terraform/docs" }
    ]
  },
  {
    id: "figma_ui_ux",
    skill: "Figma",
    title: "Figma: Auto-Layout & Design Systems",
    duration: "45 mins",
    overview: "Figma is the industry standard for UI/UX design. Auto-layout, component properties, and tokenized design systems permit rapid, responsive interface design for cross-functional handoff.",
    keyPoints: [
      "Auto-layout creates flexbox-like container alignment that adapts to screen resolutions automatically.",
      "Component variants group button states (default, hover, disabled) into single clean design assets.",
      "Define global design tokens for typography, color palettes, and elevation shadows."
    ],
    codeSnippet: `// Figma Design System Tokens (JSON Specification)
{
  "color": {
    "primary": { "value": "#2563EB" },
    "surface": { "value": "#0B0F19" }
  },
  "typography": {
    "heading-lg": { "fontSize": "24px", "fontWeight": "800" }
  }
}`,
    resources: [
      { title: "Figma Official Design Systems Guide", url: "https://www.figma.com/best-practices/guide-to-building-design-systems/" }
    ]
  },
  {
    id: "pentest_security",
    skill: "Penetration Testing",
    title: "Cybersecurity: Web App Pen Testing & OWASP Top 10",
    duration: "60 mins",
    overview: "Offensive security identifies vulnerabilities before malicious actors exploit them. Mastering OWASP Top 10 vulnerabilities (SQL Injection, XSS, CSRF) and Burp Suite analysis is key for security roles.",
    keyPoints: [
      "SQL Injection occurs when untrusted input concatenates into raw database commands.",
      "Cross-Site Scripting (XSS) injects arbitrary JavaScript into browser contexts — mitigate with Content Security Policies.",
      "Enforce least-privilege RBAC controls and sanitize all user input vectors."
    ],
    codeSnippet: `# Python Security Audit Script: Checking HTTP Security Headers
import requests

def audit_headers(url):
    r = requests.get(url)
    headers = r.headers
    security = ["Content-Security-Policy", "X-Frame-Options", "Strict-Transport-Security"]
    for h in security:
        print(f"{h}: {'PASS' if h in headers else 'FAIL (Missing Header)'}")`,
    resources: [
      { title: "OWASP Top 10 Security Risks", url: "https://owasp.org/www-project-top-ten/" }
    ]
  },
  {
    id: "product_strategy_pm",
    skill: "Product Strategy",
    title: "Product Strategy: Roadmap Prioritization & North Star Metrics",
    duration: "50 mins",
    overview: "Product Managers define product vision, align cross-functional engineering teams, and prioritize roadmaps using frameworks like RICE (Reach, Impact, Confidence, Effort).",
    keyPoints: [
      "The North Star Metric captures the core value delivered to users (e.g. Spotify: Listening Time).",
      "Use RICE scoring to evaluate feature requests objectively against resource constraints.",
      "Conduct continuous discovery user interviews to validate problems before building solutions."
    ],
    codeSnippet: `# RICE Score Calculation Formula
Reach = 10000    # Customers affected per quarter
Impact = 3       # Massive impact (3), High (2), Medium (1)
Confidence = 0.8 # 80% data-backed confidence
Effort = 2       # Person-months

RICE_Score = (Reach * Impact * Confidence) / Effort  # = 12,000`,
    resources: [
      { title: "Silicon Valley Product Group (SVPG)", url: "https://svpg.com/articles/" }
    ]
  }
];

interface LearnViewProps {
  gapSkills?: string[];
  onNavigate?: (view: string) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({ gapSkills = [], onNavigate }) => {
  const hasGapSkills = gapSkills.length > 0;

  // Sort topics so gap skills for analyzed target role appear first!
  const sortedTopics = React.useMemo(() => {
    if (gapSkills.length === 0) return ALL_TOPICS;
    const gapSet = new Set(gapSkills.map((s) => s.toLowerCase()));
    const gaps = ALL_TOPICS.filter((t) => gapSet.has(t.skill.toLowerCase()));
    const others = ALL_TOPICS.filter((t) => !gapSet.has(t.skill.toLowerCase()));
    return [...gaps, ...others];
  }, [gapSkills]);

  const [activeTopic, setActiveTopic] = useState(sortedTopics[0]?.id ?? "sql_window");
  const [isLearned, setIsLearned] = useState(false);
  const [tutorQuery, setTutorQuery] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorChat, setTutorChat] = useState<Array<{ sender: "user" | "tutor"; text: string }>>([
    {
      sender: "tutor",
      text: hasGapSkills
        ? `Hello! I'm your AI Concept Tutor. I've detected your resume has gaps in: ${gapSkills.slice(0, 3).join(", ")}${gapSkills.length > 3 ? " and more" : ""}. Ask me anything about these topics and I'll explain with simple analogies.`
        : "Hello! I am your AI Concept Tutor. Ask me any conceptual question about any lesson and I will explain it with simple visual analogies."
    }
  ]);

  // When gap skills change (new resume scan), reset to first gap topic
  React.useEffect(() => {
    if (sortedTopics.length > 0) {
      setActiveTopic(sortedTopics[0].id);
      setIsLearned(false);
    }
  }, [gapSkills.join(",")]);

  const currentTopic = sortedTopics.find((t) => t.id === activeTopic) || sortedTopics[0];
  const isCurrentTopicGap = gapSkills.some((g) => g.toLowerCase() === currentTopic?.skill.toLowerCase());

  const handleTutorAsk = async (promptQuery?: string) => {
    const q = promptQuery || tutorQuery;
    if (!q.trim() || tutorLoading) return;

    const userText = q.trim();
    setTutorQuery("");
    setTutorChat((prev) => [...prev, { sender: "user", text: userText }]);
    setTutorLoading(true);

    try {
      const res = await api.copilotChat(`Concept Tutor question on ${currentTopic.title}: ${userText}`);
      setTutorChat((prev) => [...prev, { sender: "tutor", text: res.reply }]);
    } catch {
      setTutorChat((prev) => [
        ...prev,
        {
          sender: "tutor",
          text: `In simple terms: ${currentTopic.keyPoints[0]} Think of it like a sliding window — each row inspects its peers without deleting them.`
        }
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  const handleToggleLearned = () => {
    setIsLearned(!isLearned);
    if (!isLearned) {
      fireCelebrationConfetti();
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Step 1 of 3: LEARN</span>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-medium border border-blue-500/30">
              Interactive Micro-Lessons
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Conceptual Mastery & AI Tutor</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Rigorous mental models and code examples, backed by an on-demand AI tutor.
          </p>
        </div>
      </div>

      {/* Resume-not-scanned prompt */}
      {!hasGapSkills && onNavigate && (
        <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ScanSearch className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Scan your resume to personalize lessons</p>
              <p className="text-xs text-slate-400 mt-0.5">Showing all available topics. Scan your resume to get your gap skills prioritized first.</p>
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

      {/* Personalization banner when gap skills are active */}
      {hasGapSkills && (
        <div className="p-3.5 bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-amber-300">Personalized for your resume</span>
            <span className="text-slate-400"> — showing your top gap skills first: </span>
            <span className="text-amber-200 font-semibold">{gapSkills.join(", ")}</span>
          </div>
        </div>
      )}

      {/* Topic tabs */}
      <div className="flex flex-wrap gap-2">
        {/* Gap skill tabs */}
        {hasGapSkills && (
          <>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider self-center mr-1">Your Gaps →</span>
            {sortedTopics
              .filter((t) => gapSkills.some((g) => g.toLowerCase() === t.skill.toLowerCase()))
              .map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTopic(t.id); setIsLearned(false); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeTopic === t.id
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-amber-900/40 text-amber-300 border border-amber-600/40 hover:bg-amber-800/50"
                  }`}
                >
                  <span>⚠</span>
                  {t.skill}
                </button>
              ))}
            <span className="text-[10px] text-slate-600 self-center mx-1">|</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider self-center mr-1">Other →</span>
          </>
        )}
        {/* Other / all tabs */}
        {sortedTopics
          .filter((t) => !hasGapSkills || !gapSkills.some((g) => g.toLowerCase() === t.skill.toLowerCase()))
          .map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTopic(t.id); setIsLearned(false); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTopic === t.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {t.skill}
            </button>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Lesson Content */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl space-y-5">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  {currentTopic.skill} • {currentTopic.duration}
                </span>
                {isCurrentTopicGap && (
                  <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    ⚠ GAP SKILL — Priority Learning
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">{currentTopic.title}</h2>
            </div>

            <button
              onClick={handleToggleLearned}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isLearned
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
              }`}
            >
              {isLearned ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Marked as Learned (+50 XP)</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  <span>Mark as Learned</span>
                </>
              )}
            </button>
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Core Concept</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{currentTopic.overview}</p>
          </div>

          {/* Key Points */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Key Takeaways</h3>
            <ul className="space-y-2">
              {currentTopic.keyPoints.map((pt, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Code Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-blue-400" />
                Implementation Syntax
              </span>
              <span className="font-mono text-[10px]">Copyable Example</span>
            </div>
            <pre className="p-3.5 bg-slate-950 rounded-xl text-xs font-mono text-blue-300 border border-slate-800 overflow-x-auto">
              <code>{currentTopic.codeSnippet}</code>
            </pre>
          </div>

          {/* Resource Cards */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Curated Resources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentTopic.resources.map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs text-slate-300 hover:text-white transition-all group"
                >
                  <span className="font-medium truncate pr-2">{res.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0" />
                </a>
              ))}
            </div>
          </div>

          {/* Next Step CTA after marking learned */}
          {isLearned && onNavigate && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between">
              <div className="text-xs text-emerald-300 font-semibold">
                ✓ Lesson complete! Ready to apply this skill?
              </div>
              <button
                onClick={() => onNavigate("practice")}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <span>Practice Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: AI Tutor Chat Drawer */}
        <div className="lg:col-span-5 glass-card p-5 rounded-2xl flex flex-col justify-between h-[580px]">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">AI Concept Tutor</h3>
                <p className="text-[10px] text-slate-400">Ask any clarifying question about this lesson</p>
              </div>
            </div>

            {/* Quick prompts */}
            <div className="pt-2 flex flex-wrap gap-1">
              <button
                onClick={() => handleTutorAsk("Explain this concept in simple terms for a beginner.")}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md border border-slate-700"
              >
                Explain simply
              </button>
              <button
                onClick={() => handleTutorAsk("What is a common real-world interview mistake with this?")}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-md border border-slate-700"
              >
                Common mistake?
              </button>
              {isCurrentTopicGap && (
                <button
                  onClick={() => handleTutorAsk(`How do I go from beginner to job-ready in ${currentTopic.skill} in 4 weeks?`)}
                  className="text-[10px] bg-amber-900/40 hover:bg-amber-800/50 text-amber-300 px-2 py-1 rounded-md border border-amber-600/40"
                >
                  4-week gap plan?
                </button>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {tutorChat.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 text-xs ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "tutor" && (
                  <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                  </div>
                )}
                <div
                  className={`p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                      : "bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {tutorLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>AI Tutor is drafting explanation...</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTutorAsk();
            }}
            className="pt-2 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={tutorQuery}
              onChange={(e) => setTutorQuery(e.target.value)}
              placeholder={isCurrentTopicGap ? `Ask about your ${currentTopic.skill} gap...` : "e.g. Why not use GROUP BY instead?"}
              className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={tutorLoading || !tutorQuery.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2 rounded-lg"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
