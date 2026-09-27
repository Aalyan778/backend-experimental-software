export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface FormItem {
  id: string;
  userId: string;
  name: string;
  endpointKey: string;
  status: 'active' | 'paused' | 'archived';
  notificationEmail: string;
  notifyOnSubmission: boolean;
  autoReplyEnabled: boolean;
  autoReplySubject?: string;
  autoReplyMessage?: string;
  allowedDomains: string[];
  webhookUrl?: string;
  createdAt: string;
  updatedAt: string;
  totalSubmissions?: number;
  validSubmissions?: number;
  spamSubmissions?: number;
  lastSubmissionAt?: string | null;
}

export interface Submission {
  id: string;
  formId: string;
  data: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  status: 'valid' | 'spam';
  spamReason?: string;
}

export interface EmailLog {
  id: string;
  formId: string;
  submissionId: string;
  type: 'notification' | 'autoreply';
  to: string;
  from: string;
  subject: string;
  body: string;
  status: 'delivered' | 'pending' | 'failed';
  timestamp: string;
}

export interface WebhookLog {
  id: string;
  formId: string;
  submissionId: string;
  url: string;
  status: number;
  response: string;
  durationMs: number;
  timestamp: string;
}

export interface OverviewStats {
  formsCount: number;
  totalSubmissions: number;
  validSubmissions: number;
  spamBlocked: number;
  emailsSent: number;
}
