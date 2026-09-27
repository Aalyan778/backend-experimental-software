import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db, Form, Submission, EmailLog, WebhookLog } from './src/server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable CORS for external websites submitting to public /f/:formId endpoint
app.use(cors({
  origin: (origin, callback) => {
    // Public endpoints accept any origin or validate via allowedDomains in route
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
}));

// Body parsers - 1MB limit for free tier
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Simple in-memory rate limiting map: ip -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 submissions/min per IP

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const current = rateLimitMap.get(ip);

  if (!current || now > current.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    const isJson = req.is('json') || req.headers.accept?.includes('application/json') || req.xhr;
    if (isJson) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please wait a moment before submitting again.',
        },
      });
    }
    return res.status(429).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rate Limit Exceeded — FormPulse</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0a0a0a; color: #ededed; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .card { background: #171717; border: 1px solid #262626; border-radius: 12px; padding: 32px; max-width: 480px; text-align: center; }
            h1 { font-size: 20px; color: #ef4444; margin-top: 0; }
            p { color: #a3a3a3; font-size: 14px; line-height: 1.6; }
            a { color: #10b981; text-decoration: none; font-size: 14px; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Rate Limit Exceeded</h1>
            <p>Too many requests were received from your IP address. Please wait a minute before submitting again.</p>
            <p><a href="javascript:history.back()">← Return to form</a></p>
          </div>
        </body>
      </html>
    `);
  }

  current.count++;
  next();
}

function generateId(prefix: string) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let str = '';
  for (let i = 0; i < 6; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${str}`;
}

// ==========================================
// 1. PUBLIC FORM SUBMISSION ENDPOINT: POST /f/:formId
// ==========================================
app.post('/f/:formId', rateLimiter, async (req: Request, res: Response) => {
  const { formId } = req.params;
  const forms = db.get('forms');
  const form = forms.find(f => f.id === formId || f.endpointKey === formId);

  const isJson = req.is('json') || req.headers.accept?.includes('application/json') || req.headers['x-requested-with'] === 'XMLHttpRequest';

  if (!form) {
    if (isJson) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FORM_NOT_FOUND',
          message: 'The form does not exist or has been deleted.',
        },
      });
    }
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Form Not Found — FormPulse</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0a0a0a; color: #ededed; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .card { background: #171717; border: 1px solid #262626; border-radius: 12px; padding: 32px; max-width: 480px; text-align: center; }
            h1 { font-size: 20px; color: #ef4444; margin-top: 0; }
            p { color: #a3a3a3; font-size: 14px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Form Not Found</h1>
            <p>The form endpoint <code>${formId}</code> does not exist on FormPulse. Please verify your form action URL in your code.</p>
          </div>
        </body>
      </html>
    `);
  }

  // Check form status
  if (form.status === 'paused') {
    if (isJson) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORM_PAUSED',
          message: 'This form is currently paused and not accepting new submissions.',
        },
      });
    }
    return res.status(403).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Form Paused</title><style>body { font-family: sans-serif; background: #0a0a0a; color: #ededed; display: flex; align-items: center; justify-content: center; min-height: 100vh; } .card { background: #171717; padding: 32px; border-radius: 12px; border: 1px solid #333; text-align: center; }</style></head>
        <body><div class="card"><h2>Form Paused</h2><p>The owner of this form has temporarily paused submissions.</p></div></body>
      </html>
    `);
  }

  if (form.status === 'archived') {
    if (isJson) {
      return res.status(410).json({
        success: false,
        error: {
          code: 'FORM_ARCHIVED',
          message: 'This form has been archived.',
        },
      });
    }
    return res.status(410).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Form Archived</title><style>body { font-family: sans-serif; background: #0a0a0a; color: #ededed; display: flex; align-items: center; justify-content: center; min-height: 100vh; } .card { background: #171717; padding: 32px; border-radius: 12px; border: 1px solid #333; text-align: center; }</style></head>
        <body><div class="card"><h2>Form Archived</h2><p>This form is archived and no longer accepts submissions.</p></div></body>
      </html>
    `);
  }

  // Check Allowed Domains if specified
  const origin = req.headers.origin || req.headers.referer;
  if (form.allowedDomains && form.allowedDomains.length > 0 && origin) {
    try {
      const originHost = new URL(origin).hostname;
      const isAllowed = form.allowedDomains.some(d => originHost === d || originHost.endsWith(`.${d}`));
      if (!isAllowed) {
        if (isJson) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'DOMAIN_FORBIDDEN',
              message: `Submissions from domain '${originHost}' are not allowed for this form.`,
            },
          });
        }
        return res.status(403).send(`<h2>Forbidden Domain</h2><p>Submissions from origin ${originHost} are restricted.</p>`);
      }
    } catch {
      // ignore URL parsing error
    }
  }

  // Extract raw body
  const rawBody = req.body || {};

  // Check honeypot for spam detection
  const honeypotKeys = ['_gotcha', '_honeypot', 'bot_trap', '_hp'];
  let isSpam = false;
  let spamReason: string | undefined;

  for (const hp of honeypotKeys) {
    if (rawBody[hp] && String(rawBody[hp]).trim().length > 0) {
      isSpam = true;
      spamReason = `Honeypot trap '${hp}' filled: "${rawBody[hp]}"`;
      break;
    }
  }

  // Clean form payload (strip meta keys like _gotcha, _redirect, _next, etc.)
  const cleanData: Record<string, any> = {};
  const metaKeys = ['_redirect', '_next', '_gotcha', '_honeypot', 'bot_trap', '_hp', '_subject'];

  for (const [key, val] of Object.entries(rawBody)) {
    if (!metaKeys.includes(key)) {
      cleanData[key] = val;
    }
  }

  // If payload is empty
  if (Object.keys(cleanData).length === 0) {
    if (isJson) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Form submission is empty. Please provide form fields.',
        },
      });
    }
  }

  const submissionId = generateId('sub');
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || 'Unknown';
  const timestamp = new Date().toISOString();

  const newSubmission: Submission = {
    id: submissionId,
    formId: form.id,
    data: cleanData,
    ipAddress,
    userAgent,
    createdAt: timestamp,
    status: isSpam ? 'spam' : 'valid',
    spamReason,
  };

  // Find submitter's email and name for notifications & auto-responder
  let submitterEmail: string | undefined;
  let submitterName: string | undefined;

  for (const [key, val] of Object.entries(cleanData)) {
    const lk = key.toLowerCase();
    if (!submitterEmail && (lk.includes('email') || lk === 'mail')) {
      submitterEmail = String(val);
    }
    if (!submitterName && (lk.includes('name') || lk === 'sender' || lk === 'author')) {
      submitterName = String(val);
    }
  }

  // Create notifications and logs in DB
  db.mutate(draft => {
    draft.submissions.unshift(newSubmission);

    // If valid submission, dispatch email notifications
    if (!isSpam) {
      // 1. Notification Email to form owner
      if (form.notifyOnSubmission && form.notificationEmail) {
        const fieldList = Object.entries(cleanData)
          .map(([k, v]) => `• ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
          .join('\n');

        const emailLog: EmailLog = {
          id: generateId('eml_notify'),
          formId: form.id,
          submissionId: newSubmission.id,
          type: 'notification',
          to: form.notificationEmail,
          from: 'notifications@formpulse.dev',
          subject: `New submission on '${form.name}'${submitterName ? ` from ${submitterName}` : ''}`,
          body: `You received a new submission on '${form.name}':\n\n${fieldList}\n\nSubmitted on: ${new Date(timestamp).toLocaleString()}\nIP Address: ${ipAddress}\nSubmission ID: ${submissionId}`,
          status: 'delivered',
          timestamp,
        };
        draft.emailLogs.unshift(emailLog);
      }

      // 2. Auto-responder to submitter if enabled
      if (form.autoReplyEnabled && submitterEmail) {
        const autoReplyLog: EmailLog = {
          id: generateId('eml_reply'),
          formId: form.id,
          submissionId: newSubmission.id,
          type: 'autoreply',
          to: submitterEmail,
          from: 'no-reply@formpulse.dev',
          subject: form.autoReplySubject || `Thanks for contacting us!`,
          body: form.autoReplyMessage || `We received your submission on ${form.name} and will be in touch shortly.\n\nThank you!`,
          status: 'delivered',
          timestamp,
        };
        draft.emailLogs.unshift(autoReplyLog);
      }
    }
  });

  // Webhook dispatch in background if configured (non-blocking for fast client response)
  if (!isSpam && form.webhookUrl) {
    (async () => {
      try {
        const webhookPayload = {
          event: 'form.submission',
          form_id: form.id,
          form_name: form.name,
          submission_id: newSubmission.id,
          data: cleanData,
          ip_address: ipAddress,
          created_at: timestamp,
        };

        const start = Date.now();
        let status = 200;
        let responseText = '{"status":"received"}';

        if (form.webhookUrl!.startsWith('http')) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4000);
            const whRes = await fetch(form.webhookUrl!, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'User-Agent': 'FormPulse-Webhook/1.0' },
              body: JSON.stringify(webhookPayload),
              signal: controller.signal,
            });
            clearTimeout(timeout);
            status = whRes.status;
            responseText = await whRes.text();
          } catch (err: any) {
            status = 502;
            responseText = `Webhook delivery error: ${err.message}`;
          }
        }

        db.mutate(draft => {
          draft.webhookLogs.unshift({
            id: generateId('wh'),
            formId: form.id,
            submissionId: newSubmission.id,
            url: form.webhookUrl!,
            status,
            response: responseText.slice(0, 300),
            durationMs: Date.now() - start,
            timestamp: new Date().toISOString(),
          });
        });
      } catch (err) {
        console.error('Webhook execution background error', err);
      }
    })();
  }

  // Response handling:
  if (isJson) {
    return res.status(200).json({
      success: true,
      message: 'Submission received.',
      submissionId: newSubmission.id,
      timestamp: newSubmission.createdAt,
    });
  }

  // If HTML form with custom redirect
  const redirectUrl = rawBody._redirect || rawBody._next;
  if (redirectUrl && typeof redirectUrl === 'string') {
    try {
      // basic validation of URL
      return res.redirect(302, redirectUrl);
    } catch {
      // fallback
    }
  }

  // Default clean HTML Thank You page
  const fieldsHtml = Object.entries(cleanData)
    .map(
      ([k, v]) => `
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #262626; font-size: 13px;">
        <span style="color: #a3a3a3; font-weight: 500;">${escapeHtml(k)}</span>
        <span style="color: #f5f5f5; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; text-align: right; max-width: 60%; word-break: break-all;">${escapeHtml(String(v))}</span>
      </div>
    `,
    )
    .join('');

  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Submission Received — FormPulse</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #09090b;
            color: #fafafa;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
          }
          .card {
            background: #121214;
            border: 1px solid #27272a;
            border-radius: 14px;
            max-width: 520px;
            width: 100%;
            padding: 32px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #10b981;
            font-weight: 600;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            padding: 4px 10px;
            border-radius: 9999px;
            margin-bottom: 16px;
          }
          h1 { margin: 0 0 8px; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
          p.desc { margin: 0 0 24px; font-size: 14px; color: #a1a1aa; line-height: 1.5; }
          .summary {
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 24px;
          }
          .summary-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #71717a;
            margin-bottom: 12px;
            font-weight: 600;
          }
          .btn {
            display: inline-block;
            background: #fafafa;
            color: #09090b;
            padding: 10px 18px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 8px;
            text-decoration: none;
            transition: all 0.15s ease;
          }
          .btn:hover { background: #e4e4e7; }
          .footer-note {
            margin-top: 24px;
            font-size: 12px;
            color: #52525b;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Submission Confirmed
          </div>
          <h1>Thank you!</h1>
          <p class="desc">Your message has been securely submitted to <strong>${escapeHtml(form.name)}</strong>.</p>
          
          <div class="summary">
            <div class="summary-title">Submitted Information</div>
            ${fieldsHtml}
            <div style="display: flex; justify-content: space-between; padding-top: 10px; font-size: 11px; color: #71717a;">
              <span>Ref ID</span>
              <span style="font-family: monospace;">${submissionId}</span>
            </div>
          </div>

          <div style="display: flex; gap: 12px; align-items: center;">
            <a href="javascript:history.back()" class="btn">← Back to form</a>
          </div>

          <div class="footer-note">
            Powered by FormPulse — Free Form Backend
          </div>
        </div>
      </body>
    </html>
  `);
});

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// 2. FORM DASHBOARD MANAGEMENT APIS
// ==========================================

// Get all forms with stats
app.get('/api/forms', (req: Request, res: Response) => {
  const forms = db.get('forms');
  const submissions = db.get('submissions');

  const formsWithStats = forms.map(form => {
    const formSubs = submissions.filter(s => s.formId === form.id);
    const validCount = formSubs.filter(s => s.status === 'valid').length;
    const spamCount = formSubs.filter(s => s.status === 'spam').length;
    const lastSub = formSubs[0]?.createdAt || null;

    return {
      ...form,
      totalSubmissions: formSubs.length,
      validSubmissions: validCount,
      spamSubmissions: spamCount,
      lastSubmissionAt: lastSub,
    };
  });

  res.json({ success: true, forms: formsWithStats });
});

// Create new form
app.post('/api/forms', (req: Request, res: Response) => {
  const {
    name,
    notificationEmail,
    autoReplyEnabled,
    autoReplySubject,
    autoReplyMessage,
    allowedDomains,
    webhookUrl,
  } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_NAME', message: 'Form name is required.' },
    });
  }

  const endpointKey = generateId('frm');
  const formId = endpointKey;
  const now = new Date().toISOString();

  const newForm: Form = {
    id: formId,
    userId: 'usr_dev_primary',
    name: name.trim(),
    endpointKey,
    status: 'active',
    notificationEmail: notificationEmail || 'hello@example.com',
    notifyOnSubmission: true,
    autoReplyEnabled: !!autoReplyEnabled,
    autoReplySubject: autoReplySubject || 'Thank you for reaching out!',
    autoReplyMessage: autoReplyMessage || "We've received your submission and will get back to you shortly.",
    allowedDomains: Array.isArray(allowedDomains)
      ? allowedDomains.filter(Boolean)
      : allowedDomains
      ? String(allowedDomains).split(',').map(s => s.trim()).filter(Boolean)
      : [],
    webhookUrl: webhookUrl || '',
    createdAt: now,
    updatedAt: now,
  };

  db.mutate(draft => {
    draft.forms.unshift(newForm);
  });

  res.status(201).json({ success: true, form: newForm });
});

// Get single form
app.get('/api/forms/:id', (req: Request, res: Response) => {
  const forms = db.get('forms');
  const submissions = db.get('submissions');
  const form = forms.find(f => f.id === req.params.id);

  if (!form) {
    return res.status(404).json({ success: false, error: { code: 'FORM_NOT_FOUND', message: 'Form not found' } });
  }

  const formSubs = submissions.filter(s => s.formId === form.id);
  res.json({
    success: true,
    form: {
      ...form,
      totalSubmissions: formSubs.length,
      validSubmissions: formSubs.filter(s => s.status === 'valid').length,
      spamSubmissions: formSubs.filter(s => s.status === 'spam').length,
    },
  });
});

// Update form
app.patch('/api/forms/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const forms = db.get('forms');
  const index = forms.findIndex(f => f.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: { code: 'FORM_NOT_FOUND', message: 'Form not found' } });
  }

  let updatedForm: Form | null = null;
  db.mutate(draft => {
    const target = draft.forms[index];
    const {
      name,
      status,
      notificationEmail,
      notifyOnSubmission,
      autoReplyEnabled,
      autoReplySubject,
      autoReplyMessage,
      allowedDomains,
      webhookUrl,
    } = req.body;

    if (name !== undefined) target.name = name;
    if (status !== undefined) target.status = status;
    if (notificationEmail !== undefined) target.notificationEmail = notificationEmail;
    if (notifyOnSubmission !== undefined) target.notifyOnSubmission = !!notifyOnSubmission;
    if (autoReplyEnabled !== undefined) target.autoReplyEnabled = !!autoReplyEnabled;
    if (autoReplySubject !== undefined) target.autoReplySubject = autoReplySubject;
    if (autoReplyMessage !== undefined) target.autoReplyMessage = autoReplyMessage;
    if (allowedDomains !== undefined) {
      target.allowedDomains = Array.isArray(allowedDomains)
        ? allowedDomains
        : String(allowedDomains).split(',').map(s => s.trim()).filter(Boolean);
    }
    if (webhookUrl !== undefined) target.webhookUrl = webhookUrl;
    target.updatedAt = new Date().toISOString();
    updatedForm = { ...target };
  });

  res.json({ success: true, form: updatedForm });
});

// Delete form
app.delete('/api/forms/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.mutate(draft => {
    draft.forms = draft.forms.filter(f => f.id !== id);
    draft.submissions = draft.submissions.filter(s => s.formId !== id);
    draft.emailLogs = draft.emailLogs.filter(e => e.formId !== id);
    draft.webhookLogs = draft.webhookLogs.filter(w => w.formId !== id);
  });
  res.json({ success: true, message: 'Form deleted successfully.' });
});

// Get submissions for form
app.get('/api/forms/:id/submissions', (req: Request, res: Response) => {
  const { id } = req.params;
  const { search, status } = req.query;

  const submissions = db.get('submissions');
  let filtered = submissions.filter(s => s.formId === id);

  if (status && status !== 'all') {
    filtered = filtered.filter(s => s.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(s => {
      const dataStr = JSON.stringify(s.data).toLowerCase();
      return dataStr.includes(q) || s.ipAddress.includes(q) || s.id.toLowerCase().includes(q);
    });
  }

  res.json({
    success: true,
    submissions: filtered,
    total: filtered.length,
  });
});

// Clear all submissions for form
app.delete('/api/forms/:id/submissions', (req: Request, res: Response) => {
  const { id } = req.params;
  db.mutate(draft => {
    draft.submissions = draft.submissions.filter(s => s.formId !== id);
  });
  res.json({ success: true, message: 'All submissions cleared.' });
});

// Export submissions as CSV or JSON
app.get('/api/forms/:id/export', (req: Request, res: Response) => {
  const { id } = req.params;
  const { format = 'csv' } = req.query;

  const forms = db.get('forms');
  const form = forms.find(f => f.id === id);
  const submissions = db.get('submissions').filter(s => s.formId === id);

  if (!form) {
    return res.status(404).send('Form not found');
  }

  const safeName = form.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  if (format === 'json') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}_submissions.json"`);
    return res.send(JSON.stringify(submissions, null, 2));
  }

  // CSV export
  // Gather all unique keys across all submissions
  const allKeys = Array.from(
    new Set(submissions.flatMap(s => Object.keys(s.data))),
  );

  const headers = ['id', 'status', 'created_at', 'ip_address', ...allKeys];
  const csvRows = [headers.join(',')];

  for (const s of submissions) {
    const row = [
      `"${s.id}"`,
      `"${s.status}"`,
      `"${s.createdAt}"`,
      `"${s.ipAddress}"`,
      ...allKeys.map(k => {
        const val = s.data[k];
        if (val === undefined || val === null) return '""';
        return `"${String(val).replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      }),
    ];
    csvRows.push(row.join(','));
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}_submissions.csv"`);
  res.send(csvRows.join('\n'));
});

// Single submission actions
app.delete('/api/submissions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.mutate(draft => {
    draft.submissions = draft.submissions.filter(s => s.id !== id);
  });
  res.json({ success: true, message: 'Submission deleted.' });
});

app.patch('/api/submissions/:id/toggle-spam', (req: Request, res: Response) => {
  const { id } = req.params;
  let updatedStatus = 'valid';
  db.mutate(draft => {
    const sub = draft.submissions.find(s => s.id === id);
    if (sub) {
      sub.status = sub.status === 'spam' ? 'valid' : 'spam';
      updatedStatus = sub.status;
    }
  });
  res.json({ success: true, status: updatedStatus });
});

// Email outbox logs
app.get('/api/forms/:id/email-logs', (req: Request, res: Response) => {
  const { id } = req.params;
  const logs = db.get('emailLogs').filter(e => e.formId === id);
  res.json({ success: true, logs });
});

// Global stats
app.get('/api/stats/overview', (req: Request, res: Response) => {
  const forms = db.get('forms');
  const submissions = db.get('submissions');
  const emails = db.get('emailLogs');

  const totalSubmissions = submissions.length;
  const validSubmissions = submissions.filter(s => s.status === 'valid').length;
  const spamBlocked = submissions.filter(s => s.status === 'spam').length;
  const emailsSent = emails.filter(e => e.status === 'delivered').length;

  res.json({
    success: true,
    stats: {
      formsCount: forms.length,
      totalSubmissions,
      validSubmissions,
      spamBlocked,
      emailsSent,
    },
  });
});

// Auth / current user
app.get('/api/auth/me', (req: Request, res: Response) => {
  const users = db.get('users');
  res.json({ success: true, user: users[0] });
});

// Reset demo state
app.post('/api/reset-demo', (req: Request, res: Response) => {
  db.resetToDefaults();
  res.json({ success: true, message: 'Demo data restored.' });
});

// ==========================================
// 3. VITE INTEGRATION / STATIC SERVING
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FormPulse Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[FormPulse Server] Failed to start:', err);
  process.exit(1);
});
