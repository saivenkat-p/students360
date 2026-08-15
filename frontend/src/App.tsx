import React, { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { StudentProfile } from './pages/StudentProfile';
import { Materials } from './pages/Materials';
import { Reports } from './pages/Reports';
import { BottomNav } from './components/layout/BottomNav';
import { QuickAddMenuModal } from './components/forms/QuickAddMenuModal';
import { AddSeminarModal } from './components/forms/AddSeminarModal';
import { Student } from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'materials' | 'reports'>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);

  // Modals
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isSeminarModalOpen, setIsSeminarModalOpen] = useState(false);

  useEffect(() => {
    async function fetchStudents() {
      try {
        const data = await api.getStudents();
        setStudents(data);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      }
    }
    fetchStudents();
  }, []);

  const handleSelectStudent = (id: number) => {
    setSelectedStudentId(id);
  };

  const handleOpenAction = (action: string) => {
    if (action === 'seminar') {
      setIsSeminarModalOpen(true);
    } else if (action === 'students') {
      setActiveTab('students');
      setSelectedStudentId(null);
    } else if (action === 'reports') {
      setActiveTab('reports');
    } else if (action === 'material') {
      setActiveTab('materials');
    } else {
      setIsSeminarModalOpen(true);
    }
  };

  const renderCurrentView = () => {
    if (selectedStudentId !== null) {
      return (
        <StudentProfile
          studentId={selectedStudentId}
          onBack={() => setSelectedStudentId(null)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            onOpenAction={handleOpenAction}
            onSelectStudent={handleSelectStudent}
          />
        );
      case 'students':
        return (
          <Students
            onSelectStudent={handleSelectStudent}
            onAddStudent={() => setIsSeminarModalOpen(true)}
          />
        );
      case 'materials':
        return <Materials onUploadClick={() => setIsSeminarModalOpen(true)} />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard onOpenAction={handleOpenAction} onSelectStudent={handleSelectStudent} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-0 md:py-6">
      {/* Outer Device Shell / Frame */}
      <div className="mobile-frame rounded-none md:rounded-[40px] overflow-hidden border-0 md:border-[10px] md:border-slate-800 shadow-2xl relative flex flex-col w-full max-w-[480px]">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderCurrentView()}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setSelectedStudentId(null);
            setActiveTab(tab);
          }}
          onOpenQuickAdd={() => setIsQuickMenuOpen(true)}
        />

        {/* Floating Quick Action Selection Modal */}
        <QuickAddMenuModal
          isOpen={isQuickMenuOpen}
          onClose={() => setIsQuickMenuOpen(false)}
          onSelectAction={handleOpenAction}
        />

        {/* Add Seminar Form Modal (Screen 4 exact match) */}
        <AddSeminarModal
          isOpen={isSeminarModalOpen}
          students={students}
          onClose={() => setIsSeminarModalOpen(false)}
          onSuccess={() => {
            // refresh data
            if (activeTab === 'dashboard') {
              setActiveTab('dashboard');
            }
          }}
        />
      </div>
    </div>
  );
}

export default App;
