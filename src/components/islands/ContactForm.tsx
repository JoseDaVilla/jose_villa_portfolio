import { useState, type FormEvent, type ReactNode } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const FALLBACK_EMAIL = 'josedvilla18@gmail.com';
const MAX_LEN = 4000;

// Inline Lucide-style SVG icons. 14×14, currentColor, 2px stroke.
const I = {
  package: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7.5 4.27 9 5.15"/>
      <path d="M21 8 12 13 3 8"/>
      <path d="M3 8v8a2 2 0 0 0 1 1.74l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.74l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8z"/>
      <path d="m12 22 0-10"/>
    </svg>
  ),
  users: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  zap: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  ),
  wave: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M8 10h.01"/>
      <path d="M12 10h.01"/>
      <path d="M16 10h.01"/>
    </svg>
  ),
} as const;

type Topic = 'Product build' | 'Tech leadership' | 'Automation' | 'Just saying hi';
const TOPICS: { label: Topic; icon: ReactNode }[] = [
  { label: 'Product build',    icon: I.package },
  { label: 'Tech leadership',  icon: I.users   },
  { label: 'Automation',       icon: I.zap     },
  { label: 'Just saying hi',   icon: I.wave    },
];

export default function ContactForm() {
  const accessKey = import.meta.env.PUBLIC_WEB3FORMS_KEY as string | undefined;

  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [topic, setTopic]     = useState<Topic | null>(null);
  const [status, setStatus]   = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const honeypot = (form.elements.namedItem('botcheck') as HTMLInputElement)?.value;
    if (honeypot) { setStatus('success'); return; }

    setStatus('submitting');
    setErrorMsg('');

    // No Web3Forms key configured — show the success screen without sending.
    // (The form deliberately never falls back to a mailto: handoff.)
    if (!accessKey) {
      await new Promise((r) => setTimeout(r, 650));
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
      setTopic(null);
      return;
    }

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          name,
          email,
          message,
          subject: `${topic ? `[${topic}] ` : ''}Portfolio contact from ${name}`,
          from_name: 'jose-villa.dev',
          replyto: email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
        setTopic(null);
      } else {
        setStatus('error');
        setErrorMsg(data.message ?? 'Something went wrong. Please try emailing me directly.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try emailing me directly.');
    }
  };

  // Shared classes
  const card =
    'border border-line/60 rounded-xl bg-bg-secondary/40 p-5 md:p-6 ' +
    'shadow-[0_1px_0_rgba(0,0,0,0.02)]';

  const fieldLabel = 'block text-[11px] font-mono uppercase tracking-[1.5px] text-fg-faint mb-1.5';

  const fieldInput =
    'w-full bg-bg text-fg placeholder:text-fg-faint/80 ' +
    'border border-line/80 rounded-md px-3.5 py-2.5 text-[13px] leading-relaxed ' +
    'transition-[border-color,box-shadow,background-color] duration-base ' +
    'ease-[cubic-bezier(0.16,1,0.3,1)] ' +
    'hover:border-fg-faint/40 ' +
    'focus:outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/20 ' +
    'focus:bg-bg ' +
    'disabled:opacity-60 disabled:cursor-not-allowed';

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={card + ' contact-success-card text-center py-10 sm:py-12'}
      >
        <div
          className="contact-success-badge mx-auto w-20 h-20 rounded-full
                     bg-accent/12 text-accent inline-flex items-center justify-center"
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <circle
              className="contact-success-circle"
              cx="40" cy="40" r="30"
              pathLength={100}
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              className="contact-success-check"
              d="M27 41.5 L36.5 51 L54 33"
              pathLength={100}
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <p className="contact-success-step contact-success-step-1 text-fg font-medium text-[17px] mt-6">
          Message sent — thank you.
        </p>
        <p className="contact-success-step contact-success-step-2 text-fg-muted text-[13.5px] mt-2 leading-[1.7] max-w-[44ch] mx-auto">
          I'll reach out within a day or two.
        </p>
        <p className="contact-success-step contact-success-step-3 text-fg-muted text-[12.5px] mt-4 leading-[1.7] max-w-[48ch] mx-auto">
          Need something urgent? Reach me directly at{' '}
          <a
            href={`mailto:${FALLBACK_EMAIL}`}
            className="text-fg hover:text-accent transition-colors duration-base
                       ease-[cubic-bezier(0.16,1,0.3,1)] underline underline-offset-4
                       decoration-line hover:decoration-accent"
          >
            {FALLBACK_EMAIL}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="contact-success-step contact-success-step-4 mt-6 text-[12px]
                     text-accent hover:underline underline-offset-4 cursor-pointer"
        >
          Send another message →
        </button>
      </div>
    );
  }

  return (
    <div className={card}>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {/* Honeypot */}
        <input
          type="text"
          name="botcheck"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cf-name" className={fieldLabel}>Name</label>
            <input
              id="cf-name"
              type="text"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={status === 'submitting'}
              className={fieldInput}
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="cf-email" className={fieldLabel}>Email</label>
            <input
              id="cf-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'submitting'}
              className={fieldInput}
              placeholder="you@company.com"
            />
          </div>
        </div>

        {/* Topic chips */}
        <div>
          <label className={fieldLabel}>What's this about?</label>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(({ label, icon }) => {
              const active = topic === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTopic(active ? null : label)}
                  disabled={status === 'submitting'}
                  aria-pressed={active}
                  className={
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-medium ' +
                    'border cursor-pointer ' +
                    'transition-[background-color,border-color,color,transform] ' +
                    'duration-base ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] ' +
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ' +
                    'disabled:cursor-not-allowed disabled:opacity-60 ' +
                    (active
                      ? 'bg-accent/12 text-accent border-accent/40'
                      : 'bg-bg text-fg-muted border-line hover:text-fg hover:border-fg-faint/40')
                  }
                >
                  <span className={active ? 'text-accent' : 'text-fg-faint'} aria-hidden="true">
                    {icon}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="cf-message" className={fieldLabel}>Message</label>
          <textarea
            id="cf-message"
            required
            minLength={10}
            maxLength={MAX_LEN}
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={status === 'submitting'}
            className={fieldInput + ' resize-y min-h-[140px]'}
            placeholder="What's the project, timeline, anything you'd like me to know — a few sentences is plenty."
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[11px] text-fg-faint">
              I read every message.
            </p>
            <span
              className={
                'text-[11px] font-mono tabular-nums ' +
                (message.length > MAX_LEN * 0.9 ? 'text-accent' : 'text-fg-faint')
              }
              aria-live="polite"
            >
              {message.length} / {MAX_LEN}
            </span>
          </div>
        </div>

        {status === 'error' && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-2.5 p-3 rounded-md
                       border border-red-500/30 bg-red-500/5 text-[12.5px] text-red-500 dark:text-red-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                 className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit row */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-line/40">
          <p className="text-[11.5px] text-fg-faint leading-snug">
            Or reach me directly at{' '}
            <a
              href={`mailto:${FALLBACK_EMAIL}`}
              className="text-fg hover:text-accent transition-colors duration-base
                         ease-[cubic-bezier(0.16,1,0.3,1)] underline underline-offset-4
                         decoration-line hover:decoration-accent"
            >
              {FALLBACK_EMAIL}
            </a>
          </p>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex items-center justify-center gap-2 bg-accent text-bg
                       px-4 py-2.5 rounded-md text-[12.5px] font-medium tracking-[0.3px]
                       cursor-pointer
                       hover:bg-accent/90 active:translate-y-[1px]
                       transition-[background-color,transform] duration-base
                       ease-[cubic-bezier(0.16,1,0.3,1)]
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
                       focus-visible:ring-offset-2 focus-visible:ring-offset-bg
                       disabled:opacity-60 disabled:cursor-not-allowed
                       w-full sm:w-auto"
          >
            {status === 'submitting' ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
                  <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
                </svg>
                Sending…
              </>
            ) : (
              <>
                Send message
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
