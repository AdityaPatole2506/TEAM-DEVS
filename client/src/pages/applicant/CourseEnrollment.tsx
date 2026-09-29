import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, CheckCircle, Loader2, Star, Award } from 'lucide-react';
import { coursesApi, applicantApi } from '../../services/api';
import toast from 'react-hot-toast';

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'badge-green',
  Intermediate: 'badge-blue',
  Advanced: 'badge-purple',
};

export default function CourseEnrollment() {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    Promise.all([coursesApi.getAll(), applicantApi.getEnrollments()])
      .then(([cRes, eRes]) => {
        setCourses(cRes.data.data);
        setEnrollments(eRes.data.data);
      })
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  const isEnrolled = (courseId: string) => enrollments.some(e => e.courseId === courseId);

  const handleEnroll = async (courseId: string, courseName: string) => {
    setEnrolling(courseId);
    try {
      await coursesApi.enroll(courseId);
      const eRes = await applicantApi.getEnrollments();
      setEnrollments(eRes.data.data);
      toast.success(`Enrolled in ${courseName}!`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Enrollment failed');
    } finally {
      setEnrolling(null);
    }
  };

  const filtered = courses.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || c.level === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="section-title">Course Enrollment</h1>
        <p className="section-subtitle">Browse and enroll in skill development programs</p>
      </div>

      {/* My enrollments */}
      {enrollments.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-3">My Enrolled Courses</h2>
          <div className="space-y-3">
            {enrollments.map(e => (
              <div key={e.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen size={18} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-800">{e.course?.name}</div>
                  <div className="text-xs text-gray-400">Enrolled {new Date(e.enrolledAt).toLocaleDateString('en-IN')}</div>
                </div>
                <div className="text-right">
                  <span className={`badge ${e.status === 'COMPLETED' ? 'badge-green' : e.status === 'IN_PROGRESS' ? 'badge-blue' : 'badge-gray'}`}>
                    {e.status.replace('_', ' ')}
                  </span>
                  <div className="mt-1 w-24 progress-bar">
                    <div className="progress-fill bg-blue-600" style={{ width: `${e.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="input-field flex-1 min-w-48 max-w-xs"
        />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-field w-40">
          <option value="">All Levels</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </div>

      {/* Course Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((course, idx) => {
          const enrolled = isEnrolled(course.id);
          const seatsFull = course.availableSeats > 0 && course.enrolledCount >= course.availableSeats;

          return (
            <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`card flex flex-col ${enrolled ? 'border-green-200 bg-green-50/30' : ''}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  {enrolled && <span className="badge badge-green text-xs"><CheckCircle size={11} className="mr-1" />Enrolled</span>}
                  <span className={`badge ${LEVEL_COLORS[course.level] || 'badge-gray'} text-xs`}>{course.level}</span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{course.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-3 line-clamp-3">{course.description}</p>

              {/* Skills */}
              {course.courseSkills?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {course.courseSkills.slice(0, 4).map((cs: any) => (
                    <span key={cs.skill.id} className="badge badge-gray text-xs">{cs.skill.name}</span>
                  ))}
                  {course.courseSkills.length > 4 && <span className="badge badge-gray text-xs">+{course.courseSkills.length - 4}</span>}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400 mb-4 border-t border-gray-100 pt-3 mt-auto">
                <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
                <span className="flex items-center gap-1"><Users size={12} /> {course.enrolledCount}/{course.availableSeats} seats</span>
              </div>
              {course.instructor && (
                <div className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                  <Star size={11} /> {course.instructor}
                </div>
              )}

              <button
                onClick={() => !enrolled && !seatsFull && handleEnroll(course.id, course.name)}
                disabled={enrolled || seatsFull || enrolling === course.id}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  enrolled ? 'bg-green-100 text-green-700 cursor-default' :
                  seatsFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                  'btn-primary'
                }`}
              >
                {enrolling === course.id ? <><Loader2 size={14} className="animate-spin" /> Enrolling...</> :
                 enrolled ? <><CheckCircle size={14} /> Enrolled</> :
                 seatsFull ? 'Seats Full' : 'Enroll Now'}
              </button>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-12">
          <BookOpen size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No courses found matching your search</p>
        </div>
      )}
    </div>
  );
}
