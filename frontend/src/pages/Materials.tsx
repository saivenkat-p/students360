import React, { useEffect, useState } from 'react';
import { Search, Filter, FileText, Video, Link2, MoreVertical, Plus } from 'lucide-react';
import type { Material } from '../types';
import { api } from '../services/api';

interface MaterialsProps {
  onUploadClick: () => void;
}

export const Materials: React.FC<MaterialsProps> = ({ onUploadClick }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [category, setCategory] = useState<string>('All');
  const [courseFilter, setCourseFilter] = useState<string>('B.A. (HEP) II Sem');
  const [unitFilter, setUnitFilter] = useState<string>('Unit II');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadMaterials() {
      try {
        const data = await api.getMaterials({
          category,
          course: courseFilter,
          unit: unitFilter,
          search,
        });
        setMaterials(data);
      } catch (err) {
        console.error('Failed to load materials:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMaterials();
  }, [category, courseFilter, unitFilter, search]);

  const categories = ['All', 'Notes', 'PPT', 'Videos', 'Others'];

  const getFileIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'NOTES':
        return <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center shadow-xs">PDF</div>;
      case 'PPT':
        return <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 font-bold text-xs flex items-center justify-center shadow-xs">PPT</div>;
      case 'VIDEO':
        return <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs"><Video className="w-5 h-5" /></div>;
      case 'QUESTION_BANK':
        return <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center shadow-xs">PDF</div>;
      case 'LINK':
        return <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs"><Link2 className="w-5 h-5" /></div>;
      default:
        return <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-xs"><FileText className="w-5 h-5" /></div>;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12 space-y-6">
      {/* Header Bar */}
      <div className="bg-indigo-600 text-white p-5 rounded-2xl md:rounded-3xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight">Course Materials</h1>
          <p className="text-xs text-indigo-200 mt-0.5">Notes, presentations, video lectures, and question banks</p>
        </div>
        <button
          onClick={onUploadClick}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white font-bold text-xs"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Material</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl px-4 flex space-x-6 overflow-x-auto no-scrollbar shadow-xs">
        {categories.map((cat) => {
          const isActive = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-xl">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All Courses">All Courses</option>
            <option value="B.A. (HEP) II Sem">B.A. (HEP) II Sem</option>
            <option value="B.Sc. (MPCs) II Sem">B.Sc. (MPCs) II Sem</option>
          </select>

          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All Units">All Units</option>
            <option value="Unit I">Unit I</option>
            <option value="Unit II">Unit II</option>
            <option value="Unit III">Unit III</option>
          </select>
        </div>

        {/* Material Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition-all group"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                {getFileIcon(mat.type)}
                <div className="min-w-0">
                  <h3 className="text-xs md:text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                    {mat.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {mat.unit} — The First Day
                  </p>
                  <p className="text-[10px] text-slate-400 font-normal">
                    12 May 2025 • {mat.file_size}
                  </p>
                </div>
              </div>

              <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
