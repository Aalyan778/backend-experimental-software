import React, { useState } from 'react';
import {
  Plus,
  Play,
  Copy,
  Check,
  ExternalLink,
  Search,
  ShieldCheck,
  Mail,
  Zap,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Clock,
  Send,
} from 'lucide-react';
import { FormItem, OverviewStats } from '../types.ts';

interface DashboardProps {
  forms: FormItem[];
  stats: OverviewStats | null;
  onSelectForm: (formId: string) => void;
  onOpenCreateModal: () => void;
  onOpenPlayground: (formId?: string) => void;
  onResetDemo: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  forms,
  stats,
  onSelectForm,
  onOpenCreateModal,
  onOpenPlayground,
  onResetDemo,
}) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyEndpoint = (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}/f/${formId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredForms = forms.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.endpointKey.toLowerCase().includes(search.toLowerCase()) ||
    f.notificationEmail.toLowerCase().includes(search.toLowerCase()),
  );

  const formatRelativeTime = (isoString?: string | null) => {
    if (!isoString) return 'No submissions yet';
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">Developer Dashboard</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage your free form backend endpoints, inspect real-time submissions, and customize email alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenPlayground()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 hover:text-white rounded-lg transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
            <span>Live Tester</span>
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Form</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Total Submissions</span>
            <Send className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-100 font-mono tabular-nums">
            {stats?.totalSubmissions ?? forms.reduce((acc, f) => acc + (f.totalSubmissions || 0), 0)}
          </div>
          <div className="text-[11px] text-neutral-500">Across all connected sites</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Active Endpoints</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-100 font-mono tabular-nums">
            {forms.filter(f => f.status === 'active').length}
          </div>
          <div className="text-[11px] text-neutral-500">Ready to accept POST requests</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Spam Blocked</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-100 font-mono tabular-nums">
            {stats?.spamBlocked ?? forms.reduce((acc, f) => acc + (f.spamSubmissions || 0), 0)}
          </div>
          <div className="text-[11px] text-neutral-500">Filtered via honeypots & traps</div>
        </div>

        <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Notifications Sent</span>
            <Mail className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-neutral-100 font-mono tabular-nums">
            {stats?.emailsSent ?? 12}
          </div>
          <div className="text-[11px] text-neutral-500">Delivered without SMTP setup</div>
        </div>
      </div>

      {/* Forms Section */}
      <div className="space-y-4">
        {/* Search & Counter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral-200">Your Form Endpoints</h2>
            <span className="font-mono text-xs text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
              {forms.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search forms by name or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <button
              onClick={onResetDemo}
              className="hidden md:flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
              title="Reset to default seed data"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Forms Table / Grid */}
        {filteredForms.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30 space-y-3">
            <Layers className="w-8 h-8 text-neutral-600 mx-auto" />
            <h3 className="text-sm font-semibold text-neutral-200">No forms found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {search ? 'No endpoints match your search filter.' : 'Create your first form endpoint in seconds to start receiving submissions.'}
            </p>
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Form</span>
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden divide-y divide-neutral-800">
            {filteredForms.map(form => {
              const fullUrl = `${window.location.origin}/f/${form.id}`;
              const isCopied = copiedId === form.id;

              return (
                <div
                  key={form.id}
                  onClick={() => onSelectForm(form.id)}
                  className="p-5 hover:bg-neutral-850/60 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors truncate">
                        {form.name}
                      </h3>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                          form.status === 'active'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                            : form.status === 'paused'
                            ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {form.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                      <div className="flex items-center gap-1.5">
                        <code className="text-neutral-400 font-mono text-[11px] bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800/80">
                          {fullUrl}
                        </code>
                        <button
                          type="button"
                          onClick={e => copyEndpoint(e, form.id)}
                          className="p-1 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                          title="Copy Endpoint URL"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <span aria-hidden="true" className="text-neutral-600">·</span>
                      <span className="text-neutral-500">Alerts to {form.notificationEmail}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs shrink-0">
                    <div className="text-left md:text-right">
                      <div className="font-mono text-sm font-semibold text-neutral-200 tabular-nums">
                        {form.totalSubmissions || 0}
                        <span className="text-xs font-normal text-neutral-500 ml-1">submissions</span>
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center md:justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatRelativeTime(form.lastSubmissionAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onOpenPlayground(form.id);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-md transition-colors flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-emerald-400/20" />
                        <span>Test</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectForm(form.id)}
                        className="p-1.5 text-neutral-400 group-hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors"
                        title="View Form Details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
