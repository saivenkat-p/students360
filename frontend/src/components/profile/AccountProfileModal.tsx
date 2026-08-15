import React, { useState } from 'react';
import { X, Camera, Check, User, Mail, Building, Briefcase, BadgeCheck, Upload } from 'lucide-react';
import { api } from '../../services/api';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherData: {
    name: string;
    designation: string;
    department: string;
    collegeName: string;
    employeeCode: string;
    email: string;
    avatarUrl: string;
  };
  onUpdateSuccess: (updated: any) => void;
  onLogout?: () => void;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
  teacherData,
  onUpdateSuccess,
  onLogout,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(teacherData.name);
  const [designation, setDesignation] = useState(teacherData.designation);
  const [department, setDepartment] = useState(teacherData.department);
  const [collegeName, setCollegeName] = useState(teacherData.collegeName);
  const [employeeCode, setEmployeeCode] = useState(teacherData.employeeCode);
  const [email, setEmail] = useState(teacherData.email);
  const [avatarUrl, setAvatarUrl] = useState(teacherData.avatarUrl);
  const [saving, setSaving] = useState(false);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  ];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.uploadTeacherAvatar(formData);
        if (res?.user?.avatar_url) {
          setAvatarUrl(res.user.avatar_url);
        }
      } catch (err) {
        // Fallback local blob preview for smooth UX
        const localUrl = URL.createObjectURL(file);
        setAvatarUrl(localUrl);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updated = await api.updateTeacherProfile({
        full_name: name,
        designation,
        department,
        college_name: collegeName,
        employee_code: employeeCode,
        email,
        avatar_url: avatarUrl,
      });

      onUpdateSuccess(updated);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <h2 className="text-base font-bold">Account & Profile Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center border-b border-slate-100 pb-5">
            <div className="relative group cursor-pointer mb-3">
              <img
                src={avatarUrl}
                alt={name}
                className="w-24 h-24 rounded-full border-4 border-indigo-100 object-cover shadow-md group-hover:opacity-90 transition-opacity"
              />
              <label className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 mb-1" />
                <span>Change</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-xs font-bold text-slate-800">Profile Picture</p>
            <p className="text-[11px] text-slate-400 font-medium mb-3">Click photo or select a preset avatar</p>

            {/* Preset Avatars */}
            <div className="flex space-x-2">
              {presetAvatars.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Preset ${i}`}
                  onClick={() => setAvatarUrl(url)}
                  className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-all hover:scale-105 ${
                    avatarUrl === url ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Designation</span>
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Department</span>
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                <span>College / Institution</span>
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Employee Code</span>
                </label>
                <input
                  type="text"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Action & Logout */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 px-4 rounded-xl border border-rose-200 flex items-center justify-center space-x-2 transition-all text-xs cursor-pointer"
              >
                <span>Sign Out / Log Out</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

