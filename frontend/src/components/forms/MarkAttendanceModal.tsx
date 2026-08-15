import React, { useState, useEffect } from 'react';
import { X, Calendar, Check, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';
import type { Student } from '../../types';

interface MarkAttendanceModalProps {
  isOpen: boolean;
  students: Student[];
  onClose: () => void;
  onSuccess: () => void;
}

export const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
  isOpen,
  students,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [period, setPeriod] = useState('Period 1');
  const [attendanceState, setAttendanceState] = useState<Record<number, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize all students to PRESENT by default
    const initial: Record<number, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
    students.forEach((s) => {
      initial[s.id] = 'PRESENT';
    });
    setAttendanceState(initial);
  }, [students]);

  const toggleStatus = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const records = Object.entries(attendanceState).map(([idStr, status]) => ({
        student_id: parseInt(idStr, 10),
        status,
        remarks: status !== 'PRESENT' ? status : undefined,
      }));

      await api.markAttendance({
        date,
        period,
        class_name: 'B.A. (HEP) II Sem',
        records,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit attendance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-indigo-200" />
            <h2 className="text-base font-bold">Mark Class Attendance</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Period 1">Period 1 (09:00 - 10:00)</option>
                <option value="Period 2">Period 2 (10:00 - 11:00)</option>
                <option value="Period 3">Period 3 (11:15 - 12:15)</option>
                <option value="Period 4">Period 4 (01:00 - 02:00)</option>
                <option value="Period 5">Period 5 (02:00 - 03:00)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Roster */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>Student ({students.length})</span>
              <span>Status</span>
            </div>

            {students.map((student) => {
              const current = attendanceState[student.id] || 'PRESENT';

              return (
                <div
                  key={student.id}
                  className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{student.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Roll: {student.roll_number}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => toggleStatus(student.id, 'PRESENT')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                        current === 'PRESENT'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Present</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleStatus(student.id, 'ABSENT')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                        current === 'ABSENT'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Absent</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleStatus(student.id, 'LATE')}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                        current === 'LATE'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Late</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer text-xs"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Submitting Attendance...' : 'Save Attendance Batch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
