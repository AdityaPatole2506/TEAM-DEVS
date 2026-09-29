// AI Gap Analyzer Service
// Uses deterministic mock analysis when no AI API key is configured

interface SkillRequirement {
  skill: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface RoleRequirements {
  requiredSkills: SkillRequirement[];
  learningPath: { stage: number; topic: string; duration: string; description: string }[];
  weeklyPlan: { week: string; topic: string }[];
  summary: string;
}

const ROLE_REQUIREMENTS: Record<string, RoleRequirements> = {
  'full stack developer': {
    requiredSkills: [
      { skill: 'JavaScript', level: 'INTERMEDIATE', priority: 'CRITICAL' },
      { skill: 'TypeScript', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'React', level: 'INTERMEDIATE', priority: 'CRITICAL' },
      { skill: 'Node.js', level: 'INTERMEDIATE', priority: 'CRITICAL' },
      { skill: 'Express.js', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'REST APIs', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'SQL', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'Git', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'Docker', level: 'BEGINNER', priority: 'MEDIUM' },
      { skill: 'HTML', level: 'INTERMEDIATE', priority: 'MEDIUM' },
      { skill: 'CSS', level: 'INTERMEDIATE', priority: 'MEDIUM' },
    ],
    learningPath: [
      { stage: 1, topic: 'JavaScript Fundamentals', duration: '2 weeks', description: 'ES6+, async/await, promises, closures' },
      { stage: 2, topic: 'React Development', duration: '3 weeks', description: 'Components, hooks, state management, Router' },
      { stage: 3, topic: 'Node.js & Express', duration: '2 weeks', description: 'Server-side JavaScript, REST API design' },
      { stage: 4, topic: 'Database Integration', duration: '1 week', description: 'PostgreSQL, ORMs, data modeling' },
      { stage: 5, topic: 'TypeScript', duration: '1 week', description: 'Static typing, interfaces, generics' },
      { stage: 6, topic: 'Git & Deployment', duration: '1 week', description: 'Version control, CI/CD, Docker basics' },
    ],
    weeklyPlan: [
      { week: 'Week 1-2', topic: 'JavaScript ES6+' },
      { week: 'Week 3-5', topic: 'React & Frontend' },
      { week: 'Week 6-7', topic: 'Node.js & Express' },
      { week: 'Week 8', topic: 'Database & SQL' },
      { week: 'Week 9', topic: 'REST APIs & Auth' },
      { week: 'Week 10', topic: 'Git & Deployment' },
    ],
    summary: 'To become a Full Stack Developer, focus on mastering JavaScript ecosystem including React for frontend and Node.js for backend development.',
  },

  'data analyst': {
    requiredSkills: [
      { skill: 'Python', level: 'INTERMEDIATE', priority: 'CRITICAL' },
      { skill: 'SQL', level: 'ADVANCED', priority: 'CRITICAL' },
      { skill: 'Data Visualization', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'Excel', level: 'ADVANCED', priority: 'HIGH' },
      { skill: 'Statistics', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'Tableau', level: 'INTERMEDIATE', priority: 'MEDIUM' },
      { skill: 'Power BI', level: 'INTERMEDIATE', priority: 'MEDIUM' },
      { skill: 'Machine Learning Basics', level: 'BEGINNER', priority: 'MEDIUM' },
      { skill: 'Communication', level: 'ADVANCED', priority: 'HIGH' },
    ],
    learningPath: [
      { stage: 1, topic: 'SQL Mastery', duration: '2 weeks', description: 'Advanced queries, joins, aggregations, window functions' },
      { stage: 2, topic: 'Python for Data', duration: '3 weeks', description: 'Pandas, NumPy, data manipulation' },
      { stage: 3, topic: 'Data Visualization', duration: '2 weeks', description: 'Matplotlib, Seaborn, Tableau basics' },
      { stage: 4, topic: 'Statistics', duration: '2 weeks', description: 'Descriptive stats, hypothesis testing, regression' },
      { stage: 5, topic: 'BI Tools', duration: '1 week', description: 'Power BI, dashboards, reporting' },
    ],
    weeklyPlan: [
      { week: 'Week 1-2', topic: 'Advanced SQL' },
      { week: 'Week 3-5', topic: 'Python & Pandas' },
      { week: 'Week 6-7', topic: 'Data Visualization' },
      { week: 'Week 8-9', topic: 'Statistics & Analytics' },
      { week: 'Week 10', topic: 'Power BI / Tableau' },
    ],
    summary: 'Data Analytics requires strong SQL skills combined with Python data libraries and statistical knowledge for insight generation.',
  },

  'software engineer': {
    requiredSkills: [
      { skill: 'Data Structures', level: 'ADVANCED', priority: 'CRITICAL' },
      { skill: 'Algorithms', level: 'ADVANCED', priority: 'CRITICAL' },
      { skill: 'System Design', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'Java', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'Object Oriented Programming', level: 'ADVANCED', priority: 'HIGH' },
      { skill: 'Git', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'SQL', level: 'INTERMEDIATE', priority: 'MEDIUM' },
      { skill: 'Problem Solving', level: 'ADVANCED', priority: 'CRITICAL' },
    ],
    learningPath: [
      { stage: 1, topic: 'Data Structures & Algorithms', duration: '4 weeks', description: 'Arrays, trees, graphs, sorting, searching' },
      { stage: 2, topic: 'OOP Principles', duration: '2 weeks', description: 'SOLID principles, design patterns' },
      { stage: 3, topic: 'System Design', duration: '3 weeks', description: 'Scalability, load balancing, databases' },
      { stage: 4, topic: 'Java / Python Advanced', duration: '2 weeks', description: 'Advanced language features, concurrency' },
      { stage: 5, topic: 'Competitive Programming', duration: '2 weeks', description: 'LeetCode, HackerRank practice' },
    ],
    weeklyPlan: [
      { week: 'Week 1-4', topic: 'DSA Practice' },
      { week: 'Week 5-6', topic: 'OOP & Design Patterns' },
      { week: 'Week 7-9', topic: 'System Design' },
      { week: 'Week 10-11', topic: 'Java/Python Advanced' },
      { week: 'Week 12', topic: 'Mock Interviews' },
    ],
    summary: 'Software Engineering roles prioritize strong problem-solving, data structures, and system design fundamentals.',
  },

  'ai engineer': {
    requiredSkills: [
      { skill: 'Python', level: 'ADVANCED', priority: 'CRITICAL' },
      { skill: 'Machine Learning', level: 'INTERMEDIATE', priority: 'CRITICAL' },
      { skill: 'Deep Learning', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'TensorFlow', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'Mathematics', level: 'ADVANCED', priority: 'HIGH' },
      { skill: 'Data Preprocessing', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'NLP', level: 'BEGINNER', priority: 'MEDIUM' },
      { skill: 'Cloud Computing', level: 'BEGINNER', priority: 'MEDIUM' },
    ],
    learningPath: [
      { stage: 1, topic: 'Python & Math Foundations', duration: '3 weeks', description: 'Linear algebra, calculus, probability' },
      { stage: 2, topic: 'Machine Learning', duration: '4 weeks', description: 'Supervised, unsupervised learning algorithms' },
      { stage: 3, topic: 'Deep Learning', duration: '3 weeks', description: 'Neural networks, CNNs, RNNs' },
      { stage: 4, topic: 'NLP & Computer Vision', duration: '2 weeks', description: 'Text processing, image recognition' },
      { stage: 5, topic: 'MLOps & Deployment', duration: '2 weeks', description: 'Model deployment, monitoring, cloud' },
    ],
    weeklyPlan: [
      { week: 'Week 1-3', topic: 'Python & Math' },
      { week: 'Week 4-7', topic: 'Machine Learning' },
      { week: 'Week 8-10', topic: 'Deep Learning' },
      { week: 'Week 11-12', topic: 'NLP / CV' },
      { week: 'Week 13-14', topic: 'MLOps & Projects' },
    ],
    summary: 'AI Engineering requires strong mathematical foundations combined with practical ML/DL frameworks and deployment skills.',
  },

  'cyber security analyst': {
    requiredSkills: [
      { skill: 'Network Security', level: 'INTERMEDIATE', priority: 'CRITICAL' },
      { skill: 'Ethical Hacking', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'Linux', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'Python', level: 'BEGINNER', priority: 'HIGH' },
      { skill: 'Cryptography', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'Firewalls & IDS', level: 'INTERMEDIATE', priority: 'MEDIUM' },
      { skill: 'SIEM Tools', level: 'BEGINNER', priority: 'MEDIUM' },
      { skill: 'Incident Response', level: 'INTERMEDIATE', priority: 'HIGH' },
    ],
    learningPath: [
      { stage: 1, topic: 'Networking Fundamentals', duration: '2 weeks', description: 'TCP/IP, protocols, OSI model' },
      { stage: 2, topic: 'Linux Administration', duration: '2 weeks', description: 'Linux CLI, permissions, processes' },
      { stage: 3, topic: 'Ethical Hacking', duration: '3 weeks', description: 'Penetration testing, vulnerability assessment' },
      { stage: 4, topic: 'Cryptography', duration: '1 week', description: 'Encryption, PKI, hashing' },
      { stage: 5, topic: 'Security Operations', duration: '2 weeks', description: 'SOC, SIEM, incident response' },
    ],
    weeklyPlan: [
      { week: 'Week 1-2', topic: 'Networking' },
      { week: 'Week 3-4', topic: 'Linux Admin' },
      { week: 'Week 5-7', topic: 'Ethical Hacking' },
      { week: 'Week 8', topic: 'Cryptography' },
      { week: 'Week 9-10', topic: 'Security Operations' },
    ],
    summary: 'Cyber Security requires deep knowledge of networking, ethical hacking, and security operations to protect systems effectively.',
  },

  'cloud engineer': {
    requiredSkills: [
      { skill: 'AWS', level: 'INTERMEDIATE', priority: 'CRITICAL' },
      { skill: 'Linux', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'Docker', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'Kubernetes', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'Terraform', level: 'BEGINNER', priority: 'MEDIUM' },
      { skill: 'Python', level: 'BEGINNER', priority: 'MEDIUM' },
      { skill: 'CI/CD', level: 'INTERMEDIATE', priority: 'HIGH' },
      { skill: 'Networking', level: 'INTERMEDIATE', priority: 'HIGH' },
    ],
    learningPath: [
      { stage: 1, topic: 'Cloud Fundamentals', duration: '2 weeks', description: 'AWS core services, IAM, VPC, EC2' },
      { stage: 2, topic: 'Linux & Networking', duration: '2 weeks', description: 'System administration, networking' },
      { stage: 3, topic: 'Containers', duration: '2 weeks', description: 'Docker, Kubernetes orchestration' },
      { stage: 4, topic: 'Infrastructure as Code', duration: '2 weeks', description: 'Terraform, CloudFormation' },
      { stage: 5, topic: 'DevOps & CI/CD', duration: '2 weeks', description: 'Jenkins, GitHub Actions, pipelines' },
    ],
    weeklyPlan: [
      { week: 'Week 1-2', topic: 'AWS Fundamentals' },
      { week: 'Week 3-4', topic: 'Linux & Networking' },
      { week: 'Week 5-6', topic: 'Docker & Kubernetes' },
      { week: 'Week 7-8', topic: 'Terraform & IaC' },
      { week: 'Week 9-10', topic: 'DevOps & CI/CD' },
    ],
    summary: 'Cloud Engineering requires mastery of cloud platforms, containerization, and infrastructure automation tools.',
  },
};

function findMatchingRole(targetRole: string): RoleRequirements {
  const normalizedTarget = targetRole.toLowerCase().trim();

  // Direct match
  if (ROLE_REQUIREMENTS[normalizedTarget]) {
    return ROLE_REQUIREMENTS[normalizedTarget];
  }

  // Partial match
  for (const [key, value] of Object.entries(ROLE_REQUIREMENTS)) {
    if (normalizedTarget.includes(key) || key.includes(normalizedTarget)) {
      return value;
    }
  }

  // Default - Full Stack Developer
  return ROLE_REQUIREMENTS['full stack developer'];
}

function calculateMatchPercentage(currentSkills: string[], requiredSkills: SkillRequirement[]): number {
  if (requiredSkills.length === 0) return 0;

  const normalizedCurrentSkills = currentSkills.map(s => s.toLowerCase().trim());

  let matchScore = 0;
  let totalWeight = 0;

  for (const req of requiredSkills) {
    const reqNormalized = req.skill.toLowerCase();
    const priorityWeight = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    }[req.priority] || 2;

    totalWeight += priorityWeight;

    const matched = normalizedCurrentSkills.some(
      s => s.includes(reqNormalized) || reqNormalized.includes(s) || (s.length > 3 && reqNormalized.includes(s.slice(0, -1)))
    );

    if (matched) {
      matchScore += priorityWeight;
    }
  }

  return Math.round((matchScore / totalWeight) * 100);
}

export interface GapAnalysisInput {
  currentSkills: string[];
  targetRole: string;
  education?: string;
  experience?: string;
  certifications?: string[];
}

export interface GapAnalysisResult {
  matchPercentage: number;
  existingSkills: string[];
  skillGaps: {
    skillName: string;
    currentLevel: string;
    requiredLevel: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }[];
  learningPath: {
    stage: number;
    topic: string;
    duration: string;
    description: string;
  }[];
  recommendedCourseNames: string[];
  summary: string;
  weeklyPlan: { week: string; topic: string }[];
  isDemo: boolean;
}

export async function analyzeSkillGap(input: GapAnalysisInput): Promise<GapAnalysisResult> {
  // Check if real AI API is available
  if (process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY) {
    try {
      return await callRealAI(input);
    } catch (error) {
      console.log('AI API failed, falling back to mock analysis');
    }
  }

  // Mock deterministic analysis
  return performMockAnalysis(input);
}

function performMockAnalysis(input: GapAnalysisInput): GapAnalysisResult {
  const roleReqs = findMatchingRole(input.targetRole);
  const normalizedCurrentSkills = input.currentSkills.map(s => s.toLowerCase().trim());

  const existingSkills: string[] = [];
  const skillGaps: GapAnalysisResult['skillGaps'] = [];

  for (const req of roleReqs.requiredSkills) {
    const reqNormalized = req.skill.toLowerCase();
    const matched = normalizedCurrentSkills.some(
      s => s.includes(reqNormalized) || reqNormalized.includes(s)
    );

    if (matched) {
      existingSkills.push(req.skill);
    } else {
      skillGaps.push({
        skillName: req.skill,
        currentLevel: 'BEGINNER',
        requiredLevel: req.level,
        priority: req.priority,
      });
    }
  }

  // Add education bonus
  let matchPercentage = calculateMatchPercentage(input.currentSkills, roleReqs.requiredSkills);
  if (input.education && (input.education.includes('B.Tech') || input.education.includes('B.E'))) {
    matchPercentage = Math.min(matchPercentage + 5, 95);
  }

  const courseNameMap: Record<string, string> = {
    'full stack developer': 'Full Stack Web Development',
    'data analyst': 'Data Analytics',
    'ai engineer': 'Artificial Intelligence',
    'software engineer': 'Full Stack Web Development',
    'cyber security analyst': 'Cyber Security',
    'cloud engineer': 'Cloud Computing',
  };

  const targetNormalized = input.targetRole.toLowerCase();
  const recommendedCourseNames: string[] = [];
  for (const [key, courseName] of Object.entries(courseNameMap)) {
    if (targetNormalized.includes(key) || key.includes(targetNormalized)) {
      recommendedCourseNames.push(courseName);
      break;
    }
  }
  if (recommendedCourseNames.length === 0) {
    recommendedCourseNames.push('Full Stack Web Development', 'Data Analytics');
  }

  return {
    matchPercentage,
    existingSkills,
    skillGaps: skillGaps.sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return order[a.priority] - order[b.priority];
    }),
    learningPath: roleReqs.learningPath,
    recommendedCourseNames,
    summary: `${roleReqs.summary} Your current profile matches ${matchPercentage}% of the requirements for ${input.targetRole}. Focus on addressing the ${skillGaps.filter(s => s.priority === 'CRITICAL' || s.priority === 'HIGH').length} high-priority skill gaps to accelerate your career transition.`,
    weeklyPlan: roleReqs.weeklyPlan,
    isDemo: true,
  };
}

async function callRealAI(input: GapAnalysisInput): Promise<GapAnalysisResult> {
  // This would call OpenAI/Gemini when API key is available
  // For now, always throws to fall back to mock
  throw new Error('Real AI not configured');
}
