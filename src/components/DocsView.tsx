import React, { useState } from 'react';
import { Copy, Check, Terminal, Code2, ShieldCheck, Mail, Globe, Zap, ArrowRight } from 'lucide-react';

interface DocsViewProps {
  onOpenPlayground: () => void;
  onOpenCreateModal: () => void;
}

export const DocsView: React.FC<DocsViewProps> = ({ onOpenPlayground, onOpenCreateModal }) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const htmlCode = `<form action="https://api.formpulse.dev/f/frm_8x92kd" method="POST">
  <!-- Standard form fields -->
  <label for="name">Your Name</label>
  <input type="text" id="name" name="name" placeholder="John Smith" required>

  <label for="email">Your Email</label>
  <input type="email" id="email" name="email" placeholder="john@example.com" required>

  <label for="budget">Project Budget</label>
  <input type="text" id="budget" name="budget" placeholder="$5,000">

  <label for="message">Project Details</label>
  <textarea id="message" name="message" placeholder="Describe what you need..."></textarea>

  <!-- Optional: Honeypot spam trap (invisible to real visitors) -->
  <input type="text" name="_gotcha" style="display:none !important" tabindex="-1" autocomplete="off">

  <!-- Optional: Custom redirect URL upon successful submission -->
  <input type="hidden" name="_redirect" value="https://mysite.com/thanks">

  <button type="submit">Send Proposal</button>
</form>`;

  const fetchCode = `// Modern JavaScript / Fetch API
const response = await fetch("https://api.formpulse.dev/f/frm_8x92kd", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify({
    name: "Aalyan",
    email: "aalyan@example.com",
    budget: "$12,000",
    service: "E-Commerce Rebuild",
    message: "We need a headless storefront with custom checkout."
  })
});

const result = await response.json();

if (result.success) {
  console.log("Submission ID:", result.submissionId);
  alert("Thank you! Your inquiry was sent.");
} else {
  console.error("Submission failed:", result.error.message);
}`;

  const reactCode = `import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("https://api.formpulse.dev/f/frm_8x92kd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorMessage(data.error?.message || "Something went wrong");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  };

  if (status === "success") {
    return <div className="p-4 bg-emerald-50 text-emerald-800 rounded">Thank you! Your message was sent.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" name="name" placeholder="Name" required className="input" />
      <input type="email" name="email" placeholder="Email" required className="input" />
      <textarea name="message" placeholder="Message" className="textarea" />
      
      {/* Honeypot field: invisible to users, traps bots */}
      <input type="text" name="_gotcha" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

      <button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>

      {status === "error" && <p className="text-red-500 text-sm">{errorMessage}</p>}
    </form>
  );
}`;

  const nextJsCode = `// app/actions/submit-form.ts
"use server";

export async function submitProposal(formData: FormData) {
  const payload = Object.fromEntries(formData.entries());

  const response = await fetch("https://api.formpulse.dev/f/frm_8x92kd", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
}`;

  const curlCode = `curl -X POST https://api.formpulse.dev/f/frm_8x92kd \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Sarah Khan",
    "email": "sarah@example.com",
    "budget": "$12,000",
    "message": "Looking for a complete redesign and migration."
  }'`;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
      {/* Hero */}
      <div className="border-b border-neutral-800 pb-8">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-2">
          <Terminal className="w-3.5 h-3.5" />
          <span>Developer Documentation</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-100">
          Form Backend Integration Guide
        </h1>
        <p className="text-base text-neutral-400 mt-2 max-w-3xl leading-relaxed">
          Connect any frontend website form directly to our endpoint in under 60 seconds.
          We validate, filter spam, store data, dispatch email notifications, and trigger webhooks.
          No server code required.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-6">
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Create Free Endpoint</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenPlayground}
            className="px-4 py-2 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 hover:text-white rounded-lg transition-colors"
          >
            Launch Interactive Tester
          </button>
        </div>
      </div>

      {/* Quick Nav Anchor Pills */}
      <div className="flex flex-wrap gap-2 text-xs">
        <a href="#quickstart" className="px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors">
          1. Quickstart (HTML)
        </a>
        <a href="#javascript" className="px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors">
          2. JavaScript / AJAX
        </a>
        <a href="#frameworks" className="px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors">
          3. React & Next.js
        </a>
        <a href="#honeypot" className="px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors">
          4. Spam & Honeypot
        </a>
        <a href="#cors" className="px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors">
          5. CORS & Rate Limiting
        </a>
        <a href="#webhooks" className="px-3 py-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors">
          6. Webhooks & Errors
        </a>
      </div>

      {/* Section 1: HTML Quickstart */}
      <section id="quickstart" className="space-y-4 pt-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-100 flex items-center gap-2">
            <span>1. Plain HTML Form Integration</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Simply point your HTML form's <code className="text-emerald-400 bg-neutral-900 px-1.5 py-0.5 rounded text-xs font-mono">action</code> to your FormPulse endpoint and set <code className="text-emerald-400 bg-neutral-900 px-1.5 py-0.5 rounded text-xs font-mono">method="POST"</code>.
          </p>
        </div>

        <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-xs text-neutral-400">
            <span className="font-mono">index.html</span>
            <button
              onClick={() => copyCode(htmlCode, 'html')}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {copiedIndex === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 'html' ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed">
            {htmlCode}
          </pre>
        </div>
      </section>

      {/* Section 2: JavaScript & AJAX */}
      <section id="javascript" className="space-y-4 pt-6">
        <div>
          <h2 className="text-xl font-semibold text-neutral-100">
            2. JavaScript / AJAX (Fetch API)
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            To submit without a page reload, send a POST request with <code className="text-emerald-400 bg-neutral-900 px-1.5 py-0.5 rounded text-xs font-mono">"Content-Type": "application/json"</code>. FormPulse returns clean JSON.
          </p>
        </div>

        <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-xs text-neutral-400">
            <span className="font-mono">app.js</span>
            <button
              onClick={() => copyCode(fetchCode, 'fetch')}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {copiedIndex === 'fetch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 'fetch' ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed">
            {fetchCode}
          </pre>
        </div>
      </section>

      {/* Section 3: Frameworks (React & Next.js) */}
      <section id="frameworks" className="space-y-6 pt-6">
        <div>
          <h2 className="text-xl font-semibold text-neutral-100">
            3. Framework Integrations (React, Next.js, cURL)
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Production-ready examples with loading states, error handling, and TypeScript support.
          </p>
        </div>

        {/* React Component */}
        <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-xs text-neutral-400">
            <span className="font-mono">ContactForm.tsx (React)</span>
            <button
              onClick={() => copyCode(reactCode, 'react')}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {copiedIndex === 'react' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 'react' ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed max-h-96">
            {reactCode}
          </pre>
        </div>

        {/* Next.js Server Action */}
        <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-xs text-neutral-400">
            <span className="font-mono">submitProposal.ts (Next.js 14+ Server Action)</span>
            <button
              onClick={() => copyCode(nextJsCode, 'nextjs')}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {copiedIndex === 'nextjs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 'nextjs' ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed">
            {nextJsCode}
          </pre>
        </div>

        {/* cURL */}
        <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-xs text-neutral-400">
            <span className="font-mono">Terminal / cURL</span>
            <button
              onClick={() => copyCode(curlCode, 'curl')}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {copiedIndex === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 'curl' ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed">
            {curlCode}
          </pre>
        </div>
      </section>

      {/* Section 4: Spam Protection & Honeypot */}
      <section id="honeypot" className="space-y-4 pt-6">
        <div>
          <h2 className="text-xl font-semibold text-neutral-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>4. Built-in Spam Defense & Honeypots</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Stop spam without forcing human users to solve annoying CAPTCHAs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2.5">
            <h3 className="text-sm font-semibold text-neutral-200">How the Honeypot works</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Add a hidden input with name <code className="text-emerald-400 font-mono">_gotcha</code> to your form. Real visitors will never see or fill it because it is hidden via CSS. Automated bots scrape the DOM and fill all inputs indiscriminately.
            </p>
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-xs text-neutral-300">
              {'<input type="text" name="_gotcha" style="display:none !important" tabIndex="-1" autocomplete="off">'}
            </div>
            <p className="text-xs text-neutral-500">
              If <code className="font-mono text-neutral-400">_gotcha</code> has a value, FormPulse flags the submission as Spam without alerting the bot.
            </p>
          </div>

          <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2.5">
            <h3 className="text-sm font-semibold text-neutral-200">Multi-Layer Spam Engine</h3>
            <ul className="text-xs text-neutral-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span><strong>Honeypot Traps:</strong> Supported fields include <code className="font-mono text-neutral-300">_gotcha</code>, <code className="font-mono text-neutral-300">_honeypot</code>, and <code className="font-mono text-neutral-300">bot_trap</code>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span><strong>Sliding IP Rate Limiting:</strong> 60 requests/minute per client IP to stop DDoS flooding.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span><strong>Payload Size Limit:</strong> 1MB per submission to prevent memory overload.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span><strong>Isolated Spam Inbox:</strong> Review or restore flagged submissions at any time.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5: CORS & Rate Limiting */}
      <section id="cors" className="space-y-4 pt-6">
        <div>
          <h2 className="text-xl font-semibold text-neutral-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <span>5. CORS Controls & Rate Limiting</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Allow submissions from anywhere or lock your form to your specific domain names.
          </p>
        </div>

        <div className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-200 mb-1">Domain Whitelisting (CORS)</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-2">
                By default, your endpoint accepts submissions from any website (<code className="font-mono text-neutral-300">Access-Control-Allow-Origin: *</code>).
                In Form Settings, you can configure <strong>Allowed Domains</strong> (e.g. <code className="font-mono text-neutral-300">mysite.com</code>).
              </p>
              <p className="text-xs text-neutral-500">
                Any submission originating from an unlisted domain receives HTTP 403 <code className="font-mono text-neutral-400">DOMAIN_FORBIDDEN</code>.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-200 mb-1">Rate Limiting Specs</h3>
              <p className="text-xs text-neutral-400 leading-relaxed mb-2">
                To prevent brute-force abuse, endpoints enforce a generous threshold of <strong>60 requests per minute</strong> per client IP address.
              </p>
              <p className="text-xs text-neutral-500">
                Excessive requests receive HTTP 429 <code className="font-mono text-neutral-400">RATE_LIMITED</code> with a standardized JSON error message.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Webhooks & Error Codes */}
      <section id="webhooks" className="space-y-4 pt-6 pb-8">
        <div>
          <h2 className="text-xl font-semibold text-neutral-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <span>6. Webhooks & Standard Error Codes</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Stream incoming submissions to CRMs, Discord channels, Slack, Zapier, or custom backends.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
            <h3 className="text-xs font-semibold text-neutral-300 mb-2 font-mono">Webhook JSON Payload</h3>
            <pre className="p-3 bg-neutral-900 rounded text-[11px] font-mono text-neutral-300 overflow-x-auto leading-relaxed">
{`{
  "event": "form.submission",
  "form_id": "frm_8x92kd",
  "form_name": "Proposal Form",
  "submission_id": "sub_1029",
  "data": {
    "name": "John Smith",
    "email": "john@example.com",
    "budget": "$5,000",
    "service": "Website Development"
  },
  "ip_address": "192.168.1.42",
  "created_at": "2026-09-28T09:14:00Z"
}`}
            </pre>
          </div>

          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
            <h3 className="text-xs font-semibold text-neutral-300 mb-2 font-mono">Error Response Codes</h3>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                <span className="font-mono text-rose-400 font-semibold">FORM_NOT_FOUND (404)</span>
                <p className="text-neutral-400 text-[11px] mt-0.5">The form endpoint ID does not exist or has been deleted.</p>
              </div>
              <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                <span className="font-mono text-rose-400 font-semibold">VALIDATION_ERROR (400)</span>
                <p className="text-neutral-400 text-[11px] mt-0.5">Empty submission payload or invalid data format.</p>
              </div>
              <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                <span className="font-mono text-amber-400 font-semibold">RATE_LIMITED (429)</span>
                <p className="text-neutral-400 text-[11px] mt-0.5">Exceeded 60 submissions/min rate limit.</p>
              </div>
              <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                <span className="font-mono text-amber-400 font-semibold">FORM_PAUSED (403)</span>
                <p className="text-neutral-400 text-[11px] mt-0.5">Form owner has temporarily paused submissions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
