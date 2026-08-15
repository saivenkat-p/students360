import React, { useState } from 'react';
import { ArrowLeft, Check, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Student } from '../../types';
import { api } from '../../services/api';

interface AddSeminarModalProps {
  isOpen: boolean;
  students: Student[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AddSeminarModal: React.FC<AddSeminarModalProps> = ({
  isOpen,
  students,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [studentId, setStudentId] = useState<number>(students[0]?.id || 1);
  const [topic, setTopic] = useState('The Importance of Communication');
  const [seminarDate, setSeminarDate] = useState('13/05/2025');
  const [mode, setMode] = useState<'Offline' | 'Online' | 'Hybrid'>('Offline');
  const [marks, setMarks] = useState<number>(9);
  const [remarks, setRemarks] = useState('Excellent presentation and content.');
  const [submitting, setSubmitting] = useState(false);

  // Evidence files list matching reference image
  const [evidenceFiles, setEvidenceFiles] = useState<Array<{ name: string; size: string; type: string }>>([
    { name: 'Seminar_Ravi.pdf', size: '1.2 MB', type: 'pdf' },
    { name: 'Ravi_Seminar.jpg', size: '1.5 MB', type: 'image' },
  ]);

  const handleRemoveFile = (index: number) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
  };

  const handleAddSampleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const sizeStr = `${(f.size / (1024 * 1024)).toFixed(1)} MB`;
      setEvidenceFiles([...evidenceFiles, { name: f.name, size: sizeStr, type: f.type.includes('image') ? 'image' : 'pdf' }]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);

    try {
      await api.createSeminar({
        student_id: Number(studentId),
        topic,
        seminar_date: seminarDate,
        presentation_mode: mode,
        marks_obtained: Number(marks),
        max_marks: 10.0,
        remarks,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to submit seminar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-50 w-full max-w-[480px] h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header Bar matching Reference UI Screen 4 */}
        <div className="bg-indigo-600 text-white px-4 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold tracking-tight">Add Seminar</h2>
          </div>
          <button
            onClick={() => handleSubmit()}
            disabled={submitting}
            className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white flex items-center justify-center"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Student Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Student Name</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.roll_number})
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter seminar topic"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              required
            />
          </div>

          {/* Seminar Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Seminar Date</label>
            <input
              type="text"
              value={seminarDate}
              onChange={(e) => setSeminarDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              required
            />
          </div>

          {/* Presentation Mode & Marks */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Presentation Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="Offline">Offline</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Marks (Out of 10)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter seminar remarks"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Upload Evidence */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Evidence (PPT / Photos / PDF)</label>
            <div className="space-y-2">
              {evidenceFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl shadow-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                      {file.type === 'pdf' ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{file.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(i)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <label className="mt-3 flex items-center justify-center space-x-2 w-full border border-dashed border-slate-300 rounded-xl py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50/50 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>+ Add More Files</span>
              <input type="file" onChange={handleAddSampleFile} className="hidden" />
            </label>
          </div>
        </form>
      </div>
    </div>
  );
};
