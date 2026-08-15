import React, { useState, useEffect } from 'react';
import { X, Mic, FileText, Lightbulb, Users, Star, Check, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import type { Student } from '../../types';

interface AddActivityModalProps {
  isOpen: boolean;
  initialType?: 'seminar' | 'assignment' | 'pbl' | 'pgl' | 'activity';
  students: Student[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  initialType = 'seminar',
  students,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'seminar' | 'assignment' | 'pbl' | 'pgl' | 'activity'>(initialType);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(students[0]?.id || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common date helper
  const todayStr = new Date().toISOString().split('T')[0];

  // Seminar fields
  const [seminarTopic, setSeminarTopic] = useState('');
  const [seminarDate, setSeminarDate] = useState(todayStr);
  const [presentationMode, setPresentationMode] = useState('OFFLINE');
  const [seminarMarks, setSeminarMarks] = useState('9.0');

  // Assignment fields
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentUnit, setAssignmentUnit] = useState('Unit II');
  const [assignmentDueDate, setAssignmentDueDate] = useState(todayStr);
  const [assignmentMaxMarks, setAssignmentMaxMarks] = useState('10.0');

  // PBL fields
  const [pblTitle, setPblTitle] = useState('');
  const [pblDescription, setPblDescription] = useState('');
  const [pblProgress, setPblProgress] = useState('25');
  const [pblDeadline, setPblDeadline] = useState(todayStr);

  // PGL fields
  const [pglTitle, setPglTitle] = useState('');
  const [pglDate, setPglDate] = useState(todayStr);
  const [pglParticipation, setPglParticipation] = useState('HIGH');

  // Generic activity fields
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDate, setActivityDate] = useState(todayStr);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (initialType) {
      setActiveTab(initialType);
    }
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [initialType, students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedStudentId) {
      setError('Please select a student.');
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'seminar') {
        await api.createSeminar({
          student_id: selectedStudentId,
          topic: seminarTopic,
          seminar_date: seminarDate,
          presentation_mode: presentationMode,
          marks_obtained: parseFloat(seminarMarks) || 9.0,
          remarks: remarks || undefined,
        });
      } else if (activeTab === 'assignment') {
        await api.createAssignment({
          student_id: selectedStudentId,
          title: assignmentTitle,
          unit: assignmentUnit,
          due_date: assignmentDueDate,
          max_marks: parseFloat(assignmentMaxMarks) || 10.0,
          remarks: remarks || undefined,
        });
      } else if (activeTab === 'pbl') {
        await api.createPbl({
          student_id: selectedStudentId,
          project_title: pblTitle,
          description: pblDescription || undefined,
          progress_percentage: parseInt(pblProgress, 10) || 25,
          deadline: pblDeadline,
          remarks: remarks || undefined,
        });
      } else if (activeTab === 'pgl') {
        await api.createPgl({
          student_id: selectedStudentId,
          activity_title: pglTitle,
          activity_date: pglDate,
          participation_level: pglParticipation,
          marks_obtained: 9.0,
          remarks: remarks || undefined,
        });
      } else {
        await api.createGenericActivity({
          student_id: selectedStudentId,
          title: activityTitle,
          date: activityDate,
          type: 'OTHER',
          remarks: remarks || undefined,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record activity');
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
            <Star className="w-5 h-5 text-indigo-200" />
            <h2 className="text-base font-bold">Log Academic Activity</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1.5 m-4 mb-0 rounded-2xl overflow-x-auto gap-1">
          {[
            { id: 'seminar', label: 'Seminar', icon: Mic },
            { id: 'assignment', label: 'Assignment', icon: FileText },
            { id: 'pbl', label: 'PBL Project', icon: Lightbulb },
            { id: 'pgl', label: 'PGL Activity', icon: Users },
            { id: 'activity', label: 'Other', icon: Star },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setActiveTab(tab.id as any); setError(null); }}
                className={`flex-1 min-w-[90px] py-2 px-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Student Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Student *
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.roll_number}) — {s.course}
                </option>
              ))}
            </select>
          </div>

          {/* Seminar Specific Inputs */}
          {activeTab === 'seminar' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seminar Topic *</label>
                <input
                  type="text"
                  required
                  value={seminarTopic}
                  onChange={(e) => setSeminarTopic(e.target.value)}
                  placeholder="e.g. Modern English Literature Analysis"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Seminar Date</label>
                  <input
                    type="date"
                    value={seminarDate}
                    onChange={(e) => setSeminarDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mode</label>
                  <select
                    value={presentationMode}
                    onChange={(e) => setPresentationMode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="OFFLINE">Offline</option>
                    <option value="ONLINE">Online</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Score / Marks (out of 10)</label>
                <input
                  type="number"
                  step="0.5"
                  value={seminarMarks}
                  onChange={(e) => setSeminarMarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Assignment Specific Inputs */}
          {activeTab === 'assignment' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="e.g. Critical Essay on Romantic Poetry"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit / Chapter</label>
                  <input
                    type="text"
                    value={assignmentUnit}
                    onChange={(e) => setAssignmentUnit(e.target.value)}
                    placeholder="Unit II"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={assignmentDueDate}
                    onChange={(e) => setAssignmentDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PBL Specific Inputs */}
          {activeTab === 'pbl' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={pblTitle}
                  onChange={(e) => setPblTitle(e.target.value)}
                  placeholder="e.g. Environmental Literacy Research"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Progress Completion %</label>
                  <select
                    value={pblProgress}
                    onChange={(e) => setPblProgress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="0">0% — Initiated</option>
                    <option value="25">25% — Planning</option>
                    <option value="50">50% — Mid Evaluation</option>
                    <option value="75">75% — Draft Finalized</option>
                    <option value="100">100% — Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={pblDeadline}
                    onChange={(e) => setPblDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PGL Specific Inputs */}
          {activeTab === 'pgl' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PGL Activity Title *</label>
                <input
                  type="text"
                  required
                  value={pglTitle}
                  onChange={(e) => setPglTitle(e.target.value)}
                  placeholder="e.g. Peer Group Reading Workshop"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Activity Date</label>
                  <input
                    type="date"
                    value={pglDate}
                    onChange={(e) => setPglDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Participation Level</label>
                  <select
                    value={pglParticipation}
                    onChange={(e) => setPglParticipation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Other Activity Inputs */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  placeholder="e.g. Quiz Competition / Co-Curricular"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* General Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Remarks / Feedback</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Excellent delivery and clear concepts..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer text-xs"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Submitting Activity...' : 'Submit & Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
