import React, { useEffect, useState } from 'react';
import { Search, Filter, ChevronRight, UserPlus } from 'lucide-react';
import type { Student } from '../types';
import { api } from '../services/api';

interface StudentsProps {
  onSelectStudent: (studentId: number) => void;
  onAddStudent: () => void;
}

export const Students: React.FC<StudentsProps> = ({ onSelectStudent, onAddStudent }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await api.getStudents({ search });
        setStudents(data);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [search]);

  const getAvatarColor = (index: number) => {
    const palette = [
      'bg-slate-700 text-white',
      'bg-indigo-600 text-white',
      'bg-sky-600 text-white',
      'bg-slate-600 text-white',
      'bg-purple-600 text-white',
      'bg-teal-600 text-white',
      'bg-blue-600 text-white',
      'bg-slate-700 text-white',
    ];
    return palette[index % palette.length];
  };

  const getBadgeStyle = (pct?: number, status?: string) => {
    if (pct && pct >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (pct && pct >= 65) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-rose-100 text-rose-700 border-rose-200';
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen p-8 flex flex-col items-center justify-center text-slate-500">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-indigo-700">Loading Students List...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-10 space-y-6">
      {/* Header Bar */}
      <div className="bg-indigo-600 text-white p-5 rounded-2xl md:rounded-3xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight">Student Directory</h1>
          <p className="text-xs text-indigo-200 mt-0.5">Manage and track {students.length} registered students</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onAddStudent}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white font-bold text-xs"
            title="Add Student"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Student</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or roll number..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        {/* Student Cards Grid (1 col on mobile, 2 cols on tablet, 3 cols on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {students.map((student, idx) => {
            const parts = student.name.split(' ');
            const initials = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase();
            const pct = student.overall_progress || 85;

            return (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student.id)}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99]"
              >
                <div className="flex items-center space-x-3.5">
                  {/* Initials Avatar */}
                  <div
                    className={`w-12 h-12 rounded-full ${getAvatarColor(
                      idx
                    )} font-bold text-sm flex items-center justify-center shadow-xs shrink-0`}
                  >
                    {initials}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Roll No: {student.roll_number}
                    </p>
                    <p className="text-[11px] text-slate-400 font-normal">
                      {student.course}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getBadgeStyle(
                      pct,
                      student.status
                    )}`}
                  >
                    {pct}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
