import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Zap, Target, TrendingUp, AlertCircle,
  BarChart2, ShieldAlert, Award, Compass, CheckCircle2
} from 'lucide-react';
import { analyticsApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function AIAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIAnalytics();
  }, []);

  const fetchAIAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.getGapAnalysis();
      setData(res.data.data);
    } catch {
      toast.error('Failed to load AI analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">
          <Brain size={14} /> AI Talent Intelligence System
        </div>
        <h1 className="text-2xl font-bold text-gray-900">AI Gap Analyzer Insights & Diagnostics</h1>
        <p className="text-gray-500 text-sm">
          Deep diagnostic telemetry from candidate skill audits and market role alignment
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700 mx-auto"></div>
          <p className="text-gray-400 text-sm mt-3">Synthesizing AI gap models...</p>
        </div>
      ) : (
        <>
          {/* Top Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between opacity-80">
                <span className="text-xs uppercase font-semibold">Total Career Analyses</span>
                <Brain size={20} />
              </div>
              <div className="text-4xl font-extrabold mt-3">{data?.totalAnalyses || 0}</div>
              <p className="text-xs text-purple-200 mt-1">Processed across Maharashtra districts</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs uppercase font-semibold">State Match Average</span>
                <Target size={20} className="text-blue-600" />
              </div>
              <div className="text-4xl font-extrabold text-blue-900 mt-3">{data?.avgMatchPercentage || 0}%</div>
              <p className="text-xs text-gray-500 mt-1">Average readiness for targeted role</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs uppercase font-semibold">Deficit Intensity</span>
                <ShieldAlert size={20} className="text-amber-600" />
              </div>
              <div className="text-4xl font-extrabold text-amber-700 mt-3">
                {data?.topSkillGaps?.filter((g: any) => g.priority === 'HIGH' || g.priority === 'CRITICAL').length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">High/Critical priority skills deficient</p>
            </div>
          </div>

          {/* Match Score Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 text-base mb-1">Applicant Readiness Score Distribution</h3>
            <p className="text-xs text-gray-500 mb-6">Percentage match distribution across all analyzed citizens</p>

            <div className="grid grid-cols-5 gap-3 text-center">
              {data?.matchDistribution?.map((bucket: any, idx: number) => {
                const total = data.totalAnalyses || 1;
                const pct = Math.round((bucket.count / total) * 100);

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="text-xs font-semibold text-gray-800 mb-2">{bucket.count} cand.</div>
                    <div className="w-full bg-gray-100 rounded-xl h-36 flex items-end p-1.5 overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(10, pct)}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className={`w-full rounded-lg ${
                          idx >= 3 ? 'bg-gradient-to-t from-green-600 to-emerald-400' : 'bg-gradient-to-t from-purple-700 to-indigo-500'
                        }`}
                      ></motion.div>
                    </div>
                    <div className="text-xs font-medium text-gray-600 mt-2">{bucket.range}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{pct}% of total</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Skill Gaps Table */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Prioritized Skill Deficits Identified</h3>
                <p className="text-xs text-gray-500">Skills most frequently missing in citizen evaluations</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.topSkillGaps?.map((gap: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                      #{i + 1}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{gap.skillName}</div>
                      <div className="text-xs text-gray-400">{gap.count} candidates require training</div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    gap.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                    gap.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {gap.priority || 'MEDIUM'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
