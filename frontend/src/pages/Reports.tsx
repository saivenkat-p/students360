import React, { useState } from 'react';
import { 
  FileText, Clock, Mic, CheckSquare, Lightbulb, Users, Sliders, Download, ChevronRight 
} from 'lucide-react';
import { api } from '../services/api';

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'student' | 'class'>('student');

  const reportItems = [
    {
      id: 'activity_summary',
      title: 'Activity Summary Report',
      desc: 'Overview of all activities',
      icon: FileText,
      color: 'text-sky-600 bg-sky-100',
    },
    {
      id: 'pending_activities',
      title: 'Pending Activities Report',
      desc: 'Students with pending activities',
      icon: Clock,
      color: 'text-amber-600 bg-amber-100',
    },
    {
      id: 'seminar_report',
      title: 'Seminar Report',
      desc: 'Seminar completion & marks',
      icon: Mic,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      id: 'assignment_report',
      title: 'Assignment Report',
      desc: 'Assignment submission & marks',
      icon: CheckSquare,
      color: 'text-emerald-600 bg-emerald-100',
    },
    {
      id: 'pbl_report',
      title: 'PBL Report',
      desc: 'Project progress & evaluation',
      icon: Lightbulb,
      color: 'text-orange-600 bg-orange-100',
    },
    {
      id: 'pgl_report',
      title: 'PGL Report',
      desc: 'PGL activities & verification',
      icon: Users,
      color: 'text-teal-600 bg-teal-100',
    },
    {
      id: 'custom_report',
      title: 'Custom Report',
      desc: 'Generate custom report',
      icon: Sliders,
      color: 'text-pink-600 bg-pink-100',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Header Bar matching Reference UI Screen 6 */}
      <div className="bg-indigo-600 text-white px-4 py-3.5 flex items-center justify-between shadow-md">
        <h1 className="text-base font-bold tracking-tight">Reports</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Tab Switcher: Student Reports vs Class Reports */}
        <div className="flex bg-slate-200/70 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('student')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'student'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Reports
          </button>
          <button
            onClick={() => setActiveTab('class')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'class'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Class Reports
          </button>
        </div>

        {/* List of Report Cards matching Screen 6 */}
        <div className="space-y-2.5">
          {reportItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={api.getClassSummaryPdfUrl()}
                target="_blank"
                rel="noreferrer"
                className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group block"
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-xs shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </a>
            );
          })}
        </div>

        {/* Primary Export All Data Button matching Screen 6 */}
        <a
          href={api.getExportCsvUrl()}
          download
          className="w-full bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 hover:from-indigo-800 hover:to-purple-700 text-white py-3.5 px-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] mt-6 block text-center"
        >
          <Download className="w-5 h-5" />
          <div className="text-left">
            <div className="text-sm font-bold leading-tight">Export All Data</div>
            <div className="text-[10px] text-indigo-100 font-normal">Backup / Export app data (CSV)</div>
          </div>
        </a>
      </div>
    </div>
  );
};
