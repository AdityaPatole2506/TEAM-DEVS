import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Download, TrendingUp, Users, BookOpen,
  PieChart, Brain, Filter, CheckCircle2, Award
} from 'lucide-react';
import { analyticsApi, officialApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [skillData, setSkillData] = useState<any>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [gapData, setGapData] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [skillsRes, coursesRes, gapRes] = await Promise.all([
        analyticsApi.getSkills(),
        analyticsApi.getCourses(),
        analyticsApi.getGapAnalysis(),
      ]);
      setSkillData(skillsRes.data.data);
      setCourseData(coursesRes.data.data);
      setGapData(gapRes.data.data);
    } catch {
      toast.error('Failed to load reporting metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!skillData || !gapData) return;

    let csv = 'Category,Metric,Value\n';
    csv += `Overview,Total AI Analyses,${gapData.totalAnalyses}\n`;
    csv += `Overview,Average Match Percentage,${gapData.avgMatchPercentage}%\n`;

    gapData.topTargetRoles?.forEach((r: any) => {
      csv += `Target Roles,${r.role},${r.count}\n`;
    });

    skillData.topSkillGaps?.forEach((s: any) => {
      csv += `Top Skill Gaps,${s.skillName},${s.count}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MH_Gov_Upskilling_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded successfully');
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <BarChart3 size={14} /> State Skill Intelligence & Reporting
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Macro Analytics</h1>
          <p className="text-gray-500 text-sm">
            High-level workforce diagnostics, program uptake metrics and regional talent insights
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="btn-secondary flex items-center gap-2 text-sm shadow-sm self-start md:self-auto"
        >
          <Download size={16} /> Export Comprehensive CSV Report
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-gray-100">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700 mx-auto"></div>
          <p className="text-gray-400 text-sm mt-3">Synthesizing state report data...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">AI Analyses Run</span>
                <span className="p-2 bg-blue-50 text-blue-700 rounded-xl"><Brain size={18} /></span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{gapData?.totalAnalyses || 0}</div>
              <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={13} /> Active career transitions
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Candidate Match</span>
                <span className="p-2 bg-purple-50 text-purple-700 rounded-xl"><PieChart size={18} /></span>
              </div>
              <div className="text-3xl font-bold text-purple-900 mt-2">{gapData?.avgMatchPercentage || 0}%</div>
              <div className="text-xs text-gray-400 mt-1">Across all registered job targets</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Top Target Sector</span>
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl"><Award size={18} /></span>
              </div>
              <div className="text-xl font-bold text-gray-900 mt-2 truncate">
                {gapData?.topTargetRoles?.[0]?.role || 'Full Stack Dev'}
              </div>
              <div className="text-xs text-emerald-600 mt-1">Highest career aspiration</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Programs</span>
                <span className="p-2 bg-amber-50 text-amber-700 rounded-xl"><BookOpen size={18} /></span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {courseData?.courseEnrollments?.length || 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">Government upskilling courses</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Target Roles */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-base">Most In-Demand Career Roles</h3>
                <span className="text-xs text-gray-400">By citizen aspirations</span>
              </div>

              <div className="space-y-3">
                {gapData?.topTargetRoles?.slice(0, 6).map((role: any, idx: number) => {
                  const maxCount = gapData.topTargetRoles[0]?.count || 1;
                  const pct = Math.round((role.count / maxCount) * 100);

                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-800">{role.role}</span>
                        <span className="font-semibold text-blue-700">{role.count} applicants</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Critical Skill Gaps */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-base">Top Skill Deficits Detected by AI</h3>
                <span className="text-xs text-red-600 font-medium">Critical intervention needed</span>
              </div>

              <div className="space-y-3">
                {skillData?.topSkillGaps?.slice(0, 6).map((gap: any, idx: number) => {
                  const maxGaps = skillData.topSkillGaps[0]?.count || 1;
                  const pct = Math.round((gap.count / maxGaps) * 100);

                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-800">{gap.skillName}</span>
                        <span className="font-semibold text-amber-600">{gap.count} deficits</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Course Capacity & Enrollments */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 text-base mb-4">Course Intake & Capacity Utilization</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">Course / Program</th>
                    <th className="px-4 py-3">Level</th>
                    <th className="px-4 py-3">Enrolled Citizens</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Occupancy %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courseData?.courseEnrollments?.map((c: any, i: number) => {
                    const occ = Math.round((c.enrolled / (c.seats || 1)) * 100);
                    return (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3.5 font-medium text-gray-900">{c.name}</td>
                        <td className="px-4 py-3.5"><span className="badge-blue text-[11px]">{c.level}</span></td>
                        <td className="px-4 py-3.5 font-semibold text-gray-800">{c.enrolled}</td>
                        <td className="px-4 py-3.5 text-gray-500">{c.seats}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${occ >= 80 ? 'bg-green-600' : 'bg-blue-600'}`}
                                style={{ width: `${Math.min(100, occ)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-gray-700">{occ}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
