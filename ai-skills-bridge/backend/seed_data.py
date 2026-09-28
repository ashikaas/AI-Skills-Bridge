import json
import random
from database import get_db_connection, init_db

def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("PRAGMA foreign_keys = OFF;")

    cursor.execute("DELETE FROM users")
    cursor.execute("DELETE FROM student_profiles")
    cursor.execute("DELETE FROM student_skills")
    cursor.execute("DELETE FROM student_projects")
    cursor.execute("DELETE FROM job_descriptions")
    cursor.execute("DELETE FROM extra_tracks")
    cursor.execute("DELETE FROM track_modules")
    cursor.execute("DELETE FROM practice_challenges")
    cursor.execute("DELETE FROM practice_attempts")
    cursor.execute("DELETE FROM industry_challenges")
    cursor.execute("DELETE FROM challenge_submissions")
    cursor.execute("DELETE FROM mock_interviews")
    cursor.execute("DELETE FROM interview_turns")
    cursor.execute("DELETE FROM student_badges")
    cursor.execute("DELETE FROM notifications")
    cursor.execute("DELETE FROM tpo_interventions")
    cursor.execute("DELETE FROM cohort_students")

    # 1. Users
    cursor.execute("""
    INSERT INTO users (id, email, password, role, name, avatar_url) VALUES
    ('usr_student_1', 'student@skillsbridge.demo', 'student123', 'student', 'Ashwin Kumar', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
    ('usr_tpo_1', 'tpo@skillsbridge.demo', 'tpo123', 'tpo', 'Dr. Ramesh Sharma', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80');
    """)

    # 2. Student Profile
    cursor.execute("""
    INSERT INTO student_profiles (
        user_id, university, degree, branch, year, cgpa, target_role,
        preferred_industries, streak_days, xp_points, level,
        placement_readiness, market_alignment, skill_mastery, project_readiness, interview_readiness
    ) VALUES (
        'usr_student_1', 'Indian Institute of Technology & Management', 'B.Tech', 'Artificial Intelligence & Machine Learning', 3, 8.7,
        'Data Analyst',
        '["FinTech", "E-Commerce", "SaaS", "Healthcare"]',
        14, 3450, 7,
        78.0, 82.0, 76.0, 85.0, 68.0
    );
    """)

    # 3. Student Skills
    student_skills_data = [
        ('Python', 'Python', 'Advanced', 90, 95, 92, 90, 85, 90.8, 'Built an AI-powered data analysis assistant using Python, Pandas and Streamlit.', 'Mastered'),
        ('SQL', 'SQL', 'Advanced', 85, 90, 84, 88, 76, 85.2, 'Designed normalized multi-table schemas and complex window functions for e-commerce growth analytics.', 'Mastered'),
        ('Excel', 'Excel', 'Advanced', 88, 92, 88, 85, 80, 86.8, 'Created dynamic executive reporting dashboards with pivot tables, nested lookups, and macros.', 'Mastered'),
        ('Power BI', 'Power BI', 'Intermediate', 52, 70, 55, 48, 40, 52.1, 'Created basic sales visual reports with bar/line charts; DAX modeling and Power Query need improvement.', 'Developing'),
        ('Statistics', 'Statistics', 'Beginner', 34, 45, 35, 30, 25, 33.5, 'Understands mean, median, standard deviation; hypothesis testing and confidence intervals require practice.', 'Developing'),
        ('Cloud (AWS/GCP)', 'Cloud', 'Beginner', 10, 15, 10, 5, 10, 10.0, 'No formal production deployments or Cloud data pipeline experience in resume.', 'Critical Gap'),
        ('Generative AI', 'Generative AI', 'Beginner', 25, 35, 25, 20, 20, 24.5, 'Basic prompt experimentation with OpenAI API; lacks RAG architecture and prompt chaining experience.', 'Critical Gap'),
        ('A/B Testing', 'A/B Testing', 'Beginner', 20, 30, 20, 15, 15, 19.5, 'Theoretical familiarity with control vs treatment groups; no experimental design evidence.', 'Critical Gap'),
        ('Tableau', 'Tableau', 'Beginner', 28, 35, 30, 25, 20, 27.5, 'Basic exploratory sheets created during coursework; lacks calculated fields and parameters.', 'Developing'),
        ('Communication', 'Communication', 'Intermediate', 75, 80, 75, 70, 75, 74.0, 'Demonstrated across project presentations and technical documentation.', 'Mastered')
    ]

    for s in student_skills_data:
        cursor.execute("""
        INSERT INTO student_skills (
            user_id, skill_name, normalized_skill, proficiency_level, score,
            learn_score, practice_score, do_score, interview_score, mastery_percentage, evidence_summary, status
        ) VALUES ('usr_student_1', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, s)

    # 4. Student Projects
    projects_data = [
        (
            'usr_student_1',
            'E-commerce Product Growth Analytics Dashboard',
            'Engineered an end-to-end customer cohort retention pipeline processing 150K+ transactional records. Identified top churn factors and optimized conversion by 14%.',
            json.dumps(['Python', 'Pandas', 'SQL', 'Streamlit', 'Seaborn', 'PostgreSQL']),
            'https://github.com/ashwin-k/ecommerce-analytics-pipeline',
            'https://ecommerce-insights.demo.app',
            json.dumps([
                'Implemented RFM (Recency, Frequency, Monetary) segmentation',
                'Reduced query execution time by 38% using indexed materialized views',
                'Designed interactive retention heatmaps for executive review'
            ])
        ),
        (
            'usr_student_1',
            'AI-Powered Data Analyst Assistant',
            'Developed a generative AI assistant capable of converting natural language business questions into optimized SQL queries and instant interactive data visualizations.',
            json.dumps(['Python', 'LangChain', 'Streamlit', 'SQLite', 'OpenAI API', 'Plotly']),
            'https://github.com/ashwin-k/ai-data-analyst-assistant',
            'https://ai-analyst.demo.app',
            json.dumps([
                'Built few-shot prompt chaining system achieving 91% SQL accuracy',
                'Integrated automatic schema introspection and safety query sandbox',
                'Featured in University Tech Showcase 2025'
            ])
        )
    ]
    for p in projects_data:
        cursor.execute("""
        INSERT INTO student_projects (user_id, title, description, technologies, github_url, live_demo_url, highlights)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """, p)

    # 5. Seed Realistic Job Descriptions across all 10 target roles
    roles = [
        'Data Analyst', 'Software Engineer', 'Machine Learning Engineer', 'Product Manager',
        'Business Analyst', 'Full Stack Developer', 'DevOps Engineer', 'Data Engineer',
        'Cybersecurity Analyst', 'UI/UX Designer'
    ]
    companies = [
        'Razorpay', 'Flipkart', 'Swiggy', 'Zomato', 'PhonePe', 'Amazon India', 'Microsoft', 'Google',
        'CRED', 'Meesho', 'Zepto', 'InMobi', 'Jio Platforms', 'Infosys', 'TCS', 'Wipro',
        'Deloitte', 'EY India', 'PwC', 'KPMG', 'Accenture', 'Ola Mobility', 'Urban Company', 'Groww',
        'Paytm', 'MakeMyTrip', 'Nykaa', 'Licious', 'Postman', 'BrowserStack', 'Chargebee', 'Freshworks'
    ]
    locations = ['Bengaluru, Karnataka', 'Hyderabad, Telangana', 'Pune, Maharashtra', 'Mumbai, Maharashtra', 'Gurgaon, Haryana', 'Remote']
    industries = ['FinTech', 'E-Commerce', 'SaaS', 'EdTech', 'Quick Commerce', 'Logistics', 'Enterprise IT', 'Consulting']

    role_skill_pools = {
        'Data Analyst': ['SQL', 'Python', 'Excel', 'Power BI', 'Statistics', 'Tableau', 'Cloud', 'Generative AI', 'A/B Testing', 'Communication'],
        'Software Engineer': ['Data Structures & Algorithms', 'Python', 'Java', 'JavaScript', 'System Design', 'Git', 'Cloud', 'Docker', 'SQL', 'Communication'],
        'Machine Learning Engineer': ['Python', 'Machine Learning', 'Deep Learning', 'NLP', 'MLOps', 'Feature Engineering', 'SQL', 'Cloud', 'Generative AI', 'Statistics'],
        'Product Manager': ['Product Strategy', 'User Research', 'A/B Testing', 'Data Analytics', 'Agile', 'Communication', 'Wireframing', 'Market Analysis', 'Go-to-Market', 'Technical Understanding'],
        'Business Analyst': ['Requirements Analysis', 'SQL', 'Excel', 'Process Mapping', 'Data Visualization', 'Stakeholder Management', 'Agile', 'Statistics', 'Cloud', 'Communication'],
        'Full Stack Developer': ['React', 'Node.js', 'JavaScript', 'SQL', 'Cloud', 'Docker', 'Git', 'CSS/Tailwind', 'System Design', 'Testing'],
        'DevOps Engineer': ['Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux', 'Monitoring', 'Networking', 'Git', 'Python'],
        'Data Engineer': ['Python', 'SQL', 'Spark', 'Cloud', 'ETL', 'Docker', 'Git', 'Generative AI', 'Statistics', 'Monitoring'],
        'Cybersecurity Analyst': ['Networking', 'Penetration Testing', 'SIEM', 'Vulnerability Assessment', 'Cryptography', 'Linux', 'Cloud Security', 'Incident Response', 'Python', 'Compliance'],
        'UI/UX Designer': ['Figma', 'UX Design', 'User Research', 'Wireframing', 'Design Systems', 'CSS/Tailwind', 'Accessibility', 'Data Analysis', 'Communication', 'A/B Testing']
    }

    jd_count = 0
    for r_idx, role in enumerate(roles):
        pool = role_skill_pools[role]
        for c_idx in range(14):
            jd_count += 1
            company = companies[(r_idx * 4 + c_idx) % len(companies)]
            location = locations[(jd_count) % len(locations)]
            industry = industries[(jd_count) % len(industries)]
            exp_options = ['0-2 years (Entry/Fresher)', '1-3 years (Junior)', '2-4 years (Associate)', '3-5 years (Mid-Level)']
            exp = exp_options[c_idx % len(exp_options)]
            salary = f"Rs {random.randint(6, 18)},00,000 - Rs {random.randint(19, 32)},00,000 PA"

            req_skills = [pool[0], pool[1]]
            other_skills = random.sample(pool[2:], min(random.randint(3, 5), len(pool[2:])))
            all_req_skills = list(set(req_skills + other_skills))

            desc = f"{company} is hiring a {role} in our {industry} division ({location}). We are looking for talented problem-solvers to analyze mission-critical datasets, design analytical pipelines, and automate decision frameworks. Core tech requirements: {', '.join(all_req_skills)}."

            cursor.execute("""
            INSERT INTO job_descriptions (
                id, company, role, location, industry, experience_level, salary_range,
                skills_required, description, posted_days_ago
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                f"jd_{jd_count}", company, role, location, industry, exp, salary,
                json.dumps(all_req_skills), desc, random.randint(1, 45)
            ))

    # 6. Dynamic Extra Track for Ashwin
    cursor.execute("""
    INSERT INTO extra_tracks (
        id, user_id, target_role, title, duration_weeks, total_modules, completed_modules, overall_progress, is_active
    ) VALUES (
        'trk_da_01', 'usr_student_1', 'Data Analyst', '30-Day Accelerated Data Analyst Extra Track', 4, 12, 5, 41.6, 1
    );
    """)

    track_modules_data = [
        # Week 1
        ('mod_w1_l', 'trk_da_01', 1, 'Statistics Fundamentals', 'LEARN', 'Descriptive & Inferential Statistics for Analytics',
         'Master statistical metrics: Variance, Standard Deviation, Normal Distributions, Central Limit Theorem, and Pearson correlation.',
         'Statistics', 50, 1, '2026-08-28 10:30:00', json.dumps({
             'key_points': ['Variance measures data dispersion; Standard deviation brings it back to original units.', 'Central Limit Theorem enables sampling inferences on large datasets.', 'Correlation does not imply causation; always inspect scatter plots.'],
             'code_snippet': 'import numpy as np\nimport scipy.stats as stats\nz_score = (x - np.mean(arr)) / np.std(arr)',
             'resources': [{'title': 'Khan Academy Statistics', 'url': 'https://khanacademy.org'}, {'title': 'StatQuest', 'url': 'https://statquest.org'}]
         })),
        ('mod_w1_p', 'trk_da_01', 1, 'Statistics Fundamentals', 'PRACTICE', 'Hypothesis Testing & Distribution Drill',
         'Solve 15 probability drills and 2 business hypothesis testing scenarios with confidence interval calculations.',
         'Statistics', 60, 1, '2026-08-30 14:15:00', json.dumps({'total_questions': 15, 'score_achieved': 86})),
        ('mod_w1_d', 'trk_da_01', 1, 'Statistics Fundamentals', 'DO', 'E-commerce Purchase Probability Model',
         'Analyze a retail transaction log, calculate conversion rates across customer age brackets, and run Chi-Square test.',
         'Statistics', 90, 1, '2026-09-01 18:40:00', json.dumps({'dataset': 'retail_sample.csv', 'status': 'Verified by AI Grader'})),

        # Week 2
        ('mod_w2_l', 'trk_da_01', 2, 'Power BI & Data Modeling', 'LEARN', 'Power Query, Star Schema & Advanced DAX',
         'Learn M-Code transformations, 1-to-Many star schema relationships, CALCULATE, FILTER, and Time Intelligence functions.',
         'Power BI', 55, 1, '2026-09-03 11:20:00', json.dumps({
             'key_points': ['Always prefer Star Schema over Snowflake schema for optimal VertiPaq engine compression.', 'CALCULATE modifies the active filter context of any calculation.', 'Never use RELATED without an established 1-to-many relationship.'],
             'code_snippet': 'Total Sales YTD = CALCULATE([Total Revenue], DATESYTD(DateTable[Date]))',
             'resources': [{'title': 'SQLBI DAX Guide', 'url': 'https://dax.guide'}]
         })),
        ('mod_w2_p', 'trk_da_01', 2, 'Power BI & Data Modeling', 'PRACTICE', 'DAX Context Transition Challenges',
         'Complete 10 hands-on DAX challenges calculating YOY growth, customer churn rates, and dynamic rolling 30-day averages.',
         'Power BI', 65, 1, '2026-09-05 16:00:00', json.dumps({'challenges_count': 10, 'score_achieved': 78})),
        ('mod_w2_d', 'trk_da_01', 2, 'Power BI & Data Modeling', 'DO', 'Executive Sales & Margin Dashboard',
         'Construct a multi-page interactive executive report with drill-through parameters, tooltips, and KPI cards.',
         'Power BI', 120, 0, None, json.dumps({'dataset': 'global_sales_2025.pbix', 'status': 'In Progress'})),

        # Week 3
        ('mod_w3_l', 'trk_da_01', 3, 'Advanced SQL Optimization', 'LEARN', 'CTEs, Window Functions & Execution Plans',
         'Deep dive into ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG/LEAD, recursive CTEs, and index scan strategies.',
         'SQL', 45, 0, None, json.dumps({
             'key_points': ['Window functions calculate metrics across row sets without collapsing rows like GROUP BY does.', 'Use EXPLAIN ANALYZE to identify sequential table scans vs index seeks.'],
             'code_snippet': 'SELECT customer_id, DENSE_RANK() OVER (PARTITION BY region ORDER BY revenue DESC) as rank FROM sales;',
             'resources': [{'title': 'PostgreSQL Window Functions', 'url': 'https://postgresql.org'}]
         })),
        ('mod_w3_p', 'trk_da_01', 3, 'Advanced SQL Optimization', 'PRACTICE', 'LeetCode/HackerRank Style SQL Mastery',
         'Solve 12 complex SQL challenges involving running totals, cohort retention matrices, and top-N grouped queries.',
         'SQL', 60, 0, None, json.dumps({'total_challenges': 12, 'status': 'Pending'})),
        ('mod_w3_d', 'trk_da_01', 3, 'Advanced SQL Optimization', 'DO', 'SaaS Churn & Cohort Retention Engine',
         'Write a production-grade SQL script generating monthly active customer cohort retention curves from raw event streams.',
         'SQL', 90, 0, None, json.dumps({'dataset': 'saas_events.sql', 'status': 'Pending'})),

        # Week 4
        ('mod_w4_l', 'trk_da_01', 4, 'GenAI for Analytics', 'LEARN', 'LLM Prompting, Tool Calling & Automated Insights',
         'Learn how to leverage LLMs for automated narrative generation, data cleaning heuristics, and semantic SQL generation.',
         'Generative AI', 50, 0, None, json.dumps({
             'key_points': ['System prompts set boundary rules and schema constraints for safe SQL generation.', 'Few-shot examples dramatically eliminate hallucinations on complex domain metrics.'],
             'code_snippet': 'client.models.generate_content(model="gemini-2.5-flash", contents=prompt)',
             'resources': [{'title': 'Gemini API Cookbook', 'url': 'https://ai.google.dev'}]
         })),
        ('mod_w4_p', 'trk_da_01', 4, 'GenAI for Analytics', 'PRACTICE', 'Few-Shot Text-to-SQL Prompt Engineering',
         'Test prompts against 10 ambiguous stakeholder requests and score generated SQL validity and precision.',
         'Generative AI', 60, 0, None, json.dumps({'challenges_count': 10, 'status': 'Pending'})),
        ('mod_w4_d', 'trk_da_01', 4, 'GenAI for Analytics', 'DO', 'Build an AI Executive Briefing Agent',
         'Develop a Python script integrating an LLM to automatically scan daily revenue logs and deliver an anomaly report.',
         'Generative AI', 100, 0, None, json.dumps({'status': 'Pending'}))
    ]

    for m in track_modules_data:
        cursor.execute("""
        INSERT INTO track_modules (
            id, track_id, week_number, theme, type, title, description, associated_skill,
            estimated_minutes, is_completed, completed_at, content_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, m)

    # 7. Practice Challenges
    challenges = [
        (
            'prac_sql_01', 'Top 5 Customers by Total Revenue', 'SQL', 'Medium', 'SQL',
            'Write a SQL query to return the top 5 customers (customer_id, customer_name, total_spent) who spent the highest cumulative amount across all orders with status "COMPLETED". Order by total_spent descending.',
            'SELECT c.customer_id, c.customer_name, SUM(o.order_amount) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.order_status = "COMPLETED" GROUP BY c.customer_id, c.customer_name ORDER BY total_spent DESC LIMIT 5;',
            json.dumps([
                {'customer_id': 101, 'name': 'Aditi Rao', 'spent': 45200},
                {'customer_id': 104, 'name': 'Rahul Verma', 'spent': 38900},
                {'customer_id': 109, 'name': 'Neha Patel', 'spent': 32400}
            ]),
            'GROUP BY with aggregated SUM(), JOIN with filter on order_status, and ORDER BY LIMIT.',
            json.dumps(['Use INNER JOIN between customers and orders', 'Filter WHERE order_status = "COMPLETED" before grouping', 'Order by SUM(order_amount) DESC and LIMIT 5'])
        ),
        (
            'prac_sql_02', 'Monthly Customer Retention Window Function', 'SQL', 'Hard', 'SQL',
            'Given an `orders` table (order_id, customer_id, order_date, amount), write a query using a window function to calculate the date of the customer previous order and days elapsed between consecutive purchases.',
            'SELECT customer_id, order_id, order_date, LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) as prev_order_date FROM orders;',
            json.dumps([]),
            'LAG() window function partitioned by customer_id and ordered by order_date.',
            json.dumps(['Use LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)', 'Subtract LAG from order_date'])
        ),
        (
            'prac_py_01', 'Detecting Outliers using Interquartile Range (IQR)', 'Python', 'Medium', 'Python',
            'Write a Python function find_outliers(data: list[float]) -> list[float] that identifies and returns all values that lie outside 1.5 * IQR from Q1 and Q3.',
            'def find_outliers(data):\n    q75, q25 = np.percentile(data, [75, 25])\n    iqr = q75 - q25\n    return [x for x in data if x < q25 - 1.5*iqr or x > q75 + 1.5*iqr]',
            json.dumps([12, 14, 15, 16, 17, 18, 19, 95, 2, 14, 16]),
            'Percentile calculation (Q1, Q3), IQR formula, and conditional list comprehension.',
            json.dumps(['Calculate 25th and 75th percentiles', 'IQR = Q3 - Q1', 'Outliers are outside [Q1 - 1.5*IQR, Q3 + 1.5*IQR]'])
        ),
        (
            'prac_mcq_01', 'A/B Test Minimum Detectable Effect', 'A/B Testing', 'Easy', 'MCQ',
            'If you increase the sample size in an A/B experiment while keeping significance level (alpha) and statistical power (1-beta) constant, what happens to the Minimum Detectable Effect (MDE)?',
            'The Minimum Detectable Effect decreases, allowing you to detect smaller percentage changes.',
            json.dumps({
                'options': [
                    'The Minimum Detectable Effect increases.',
                    'The Minimum Detectable Effect decreases, allowing detection of smaller differences.',
                    'The MDE remains completely unchanged.',
                    'The p-value automatically collapses to zero.'
                ],
                'correct_index': 1
            }),
            'Statistical power formulas: sample size is inversely proportional to square of MDE.',
            json.dumps(['Larger samples reduce standard error', 'Smaller standard error enables finding subtle shifts with high statistical confidence'])
        ),
        (
            'prac_dsa_01', 'Binary Tree Lowest Common Ancestor', 'Data Structures & Algorithms', 'Hard', 'Python',
            'Write a Python function lowest_common_ancestor(root, p, q) that returns the Lowest Common Ancestor (LCA) node of two given nodes in a Binary Tree.',
            'def lowest_common_ancestor(root, p, q):\n    if not root or root == p or root == q:\n        return root\n    left = lowest_common_ancestor(root.left, p, q)\n    right = lowest_common_ancestor(root.right, p, q)\n    return root if (left and right) else (left or right)',
            json.dumps([]),
            'Recursive tree post-order traversal returning matched nodes.',
            json.dumps(['If current node is p or q or null, return current node', 'Recursively search left and right subtrees', 'If both left and right return non-null, root is LCA'])
        ),
        (
            'prac_docker_01', 'Multi-Stage Production Dockerfile', 'Docker', 'Medium', 'Docker',
            'Write a production-grade multi-stage Dockerfile for a FastAPI Python backend that minimizes container size by compiling dependencies in a builder stage and copying only runtime files.',
            'FROM python:3.12-slim AS builder\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\nFROM python:3.12-slim\nWORKDIR /app\nCOPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12\nCOPY . .\nCMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]',
            json.dumps([]),
            'Multi-stage Docker build pattern for lean production images.',
            json.dumps(['Use AS builder to define build stage', 'Copy installed site-packages to minimal runtime image', 'Set CMD to run uvicorn server'])
        ),
        (
            'prac_k8s_01', 'Kubernetes Deployment Rolling Update', 'Kubernetes', 'Hard', 'YAML',
            'Write a Kubernetes Deployment manifest with maxSurge=1 and maxUnavailable=0 to guarantee zero-downtime rolling upgrades.',
            'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: payment-service\nspec:\n  replicas: 4\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxSurge: 1\n      maxUnavailable: 0\n  selector:\n    matchLabels:\n      app: payment',
            json.dumps([]),
            'Declarative deployment strategies for zero-downtime microservices.',
            json.dumps(['Define strategy type as RollingUpdate', 'Set maxUnavailable to 0 to prevent capacity drop during deployment'])
        ),
        (
            'prac_dl_01', 'PyTorch Focal Loss for Class Imbalance', 'Deep Learning', 'Hard', 'Python',
            'Implement a Focal Loss class in PyTorch to handle extreme class imbalance in object detection tasks.',
            'import torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n\nclass FocalLoss(nn.Module):\n    def __init__(self, alpha=0.25, gamma=2.0):\n        super().__init__()\n        self.alpha = alpha\n        self.gamma = gamma\n    def forward(self, inputs, targets):\n        bce = F.binary_cross_entropy_with_logits(inputs, targets, reduction="none")\n        pt = torch.exp(-bce)\n        focal_loss = self.alpha * (1 - pt)**self.gamma * bce\n        return focal_loss.mean()',
            json.dumps([]),
            'Modulating factor (1 - pt)^gamma down-weights easy examples and focuses training on hard negative examples.',
            json.dumps(['Compute BCE loss without reduction', 'Calculate pt = exp(-bce)', 'Scale by alpha * (1 - pt)^gamma'])
        ),
        (
            'prac_pm_01', 'RICE Framework Feature Prioritization', 'Product Strategy', 'Medium', 'Python',
            'Write a Python function calculate_rice_score(reach: int, impact: float, confidence: float, effort: float) -> float that outputs the RICE priority score.',
            'def calculate_rice_score(reach, impact, confidence, effort):\n    if effort <= 0: return 0.0\n    return round((reach * impact * confidence) / effort, 2)',
            json.dumps([]),
            'Standard Product Management RICE framework: (Reach * Impact * Confidence) / Effort.',
            json.dumps(['Reach = users affected', 'Impact = quantitative value (3=massive, 2=high, 1=medium)', 'Confidence = percentage (e.g. 0.8)', 'Effort = person-months'])
        )
    ]

    for ch in challenges:
        cursor.execute("""
        INSERT INTO practice_challenges (
            id, title, skill, difficulty, type, prompt, starter_code, sample_data_json, expected_concept, hints
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, ch)

    # 8. Industry Challenges (DO Projects across all 10 roles)
    ind_projects = [
        (
            'proj_ind_01',
            'E-commerce Customer Retention & Lifetime Value (LTV) Optimization',
            'Quick Commerce / Retail',
            'Data Analyst',
            'You are the Lead Growth Analyst at QuickCart, a high-growth grocery delivery startup. The VP of Growth has noticed a 22% drop in 30-day repeat purchase rates over Q3. Your objective is to ingest transaction logs, clean irregularities, segment users by RFM tiers, and identify the root cause of churn.',
            '["1. Data Cleaning: Handle missing values, outliers, and invalid negative return amounts.", "2. Cohort Analysis: Build a triangular monthly retention matrix from January to September.", "3. RFM Segmentation: Score customers from 1 to 5 on Recency, Frequency, and Monetary value.", "4. Business Insights: Identify the highest churn category and recommend targeted retention campaigns."]',
            'Synthetic transactional dataset containing 2,500 customer order records.',
            '[{"order_id": "ORD-1092", "customer_id": "CUST-441", "category": "Dairy & Produce", "order_value": 450.0, "delivery_delay_mins": 4, "is_churned": 0}, {"order_id": "ORD-1093", "customer_id": "CUST-891", "category": "Snacks & Beverages", "order_value": 1280.0, "delivery_delay_mins": 35, "is_churned": 1}, {"order_id": "ORD-1094", "customer_id": "CUST-104", "category": "Personal Care", "order_value": 720.0, "delivery_delay_mins": 12, "is_churned": 0}]',
            '{"technical": {"weight": 25, "desc": "Correctness of SQL/Python aggregations, window functions, and data cleanliness"}, "analysis": {"weight": 20, "desc": "Statistical rigor in cohort analysis and RFM quartile scoring"}, "business": {"weight": 20, "desc": "Actionable, revenue-focused marketing recommendations"}, "problem_solving": {"weight": 15, "desc": "Identifying delivery delay as the hidden catalyst of customer dissatisfaction"}, "communication": {"weight": 10, "desc": "Clarity of executive summary narrative"}, "visualization": {"weight": 10, "desc": "Effective retention heatmaps and cohort charts"}}'
        ),
        (
            'proj_ind_02',
            'High-Throughput Microservice & Distributed Rate Limiter Engine',
            'FinTech / Distributed Systems',
            'Software Engineer',
            'Design and build a resilient microservice backend with a distributed Sliding Window Counter rate limiter. Your system must process 10,000 requests/sec, integrate Redis for distributed lock synchronization, and provide dynamic token bucket throttling.',
            '["1. System Architecture: Design REST/gRPC API with distributed Redis rate-limiting middleware.", "2. Data Structures: Implement sliding window log algorithm with atomic Lua scripts.", "3. Resilience: Implement circuit breaker patterns and fallback handling.", "4. Benchmarking: Conduct load testing and benchmark P99 latency."]',
            'Synthetic request log dataset with HTTP headers, client IP, API key, response status, and latency metrics.',
            '[{"req_id": "REQ-8801", "client_id": "CLIENT-42", "endpoint": "/api/v1/transfer", "latency_ms": 14.2, "status_code": 200}, {"req_id": "REQ-8802", "client_id": "CLIENT-42", "endpoint": "/api/v1/transfer", "latency_ms": 2.1, "status_code": 429}]',
            '{"technical": {"weight": 25, "desc": "Thread safety, atomic Redis execution, and clean API design"}, "analysis": {"weight": 20, "desc": "P99 latency benchmarks and bottleneck analysis"}, "business": {"weight": 20, "desc": "SLA compliance and API monetisation tier enforcement"}, "problem_solving": {"weight": 15, "desc": "Handling Redis failover and race condition mitigation"}, "communication": {"weight": 10, "desc": "Architecture diagram documentation"}, "visualization": {"weight": 10, "desc": "Grafana request throughput dashboard"}}'
        ),
        (
            'proj_ind_03',
            'Real-Time Financial Fraud Detection & Production MLOps Pipeline',
            'Banking / Machine Learning',
            'Machine Learning Engineer',
            'Develop an end-to-end real-time credit card fraud detection system. Train LightGBM & PyTorch Autoencoder models on highly imbalanced transaction streams, implement SMOTE resampling, log experiments with MLflow, and serve predictions via Dockerized FastAPI.',
            '["1. Feature Engineering: Compute velocity aggregation features (e.g. transactions in past 10m).", "2. Model Training: Train baseline Random Forest, LightGBM, and Deep Autoencoders.", "3. MLOps Lifecycle: Register model in MLflow with automated F1/AUC evaluation gates.", "4. Deployment: Containerize REST API with FastAPI and Docker."]',
            'Synthetic financial transaction dataset with anonymized PCA features V1-V28 and Class labels.',
            '[{"tx_id": "TX-9901", "amount": 1420.50, "v1": -1.35, "v2": 2.11, "is_fraud": 0}, {"tx_id": "TX-9902", "amount": 9999.00, "v1": 4.12, "v2": -3.88, "is_fraud": 1}]',
            '{"technical": {"weight": 25, "desc": "Model evaluation precision, SMOTE application, and MLOps structure"}, "analysis": {"weight": 20, "desc": "PR-AUC curve analysis and optimal decision threshold tuning"}, "business": {"weight": 20, "desc": "Balancing false positive friction against fraud loss prevention"}, "problem_solving": {"weight": 15, "desc": "Handling severe 0.1% class imbalance without overfitting"}, "communication": {"weight": 10, "desc": "Model card documentation"}, "visualization": {"weight": 10, "desc": "Feature importance plots and confusion matrices"}}'
        ),
        (
            'proj_ind_04',
            'Automated Multi-Cloud Kubernetes Infrastructure & CI/CD Pipeline',
            'Cloud Infrastructure / DevOps',
            'DevOps Engineer',
            'Architect a production-ready Kubernetes infrastructure using Terraform IaC on AWS EKS. Build automated GitHub Actions CI/CD pipelines with vulnerability container scanning (Trivy), Helm deployment charts, and Prometheus/Grafana alerting.',
            '["1. IaC Provisioning: Write modular Terraform scripts for VPC, EKS cluster, and IAM roles.", "2. CI/CD Pipeline: Build GitHub Actions workflow with Docker multi-stage build and Trivy scan.", "3. Helm Packaging: Package application manifests into Helm charts with rollback support.", "4. Monitoring: Set up Prometheus alerts for pod crash loop backoffs."]',
            'Synthetic infrastructure log and metric dataset.',
            '[{"node_id": "ip-10-0-1-12", "cpu_util_pct": 88.4, "mem_util_pct": 74.2, "pod_count": 28, "status": "Ready"}]',
            '{"technical": {"weight": 25, "desc": "Terraform module cleanliness, state locking, and Helm chart structure"}, "analysis": {"weight": 20, "desc": "Cluster autoscaling efficiency and cost optimization"}, "business": {"weight": 20, "desc": "Achieving 99.99% uptime SLA and zero-downtime deployments"}, "problem_solving": {"weight": 15, "desc": "Resolving ingress routing and TLS certificate automated renewal"}, "communication": {"weight": 10, "desc": "Runbook documentation for incident response"}, "visualization": {"weight": 10, "desc": "Grafana cluster health dashboard"}}'
        ),
        (
            'proj_ind_05',
            'Enterprise B2B SaaS Product Growth & A/B Experiment Strategy',
            'SaaS / Product Management',
            'Product Manager',
            'Lead the product redesign of a SaaS onboarding funnel to increase 14-day free trial conversion by 25%. Define PRDs, user personas, RICE prioritization matrix, and design a 2-variant A/B experiment with sample size calculations.',
            '["1. Funnel Discovery: Analyze drop-off metrics across the 5-step onboarding workflow.", "2. PRD Authoring: Draft comprehensive Product Requirement Document with acceptance criteria.", "3. Feature Prioritization: Evaluate 10 backlog items using RICE scoring framework.", "4. Experiment Design: Define H0/H1 hypotheses, sample size, and metric dashboards."]',
            'Synthetic product analytics onboarding drop-off dataset.',
            '[{"user_id": "U-501", "step_reached": "Signup", "time_spent_secs": 45, "converted": 0}, {"user_id": "U-502", "step_reached": "Team Invite", "time_spent_secs": 320, "converted": 1}]',
            '{"technical": {"weight": 25, "desc": "Statistical rigor in A/B test power calculation and metric definition"}, "analysis": {"weight": 20, "desc": "Funnel drop-off diagnosis and cohort segmentation"}, "business": {"weight": 20, "desc": "ARR expansion projections and CAC payback optimization"}, "problem_solving": {"weight": 15, "desc": "Resolving friction in multi-tenant team invitation flow"}, "communication": {"weight": 10, "desc": "PRD clarity and executive roadmap presentation"}, "visualization": {"weight": 10, "desc": "Figma user journey flow & funnel chart"}}'
        )
    ]

    for proj in ind_projects:
        cursor.execute("""
        INSERT INTO industry_challenges (
            id, title, domain, target_role, overview, tasks_json, dataset_description, dataset_sample_json, rubric_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, proj)

    # 9. Student Badges
    badges_data = [
        ('usr_student_1', 'sql_warrior', 'SQL Warrior', 'Executed 25+ advanced queries with CTEs and window functions.', 'Database'),
        ('usr_student_1', 'data_storyteller', 'Data Storyteller', 'Synthesized complex multi-dimensional datasets into executive dashboards.', 'BookOpen'),
        ('usr_student_1', 'dashboard_pro', 'Dashboard Pro', 'Crafted interactive business intelligence reports with cross-filtering.', 'LayoutDashboard'),
        ('usr_student_1', 'interview_ready', 'Interview Ready', 'Maintained 70%+ score across AI technical & behavioral rounds.', 'CheckCircle2'),
        ('usr_student_1', 'problem_solver', 'Industry Problem Solver', 'Successfully solved and defended real-world business case studies.', 'ShieldCheck')
    ]
    for b in badges_data:
        cursor.execute("""
        INSERT INTO student_badges (user_id, badge_name, badge_title, description, icon)
        VALUES (?, ?, ?, ?, ?);
        """, b)

    # 10. Seed Notifications
    notifs = [
        ('usr_student_1', 'Market Demand Alert', 'GenAI requirements for Data Analyst roles increased 17% in the latest market scan across 112 job postings.', 'market', 0),
        ('usr_student_1', 'Extra Track Milestone', 'Week 1 Statistics Fundamentals completed! You earned +350 XP.', 'track', 0),
        ('usr_student_1', 'New SQL Practice Available', 'Solve "Monthly Customer Retention Window Function" to boost your SQL Mastery to 88%.', 'practice', 0),
        ('usr_student_1', 'Skill Passport Updated', 'Your verified mastery score for Python is now 90.8% with 4/4 evidence points.', 'badge', 1)
    ]
    for n in notifs:
        cursor.execute("""
        INSERT INTO notifications (user_id, title, message, type, is_read)
        VALUES (?, ?, ?, ?, ?);
        """, n)

    # 11. Seed 55 Cohort Students for TPO Analytics
    departments = ['CSE', 'AIML', 'IT', 'ECE']
    first_names = ['Aarav', 'Diya', 'Rohan', 'Ananya', 'Vivaan', 'Ishaan', 'Saanvi', 'Kavya', 'Aditya', 'Sneha', 'Arjun', 'Meera', 'Tanvi', 'Varun', 'Pooja', 'Nikhil', 'Priyanka', 'Siddharth', 'Karthik', 'Rhea']
    last_names = ['Sharma', 'Verma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Gupta', 'Singh', 'Chopra', 'Rao', 'Deshmukh', 'Menon', 'Bose', 'Mukherjee', 'Joshi']

    for i in range(55):
        s_id = f"cohort_{i+1}"
        s_name = f"{random.choice(first_names)} {random.choice(last_names)}"
        dept = departments[i % len(departments)]
        target = random.choice(['Data Analyst', 'Data Scientist', 'AI/ML Engineer', 'Software Engineer', 'Cloud Engineer'])

        if dept in ['AIML', 'CSE']:
            readiness = random.randint(55, 94)
            alignment = random.randint(60, 96)
            skill_sc = random.randint(58, 92)
            interview_sc = random.randint(50, 88)
        else:
            readiness = random.randint(35, 82)
            alignment = random.randint(40, 85)
            skill_sc = random.randint(38, 80)
            interview_sc = random.randint(35, 75)

        is_ready = 1 if readiness >= 75 else 0
        is_at_risk = 1 if readiness < 50 else 0

        dept_skill_bias = {
            'AIML': {'Python': 88, 'SQL': 78, 'Machine Learning': 84, 'Cloud': 38, 'Generative AI': 42, 'Power BI': 48},
            'CSE': {'Python': 82, 'SQL': 74, 'Machine Learning': 65, 'Cloud': 34, 'Generative AI': 28, 'Power BI': 42},
            'IT': {'Python': 74, 'SQL': 70, 'Machine Learning': 52, 'Cloud': 28, 'Generative AI': 20, 'Power BI': 46},
            'ECE': {'Python': 65, 'SQL': 58, 'Machine Learning': 42, 'Cloud': 22, 'Generative AI': 14, 'Power BI': 32}
        }

        s_skills = {}
        for k, v in dept_skill_bias[dept].items():
            s_skills[k] = max(10, min(99, v + random.randint(-12, 12)))

        cursor.execute("""
        INSERT INTO cohort_students (
            id, name, department, year, target_role, placement_ready, readiness_score,
            market_alignment, skill_score, interview_score, is_at_risk, skills_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            s_id, s_name, dept, 3, target, is_ready, readiness,
            alignment, skill_sc, interview_sc, is_at_risk, json.dumps(s_skills)
        ))

    # 12. Seed TPO Interventions
    cursor.execute("""
    INSERT INTO tpo_interventions (
        id, tpo_user_id, title, target_department, target_skill,
        affected_students_count, market_demand_pct, curriculum_weeks, status, expected_readiness_boost
    ) VALUES
    ('intv_01', 'usr_tpo_1', 'Cloud Infrastructure & AWS Deployment Bootcamp', 'AIML', 'Cloud', 23, 78, 4, 'Active', 22.4),
    ('intv_02', 'usr_tpo_1', 'Enterprise Power BI & Business Storytelling Track', 'ECE', 'Power BI', 31, 74, 3, 'Active', 18.0),
    ('intv_03', 'usr_tpo_1', 'Generative AI & LLM Engineering Sprint', 'CSE', 'Generative AI', 29, 68, 2, 'Completed', 25.5);
    """)

    conn.commit()
    conn.close()
    print("Database seeded successfully with 112 JDs, 55 Cohort Students, and complete Ashwin Kumar profile.")

if __name__ == "__main__":
    seed_database()
