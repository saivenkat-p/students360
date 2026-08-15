import React from 'react';
import { Bell, Menu } from 'lucide-react';

interface HeaderCardProps {
  teacherName?: string;
  designation?: string;
  collegeName?: string;
  unreadCount?: number;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({
  teacherName = "Md. Shahazadi Begum",
  designation = "Lecturer in English",
  collegeName = "GDC Ramachandrapuram",
  unreadCount = 3,
}) => {
  return (
    <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white p-5 rounded-b-3xl shadow-lg relative">
      <div className="flex items-center justify-between mb-4">
        <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
          <Menu className="w-6 h-6 text-white" />
        </button>
        <div className="relative">
          <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors relative">
            <Bell className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-indigo-700">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
          alt={teacherName}
          className="w-16 h-16 rounded-full border-2 border-white/80 object-cover shadow-md"
        />
        <div>
          <span className="text-xs uppercase tracking-wider text-indigo-200 font-medium">Welcome,</span>
          <h1 className="text-lg font-bold text-white leading-snug">{teacherName}</h1>
          <p className="text-xs text-indigo-100 font-normal">{designation}</p>
          <p className="text-xs text-indigo-200/80 font-medium mt-0.5">{collegeName}</p>
        </div>
      </div>
    </div>
  );
};
