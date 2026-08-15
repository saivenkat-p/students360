import React from 'react';
import { X, Mic, FileText, Lightbulb, Users, Star, Calendar, BookOpen, UserPlus } from 'lucide-react';

interface QuickAddMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: string) => void;
}

export const QuickAddMenuModal: React.FC<QuickAddMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const items = [
    { id: 'add_student', label: 'Add New Student', icon: UserPlus, color: 'text-indigo-600 bg-indigo-100' },
    { id: 'seminar', label: 'Add Seminar', icon: Mic, color: 'text-purple-600 bg-purple-100' },
    { id: 'assignment', label: 'Add Assignment', icon: FileText, color: 'text-emerald-600 bg-emerald-100' },
    { id: 'pbl', label: 'Add PBL Project', icon: Lightbulb, color: 'text-amber-600 bg-amber-100' },
    { id: 'pgl', label: 'Add PGL Activity', icon: Users, color: 'text-sky-600 bg-sky-100' },
    { id: 'activity', label: 'Add Activity', icon: Star, color: 'text-pink-600 bg-pink-100' },
    { id: 'attendance', label: 'Mark Attendance', icon: Calendar, color: 'text-indigo-600 bg-indigo-100' },
    { id: 'material', label: 'Upload Material', icon: BookOpen, color: 'text-teal-600 bg-teal-100' },
  ];


  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Quick Academic Action</h3>
            <p className="text-xs text-slate-400">Select activity type to add</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectAction(item.id);
                  onClose();
                }}
                className="flex items-center space-x-3 p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-left group"
              >
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
