import { FormItem, Submission, EmailLog, WebhookLog, OverviewStats, User } from '../types.ts';

export async function fetchForms(): Promise<FormItem[]> {
  const res = await fetch('/api/forms');
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch forms');
  return data.forms;
}

export async function fetchForm(id: string): Promise<FormItem> {
  const res = await fetch(`/api/forms/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Form not found');
  return data.form;
}

export async function createForm(payload: {
  name: string;
  notificationEmail: string;
  autoReplyEnabled?: boolean;
  autoReplySubject?: string;
  autoReplyMessage?: string;
  allowedDomains?: string[];
  webhookUrl?: string;
}): Promise<FormItem> {
  const res = await fetch('/api/forms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to create form');
  return data.form;
}

export async function updateForm(id: string, payload: Partial<FormItem>): Promise<FormItem> {
  const res = await fetch(`/api/forms/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to update form');
  return data.form;
}

export async function deleteForm(id: string): Promise<void> {
  const res = await fetch(`/api/forms/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to delete form');
}

export async function fetchSubmissions(formId: string, options?: { search?: string; status?: string }): Promise<Submission[]> {
  const params = new URLSearchParams();
  if (options?.search) params.set('search', options.search);
  if (options?.status) params.set('status', options.status);

  const res = await fetch(`/api/forms/${formId}/submissions?${params.toString()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch submissions');
  return data.submissions;
}

export async function deleteSubmission(id: string): Promise<void> {
  const res = await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to delete submission');
}

export async function toggleSubmissionSpam(id: string): Promise<'valid' | 'spam'> {
  const res = await fetch(`/api/submissions/${id}/toggle-spam`, { method: 'PATCH' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to toggle spam state');
  return data.status;
}

export async function clearAllSubmissions(formId: string): Promise<void> {
  const res = await fetch(`/api/forms/${formId}/submissions`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to clear submissions');
}

export async function fetchEmailLogs(formId: string): Promise<EmailLog[]> {
  const res = await fetch(`/api/forms/${formId}/email-logs`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch email logs');
  return data.logs;
}

export async function fetchOverviewStats(): Promise<OverviewStats> {
  const res = await fetch('/api/stats/overview');
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch stats');
  return data.stats;
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch user');
  return data.user;
}

export async function submitToEndpoint(formId: string, payload: Record<string, any>): Promise<{ success: boolean; submissionId?: string; error?: any; timestamp?: string }> {
  const res = await fetch(`/f/${formId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

export async function resetDemoData(): Promise<void> {
  await fetch('/api/reset-demo', { method: 'POST' });
}
