'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth';
import { invites } from '@/lib/api';
import type { InviteInfo } from '@/lib/api';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const { token: authToken, hydrate, hydrated, user } = useAuthStore();

  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!params.token) return;
    fetchInviteInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]);

  async function fetchInviteInfo() {
    setLoading(true);
    try {
      const data = await invites.info(params.token);
      setInfo(data);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Invalid or expired invite');
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    if (!hydrated || !authToken) return;
    setAccepting(true);
    setError('');
    try {
      await invites.accept(params.token, authToken);
      setAccepted(true);
      setTimeout(() => {
        if (info?.room?.id) router.push(`/room/${info.room.id}`);
        else router.push('/dashboard');
      }, 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite');
    } finally {
      setAccepting(false);
    }
  }

  const isLoggedIn = hydrated && !!authToken;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(232,137,42,0.08) 0%, transparent 65%)',
        }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Logo */}
      <Link
        href="/"
        className="relative z-10 flex flex-col items-center gap-2 mb-8 group animate-fade-in"
      >
        <Image
          src="/knit_logo.png"
          alt="Knit"
          width={72}
          height={72}
          className="rounded-2xl transition-transform group-hover:scale-105"
          style={{ filter: 'drop-shadow(0 4px 16px rgba(232,137,42,0.3))' }}
        />
        <span
          className="text-sm font-bold tracking-widest uppercase font-mono text-[var(--text-2)] group-hover:text-[var(--text)] transition-colors"
          style={{ letterSpacing: '0.25em' }}
        >
          Knit
        </span>
      </Link>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-md animate-fade-in shadow-2xl rounded-2xl overflow-hidden"
        style={{ animationDelay: '0.08s', border: '1px solid var(--border)' }}
      >
        {/* Card top accent bar */}
        <div
          style={{
            height: '3px',
            background: 'linear-gradient(90deg, var(--accent), var(--violet))',
          }}
        />

        <div className="p-8" style={{ background: 'var(--surface)' }}>
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--border-2)', borderTopColor: 'var(--accent)' }}
              />
              <p className="text-sm text-[var(--text-2)]">Loading invite…</p>
            </div>

          ) : fetchError ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(242,87,87,0.1)', border: '1px solid rgba(242,87,87,0.2)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="var(--danger)" strokeWidth="1.5" />
                  <path d="M12 7v6M12 16h.01" stroke="var(--danger)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-[var(--text)] mb-1">Invalid Invite</h2>
                <p className="text-sm text-[var(--text-2)]">{fetchError}</p>
              </div>
              <Link href="/dashboard" className="btn btn-ghost text-xs mt-2">
                Go to Dashboard
              </Link>
            </div>

          ) : accepted ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(82,201,138,0.1)', border: '1px solid rgba(82,201,138,0.2)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="var(--success)" strokeWidth="1.5" />
                  <path d="M7.5 12l3.5 3.5 5.5-6" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text)] mb-1">You&apos;re in!</h2>
                <p className="text-sm text-[var(--text-2)]">
                  Joining <strong className="text-[var(--text)]">{info?.room?.name}</strong>…
                </p>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1 rounded-full mt-2 overflow-hidden" style={{ background: 'var(--border)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    background: 'var(--accent)',
                    animation: 'fill-bar 1.6s ease forwards',
                  }}
                />
              </div>
            </div>

          ) : info ? (
            <>
              {/* Inviter + room info */}
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-4 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--violet))' }}
                >
                  {info.room.name[0]?.toUpperCase()}
                </div>
                <p className="text-sm text-[var(--text-2)]">
                  <strong className="text-[var(--text)]">{info.inviter.name}</strong> invited you to join
                </p>
                <h2 className="text-xl font-bold text-[var(--text)] mt-1 mb-2">
                  {info.room.name}
                </h2>
                <span
                  className="text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
                  style={{
                    background: 'rgba(232,137,42,0.1)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(232,137,42,0.25)',
                  }}
                >
                  as {info.role}
                </span>
              </div>

              {/* Divider */}
              <div className="h-px mb-6" style={{ background: 'var(--border)' }} />

              {/* Action */}
              {!isLoggedIn ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-[var(--text-2)] text-center mb-1">
                    Sign in or create an account to accept this invite.
                  </p>
                  <Link
                    href={`/login?next=/invite/${params.token}`}
                    className="btn btn-primary w-full text-center"
                    style={{ justifyContent: 'center' }}
                  >
                    Sign in to accept
                  </Link>
                  <Link
                    href={`/register?next=/invite/${params.token}`}
                    className="btn btn-ghost w-full text-center"
                    style={{ justifyContent: 'center' }}
                  >
                    Create account
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-xs text-[var(--text-2)] text-center mb-4">
                    Accepting as{' '}
                    <span
                      className="font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
                    >
                      {user?.name}
                    </span>
                  </p>

                  {error && (
                    <p className="text-sm text-[var(--danger)] mb-4 text-center bg-[var(--danger)]/10 px-3 py-2 rounded-lg border border-[var(--danger)]/20">
                      {error}
                    </p>
                  )}

                  <button
                    className="btn btn-primary w-full"
                    style={{ padding: '0.75rem', fontSize: '0.95rem', borderRadius: '10px' }}
                    onClick={handleAccept}
                    disabled={accepting}
                  >
                    {accepting ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Accepting…
                      </>
                    ) : (
                      'Accept Invite'
                    )}
                  </button>

                  <Link href="/dashboard" className="btn btn-ghost w-full mt-2 text-center" style={{ justifyContent: 'center' }}>
                    Decline
                  </Link>
                </>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-6 text-xs text-[var(--text-3)] animate-fade-in" style={{ animationDelay: '0.2s' }}>
        Knit · Real-Time Collaborative Workspace
      </p>

      <style>{`
        @keyframes fill-bar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
}
