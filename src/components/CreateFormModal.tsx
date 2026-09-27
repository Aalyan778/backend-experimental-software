import React, { useState } from 'react';
import { X, Check, Mail, Globe, Shield, Radio, Sparkles } from 'lucide-react';
import { createForm } from '../services/api.ts';
import { FormItem } from '../types.ts';

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newForm: FormItem) => void;
}

export const CreateFormModal: React.FC<CreateFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('aalyanmukhtar1@gmail.com');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [autoReplySubject, setAutoReplySubject] = useState("We've received your submission!");
  const [autoReplyMessage, setAutoReplyMessage] = useState("Thank you for reaching out. Our team has received your message and will get back to you shortly.");
  const [allowedDomains, setAllowedDomains] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a form name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const domains = allowedDomains
        .split(',')
        .map(d => d.trim())
        .filter(Boolean);

      const form = await createForm({
        name: name.trim(),
        notificationEmail: notificationEmail.trim() || 'hello@example.com',
        autoReplyEnabled,
        autoReplySubject: autoReplyEnabled ? autoReplySubject : undefined,
        autoReplyMessage: autoReplyEnabled ? autoReplyMessage : undefined,
        allowedDomains: domains,
        webhookUrl: webhookUrl.trim() || undefined,
      });

      onSuccess(form);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (tplName: string, tplSubject: string) => {
    setName(tplName);
    setAutoReplySubject(tplSubject);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div>
            <h2 className="text-base font-semibold text-neutral-100">Create New Form Endpoint</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Generate a dedicated POST endpoint for your frontend website</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-6 pt-4 pb-1 border-b border-neutral-800/60 bg-neutral-950/40">
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
            <span>Quick presets:</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              onClick={() => applyTemplate('Proposal Form', "We've received your project proposal!")}
              className="text-xs px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60 transition-colors"
            >
              Proposal / RFP Form
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('Contact Us', "Thanks for reaching out to us!")}
              className="text-xs px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60 transition-colors"
            >
              Contact Us Form
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('Job Application', 'Application received: Senior Engineer')}
              className="text-xs px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60 transition-colors"
            >
              Careers / Hiring
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('Client Feedback & NPS', 'Thank you for your valuable feedback')}
              className="text-xs px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60 transition-colors"
            >
              User Feedback
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Form Name <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Client Proposal Form, Landing Page Contact"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center justify-between">
              <span>Notification Email</span>
              <span className="text-[11px] text-neutral-500">Where alerts are sent</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                placeholder="hello@example.com"
                value={notificationEmail}
                onChange={e => setNotificationEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 font-mono text-xs"
              />
            </div>
          </div>

          {/* Auto Responder Section */}
          <div className="p-3.5 bg-neutral-950/60 border border-neutral-800/80 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="autoReplyToggle" className="flex items-center gap-2 cursor-pointer">
                <input
                  id="autoReplyToggle"
                  type="checkbox"
                  checked={autoReplyEnabled}
                  onChange={e => setAutoReplyEnabled(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                />
                <span className="text-xs font-medium text-neutral-200">
                  Send automated confirmation email to submitter
                </span>
              </label>
              <span className="text-[11px] text-emerald-400 font-mono">100% Free</span>
            </div>

            {autoReplyEnabled && (
              <div className="space-y-2.5 pt-1 pl-5.5 border-l border-neutral-800 ml-1">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={autoReplySubject}
                    onChange={e => setAutoReplySubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Email Message Body</label>
                  <textarea
                    rows={2}
                    value={autoReplyMessage}
                    onChange={e => setAutoReplyMessage(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded text-neutral-200 focus:outline-none focus:border-emerald-500/50 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Security & Domains */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-neutral-500" />
                <span>Allowed Domains (CORS)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. mysite.com, localhost"
                value={allowedDomains}
                onChange={e => setAllowedDomains(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 font-mono"
              />
              <span className="text-[10px] text-neutral-500 block mt-1">Leave empty to accept any origin</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-neutral-500" />
                <span>Webhook URL (Optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://hooks.slack.com/..."
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500/60 font-mono"
              />
              <span className="text-[10px] text-neutral-500 block mt-1">POST payload on submission</span>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Generating Endpoint...' : 'Create Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
