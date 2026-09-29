import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Zap, Target, TrendingUp, BookOpen, Clock,
  ChevronRight, AlertCircle, Loader2, CheckCircle, X,
  BarChart2, Route, Star, RefreshCw
} from 'lucide-react';
import { aiApi, applicantApi, coursesApi } from '../../services/api';
import toast from 'react-hot-toast';

const COMMON_ROLES = [
  'Full Stack Developer', 'Data Analyst', 'Software Engineer',
  'AI Engineer', 'Cyber Security Analyst', 'Cloud Engineer',
  'Mobile App Developer', 'DevOps Engineer',
];

const PRIORITY_CONFIG = {
  CRITICAL: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Critical' },
  HIGH: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'High' },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Medium' },
  LOW: { color: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Low' },
};

function CircularMatchScore({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  const color = value >= 70 ? '#16a34a' : value >= 50 ? '#2563eb' : '#f59e0b';

  return (
    <div className="relative flex items-center justify-center">
      <svg width="128" height="128" className="-rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold" style={{ color }}>{value}%</div>
        <div className="text-xs text-gray-500">Match</div>
      </div>
    </div>
  );
}

export default function AIGapAnalyzer() {
  const [profile, setProfile] = useState<any>(null);
  const [targetRole, setTargetRole] = useState('');
  const [customSkills, setCustomSkills] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'analyze' | 'history'>('analyze');

  useEffect(() => {
    applicantApi.getProfile().then(r => setProfile(r.data.data)).catch(() => {});
    aiApi.getHistory().then(r => setHistory(r.data.data)).catch(() => {});
  }, []);

  const currentSkills = [
    ...(profile?.applicantSkills?.map((s: any) => s.skill.name) || []),
    ...customSkills.split(',').map(s => s.trim()).filter(Boolean),
  ];

  const handleAnalyze = async () => {
    if (!targetRole.trim()) {
      toast.error('Please enter a target role');
      return;
    }
    if (currentSkills.length === 0) {
      toast.error('No skills found. Add skills to your profile or enter them below.');
      return;
    }

    setAnalyzing(true);
    setResult(null);
    try {
      const res = await aiApi.analyze({
        targetRole,
        currentSkills,
        education: profile?.education?.[0]?.qualification,
      });
      setResult(res.data.data);
      // Refresh history
      aiApi.getHistory().then(r => setHistory(r.data.data)).catch(() => {});
      toast.success('AI Analysis completed!');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const loadHistoryItem = (item: any) => {
    const mapped = {
      matchPercentage: item.matchPercentage,
      existingSkills: profile?.applicantSkills?.map((s: any) => s.skill.name) || [],
      skillGaps: item.skillGaps || [],
      learningPath: item.learningPath || [],
      weeklyPlan: [],
      summary: item.summary,
      isDemo: item.isDemo,
      recommendedCourses: item.recommendations?.map((r: any) => r.course).filter(Boolean) || [],
    };
    setResult(mapped);
    setTargetRole(item.targetRole);
    setActiveTab('analyze');
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Brain size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Gap Analyzer</h1>
            <p className="text-purple-200 text-sm">Identify the skills you need to reach your target career</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['analyze', 'history'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              activeTab === tab ? 'bg-purple-700 text-white shadow' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}>
            {tab === 'history' ? `Analysis History (${history.length})` : 'New Analysis'}
          </button>
        ))}
      </div>

      {activeTab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="card text-center py-10">
              <Brain size={40} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400">No analyses yet</p>
            </div>
          ) : history.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="card cursor-pointer hover:shadow-md transition-all"
              onClick={() => loadHistoryItem(item)}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">{item.targetRole}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="flex items-center gap-3">
                  {item.isDemo && <span className="badge badge-purple text-xs">AI Demo</span>}
                  <div className="text-2xl font-bold text-purple-700">{item.matchPercentage}%</div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'analyze' && (
        <>
          {/* Input section */}
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Configure Analysis</h2>

            {/* Target Role */}
            <div className="mb-4">
              <label className="label">Target Job Role *</label>
              <input
                className="input-field"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, Data Analyst..."
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {COMMON_ROLES.map(r => (
                  <button key={r} onClick={() => setTargetRole(r)}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      targetRole === r ? 'bg-purple-700 text-white border-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600'
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Current skills from profile */}
            <div className="mb-4">
              <label className="label">Current Skills (from your profile)</label>
              {profile?.applicantSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl">
                  {profile.applicantSkills.map((s: any) => (
                    <span key={s.id} className="badge badge-blue text-xs">{s.skill.name}</span>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-400">
                  No skills in profile. Add them below.
                </div>
              )}
            </div>

            {/* Additional skills */}
            <div className="mb-5">
              <label className="label">Additional Skills (comma-separated)</label>
              <input
                className="input-field"
                value={customSkills}
                onChange={e => setCustomSkills(e.target.value)}
                placeholder="e.g. React, Node.js, SQL..."
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={analyzing || !targetRole}
              className="w-full bg-purple-700 text-white py-3.5 rounded-xl font-semibold hover:bg-purple-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {analyzing ? (
                <><Loader2 size={18} className="animate-spin" /> Analyzing your profile...</>
              ) : (
                <><Zap size={18} /> Analyze Skill Gap</>
              )}
            </motion.button>
          </div>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Demo notice */}
                {result.isDemo && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-purple-700 flex items-center gap-2">
                    <Brain size={16} />
                    <span><strong>AI Demo Analysis</strong> — Results generated using deterministic skill gap modeling. Connect an AI API key for enhanced analysis.</span>
                  </div>
                )}

                {/* A. Match Score */}
                <div className="card">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart2 size={18} className="text-purple-600" />
                    Overall Profile Match
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <CircularMatchScore value={result.matchPercentage} />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-2">
                        {result.matchPercentage >= 70 ? '🎉 Great match!' :
                         result.matchPercentage >= 50 ? '👍 Good progress!' : '📚 Room to grow!'}
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">{result.summary}</p>
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span className="text-green-600 font-medium">{result.existingSkills?.length || 0} skills matched</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-orange-600 font-medium">{result.skillGaps?.length || 0} gaps identified</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* B. Existing Skills */}
                {result.existingSkills?.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-600" />
                      Existing Skills ({result.existingSkills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.existingSkills.map((s: string) => (
                        <span key={s} className="badge badge-green">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* C. Skill Gaps */}
                {result.skillGaps?.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Target size={18} className="text-orange-600" />
                      Skill Gaps ({result.skillGaps.length})
                    </h3>
                    <div className="space-y-3">
                      {result.skillGaps.map((gap: any, i: number) => {
                        const cfg = PRIORITY_CONFIG[gap.priority as keyof typeof PRIORITY_CONFIG];
                        return (
                          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className={`flex items-center justify-between p-3 rounded-xl border ${cfg.color}`}>
                            <div className="flex items-center gap-3">
                              <AlertCircle size={16} />
                              <div>
                                <div className="font-semibold text-sm">{gap.skillName}</div>
                                <div className="text-xs opacity-70">Current: {gap.currentLevel} → Required: {gap.requiredLevel}</div>
                              </div>
                            </div>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/60">{cfg.label} Priority</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* D. Learning Path */}
                {result.learningPath?.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Route size={18} className="text-blue-600" />
                      Recommended Learning Path
                    </h3>
                    <div className="space-y-3">
                      {result.learningPath.map((lp: any, i: number) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {lp.stage}
                            </div>
                            {i < result.learningPath.length - 1 && <div className="w-0.5 flex-1 bg-blue-200 mt-1 min-h-6"></div>}
                          </div>
                          <div className="pb-4 flex-1">
                            <div className="font-semibold text-gray-800">{lp.topic}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Clock size={11} /> {lp.duration}
                            </div>
                            {lp.description && <div className="text-sm text-gray-500 mt-1">{lp.description}</div>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* E. Weekly Plan */}
                {result.weeklyPlan?.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Clock size={18} className="text-green-600" />
                      Estimated Learning Plan
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {result.weeklyPlan.map((w: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Star size={14} className="text-green-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 font-medium">{w.week}</div>
                            <div className="text-sm font-semibold text-gray-800">{w.topic}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* F. Recommended Courses */}
                {result.recommendedCourses?.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <BookOpen size={18} className="text-purple-600" />
                      Recommended Courses
                    </h3>
                    <div className="space-y-3">
                      {result.recommendedCourses.map((course: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl p-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <BookOpen size={18} className="text-purple-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-purple-800">{course.name}</div>
                            {course.description && <div className="text-xs text-purple-600 mt-0.5 line-clamp-1">{course.description}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Re-analyze */}
                <div className="text-center">
                  <button onClick={() => setResult(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mx-auto text-sm">
                    <RefreshCw size={14} /> Start New Analysis
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
