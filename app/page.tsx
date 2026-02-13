import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-emerald-500/20 blur-[120px]" />
          <div className="absolute -bottom-52 left-0 h-[520px] w-[520px] rounded-full bg-sky-500/20 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.7),_transparent_60%)]" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-16">
          <div className="w-full text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
              WhatsApp AI SaaS
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Launch a smart WhatsApp bot that answers like your best agent
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
              Train it on your business knowledge, connect WhatsApp once, and let it handle
              customer conversations at scale.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-8 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-300"
              >
                Log In to Your Dashboard
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                No-code setup
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                Secure per-tenant data
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                AI replies in seconds
              </div>
            </div>
          </div>

          <div className="mt-16 grid w-full gap-6 md:grid-cols-3">
            {[
              {
                title: 'Bot Blueprint',
                text: 'Define your goal, rules, and knowledge in one place. Your assistant stays on-brand.',
              },
              {
                title: 'WhatsApp Connected',
                text: 'Connect once and keep the session alive. Your bot responds instantly to incoming chats.',
              },
              {
                title: 'Live Control',
                text: 'Pause, update, or improve your bot anytime from the dashboard without downtime.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-3 text-sm text-slate-300">{card.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-left">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-3xl font-bold text-emerald-300">24/7</p>
                <p className="mt-2 text-sm text-slate-300">Always-on customer replies</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-300">1-minute</p>
                <p className="mt-2 text-sm text-slate-300">Fast setup and go live</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-300">100%</p>
                <p className="mt-2 text-sm text-slate-300">Your knowledge, your brand</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
