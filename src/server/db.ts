import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Form {
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

export interface DatabaseSchema {
  users: User[];
  forms: Form[];
  submissions: Submission[];
  emailLogs: EmailLog[];
  webhookLogs: WebhookLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function getInitialData(): DatabaseSchema {
  const now = new Date();
  const subTime = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();

  return {
    users: [
      {
        id: 'usr_dev_primary',
        email: 'aalyanmukhtar1@gmail.com',
        name: 'Aalyan Mukhtar',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    forms: [
      {
        id: 'frm_8x92kd',
        userId: 'usr_dev_primary',
        name: 'Proposal Form',
        endpointKey: 'frm_8x92kd',
        status: 'active',
        notificationEmail: 'aalyanmukhtar1@gmail.com',
        notifyOnSubmission: true,
        autoReplyEnabled: true,
        autoReplySubject: "We've received your proposal inquiry!",
        autoReplyMessage: "Thank you for reaching out. We have received your proposal details and our team will review your budget and scope within 24 hours.",
        allowedDomains: [],
        webhookUrl: '',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'frm_contact_7a3b',
        userId: 'usr_dev_primary',
        name: 'Main Website Contact Form',
        endpointKey: 'frm_contact_7a3b',
        status: 'active',
        notificationEmail: 'hello@example.com',
        notifyOnSubmission: true,
        autoReplyEnabled: true,
        autoReplySubject: 'Thanks for contacting us',
        autoReplyMessage: "Thanks for reaching out! We've received your note and will get back to you shortly.",
        allowedDomains: ['mysite.com', 'localhost'],
        webhookUrl: '',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'frm_careers_4k91',
        userId: 'usr_dev_primary',
        name: 'Senior Engineer Job Applications',
        endpointKey: 'frm_careers_4k91',
        status: 'active',
        notificationEmail: 'jobs@example.com',
        notifyOnSubmission: true,
        autoReplyEnabled: false,
        allowedDomains: [],
        webhookUrl: '',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'frm_feedback_2m50',
        userId: 'usr_dev_primary',
        name: 'Product Feedback & NPS',
        endpointKey: 'frm_feedback_2m50',
        status: 'active',
        notificationEmail: 'feedback@example.com',
        notifyOnSubmission: false,
        autoReplyEnabled: false,
        allowedDomains: [],
        webhookUrl: '',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    submissions: [
      {
        id: 'sub_1029',
        formId: 'frm_8x92kd',
        data: {
          name: 'John Smith',
          email: 'john@example.com',
          company: 'Smith & Co Enterprises',
          budget: '$5,000',
          service: 'Website Development',
          message: 'We need an e-commerce website with 200 products, mobile responsiveness, and custom checkout flows.',
        },
        ipAddress: '192.168.1.42',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: subTime(2),
        status: 'valid',
      },
      {
        id: 'sub_1028',
        formId: 'frm_8x92kd',
        data: {
          name: 'Sarah Khan',
          email: 'sarah@example.com',
          company: 'Khan Global Design',
          budget: '$12,000',
          service: 'E-commerce Website',
          message: 'Looking for a complete redesign and migration to modern headless frontend.',
        },
        ipAddress: '104.28.14.99',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        createdAt: subTime(18),
        status: 'valid',
      },
      {
        id: 'sub_1027',
        formId: 'frm_8x92kd',
        data: {
          name: 'Ali Ahmed',
          email: 'ali@example.com',
          company: 'Pulse Innovations',
          budget: '$8,500',
          service: 'AI Automation',
          message: 'We want to integrate automated workflow webhooks with customer inquiry forms.',
        },
        ipAddress: '172.56.21.80',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)',
        createdAt: subTime(60),
        status: 'valid',
      },
      {
        id: 'sub_1026',
        formId: 'frm_8x92kd',
        data: {
          name: 'Elena Rostova',
          email: 'elena@vanguard.io',
          company: 'Vanguard Systems',
          budget: '$25,000',
          service: 'Custom SaaS Portal',
          message: 'Requesting RFQ for engineering partner on multi-tenant portal with authentication.',
        },
        ipAddress: '89.144.20.12',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)',
        createdAt: subTime(180),
        status: 'valid',
      },
      {
        id: 'sub_1025',
        formId: 'frm_8x92kd',
        data: {
          name: 'David Chen',
          email: 'david@zenithlab.org',
          budget: '$3,000 - $6,000',
          service: 'Landing Page & Lead Funnel',
          message: 'Need high-converting landing page built before Q4 product launch.',
        },
        ipAddress: '66.249.79.11',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        createdAt: subTime(360),
        status: 'valid',
      },
      {
        id: 'sub_spam_01',
        formId: 'frm_8x92kd',
        data: {
          name: 'SEO Ranking Bot 99',
          email: 'promo@free-traffic-rank1.biz',
          message: 'BUY CHEAP BACKLINKS NOW guaranteed top rank in Google 24hrs!',
          _gotcha: 'i_am_a_bot',
        },
        ipAddress: '185.220.101.5',
        userAgent: 'curl/7.68.0',
        createdAt: subTime(420),
        status: 'spam',
        spamReason: 'Honeypot field (_gotcha) triggered',
      },
      {
        id: 'sub_cont_01',
        formId: 'frm_contact_7a3b',
        data: {
          name: 'Marcus Bell',
          email: 'marcus@acmecorp.com',
          subject: 'Partnership Inquiry',
          message: 'Hi team, would love to discuss a developer tooling integration with our ecosystem.',
        },
        ipAddress: '157.240.22.35',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        createdAt: subTime(120),
        status: 'valid',
      },
      {
        id: 'sub_cont_02',
        formId: 'frm_contact_7a3b',
        data: {
          name: 'Amara Okafor',
          email: 'amara@techbridge.ng',
          subject: 'Documentation Question',
          message: 'Can we send nested JSON arrays via the AJAX endpoint? Excellent free service by the way!',
        },
        ipAddress: '197.210.44.18',
        userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64)',
        createdAt: subTime(240),
        status: 'valid',
      },
      {
        id: 'sub_job_01',
        formId: 'frm_careers_4k91',
        data: {
          name: 'Liam O’Connor',
          email: 'liam@dublindev.ie',
          position: 'Lead React / Node Architect',
          portfolio: 'https://liamoconnor.dev',
          years_experience: '8',
          message: 'Excited about the engineering mission. My background includes building high-throughput developer platforms.',
        },
        ipAddress: '80.111.45.19',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        createdAt: subTime(500),
        status: 'valid',
      },
    ],
    emailLogs: [
      {
        id: 'eml_1029_notify',
        formId: 'frm_8x92kd',
        submissionId: 'sub_1029',
        type: 'notification',
        to: 'aalyanmukhtar1@gmail.com',
        from: 'notifications@formpulse.dev',
        subject: 'New Proposal Submission from John Smith',
        body: "You have a new proposal submission on 'Proposal Form':\n\nName: John Smith\nEmail: john@example.com\nCompany: Smith & Co Enterprises\nBudget: $5,000\nService: Website Development\nMessage: We need an e-commerce website with 200 products, mobile responsiveness, and custom checkout flows.\n\nView submission in your dashboard: /dashboard/forms/frm_8x92kd",
        status: 'delivered',
        timestamp: subTime(2),
      },
      {
        id: 'eml_1029_autoreply',
        formId: 'frm_8x92kd',
        submissionId: 'sub_1029',
        type: 'autoreply',
        to: 'john@example.com',
        from: 'no-reply@formpulse.dev',
        subject: "We've received your proposal inquiry!",
        body: "Hello John Smith,\n\nThank you for reaching out. We have received your proposal details and our team will review your budget and scope within 24 hours.\n\nBest regards,\nThe Team",
        status: 'delivered',
        timestamp: subTime(2),
      },
      {
        id: 'eml_1028_notify',
        formId: 'frm_8x92kd',
        submissionId: 'sub_1028',
        type: 'notification',
        to: 'aalyanmukhtar1@gmail.com',
        from: 'notifications@formpulse.dev',
        subject: 'New Proposal Submission from Sarah Khan',
        body: "You have a new proposal submission on 'Proposal Form':\n\nName: Sarah Khan\nEmail: sarah@example.com\nCompany: Khan Global Design\nBudget: $12,000\nService: E-commerce Website\nMessage: Looking for a complete redesign and migration to modern headless frontend.",
        status: 'delivered',
        timestamp: subTime(18),
      },
    ],
    webhookLogs: [
      {
        id: 'wh_1029',
        formId: 'frm_8x92kd',
        submissionId: 'sub_1029',
        url: 'https://webhook.site/demo-endpoint',
        status: 200,
        response: '{"status":"received","id":"wh_ack_991"}',
        durationMs: 142,
        timestamp: subTime(2),
      },
    ],
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.readFromDisk();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private readFromDisk(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading db.json, generating initial dataset', err);
    }
    const initial = getInitialData();
    this.saveToDisk(initial);
    return initial;
  }

  private saveToDisk(data: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving db.json', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(collection: K): DatabaseSchema[K] {
    return this.data[collection];
  }

  public mutate(fn: (draft: DatabaseSchema) => void) {
    fn(this.data);
    this.saveToDisk(this.data);
  }

  public resetToDefaults() {
    this.data = getInitialData();
    this.saveToDisk(this.data);
  }
}

export const db = new Database();
