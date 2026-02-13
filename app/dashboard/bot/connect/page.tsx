'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type WaStatus = 'idle' | 'starting' | 'qr' | 'connected' | 'error';

function StatusBadge({ status }: { status: WaStatus }) {
  const label = useMemo(() => {
    switch (status) {
      case 'starting':
        return 'Starting';
      case 'qr':
        return 'Scan QR';
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  }, [status]);

  const color =
    status === 'connected'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'error'
      ? 'bg-red-100 text-red-800'
      : 'bg-amber-100 text-amber-800';

  return <span className={`rounded-full px-3 py-1 text-sm font-semibold ${color}`}>{label}</span>;
}

export default function ConnectWhatsAppPage() {
  const [status, setStatus] = useState<WaStatus>('idle');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [disconnecting, setDisconnecting] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    let pollInterval: NodeJS.Timeout | null = null;

    const init = async () => {
      try {
        const response = await fetch('/api/wa/status');
        if (response.ok) {
          const data = await response.json();
          if (data?.status) setStatus(data.status);
          if (data?.latestQr) setQrDataUrl(data.latestQr);
        }

        eventSource = new EventSource('/api/wa/qr');
        eventSource.addEventListener('status', (event) => {
          const parsed = JSON.parse((event as MessageEvent).data);
          if (parsed?.status) setStatus(parsed.status);
        });
        eventSource.addEventListener('qr', (event) => {
          const parsed = JSON.parse((event as MessageEvent).data);
          if (parsed?.dataUrl) setQrDataUrl(parsed.dataUrl);
        });
        eventSource.onerror = () => {
          eventSource?.close();
        };

        // Fallback polling if SSE doesn't deliver QR (Windows/edge cases)
        pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch('/api/wa/qr-image');
            if (!statusRes.ok) return;
            const data = await statusRes.json();
            if (data?.status) setStatus(data.status);
            if (data?.latestQr) setQrDataUrl(data.latestQr);
            if (data?.dataUrl) setQrDataUrl(data.dataUrl);
          } catch (err) {
            return;
          }
        }, 3000);
      } catch (err) {
        setError('Unable to load WhatsApp QR. Try again.');
      }
    };

    init();

    return () => {
      eventSource?.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">WhatsApp AI SaaS</p>
            <h1 className="text-3xl font-bold text-slate-900">Connect WhatsApp</h1>
            <p className="mt-2 text-slate-600">
              Scan the QR code to link your WhatsApp account.
            </p>
          </div>
          <Link href="/dashboard/bot" className="text-sm font-semibold text-emerald-700">
            Back to Bot
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Connection Status</h2>
            <div className="mt-4">
              <StatusBadge status={status} />
            </div>
            <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
              After scanning, your bot will respond automatically using your saved knowledge base.
            </div>
          </div>

          <div className="lg:col-span-2">
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              {status === 'connected' ? (
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700">
                    WhatsApp Connected Successfully
                  </div>
                  <p className="mt-2 text-slate-600">
                    Your bot is now live and ready to respond.
                  </p>
                  <button
                    onClick={async () => {
                      setReconnecting(true);
                      setError('');
                      try {
                        const res = await fetch('/api/wa/reconnect', { method: 'POST' });
                        if (!res.ok) {
                          setError('Failed to reconnect. Try again.');
                        } else {
                          setStatus('starting');
                          setQrDataUrl(null);
                        }
                      } catch (err) {
                        setError('Failed to reconnect. Try again.');
                      } finally {
                        setReconnecting(false);
                      }
                    }}
                    disabled={reconnecting || disconnecting}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                  >
                    {reconnecting ? 'Reconnecting...' : 'Reconnect WhatsApp'}
                  </button>
                  <button
                    onClick={async () => {
                      setDisconnecting(true);
                      setError('');
                      try {
                        const res = await fetch('/api/wa/disconnect', { method: 'POST' });
                        if (!res.ok) {
                          setError('Failed to disconnect. Try again.');
                        } else {
                          setStatus('idle');
                          setQrDataUrl(null);
                        }
                      } catch (err) {
                        setError('Failed to disconnect. Try again.');
                      } finally {
                        setDisconnecting(false);
                      }
                    }}
                    disabled={disconnecting || reconnecting}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                  >
                    {disconnecting ? 'Disconnecting...' : 'Disconnect WhatsApp'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-slate-900">Scan QR Code</div>
                    <p className="mt-2 text-sm text-slate-600">
                      Open WhatsApp on your phone and scan the QR below.
                    </p>
                  </div>

                  <div className="flex h-72 w-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qrDataUrl} alt="WhatsApp QR Code" className="h-64 w-64" />
                    ) : (
                      <div className="text-sm text-slate-500">Waiting for QR...</div>
                    )}
                  </div>

                  <div className="text-xs text-slate-500">
                    Keep this page open until connection is complete.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
