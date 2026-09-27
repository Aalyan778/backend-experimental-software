import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { FormDetail } from './components/FormDetail.tsx';
import { DocsView } from './components/DocsView.tsx';
import { CreateFormModal } from './components/CreateFormModal.tsx';
import { LivePlaygroundModal } from './components/LivePlaygroundModal.tsx';
import { fetchForms, fetchOverviewStats, resetDemoData } from './services/api.ts';
import { FormItem, OverviewStats } from './types.ts';
import { Terminal, Heart } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'docs'>('landing');
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [forms, setForms] = useState<FormItem[]>([]);
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [playgroundTargetId, setPlaygroundTargetId] = useState<string | undefined>(undefined);

  const loadData = async () => {
    try {
      setLoading(true);
      const [formsList, overview] = await Promise.all([
        fetchForms(),
        fetchOverviewStats(),
      ]);
      setForms(formsList);
      setStats(overview);
    } catch (err) {
      console.error('Error loading initial data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenPlayground = (formId?: string) => {
    setPlaygroundTargetId(formId || forms[0]?.id);
    setIsPlaygroundOpen(true);
  };

  const handleFormCreated = (newForm: FormItem) => {
    setForms(prev => [newForm, ...prev]);
    setSelectedFormId(newForm.id);
    setCurrentView('dashboard');
  };

  const handleFormUpdated = (updated: FormItem) => {
    setForms(prev => prev.map(f => (f.id === updated.id ? { ...f, ...updated } : f)));
  };

  const handleFormDeleted = (deletedId: string) => {
    setForms(prev => prev.filter(f => f.id !== deletedId));
    setSelectedFormId(null);
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset all demo forms and submissions to initial state?')) return;
    try {
      await resetDemoData();
      await loadData();
      setSelectedFormId(null);
    } catch (err) {
      console.error('Error resetting demo', err);
    }
  };

  const selectedForm = forms.find(f => f.id === selectedFormId);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Bar adhering strictly to Top Bar Contract */}
      <Navbar
        currentView={currentView}
        onNavigate={view => {
          setCurrentView(view);
          setSelectedFormId(null);
        }}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenPlayground={() => handleOpenPlayground()}
      />

      {/* Main Viewport */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => setCurrentView('dashboard')}
            onOpenDocs={() => setCurrentView('docs')}
            onOpenPlayground={handleOpenPlayground}
            demoForm={forms[0]}
          />
        )}

        {currentView === 'dashboard' && !selectedFormId && (
          <Dashboard
            forms={forms}
            stats={stats}
            onSelectForm={id => setSelectedFormId(id)}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onOpenPlayground={handleOpenPlayground}
            onResetDemo={handleResetDemo}
          />
        )}

        {currentView === 'dashboard' && selectedFormId && selectedForm && (
          <FormDetail
            form={selectedForm}
            onBack={() => setSelectedFormId(null)}
            onFormUpdated={handleFormUpdated}
            onFormDeleted={handleFormDeleted}
            onOpenPlayground={handleOpenPlayground}
          />
        )}

        {currentView === 'docs' && (
          <DocsView
            onOpenPlayground={() => handleOpenPlayground()}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <CreateFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleFormCreated}
      />

      <LivePlaygroundModal
        isOpen={isPlaygroundOpen}
        onClose={() => setIsPlaygroundOpen(false)}
        forms={forms}
        defaultFormId={playgroundTargetId}
        onSubmissionSuccess={() => {
          loadData();
        }}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 px-6 py-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-neutral-400">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-neutral-300">FormPulse</span>
            <span aria-hidden="true">·</span>
            <span>100% Free Form Backend for Developers</span>
          </div>

          <div className="flex items-center gap-5 text-neutral-400">
            <button
              onClick={() => {
                setCurrentView('landing');
                setSelectedFormId(null);
              }}
              className="hover:text-neutral-200 transition-colors"
            >
              Overview
            </button>
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setSelectedFormId(null);
              }}
              className="hover:text-neutral-200 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setCurrentView('docs');
                setSelectedFormId(null);
              }}
              className="hover:text-neutral-200 transition-colors"
            >
              Documentation
            </button>
            <button
              onClick={() => handleOpenPlayground()}
              className="hover:text-emerald-400 transition-colors"
            >
              Live Tester
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
