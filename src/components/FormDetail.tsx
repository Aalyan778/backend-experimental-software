import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  Play,
  Download,
  Trash2,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  Mail,
  Globe,
  Radio,
  ExternalLink,
  Code2,
  RefreshCw,
  Eye,
  X,
  FileSpreadsheet,
  FileJson,
  Send,
} from 'lucide-react';
import { FormItem, Submission, EmailLog } from '../types.ts';
import {
  fetchSubmissions,
  fetchEmailLogs,
  deleteSubmission,
  toggleSubmissionSpam,
  clearAllSubmissions,
  updateForm,
  deleteForm,
} from '../services/api.ts';

interface FormDetailProps {
  form: FormItem;
  onBack: () => void;
  onFormUpdated: (updated: FormItem) => void;
  onFormDeleted: (formId: string) => void;
  onOpenPlayground: (formId: string) => void;
}

type TabType = 'submissions' | 'snippets' | 'emails' | 'settings';

export const FormDetail: React.FC<FormDetailProps> = ({
  form,
  onBack,
  onFormUpdated,
  onFormDeleted,
  onOpenPlayground,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('submissions');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'spam'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedEmailLog, setSelectedEmailLog] = useState<EmailLog | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Settings form states
  const [settingsName, setSettingsName] = useState(form.name);
  const [settingsStatus, setSettingsStatus] = useState(form.status);
  const [settingsEmail, setSettingsEmail] = useState(form.notificationEmail);
  const [settingsNotify, setSettingsNotify] = useState(form.notifyOnSubmission);
  const [settingsAutoReply, setSettingsAutoReply] = useState(form.autoReplyEnabled);
  const [settingsAutoSubject, setSettingsAutoSubject] = useState(form.autoReplySubject || '');
  const [settingsAutoMessage, setSettingsAutoMessage] = useState(form.autoReplyMessage || '');
  const [settingsDomains, setSettingsDomains] = useState(form.allowedDomains.join(', '));
  const [settingsWebhook, setSettingsWebhook] = useState(form.webhookUrl || '');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  const endpointUrl = `${window.location.origin}/f/${form.id}`;

  const loadData = async () => {
    try {
      setLoading(true);
      const [subs, emails] = await Promise.all([
        fetchSubmissions(form.id, {
          search: searchQuery || undefined,
          status: statusFilter,
        }),
        fetchEmailLogs(form.id),
      ]);
      setSubmissions(subs);
      setEmailLogs(emails);
    } catch (err) {
      console.error('Error loading form detail data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [form.id, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  const copySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    try {
      await deleteSubmission(id);
      setSubmissions(prev => prev.filter(s => s.id !== id));
      if (selectedSubmission?.id === id) setSelectedSubmission(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleSpam = async (id: string) => {
    try {
      const newStatus = await toggleSubmissionSpam(id);
      setSubmissions(prev =>
        prev.map(s => (s.id === id ? { ...s, status: newStatus } : s)),
      );
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all submissions for this form? This cannot be undone.')) return;
    try {
      await clearAllSubmissions(form.id);
      setSubmissions([]);
      setSelectedSubmission(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      setSettingsFeedback(null);
      const updated = await updateForm(form.id, {
        name: settingsName.trim(),
        status: settingsStatus,
        notificationEmail: settingsEmail.trim(),
        notifyOnSubmission: settingsNotify,
        autoReplyEnabled: settingsAutoReply,
        autoReplySubject: settingsAutoSubject,
        autoReplyMessage: settingsAutoMessage,
        allowedDomains: settingsDomains
          .split(',')
          .map(d => d.trim())
          .filter(Boolean),
        webhookUrl: settingsWebhook.trim(),
      });
      onFormUpdated(updated);
      setSettingsFeedback('Form settings saved successfully.');
      setTimeout(() => setSettingsFeedback(null), 3000);
    } catch (err: any) {
      setSettingsFeedback(`Error: ${err.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteForm = async () => {
    if (!confirm(`Are you sure you want to permanently delete '${form.name}'?`)) return;
    try {
      await deleteForm(form.id);
      onFormDeleted(form.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatRelativeTime = (isoString: string) => {
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
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Back to all forms"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-neutral-100">{form.name}</h1>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded capitalize ${
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
            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
              <span>Endpoint ID: <code className="text-neutral-400 font-mono">{form.id}</code></span>
              <span aria-hidden="true">·</span>
              <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenPlayground(form.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-400/20" />
            <span>Test Form</span>
          </button>

          <a
            href={`/api/forms/${form.id}/export?format=csv`}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </a>

          <a
            href={`/api/forms/${form.id}/export?format=json`}
            download
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors"
          >
            <FileJson className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export JSON</span>
          </a>
        </div>
      </div>

      {/* Prominent Endpoint Box */}
      <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
            POST Endpoint
          </span>
          <code className="text-xs sm:text-sm font-mono text-emerald-400 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800/80 break-all select-all">
            {endpointUrl}
          </code>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(endpointUrl)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-750 hover:text-white rounded-lg transition-colors"
          >
            {copiedEndpoint ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Endpoint</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-800">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <span>Submissions</span>
          <span className="font-mono tabular-nums text-[11px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
            {submissions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('snippets')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'snippets'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Integration Code</span>
        </button>

        <button
          onClick={() => setActiveTab('emails')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'emails'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email Outbox Logs</span>
          <span className="font-mono tabular-nums text-[11px] bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
            {emailLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <span>Form Settings</span>
        </button>
      </div>

      {/* TAB 1: SUBMISSIONS LIST */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search across any submission field, name, email, IP..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60"
              />
            </form>

            <div className="flex items-center gap-2">
              {/* Status Segmented Control */}
              <div className="flex items-center bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-xs">
                {(['all', 'valid', 'spam'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`capitalize px-3 py-1 rounded-md transition-colors ${
                      statusFilter === s
                        ? 'bg-neutral-800 text-white font-medium shadow-sm'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {s === 'all' ? 'All Submissions' : s === 'valid' ? 'Valid' : 'Spam Trap'}
                  </button>
                ))}
              </div>

              <button
                onClick={loadData}
                className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
                title="Refresh submissions"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {submissions.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded border border-rose-900/30 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Submissions Table / Cards */}
          {loading ? (
            <div className="p-12 text-center text-xs text-neutral-500">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-neutral-400" />
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30 space-y-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800/80 flex items-center justify-center mx-auto text-neutral-400">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-200">No submissions yet</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                No submissions match your query. Connect this endpoint to your frontend or trigger a test submission using the built-in simulator.
              </p>
              <button
                onClick={() => onOpenPlayground(form.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-lg transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Send Test Submission</span>
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden divide-y divide-neutral-800">
              {submissions.map((sub, idx) => {
                const primaryName = sub.data.name || sub.data.full_name || sub.data.customer_name || 'Anonymous';
                const primaryEmail = sub.data.email || sub.data.mail || sub.data.email_address || 'No email provided';
                const previewKeys = Object.entries(sub.data)
                  .filter(([k]) => !['name', 'email', 'full_name'].includes(k.toLowerCase()))
                  .slice(0, 3);

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className="p-4 hover:bg-neutral-850/60 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-100 truncate">
                          {primaryName}
                        </span>
                        <span className="text-xs text-neutral-400 font-mono truncate">
                          {primaryEmail}
                        </span>
                        {sub.status === 'spam' && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/80">
                            Spam
                          </span>
                        )}
                      </div>

                      {/* Arbitrary dynamic fields preview */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                        {previewKeys.map(([k, val]) => (
                          <div key={k} className="flex items-center gap-1 truncate max-w-xs">
                            <span className="text-neutral-500 text-[11px] font-mono">{k}:</span>
                            <span className="text-neutral-300 truncate">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-neutral-500 shrink-0">
                      <span className="font-mono tabular-nums text-[11px]">
                        {formatRelativeTime(sub.createdAt)}
                      </span>

                      <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleToggleSpam(sub.id);
                          }}
                          className={`p-1.5 rounded transition-colors ${
                            sub.status === 'spam'
                              ? 'text-emerald-400 hover:bg-emerald-950/40'
                              : 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-800'
                          }`}
                          title={sub.status === 'spam' ? 'Mark as Not Spam' : 'Mark as Spam'}
                        >
                          {sub.status === 'spam' ? <Shield className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteSubmission(sub.id);
                          }}
                          className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded transition-colors"
                          title="Delete submission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTEGRATION CODE SNIPPETS */}
      {activeTab === 'snippets' && (
        <div className="space-y-6">
          <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
            <h3 className="text-sm font-semibold text-neutral-200">Copy-Paste Integration</h3>
            <p className="text-xs text-neutral-400">
              Each snippet is pre-configured with this form's dedicated endpoint: <code className="text-emerald-400 font-mono">{endpointUrl}</code>
            </p>
          </div>

          {/* HTML Form */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-xs text-neutral-400">
              <span className="font-mono">1. Standard HTML Form (No JavaScript Needed)</span>
              <button
                onClick={() =>
                  copySnippet(
                    `<form action="${endpointUrl}" method="POST">
  <input type="text" name="name" placeholder="Your Name" required>
  <input type="email" name="email" placeholder="Your Email" required>
  <textarea name="message" placeholder="Your Message"></textarea>
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off">
  <button type="submit">Submit</button>
</form>`,
                    'snip_html',
                  )
                }
                className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200"
              >
                {copiedSnippet === 'snip_html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet === 'snip_html' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed">
{`<form action="${endpointUrl}" method="POST">
  <input type="text" name="name" placeholder="Your Name" required>
  <input type="email" name="email" placeholder="Your Email" required>
  <textarea name="message" placeholder="Your Message"></textarea>
  
  <!-- Anti-spam honeypot (hidden from human visitors) -->
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off">

  <button type="submit">Submit</button>
</form>`}
            </pre>
          </div>

          {/* Fetch / AJAX */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-xs text-neutral-400">
              <span className="font-mono">2. JavaScript Fetch / AJAX</span>
              <button
                onClick={() =>
                  copySnippet(
                    `const res = await fetch("${endpointUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify({
    name: "Jane Doe",
    email: "jane@example.com",
    message: "Hello world!"
  })
});
const data = await res.json();
console.log(data);`,
                    'snip_fetch',
                  )
                }
                className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200"
              >
                {copiedSnippet === 'snip_fetch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet === 'snip_fetch' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed">
{`const res = await fetch("${endpointUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify({
    name: "Jane Doe",
    email: "jane@example.com",
    message: "Hello world!"
  })
});

const data = await res.json();
if (data.success) {
  console.log("Submission ID:", data.submissionId);
}`}
            </pre>
          </div>

          {/* cURL */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-xs text-neutral-400">
              <span className="font-mono">3. Terminal cURL Command</span>
              <button
                onClick={() =>
                  copySnippet(
                    `curl -X POST ${endpointUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"name":"John","email":"john@test.com","message":"Hello"}'`,
                    'snip_curl',
                  )
                }
                className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200"
              >
                {copiedSnippet === 'snip_curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet === 'snip_curl' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed">
{`curl -X POST ${endpointUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"name":"John","email":"john@test.com","message":"Hello"}'`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: EMAIL LOGS / OUTBOX */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl">
            <h3 className="text-sm font-semibold text-neutral-200">Email Outbox & Delivery Inspector</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live audit logs of all transactional notifications dispatched to the form owner and auto-replies sent to submitters.
            </p>
          </div>

          {emailLogs.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-neutral-800 rounded-xl text-xs text-neutral-500">
              No emails dispatched yet. Submit a test response to trigger notifications.
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden divide-y divide-neutral-800">
              {emailLogs.map(log => (
                <div
                  key={log.id}
                  onClick={() => setSelectedEmailLog(log)}
                  className="p-4 hover:bg-neutral-850/60 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded capitalize ${
                          log.type === 'notification'
                            ? 'bg-blue-950/80 text-blue-400 border border-blue-800/80'
                            : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                        }`}
                      >
                        {log.type === 'notification' ? 'Owner Notification' : 'Submitter Auto-Reply'}
                      </span>
                      <span className="text-xs font-semibold text-neutral-200 truncate">
                        {log.subject}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                      <span>To: <strong className="text-neutral-300 font-mono text-[11px]">{log.to}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>From: <code className="text-neutral-500 font-mono text-[11px]">{log.from}</code></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-500 shrink-0">
                    <span className="font-mono text-emerald-400 text-[11px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                      {log.status}
                    </span>
                    <span className="font-mono tabular-nums text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-neutral-400 text-xs group-hover:text-neutral-200">
                      View Body →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
          {settingsFeedback && (
            <div
              className={`p-3 text-xs rounded-lg border ${
                settingsFeedback.startsWith('Error')
                  ? 'bg-rose-950/30 border-rose-900 text-rose-300'
                  : 'bg-emerald-950/30 border-emerald-900 text-emerald-300'
              }`}
            >
              {settingsFeedback}
            </div>
          )}

          {/* General */}
          <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-neutral-200">General Configuration</h3>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Form Name
              </label>
              <input
                type="text"
                required
                value={settingsName}
                onChange={e => setSettingsName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Status
              </label>
              <select
                value={settingsStatus}
                onChange={e => setSettingsStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:border-emerald-500/60"
              >
                <option value="active">Active (Accepting submissions)</option>
                <option value="paused">Paused (Returns 403 Form Paused)</option>
                <option value="archived">Archived (Read only)</option>
              </select>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-neutral-200">Email Notifications</h3>

            <div>
              <label htmlFor="settingsNotifyToggle" className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  id="settingsNotifyToggle"
                  type="checkbox"
                  checked={settingsNotify}
                  onChange={e => setSettingsNotify(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-xs font-medium text-neutral-200">
                  Email me every time someone submits this form
                </span>
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                <input
                  type="email"
                  value={settingsEmail}
                  onChange={e => setSettingsEmail(e.target.value)}
                  placeholder="alerts@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 font-mono focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>

            {/* Auto-responder */}
            <div className="pt-3 border-t border-neutral-800/80 space-y-3">
              <label htmlFor="settingsAutoReplyToggle" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="settingsAutoReplyToggle"
                  type="checkbox"
                  checked={settingsAutoReply}
                  onChange={e => setSettingsAutoReply(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
                />
                <span className="text-xs font-medium text-neutral-200">
                  Send automated confirmation email back to submitter
                </span>
              </label>

              {settingsAutoReply && (
                <div className="space-y-3 pl-5 border-l border-neutral-800">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Subject</label>
                    <input
                      type="text"
                      value={settingsAutoSubject}
                      onChange={e => setSettingsAutoSubject(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Message Body</label>
                    <textarea
                      rows={2}
                      value={settingsAutoMessage}
                      onChange={e => setSettingsAutoMessage(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded text-neutral-100 focus:outline-none focus:border-emerald-500/60 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security & Webhook */}
          <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-4">
            <h3 className="text-sm font-semibold text-neutral-200">Security & Webhooks</h3>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Allowed Origin Domains (CORS)
              </label>
              <input
                type="text"
                value={settingsDomains}
                onChange={e => setSettingsDomains(e.target.value)}
                placeholder="e.g. example.com, mysite.org"
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 font-mono focus:outline-none focus:border-emerald-500/60"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Comma-separated list of hostnames allowed to submit. Leave empty to allow all websites.
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                value={settingsWebhook}
                onChange={e => setSettingsWebhook(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 font-mono focus:outline-none focus:border-emerald-500/60"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                We'll send a JSON POST request with the submission data immediately upon receipt.
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleDeleteForm}
              className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded border border-rose-900/40 transition-colors"
            >
              Delete Form Permanently
            </button>

            <button
              type="submit"
              disabled={savingSettings}
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* SUBMISSION INSPECTION MODAL (Drawer matching PRD Section 18) */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold">
                  #
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-neutral-100">
                    Submission {selectedSubmission.id}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <span>{new Date(selectedSubmission.createdAt).toLocaleString()}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[11px]">{selectedSubmission.ipAddress}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleSpam(selectedSubmission.id)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    selectedSubmission.status === 'spam'
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80'
                      : 'bg-amber-950/40 text-amber-400 border-amber-800/80'
                  }`}
                >
                  {selectedSubmission.status === 'spam' ? 'Restore as Valid' : 'Mark as Spam'}
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Spam Warning if applicable */}
              {selectedSubmission.status === 'spam' && (
                <div className="p-3 bg-amber-950/40 border border-amber-900/60 rounded-lg text-xs text-amber-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Flagged as Spam:</strong> {selectedSubmission.spamReason || 'Triggered honeypot or bot heuristics.'}
                  </span>
                </div>
              )}

              {/* Formatted Key-Value pairs */}
              <div>
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  Submitted Fields
                </h3>
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 divide-y divide-neutral-800">
                  {Object.entries(selectedSubmission.data).map(([key, value]) => (
                    <div key={key} className="p-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <span className="text-xs font-mono font-medium text-neutral-400 sm:w-1/3">
                        {key}
                      </span>
                      <span className="text-xs text-neutral-100 sm:w-2/3 break-words font-sans">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta details */}
              <div>
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Metadata & Telemetry
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                    <span className="text-neutral-500 block text-[11px]">IP Address</span>
                    <code className="text-neutral-200 font-mono">{selectedSubmission.ipAddress}</code>
                  </div>
                  <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                    <span className="text-neutral-500 block text-[11px]">Created At</span>
                    <span className="text-neutral-200 font-mono">{selectedSubmission.createdAt}</span>
                  </div>
                  <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg col-span-1 sm:col-span-2">
                    <span className="text-neutral-500 block text-[11px]">User Agent</span>
                    <span className="text-neutral-300 font-mono text-[11px] break-all">{selectedSubmission.userAgent}</span>
                  </div>
                </div>
              </div>

              {/* Raw JSON */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Raw JSON
                  </h3>
                  <button
                    onClick={() => copySnippet(JSON.stringify(selectedSubmission, null, 2), 'raw_json')}
                    className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1"
                  >
                    {copiedSnippet === 'raw_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSnippet === 'raw_json' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300 overflow-x-auto max-h-48 leading-relaxed">
                  {JSON.stringify(selectedSubmission, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
              <button
                onClick={() => handleDeleteSubmission(selectedSubmission.id)}
                className="px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Submission</span>
              </button>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL LOG PREVIEW MODAL */}
      {selectedEmailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/80">
              <div>
                <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                  <span>Email Dispatch Preview</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Delivered
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">{selectedEmailLog.subject}</p>
              </div>
              <button
                onClick={() => setSelectedEmailLog(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1 text-xs">
                <div><span className="text-neutral-500">To:</span> <strong className="text-neutral-200">{selectedEmailLog.to}</strong></div>
                <div><span className="text-neutral-500">From:</span> <span className="text-neutral-400">{selectedEmailLog.from}</span></div>
                <div><span className="text-neutral-500">Sent:</span> <span className="text-neutral-400">{new Date(selectedEmailLog.timestamp).toLocaleString()}</span></div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Message Body</h4>
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {selectedEmailLog.body}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-800 bg-neutral-900/80 flex justify-end">
              <button
                onClick={() => setSelectedEmailLog(null)}
                className="px-4 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
