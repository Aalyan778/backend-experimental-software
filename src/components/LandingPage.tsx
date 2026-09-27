import React, { useState } from 'react';
import {
  ArrowRight,
  Terminal,
  Zap,
  ShieldCheck,
  Mail,
  Code2,
  Globe,
  Radio,
  Check,
  Copy,
  Play,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database,
  Send,
  Lock,
} from 'lucide-react';
import heroImg from '../assets/images/hero_cloud_api_mesh_1790549133641.jpg';
import { submitToEndpoint } from '../services/api.ts';
import { FormItem } from '../types.ts';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenDocs: () => void;
  onOpenPlayground: (formId?: string) => void;
  demoForm?: FormItem;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onOpenDocs,
  onOpenPlayground,
  demoForm,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'fetch' | 'react' | 'curl'>('html');
  const [copiedCode, setCopiedCode] = useState(false);

  // In-hero interactive demo form state
  const [demoName, setDemoName] = useState('Alex Morgan');
  const [demoEmail, setDemoEmail] = useState('alex@techcorp.io');
  const [demoBudget, setDemoBudget] = useState('$8,000');
  const [demoMessage, setDemoMessage] = useState('Looking for an experienced engineer to build our client portal.');
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoSubmissionId, setDemoSubmissionId] = useState<string | null>(null);

  const targetFormId = demoForm?.id || 'frm_8x92kd';
  const endpointUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://api.formpulse.dev'}/f/${targetFormId}`;

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDemoSubmitting(true);
    try {
      const res = await submitToEndpoint(targetFormId, {
        name: demoName,
        email: demoEmail,
        budget: demoBudget,
        service: 'Web Development Proposal',
        message: demoMessage,
      });

      if (res.success) {
        setDemoSubmitted(true);
        setDemoSubmissionId(res.submissionId || 'sub_live_demo');
      }
    } catch (err) {
      console.error('Demo submit failed', err);
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  const codeSnippets = {
    html: `<form action="${endpointUrl}" method="POST">
  <input type="text" name="name" placeholder="Your Name" required>
  <input type="email" name="email" placeholder="Your Email" required>
  <input type="text" name="budget" placeholder="Project Budget">
  <textarea name="message" placeholder="Project Details"></textarea>
  
  <!-- Anti-spam honeypot (invisible to humans) -->
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off">

  <button type="submit">Send Proposal</button>
</form>`,
    fetch: `// Modern Fetch (async/await)
const res = await fetch("${endpointUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify({
    name: "Alex Morgan",
    email: "alex@techcorp.io",
    budget: "$8,000",
    message: "Need a high-converting landing page."
  })
});

const data = await res.json();
console.log(data); // { success: true, submissionId: "sub_..." }`,
    react: `// React Functional Component
export function ProposalForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    
    const res = await fetch("${endpointUrl}", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) alert("Proposal received!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Send</button>
    </form>
  );
}`,
    curl: `curl -X POST ${endpointUrl} \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Alex Morgan",
    "email": "alex@techcorp.io",
    "budget": "$8,000",
    "message": "Looking for frontend engineering partner."
  }'`,
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-24 py-10">
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% Free Developer Tool · No Payments · No Hidden Limits</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-100 leading-[1.08] text-balance">
              Your Forms. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                Our Backend.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-400 leading-relaxed max-w-xl">
              Connect your website forms to a backend in minutes. No server setup, no database, no email code required.
              Point your form to our endpoint and receive instant submissions.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onGetStarted}
                className="px-5 py-3 text-sm font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={onOpenDocs}
                className="px-5 py-3 text-sm font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white rounded-xl transition-colors"
              >
                Documentation
              </button>

              <button
                onClick={() => onOpenPlayground(targetFormId)}
                className="px-4 py-3 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-emerald-400/20" />
                <span>Live Tester</span>
              </button>
            </div>

            <div className="pt-4 flex items-center gap-6 text-xs text-neutral-500">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Honeypot Spam Defense</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Email Notifications</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instant Webhooks</span>
              </div>
            </div>
          </div>

          {/* Right: Live Interactive Sandbox Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-2xl p-6 backdrop-blur-xl">
              {/* Window controls header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] font-mono text-neutral-400 ml-2">
                    POST /f/{targetFormId}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-900/40 px-2 py-0.5 rounded">
                  Live Endpoint
                </span>
              </div>

              {demoSubmitted ? (
                <div className="p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                    <Check className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-neutral-100">
                      Submission Received!
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                      HTTP 200 OK returned. Data stored, honeypot checked, and notification email logged in the dashboard.
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 text-xs font-mono text-neutral-300">
                    ID: {demoSubmissionId}
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setDemoSubmitted(false)}
                      className="text-xs text-neutral-400 hover:text-white underline"
                    >
                      Submit another test
                    </button>
                    <button
                      onClick={onGetStarted}
                      className="px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg"
                    >
                      Open Dashboard →
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleHeroSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                        name
                      </label>
                      <input
                        type="text"
                        required
                        value={demoName}
                        onChange={e => setDemoName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-emerald-500/60 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                        email
                      </label>
                      <input
                        type="email"
                        required
                        value={demoEmail}
                        onChange={e => setDemoEmail(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-emerald-500/60 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                      budget
                    </label>
                    <input
                      type="text"
                      value={demoBudget}
                      onChange={e => setDemoBudget(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-emerald-500/60 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 mb-1">
                      message
                    </label>
                    <textarea
                      rows={2}
                      value={demoMessage}
                      onChange={e => setDemoMessage(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-200 focus:outline-none focus:border-emerald-500/60 font-mono resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isDemoSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all disabled:opacity-50"
                    >
                      {isDemoSubmitting ? (
                        <span>Validating & Storing...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Test Live Submit to /f/{targetFormId}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-neutral-500 text-center">
                    Submits to live Express backend · Updates database in real-time
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. ARCHITECTURE DIAGRAM SECTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 md:p-10 rounded-2xl border border-neutral-800 bg-neutral-900/40 relative overflow-hidden">
          <div className="max-w-xl mb-8 space-y-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
              Product Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
              How FormPulse Works
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Zero backend infrastructure to maintain. FormPulse handles the entire lifecycle behind your simple HTML forms.
            </p>
          </div>

          {/* ASCII / Visual Flow Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <div className="p-5 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-2">
              <div className="text-[11px] font-mono text-emerald-400 font-semibold">01 · YOUR FRONTEND</div>
              <h3 className="text-sm font-semibold text-neutral-200">HTML / React / Next</h3>
              <p className="text-xs text-neutral-400">
                Visitor fills out your standard frontend form and hits submit.
              </p>
            </div>

            <div className="p-5 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-2">
              <div className="text-[11px] font-mono text-emerald-400 font-semibold">02 · API INGESTION</div>
              <h3 className="text-sm font-semibold text-neutral-200">Validation & Spam Check</h3>
              <p className="text-xs text-neutral-400">
                Inspects honeypot traps, enforces 60 req/min rate limit, checks CORS domain locks.
              </p>
            </div>

            <div className="p-5 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-2">
              <div className="text-[11px] font-mono text-emerald-400 font-semibold">03 · PERSISTENCE</div>
              <h3 className="text-sm font-semibold text-neutral-200">Dynamic Storage</h3>
              <p className="text-xs text-neutral-400">
                Arbitrary JSON schema is stored securely and indexed for immediate querying.
              </p>
            </div>

            <div className="p-5 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-2">
              <div className="text-[11px] font-mono text-emerald-400 font-semibold">04 · NOTIFICATION</div>
              <h3 className="text-sm font-semibold text-neutral-200">Email & Webhooks</h3>
              <p className="text-xs text-neutral-400">
                Dispatches transactional email alerts, auto-replies, and optional webhook pings.
              </p>
            </div>
          </div>

          {/* Illustration asset */}
          <div className="mt-8 rounded-xl overflow-hidden border border-neutral-800/80 max-h-64 relative group">
            <img
              src={heroImg}
              alt="Cloud Form Backend Architecture"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-95 transition-opacity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent flex items-end p-6">
              <div className="text-xs text-neutral-300 font-mono">
                Real-time API ingestion engine · End-to-end HTTPS encryption · 100% Free
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CODE INTEGRATION SHOWCASE */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Works with Any Framework
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Copy and paste ready code for plain HTML, React, Next.js, or curl commands.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/80 border-b border-neutral-800">
            <div className="flex items-center gap-1">
              {(['html', 'fetch', 'react', 'curl'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveCodeTab(tab)}
                  className={`text-xs uppercase px-3 py-1.5 rounded-md font-mono transition-colors ${
                    activeCodeTab === tab
                      ? 'bg-neutral-800 text-emerald-400 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-6 text-xs font-mono text-neutral-300 overflow-x-auto leading-relaxed">
            {codeSnippets[activeCodeTab]}
          </pre>
        </div>
      </section>

      {/* 4. USE CASES SECTION */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-8 space-y-2">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
            Supported Formats
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            Built for Any Web Form
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            FormPulse adapts to your data structure. No rigid schemas or manual field mapping required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-2">
            <h3 className="text-sm font-semibold text-neutral-200">Proposal & RFQ Forms</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Capture customer budget, scope, company details, timeline, and custom specifications directly into your dashboard.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 pt-1">
              fields: name, company, budget, scope, message
            </div>
          </div>

          <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-2">
            <h3 className="text-sm font-semibold text-neutral-200">Contact Us Inquiries</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Never miss a client lead. Instant email alert to your team with auto-reply confirmation sent back to the customer.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 pt-1">
              fields: name, email, subject, message
            </div>
          </div>

          <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-2">
            <h3 className="text-sm font-semibold text-neutral-200">Hiring & Careers</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Accept applicant resumes, portfolio links, GitHub handles, and experience summaries cleanly in one place.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 pt-1">
              fields: name, email, position, portfolio, bio
            </div>
          </div>

          <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-2">
            <h3 className="text-sm font-semibold text-neutral-200">Feedback & Surveys</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Collect user satisfaction ratings, Net Promoter Scores (NPS), and qualitative bug reports.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 pt-1">
              fields: rating, feedback, device, version
            </div>
          </div>

          <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-2">
            <h3 className="text-sm font-semibold text-neutral-200">Lead Generation Funnels</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              High-converting landing page lead forms with instant webhook forwarding to your CRM or Discord.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 pt-1">
              fields: phone, service, location, company_size
            </div>
          </div>

          <div className="p-5 bg-neutral-900/40 border border-neutral-800 rounded-xl space-y-2">
            <h3 className="text-sm font-semibold text-neutral-200">Event Registrations</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Webinar sign-ups, workshop RSVPs, and ticket waitlists with automated confirmation emails.
            </p>
            <div className="text-[11px] font-mono text-neutral-500 pt-1">
              fields: attendee_name, ticket_type, guests
            </div>
          </div>
        </div>
      </section>

      {/* 5. 100% FREE COMMITMENT BANNER */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
            <span>Our Free Commitment</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
            100% Free Developer Tool · No Hidden Tiers
          </h2>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
            No credit cards, no invoices, and no surprise paywalls. If you can build a frontend form, you can give it a reliable backend for free.
          </p>

          <div className="pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md active:scale-95"
            >
              Start Building Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
