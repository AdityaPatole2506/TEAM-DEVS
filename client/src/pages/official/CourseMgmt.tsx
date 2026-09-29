import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Plus, Search, Edit2, Trash2, Users,
  Clock, CheckCircle, XCircle, Award, X, Sparkles
} from 'lucide-react';
import { coursesApi, officialApi } from '../../services/api';
import toast from 'react-hot-toast';

interface CourseItem {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  level?: string;
  availableSeats: number;
  enrolledCount: number;
  isActive: boolean;
  instructor?: string;
  courseSkills?: Array<{
    skill: { id: string; name: string };
  }>;
}

export default function CourseMgmt() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    description: '',
    duration: '10 weeks',
    level: 'Intermediate',
    availableSeats: 50,
    instructor: '',
    skills: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await coursesApi.getAll();
      setCourses(res.data.data || []);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setForm({
      name: '',
      description: '',
      duration: '10 weeks',
      level: 'Intermediate',
      availableSeats: 50,
      instructor: '',
      skills: 'JavaScript, Python, React',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (course: CourseItem) => {
    setEditingCourse(course);
    setForm({
      name: course.name,
      description: course.description || '',
      duration: course.duration || '8 weeks',
      level: course.level || 'Intermediate',
      availableSeats: course.availableSeats,
      instructor: course.instructor || '',
      skills: course.courseSkills?.map(s => s.skill.name).join(', ') || '',
      isActive: course.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error('Course title is required');
      return;
    }
    setSubmitting(true);
    try {
      const skillsArray = form.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (editingCourse) {
        await officialApi.updateCourse(editingCourse.id, {
          name: form.name,
          description: form.description,
          duration: form.duration,
          level: form.level,
          availableSeats: form.availableSeats,
          instructor: form.instructor,
          isActive: form.isActive,
        });
        toast.success('Course updated successfully');
      } else {
        await officialApi.createCourse({
          name: form.name,
          description: form.description,
          duration: form.duration,
          level: form.level,
          availableSeats: form.availableSeats,
          instructor: form.instructor,
          skills: skillsArray,
        });
        toast.success('New course created successfully');
      }
      setModalOpen(false);
      fetchCourses();
    } catch {
      toast.error('Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await officialApi.deleteCourse(id);
      toast.success('Course deleted');
      fetchCourses();
    } catch {
      toast.error('Failed to delete course');
    }
  };

  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.instructor && c.instructor.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  const totalSeats = courses.reduce((acc, c) => acc + c.availableSeats, 0);
  const totalEnrolled = courses.reduce((acc, c) => acc + c.enrolledCount, 0);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <BookOpen size={14} /> Training & Skill Upskilling Programs
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Course & Curriculum Management</h1>
          <p className="text-gray-500 text-sm">
            Publish, edit and monitor capacity for government-sponsored upskilling programs
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2 text-sm shadow-md self-start md:self-auto"
        >
          <Plus size={16} /> Add New Program
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="text-xs text-gray-500 font-medium">Total Courses</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{courses.length}</div>
        </div>
        <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 shadow-sm">
          <div className="text-xs text-blue-600 font-medium">Total Enrolled Citizens</div>
          <div className="text-2xl font-bold text-blue-800 mt-1">{totalEnrolled}</div>
        </div>
        <div className="bg-teal-50/60 rounded-xl p-4 border border-teal-100 shadow-sm">
          <div className="text-xs text-teal-600 font-medium">Total Seats Available</div>
          <div className="text-2xl font-bold text-teal-800 mt-1">{totalSeats}</div>
        </div>
        <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-100 shadow-sm">
          <div className="text-xs text-purple-600 font-medium">Overall Seat Occupancy</div>
          <div className="text-2xl font-bold text-purple-800 mt-1">
            {totalSeats > 0 ? Math.round((totalEnrolled / totalSeats) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            type="text"
            placeholder="Search programs by title, instructor, or topic..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 py-2 text-sm"
          />
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
          <p className="text-gray-400 text-sm mt-3">Loading courses...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 text-gray-400">
          <BookOpen size={40} className="mx-auto text-gray-300 mb-2" />
          <p className="font-medium text-gray-600">No courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(course => {
            const pct = Math.min(100, Math.round((course.enrolledCount / (course.availableSeats || 1)) * 100));

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="badge-blue text-[11px]">{course.level || 'Intermediate'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      course.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {course.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base leading-snug">{course.name}</h3>
                  <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">{course.description}</p>

                  {/* Skills tags */}
                  {course.courseSkills && course.courseSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {course.courseSkills.slice(0, 4).map((cs, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
                          {cs.skill.name}
                        </span>
                      ))}
                      {course.courseSkills.length > 4 && (
                        <span className="text-[10px] text-gray-400 self-center">
                          +{course.courseSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta details */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-blue-600" />
                      <span>{course.duration || '8 weeks'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award size={13} className="text-indigo-600" />
                      <span className="truncate">{course.instructor || 'Lead Instructor'}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Enrollment</span>
                      <span className="font-semibold text-gray-800">
                        {course.enrolledCount} / {course.availableSeats} seats ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(course)}
                    className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Course"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(course.id, course.name)}
                    className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingCourse ? 'Edit Training Program' : 'Create New Training Program'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label text-xs">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Advanced Artificial Intelligence & Machine Learning"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="label text-xs">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Curriculum overview and objectives..."
                    className="input-field text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Duration</label>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={e => setForm({ ...form, duration: e.target.value })}
                      placeholder="e.g. 12 weeks"
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Proficiency Level</label>
                    <select
                      value={form.level}
                      onChange={e => setForm({ ...form, level: e.target.value })}
                      className="input-field text-sm"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Seat Capacity</label>
                    <input
                      type="number"
                      min={1}
                      value={form.availableSeats}
                      onChange={e => setForm({ ...form, availableSeats: parseInt(e.target.value) || 0 })}
                      className="input-field text-sm"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Lead Instructor</label>
                    <input
                      type="text"
                      value={form.instructor}
                      onChange={e => setForm({ ...form, instructor: e.target.value })}
                      placeholder="e.g. Dr. Ramesh Joshi"
                      className="input-field text-sm"
                    />
                  </div>
                </div>

                {!editingCourse && (
                  <div>
                    <label className="label text-xs">Key Skills Taught (Comma separated)</label>
                    <input
                      type="text"
                      value={form.skills}
                      onChange={e => setForm({ ...form, skills: e.target.value })}
                      placeholder="e.g. React, Node.js, Express, MongoDB"
                      className="input-field text-sm"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <label htmlFor="isActive" className="text-xs font-medium text-gray-700 cursor-pointer">
                    Course is actively accepting citizen enrollments
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs py-2 px-5"
                  >
                    {submitting ? 'Saving...' : editingCourse ? 'Save Changes' : 'Publish Program'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
