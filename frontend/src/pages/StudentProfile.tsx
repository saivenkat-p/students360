import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, MoreVertical, Phone, Mic, FileText, Lightbulb, Users, 
  Star, ChevronRight, FileDown, CheckCircle2, Clock, AlertCircle, Paperclip
} from 'lucide-react';
import { StudentProfile as StudentProfileType } from '../types';
import { api } from '../services/api';

import { EditStudentModal } from '../components/forms/EditStudentModal';

interface StudentProfileProps {
  studentId: number;
  onBack: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ studentId, onBack }) => {
  const [profile, setProfile] = useState<StudentProfileType | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await api.getStudentProfile(studentId);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [studentId]);

  const handleArchiveStudent = async () => {
    if (!profile) return;
    if (window.confirm(`Archive ${profile.name}? This student will be moved to archived records.`)) {
      try {
        await api.updateStudent(profile.id, { status: 'ARCHIVED' });
        onBack();
      } catch (err: any) {
        alert(err.message || 'Failed to archive student');
      }
    }
  };

  const handleDeleteStudent = async () => {
    if (!profile) return;
    if (window.confirm(`Remove ${profile.name}? This will permanently remove the student's record and associated academic data.`)) {
      try {
        await api.deleteStudent(profile.id);
        onBack();
      } catch (err: any) {
        alert(err.message || 'Failed to delete student');
      }
    }
  };

  if (loading || !profile) {
    return (
      <div className="bg-slate-50 min-h-screen p-4 text-center text-slate-500">
        Loading student profile...
      </div>
    );
  }

  const parts = profile.name.split(' ');
  const initials = parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase();

  const overviewRows = [
    {
      label: 'Seminars',
      count: profile.seminars_count,
      status: profile.seminars_status,
      icon: Mic,
      iconColor: 'text-purple-600 bg-purple-100',
    },
    {
      label: 'Assignments',
      count: profile.assignments_count,
      status: profile.assignments_status,
      icon: FileText,
      iconColor: 'text-emerald-600 bg-emerald-100',
    },
    {
      label: 'PBL Projects',
      count: profile.pbl_count,
      status: profile.pbl_status,
      icon: Lightbulb,
      iconColor: 'text-amber-600 bg-amber-100',
    },
    {
      label: 'PGL Activities',
      count: profile.pgl_count,
      status: profile.pgl_status,
      icon: Users,
      iconColor: 'text-sky-600 bg-sky-100',
    },
    {
      label: 'Other Activities',
      count: profile.other_count,
      status: profile.other_status,
      icon: Star,
      iconColor: 'text-pink-600 bg-pink-100',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-12 relative">
      {/* Top Bar */}
      <div className="bg-indigo-600 text-white px-4 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-white/10 transition-colors text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold tracking-tight">Student Profile</h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded-full hover:bg-white/10 transition-colors text-white cursor-pointer"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 text-slate-700 animate-in fade-in duration-150">
              <button
                onClick={() => { setIsMenuOpen(false); setIsEditModalOpen(true); }}
                className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
              >
                <span>✏️ Edit Student</span>
              </button>
              <button
                onClick={() => { setIsMenuOpen(false); handleArchiveStudent(); }}
                className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 text-amber-600 flex items-center space-x-2 cursor-pointer"
              >
                <span>📁 Archive Student</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => { setIsMenuOpen(false); handleDeleteStudent(); }}
                className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-rose-50 text-rose-600 flex items-center space-x-2 cursor-pointer"
              >
                <span>🗑️ Remove Student</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <EditStudentModal
        isOpen={isEditModalOpen}
        student={profile}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadProfile}
      />


      <div className="p-4 space-y-4">
        {/* Profile Card matching Screen 3 Header */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-700 text-white font-bold text-xl flex items-center justify-center shadow-md mb-2">
            {initials}
          </div>
          <h2 className="text-lg font-bold text-slate-800">{profile.name}</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Roll No: {profile.roll_number}
          </p>
          <p className="text-xs text-slate-400 font-normal">{profile.course}</p>
          {profile.phone && (
            <div className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 mt-2 bg-indigo-50 px-3 py-1 rounded-full">
              <Phone className="w-3.5 h-3.5" />
              <span>{profile.phone}</span>
            </div>
          )}
        </div>

        {/* Tab Switcher: Overview vs Academic Timeline */}
        <div className="flex bg-slate-200/70 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Activity Overview
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'timeline'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Academic Timeline
          </button>
        </div>

        {/* Overview Tab Content matching Screen 3 */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
                Activity Overview
              </h3>

              <div className="space-y-3">
                {overviewRows.map((row) => {
                  const Icon = row.icon;
                  const isCompleted = row.status === 'Completed';

                  return (
                    <div
                      key={row.label}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl ${row.iconColor} flex items-center justify-center`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {row.label}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-bold text-slate-600">
                          {row.count}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {row.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Link Cards matching Screen 3 */}
            <div className="space-y-2">
              <div
                onClick={() => setActiveTab('timeline')}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                      View All Records
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Check all activities & evidence
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </div>

              <a
                href={api.getStudentReportPdfUrl(profile.id)}
                target="_blank"
                rel="noreferrer"
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:border-indigo-200 transition-all cursor-pointer flex items-center justify-between group block"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <FileDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                      Student Report
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Generate student report (PDF)
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </a>
            </div>
          </div>
        )}

        {/* Academic Timeline Stream */}
        {activeTab === 'timeline' && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Academic Journey Timeline
            </h3>

            <div className="relative pl-6 border-l-2 border-indigo-100 space-y-4">
              {profile.activities.map((act) => {
                const isCompleted = act.status === 'COMPLETED';
                const isPending = act.status === 'PENDING';

                return (
                  <div key={act.id} className="relative">
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-indigo-600 shadow-xs">
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : isPending ? (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">
                          {act.type}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {act.due_date || 'Recent'}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800">{act.title}</h4>
                      {act.remarks && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">
                          "{act.remarks}"
                        </p>
                      )}

                      {act.marks_obtained !== undefined && act.marks_obtained !== null && (
                        <p className="text-[11px] font-bold text-emerald-600 mt-1">
                          Score: {act.marks_obtained} / {act.max_marks || 10}
                        </p>
                      )}

                      {/* Evidence Files attachments */}
                      {act.evidence_files && act.evidence_files.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-400 flex items-center space-x-1">
                            <Paperclip className="w-3 h-3" />
                            <span>Attached Evidence ({act.evidence_files.length})</span>
                          </span>
                          {act.evidence_files.map((ef) => (
                            <a
                              key={ef.id}
                              href={api.getEvidenceFileUrl(ef.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-indigo-600 hover:underline block truncate"
                            >
                              • {ef.file_name} ({ef.file_size})
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
