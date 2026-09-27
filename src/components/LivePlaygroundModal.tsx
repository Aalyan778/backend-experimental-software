import React, { useState } from 'react';
import { X, Send, Play, ShieldAlert, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import { FormItem } from '../types.ts';
import { submitToEndpoint } from '../services/api.ts';

interface LivePlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  forms: FormItem[];
  defaultFormId?: string;
  onSubmissionSuccess?: (formId: string) => void;
}

type TemplateType = 'proposal' | 'contact' | 'job' | 'feedback' | 'custom';

export const LivePlaygroundModal: React.FC<LivePlaygroundModalProps> = ({
  isOpen,
  onClose,
  forms,
  defaultFormId,
  onSubmissionSuccess,
}) => {
  const [selectedFormId, setSelectedFormId] = useState<string>(
    defaultFormId || forms[0]?.id || 'frm_8x92kd',
  );
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>('proposal');
  const [enableHoneypotTrap, setEnableHoneypotTrap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseLog, setResponseLog] = useState<{
    status: number;
    latencyMs: number;
    body: any;
    timestamp: string;
  } | null>(null);

  // Template state
  const [formData, setFormData] = useState<Record<string, string>>({
    name: 'Sarah Connor',
    email: 'sarah@skynet-defense.org',
    company: 'Resistance Tech',
    budget: '$15,000',
    service: 'Enterprise Backend & Webhook Integration',
    message: 'Need a fast, zero-server form pipeline for our incoming telemetry portal.',
  });

  if (!isOpen) return null;

  const currentForm = forms.find(f => f.id === selectedFormId) || forms[0];

  const handleTemplateChange = (tpl: TemplateType) => {
    setActiveTemplate(tpl);
    if (tpl === 'proposal') {
      setFormData({
        name: 'Sarah Connor',
        email: 'sarah@skynet-defense.org',
        company: 'Resistance Tech',
        budget: '$15,000',
        service: 'Enterprise Backend & Webhook Integration',
        message: 'Need a fast, zero-server form pipeline for our incoming telemetry portal.',
      });
    } else if (tpl === 'contact') {
      setFormData({
        name: 'Alex Rivera',
        email: 'alex@designstudio.co',
        message: 'Hello! I really like the zero-configuration form API. Can we schedule a quick call?',
      });
    } else if (tpl === 'job') {
      setFormData({
        name: 'Darius Vance',
        email: 'darius.vance@devmail.io',
        position: 'Staff Systems Engineer',
        portfolio: 'https://dariusvance.io',
        experience: '7 years in high-concurrency Node & TypeScript',
        message: 'Submitting my resume for the cloud platform engineering opening.',
      });
    } else if (tpl === 'feedback') {
      setFormData({
        name: 'Maya Lin',
        email: 'maya@linventures.com',
        rating: '5/5 Stars',
        recommendation: 'Definitely recommend to all frontend developers',
        feedback: 'Setting up an endpoint took 30 seconds. Seamless integration with Vite and Next.js.',
      });
    } else if (tpl === 'custom') {
      setFormData({
        customer_id: 'cust_8829',
        tier: 'Developer Pro',
        project_scope: 'Mobile lead funnel',
        notes: 'Testing dynamic arbitrary JSON schema capability.',
      });
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const addCustomField = () => {
    const key = prompt('Enter new field name (e.g. phone, department, referral):');
    if (key && key.trim()) {
      setFormData(prev => ({ ...prev, [key.trim()]: '' }));
    }
  };

  const removeField = (key: string) => {
    setFormData(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormId) return;

    setIsSubmitting(true);
    const start = performance.now();

    const payloadToSend: Record<string, any> = { ...formData };
    if (enableHoneypotTrap) {
      payloadToSend._gotcha = 'bot_spammer_probe_123';
    }

    try {
      const res = await submitToEndpoint(selectedFormId, payloadToSend);
      const latency = Math.round(performance.now() - start);

      setResponseLog({
        status: res.success ? 200 : res.error?.code === 'RATE_LIMITED' ? 429 : 400,
        latencyMs: latency,
        body: res,
        timestamp: new Date().toLocaleTimeString(),
      });

      if (res.success && onSubmissionSuccess) {
        onSubmissionSuccess(selectedFormId);
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - start);
      setResponseLog({
        status: 500,
        latencyMs: latency,
        body: { success: false, error: err.message },
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Play className="w-4 h-4 fill-emerald-400/20" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                <span>Interactive Live Form Tester</span>
                <span className="text-[11px] font-normal text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  HTTP Client
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Fire live HTTP POST requests to your FormPulse backend and inspect responses in real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Controls Bar */}
        <div className="px-6 py-3 border-b border-neutral-800 bg-neutral-950/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 font-medium">Target Form:</span>
            <select
              value={selectedFormId}
              onChange={e => setSelectedFormId(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:border-emerald-500/60 font-mono"
            >
              {forms.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.id})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400 mr-1.5">Template:</span>
            {(['proposal', 'contact', 'job', 'feedback', 'custom'] as TemplateType[]).map(t => (
              <button
                key={t}
                onClick={() => handleTemplateChange(t)}
                className={`text-xs capitalize px-2.5 py-1 rounded transition-colors ${
                  activeTemplate === t
                    ? 'bg-neutral-800 text-white font-medium border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Split Grid: Left Form Inputs | Right HTTP Inspector */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-800 overflow-y-auto">
          {/* Left: Input Payload */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">
                Form Fields ({Object.keys(formData).length})
              </span>
              <button
                type="button"
                onClick={addCustomField}
                className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                + Add dynamic field
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(formData).map(([k, val]) => (
                <div key={k} className="relative group">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono text-neutral-400">{k}</label>
                    {activeTemplate === 'custom' && (
                      <button
                        type="button"
                        onClick={() => removeField(k)}
                        className="text-[10px] text-neutral-500 hover:text-rose-400 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {k === 'message' || k === 'notes' || k === 'feedback' ? (
                    <textarea
                      rows={2}
                      value={val}
                      onChange={e => handleInputChange(k, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-emerald-500/60 resize-none font-mono"
                    />
                  ) : (
                    <input
                      type="text"
                      value={val}
                      onChange={e => handleInputChange(k, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-emerald-500/60 font-mono"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Spam Honeypot Simulation */}
            <div className="pt-2 border-t border-neutral-800/80">
              <label htmlFor="honeypotTrapToggle" className="flex items-center gap-2 cursor-pointer p-2.5 rounded bg-neutral-950/60 border border-neutral-800/60 hover:border-neutral-700/80 transition-all">
                <input
                  id="honeypotTrapToggle"
                  type="checkbox"
                  checked={enableHoneypotTrap}
                  onChange={e => setEnableHoneypotTrap(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                />
                <div className="flex-1">
                  <div className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Simulate Spam Bot (_gotcha honeypot filled)</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    Tests how FormPulse flags bot submissions to Spam without breaking the site
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all disabled:opacity-50 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending HTTP POST...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Submit to POST /f/{selectedFormId}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Right: Live Request / Response Inspector */}
          <div className="p-6 bg-neutral-950 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-neutral-300">HTTP Inspector</span>
                <span className="text-[11px] font-mono text-neutral-500">
                  POST /f/{selectedFormId}
                </span>
              </div>

              {/* Request Payload Preview */}
              <div className="mb-4">
                <div className="text-[11px] text-neutral-400 mb-1.5 flex items-center justify-between">
                  <span>Outgoing Request Payload:</span>
                  <span className="font-mono text-[10px] text-neutral-500">application/json</span>
                </div>
                <pre className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-[11px] text-neutral-300 font-mono overflow-x-auto max-h-40 leading-relaxed">
                  {JSON.stringify(
                    {
                      ...formData,
                      ...(enableHoneypotTrap ? { _gotcha: 'bot_spammer_probe_123' } : {}),
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>

              {/* Response Log */}
              <div>
                <div className="text-[11px] text-neutral-400 mb-1.5 flex items-center justify-between">
                  <span>Response:</span>
                  {responseLog && (
                    <span className="font-mono text-[10px] text-neutral-400">
                      {responseLog.latencyMs}ms · {responseLog.timestamp}
                    </span>
                  )}
                </div>

                {responseLog ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-mono font-semibold ${
                          responseLog.status === 200
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                        }`}
                      >
                        {responseLog.status} {responseLog.status === 200 ? 'OK' : 'ERROR'}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {responseLog.status === 200
                          ? 'Saved to database & queued notifications'
                          : 'Error response returned'}
                      </span>
                    </div>

                    <pre className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-[11px] text-emerald-300 font-mono overflow-x-auto max-h-44 leading-relaxed">
                      {JSON.stringify(responseLog.body, null, 2)}
                    </pre>

                    {enableHoneypotTrap && (
                      <div className="p-2.5 rounded bg-amber-950/30 border border-amber-900/50 text-[11px] text-amber-300 flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Bot detected! FormPulse flagged this as Spam in the submissions inbox.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-neutral-800 rounded-lg text-center text-xs text-neutral-500">
                    Click "Submit to POST /f/{selectedFormId}" to send a test payload and view server response
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
              <span>Target Form: <strong className="text-neutral-200">{currentForm?.name}</strong></span>
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-emerald-400 hover:underline"
              >
                Done testing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
