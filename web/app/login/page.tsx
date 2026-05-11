'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { auth } from '@/lib/api';

const STICKY_NOTES = [
  { id: 1, text: 'Yjs CRDT sync', sub: 'Conflict-free real-time merges', bg: 'linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, rgba(20, 25, 40, 0.7) 100%)', borderTop: '2px solid rgba(212, 175, 55, 0.6)', x: 18,  y: 30, delay: 0   },
  { id: 2, text: 'Node-level RBAC', sub: 'Lead · Contributor · Viewer',   bg: 'linear-gradient(180deg, rgba(212, 175, 55, 0.15) 0%, rgba(20, 25, 40, 0.7) 100%)', borderTop: '2px solid rgba(212, 175, 55, 0.6)', x: 82, y: 25, delay: 0.4 },
  { id: 3, text: 'AI intent extraction', sub: 'Action items auto-detected', bg: 'linear-gradient(180deg, rgba(100, 200, 180, 0.15) 0%, rgba(20, 25, 40, 0.7) 100%)', borderTop: '2px solid rgba(100, 200, 180, 0.6)', x: 78, y: 70, delay: 0.8 },
  { id: 4, text: 'Event sourcing',  sub: 'Every action, forever',          bg: 'linear-gradient(180deg, rgba(150, 180, 255, 0.15) 0%, rgba(20, 25, 40, 0.7) 100%)', borderTop: '2px solid rgba(150, 180, 255, 0.6)', x: 22,  y: 65, delay: 0.2 },
];

const CURSOR_TRAIL = [
  { x: 70, y: 35 }, { x: 74, y: 45 }, { x: 76, y: 55 },
  { x: 72, y: 50 }, { x: 68, y: 40 }, { x: 65, y: 32 },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, hydrate, token } = useAuthStore();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [cursorStep, setCursorStep] = useState(0);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (token) router.replace('/dashboard'); }, [token, router]);

  // Animate fake presence cursor
  useEffect(() => {
    const t = setInterval(() => setCursorStep(s => (s + 1) % CURSOR_TRAIL.length), 1800);
    return () => clearInterval(t);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.login({ email, password });
      setAuth(res.user, res.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const cursor = CURSOR_TRAIL[cursorStep] || CURSOR_TRAIL[0];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', backgroundColor: '#02050a' }}>

      {/* ── Nebula Background Image ── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/deep_space.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.85,
        mixBlendMode: 'screen',
      }} />

      {/* ── Subtle Dot Grid Overlay ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* ── SVG Filaments connecting nodes to center ── */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(100, 200, 255, 0.05)" />
            <stop offset="50%" stopColor="rgba(100, 200, 255, 0.4)" />
            <stop offset="100%" stopColor="rgba(100, 200, 255, 0.05)" />
          </linearGradient>
        </defs>
        {STICKY_NOTES.map(n => (
          <path
            key={`line-${n.id}`}
            d={`M 50% 50% Q ${50 + (n.x - 50) * 0.7}% ${n.y}% ${n.x}% ${n.y}%`}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="1.5"
            style={{ animation: 'pulse-line 4s infinite alternate', filter: 'drop-shadow(0 0 6px rgba(100,200,255,0.3))' }}
          />
        ))}
      </svg>

      {/* ── canvas toolbar ── */}
      <header style={{
        position:'absolute', top:0, left:0, right:0, zIndex:40,
        display:'flex', alignItems:'center', gap:10, padding:'12px 24px',
        borderBottom:'1px solid rgba(255,255,255,0.05)',
        background:'linear-gradient(180deg, rgba(2, 5, 10, 0.8) 0%, rgba(2, 5, 10, 0) 100%)',
      }}>
        <Image src="/knit_logo.png" alt="Knit" width={26} height={26}
          style={{ filter:'drop-shadow(0 1px 6px rgba(100,150,255,0.5))' }} />
        <span style={{ color:'#dce6f5', fontWeight:700, fontSize:'0.9rem', letterSpacing:'0.06em' }}>Knit</span>
        <span style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.8rem' }}>/ sign in</span>

        {/* fake online users */}
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.5)', fontFamily:'monospace' }}>2 online</span>
          {['#e05a3a','#7c6af7'].map((c,i) => (
            <div key={i} style={{ width:20, height:20, borderRadius:'50%', background:c,
              border:'2px solid #050a14', marginLeft: i === 0 ? 0 : -6 }} />
          ))}
        </div>
      </header>

      {/* ── floating feature nodes ── */}
      {STICKY_NOTES.map(n => (
        <div key={n.id} style={{
          position:'absolute', left:`${n.x}%`, top:`${n.y}%`, zIndex:20, pointerEvents:'none',
          transform: 'translate(-50%, -50%)',
          animation:`nodeFloat ${6 + n.delay}s ease-in-out ${n.delay}s infinite`,
        }}>
          <div style={{
            background: n.bg, padding:'14px 18px', borderRadius:8, minWidth:180,
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            boxShadow:'0 12px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderTop: n.borderTop,
          }}>
            <div style={{ fontSize:'0.8rem', fontWeight:600, color:'#dce6f5', marginBottom:4 }}>{n.text}</div>
            <div style={{ fontSize:'0.68rem', color:'#7a8da8', lineHeight:1.4 }}>{n.sub}</div>
          </div>
        </div>
      ))}

      {/* ── fake presence cursor ── */}
      <div style={{
        position:'absolute', zIndex:25, pointerEvents:'none',
        left:`${cursor.x}%`, top:`${cursor.y}%`,
        transition:'left 1.6s cubic-bezier(.25,.46,.45,.94), top 1.6s cubic-bezier(.25,.46,.45,.94)',
        filter: 'drop-shadow(0 4px 12px rgba(124, 106, 247, 0.4))'
      }}>
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
          <path d="M1 1l13 8.5-6.5 1.5-3.5 6L1 1z" fill="#7c6af7" stroke="white" strokeWidth="1.2"/>
        </svg>
        <div style={{
          background:'#7c6af7', color:'#fff', fontSize:'0.6rem', fontWeight:600,
          padding:'3px 8px', borderRadius:6, marginTop:4, marginLeft:4, whiteSpace:'nowrap',
        }}>Alex</div>
      </div>

      {/* ── frosted glass center card ── */}
      <main style={{ position:'absolute', inset:0, zIndex:30, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{
          background:'rgba(12, 18, 30, 0.55)', borderRadius:16, width:'100%', maxWidth:420,
          padding:'44px 44px 36px', position:'relative',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          boxShadow:'0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
          border:'1px solid rgba(255,255,255,0.06)',
          animation:'fadeUp 0.8s ease both',
        }}>

          {/* subtle glow dot at the top edge */}
          <div style={{
             position: 'absolute', top: -3, left: '50%', transform: 'translateX(-50%)',
             width: 6, height: 6, borderRadius: '50%', background: '#e05a3a',
             boxShadow: '0 0 12px 2px rgba(224,90,58,0.8)'
          }} />
          
          {/* subtle red accent line across top */}
          <div style={{
            position:'absolute', top:0, left:'30%', right:'30%', height:1,
            background: 'linear-gradient(90deg, transparent, rgba(224, 90, 58, 0.4), transparent)',
          }} />

          {/* logo row */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
            <Image src="/knit_logo.png" alt="Knit" width={32} height={32}
              style={{ filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }} />
            <div>
              <div style={{ fontWeight:700, fontSize:'1.05rem', color:'#dce6f5', letterSpacing:'0.05em' }}>Knit</div>
              <div style={{ fontSize:'0.6rem', color:'#7a8da8', textTransform:'uppercase', letterSpacing:'0.16em', fontFamily:'monospace' }}>
                Collaborative Canvas
              </div>
            </div>
          </div>

          <h1 style={{ 
            fontSize:'1.8rem', fontWeight:600, color:'#dce6f5', marginBottom:8, lineHeight:1.2,
            fontFamily: 'ui-serif, Georgia, serif'
          }}>
            Open your canvas
          </h1>
          <p style={{ fontSize:'0.85rem', color:'#7a8da8', marginBottom:32 }}>
            Your team&apos;s notes are live right now.
          </p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {(['email','password'] as const).map((field) => (
              <div key={field}>
                <label style={{
                  display:'block', fontSize:'0.65rem', fontWeight:600, color:'#7a8da8',
                  textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8, fontFamily:'monospace',
                }}>{field}</label>
                <input
                  type={field}
                  placeholder={field === 'email' ? 'you@team.com' : '••••••••'}
                  value={field === 'email' ? email : password}
                  onChange={e => field === 'email' ? setEmail(e.target.value) : setPassword(e.target.value)}
                  required
                  autoComplete={field === 'email' ? 'email' : 'current-password'}
                  className="knit-input"
                />
              </div>
            ))}

            {error && (
              <div style={{
                fontSize:'0.8rem', color:'#fca5a5', background:'rgba(220, 38, 38, 0.15)',
                border:'1px solid rgba(220, 38, 38, 0.3)', borderRadius:8, padding:'10px 14px',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span style={{ fontSize: '1rem' }}>⚠</span> {error}
              </div>
            )}

            {/* button + invite-only badge inline */}
            <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:8 }}>
              <button type="submit" disabled={loading} style={{
                flex:1, padding:'12px 20px',
                background: loading ? 'rgba(224, 90, 58, 0.5)' : 'linear-gradient(135deg, #e05a3a 0%, #c2410c 100%)',
                color:'#fff', border:'none', borderRadius:8, fontWeight:600,
                fontSize:'1rem', cursor: loading ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                boxShadow:'0 4px 16px rgba(224,90,58,0.25)', letterSpacing:'0.02em',
                transition:'all 0.2s ease',
              }} className="submit-btn">
                {loading
                  ? <><span className="spin-ring" />Signing in…</>
                  : 'Sign In →'
                }
              </button>
              <div style={{
                padding:'8px 12px', borderRadius:8, whiteSpace:'nowrap',
                background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
                fontSize:'0.65rem', fontWeight:600, color:'#7a8da8',
                textTransform:'uppercase', letterSpacing:'0.12em', fontFamily:'monospace',
              }}>Invite only</div>
            </div>
          </form>

          <p style={{ fontSize:'0.85rem', color:'#7a8da8', textAlign:'center', marginTop: 32 }}>
            No account?{' '}
            <Link href="/register" style={{ color:'#e05a3a', fontWeight:500, textDecoration:'none', transition: 'color 0.2s' }}>Register</Link>
          </p>
        </div>
      </main>

      <style>{`
        @keyframes nodeFloat {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50%      { transform: translate(-50%, -50%) translateY(-12px); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(30px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse-line {
          0% { opacity: 0.3; }
          100% { opacity: 0.9; }
        }
        .knit-input {
          width:100%; padding:14px 16px; box-sizing:border-box;
          background:rgba(0, 0, 0, 0.25); border:1px solid rgba(255,255,255,0.06);
          border-radius:8px; font-size:0.95rem; color:#dce6f5; outline:none;
          transition:all 0.2s ease; font-family:inherit;
        }
        .knit-input::placeholder { color:rgba(122, 141, 168, 0.4); }
        .knit-input:focus {
          background: rgba(0, 0, 0, 0.4);
          border-color: rgba(224, 90, 58, 0.5);
          box-shadow: 0 0 0 3px rgba(224, 90, 58, 0.15);
        }
        .submit-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        .submit-btn:active {
          transform: translateY(1px);
        }
        .spin-ring {
          display:inline-block; width:16px; height:16px; border-radius:50%;
          border:2px solid rgba(255,255,255,0.3); border-top-color:#fff;
          animation:spin 0.7s linear infinite;
        }
      `}</style>
    </div>
  );
}
