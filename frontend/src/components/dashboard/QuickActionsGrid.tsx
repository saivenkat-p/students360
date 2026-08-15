import React from 'react';
import { 
  Mic, FileText, Lightbulb, Users, Star, 
  BookOpen, BarChart3, UserCheck, Calendar 
} from 'lucide-react';

interface QuickActionsGridProps {
  onOpenAction: (actionType: string) => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ onOpenAction }) => {
  const actions = [
    { id: 'seminar', label: 'Add Seminar', icon: Mic, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
    { id: 'assignment', label: 'Add Assignment', icon: FileText, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
    { id: 'pbl', label: 'Add PBL', icon: Lightbulb, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
    { id: 'pgl', label: 'Add PGL', icon: Users, color: 'text-sky-600 bg-sky-50 hover:bg-sky-100' },
    { id: 'attendance', label: 'Attendance', icon: Calendar, color: 'text-rose-600 bg-rose-50 hover:bg-rose-100' },
    { id: 'activity', label: 'Add Activity', icon: Star, color: 'text-pink-600 bg-pink-50 hover:bg-pink-100' },
    { id: 'material', label: 'Share Material', icon: BookOpen, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
    { id: 'reports', label: 'View Reports', icon: BarChart3, color: 'text-violet-600 bg-violet-50 hover:bg-violet-100' },
    { id: 'students', label: 'Student List', icon: UserCheck, color: 'text-teal-600 bg-teal-50 hover:bg-teal-100' },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4">
      <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
        <span>Quick Actions</span>
        <span className="text-[11px] font-medium text-slate-400">1-Tap Action</span>
      </h2>

      <div className="grid grid-cols-4 gap-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onOpenAction(act.id)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl transition-all active:scale-95 text-center group hover:shadow-sm border border-transparent hover:border-slate-100"
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-1.5 ${act.color} transition-transform group-hover:scale-105`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 leading-tight">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
