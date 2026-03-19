import { useState, useRef } from 'react'

export default function AuthPage({ onLogin, onRegister }) {
  const [mode,    setMode]    = useState('login')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const emailRef = useRef()
  const passRef  = useRef()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'login')    await onLogin(emailRef.current.value, passRef.current.value)
      if (mode === 'register') await onRegister(emailRef.current.value, passRef.current.value)
    } catch (err) { setError(err.message || 'Une erreur est survenue') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header mobile */}
      <div style={{ background: '#1a1814', padding: '40px 24px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: '#faf9f7', fontWeight: 300, letterSpacing: -1 }}>Readly</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 8, fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
          Votre journal de lecture
        </div>
      </div>

      {/* Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'fadeIn 0.3s ease' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, marginBottom: 6, letterSpacing: -0.4 }}>
            {mode === 'login' ? 'Bon retour !' : 'Créer un compte'}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 28 }}>
            {mode === 'login' ? 'Connectez-vous à votre bibliothèque' : 'Commencez à suivre vos lectures'}
          </div>

          <form onSubmit={handleSubmit}>
            <Field label="Email">
              <input ref={emailRef} type="email" required placeholder="vous@exemple.com" style={inp} />
            </Field>
            <Field label="Mot de passe">
              <input ref={passRef} type="password" required placeholder="••••••••" minLength={6} style={inp} />
            </Field>

            {error && (
              <div style={{ background: 'rgba(192,57,43,0.08)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 'var(--radius-sm)', border: 'none', background: loading ? 'var(--surface3)' : '#1a1814', color: loading ? 'var(--text3)' : '#faf9f7', fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', transition: 'all var(--transition)' }}>
              {loading ? '…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text3)' }}>
            {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              style={{ color: 'var(--text)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>
              {mode === 'login' ? "S'inscrire" : 'Se connecter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>{label}</label>
    {children}
  </div>
}

const inp = { width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--text)', fontSize: 15, outline: 'none' }
