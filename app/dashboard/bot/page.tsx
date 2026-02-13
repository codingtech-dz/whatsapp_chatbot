'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Bot = {
  id: string;
  name: string;
  goal: string;
  systemPrompt: string;
  rules: string;
  knowledgeText: string;
  isActive: boolean;
  phoneNumberId: string | null;
};

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
        active ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-600' : 'bg-amber-600'}`} />
      {label}
    </span>
  );
}

export default function BotDashboardPage() {
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [rules, setRules] = useState('');
  const [knowledgeText, setKnowledgeText] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const loadBot = async () => {
      try {
        // Ensure WhatsApp client starts on dashboard load
        fetch('/api/wa/status').catch(() => null);

        const response = await fetch('/api/bots');
        const data = await response.json();
        if (response.ok && data) {
          setBot(data);
          setName(data.name);
          setGoal(data.goal);
          setSystemPrompt(data.systemPrompt);
          setRules(data.rules);
          setKnowledgeText(data.knowledgeText || '');
          setIsActive(Boolean(data.isActive));
        }
      } catch (err) {
        setError('Failed to load bot data.');
      } finally {
        setLoading(false);
      }
    };

    loadBot();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const payload = {
        name,
        goal,
        systemPrompt,
        rules,
        knowledgeText,
        isActive,
      };

      const response = await fetch(bot ? '/api/bots/update' : '/api/bots', {
        method: bot ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to save bot.');
        return;
      }

      setBot(data);
      setMessage(bot ? 'Bot updated successfully.' : 'Bot created successfully.');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">WhatsApp AI SaaS</p>
            <h1 className="text-3xl font-bold text-slate-900">Bot Workspace</h1>
            <p className="mt-2 text-slate-600">
              Create your bot, add knowledge, and connect WhatsApp to go live.
            </p>
          </div>
          <Link
            href="/dashboard/bot/connect"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            Connect WhatsApp
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Setup Status</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Bot Created</span>
                <StatusPill label={bot ? 'Complete' : 'Pending'} active={Boolean(bot)} />
              </div>
              <div className="flex items-center justify-between">
                <span>WhatsApp Connected</span>
                <StatusPill
                  label={bot?.phoneNumberId ? 'Connected' : 'Not Connected'}
                  active={Boolean(bot?.phoneNumberId)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Bot Active</span>
                <StatusPill label={isActive ? 'Active' : 'Paused'} active={isActive} />
              </div>
            </div>
            <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
              Tip: Connect WhatsApp and set your bot to Active to start responding automatically.
            </div>
          </div>

          <div className="lg:col-span-2">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                {message}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Bot Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none"
                    placeholder="Customer Support Bot"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">Goal</label>
                  <input
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none"
                    placeholder="Answer product questions and collect leads"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700">System Prompt</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none"
                  rows={4}
                  placeholder="You are a professional WhatsApp assistant for our brand..."
                  required
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700">Rules</label>
                <textarea
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none"
                  rows={3}
                  placeholder="Be concise. Ask clarifying questions. Always be polite."
                  required
                />
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700">Knowledge Base</label>
                <textarea
                  value={knowledgeText}
                  onChange={(e) => setKnowledgeText(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none"
                  rows={6}
                  placeholder="Paste FAQs, policies, product details, pricing, support scripts..."
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                  />
                  Bot is Active
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:bg-slate-400"
                >
                  {saving ? 'Saving...' : bot ? 'Update Bot' : 'Create Bot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
