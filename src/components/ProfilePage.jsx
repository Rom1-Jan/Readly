import { useState, useRef } from 'react'
import { GENRES } from '../hooks/useProfile'
import Avatar from './Avatar'

export default function ProfilePage({ profile, onUpdateProfile, onUploadAvatar, onUpdateEmail, onUpdatePassword, isMobile }) {
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState('')
  const [error,   setError]   = useState('')
  const fileRef = useRef()

  const [username, setUsername] = useState(profile?.username || '')
  const [bio,      setBio]      = useState(profile?.bio || '')
  const [genres,   setGenres]   = useState(profile?.genres || [])
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [passConfirm, setPassConfirm] = useState('')

  function notify(msg, isError = false) {
    if (isError) { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setSuccess(''); setError('') }, 3000)
  }

  async function handleSaveProfile() {
    setSaving(true)
    try {
      await onUpdateProfile({ username, bio, genres })
      notify('Profil mis à jour !')
    } catch (e) { notify(e.message, true) }
    finally { setSaving(false) }
  }

  async function handleAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { notify('Image trop lourde (max 2 Mo)', true); return }
    setSaving(true)
    try {
      await onUploadAvatar(file)
      notify('Avatar mis à jour !')
    } catch (e) { notify(e.message, true) }
    finally { setSaving(false) }
  }

  async function handleEmail() {
    if (!email) return
    setSaving(true)
    try {
      await onUpdateEmail(email)
      notify('Email mis à jour ! Vérifiez votre boîte mail.')
      setEmail('')
    } catch (e) { notify(e.message, true) }
    finally { setSaving(false) }
  }

  async function handlePassword() {
    if (!password) return
    if (password !== passConfirm) { notify('Les mots de passe ne correspondent pas', true); return }
    if (password.length < 6) { notify('Minimum 6 caractères', true); return }
    setSaving(true)
    try {
      await onUpdatePassword(password)
      notify('Mot de passe mis à jour !')
      setPassword(''); setPassConfirm('')
    } catch (e) { notify(e.message, true) }
    finally { setSaving(false) }
  }

  function toggleGenre(g) {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  return (
    <div style={{ maxWidth: 560, paddingBottom: 32 }}>

      {/* Notification */}
      {(success || error) && (
        <div style={{ padding: '10px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 20, fontSize: 13, fontWeight: 500, background: error ? 'var(--danger-soft)' : 'var(--green-soft)', color: error ? 'var(--danger)' : 'var(--green)', animation: 'fadeIn 0.2s ease' }}>
          {success || error}
        </div>
      )}

      {/* Avatar */}
      <Section title="Photo de profil">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
            <Avatar profile={profile} size={72} editable />
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
          </div>
          <div>
            <button onClick={() => fileRef.current?.click()} style={btnSecStyle}>
              Changer la photo
            </button>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>JPG, PNG — max 2 Mo</div>
          </div>
        </div>
      </Section>

      {/* Infos générales */}
      <Section title="Informations">
        <Field label="Pseudo">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Votre pseudo"
            style={inpStyle}
          />
        </Field>
        <Field label="Bio">
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Quelques mots sur vous…"
            rows={3}
            style={{ ...inpStyle, resize: 'none', lineHeight: 1.6 }}
          />
        </Field>
        <button onClick={handleSaveProfile} disabled={saving} style={btnPriStyle}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </Section>

      {/* Genres favoris */}
      <Section title="Genres favoris">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => toggleGenre(g)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: `1px solid ${genres.includes(g) ? 'transparent' : 'var(--border2)'}`,
                background: genres.includes(g) ? '#1a1814' : 'transparent',
                color: genres.includes(g) ? '#faf9f7' : 'var(--text2)',
                cursor: 'pointer', transition: 'all var(--transition)',
              }}
            >{g}</button>
          ))}
        </div>
        <button onClick={handleSaveProfile} disabled={saving} style={btnPriStyle}>
          {saving ? 'Enregistrement…' : 'Enregistrer les genres'}
        </button>
      </Section>

      {/* Changer email */}
      <Section title="Changer l'email">
        <Field label="Nouvel email">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="nouveau@email.com"
            style={inpStyle}
          />
        </Field>
        <button onClick={handleEmail} disabled={saving || !email} style={btnPriStyle}>
          Mettre à jour l'email
        </button>
      </Section>

      {/* Changer mot de passe */}
      <Section title="Changer le mot de passe">
        <Field label="Nouveau mot de passe">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inpStyle}
          />
        </Field>
        <Field label="Confirmer le mot de passe">
          <input
            type="password"
            value={passConfirm}
            onChange={e => setPassConfirm(e.target.value)}
            placeholder="••••••••"
            style={inpStyle}
          />
        </Field>
        <button onClick={handlePassword} disabled={saving || !password} style={btnPriStyle}>
          Mettre à jour le mot de passe
        </button>
      </Section>

    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

const inpStyle = {
  width: '100%', padding: '10px 12px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border2)',
  background: 'var(--surface2)', color: 'var(--text)',
  fontSize: 14, outline: 'none',
}

const btnPriStyle = {
  padding: '9px 18px', borderRadius: 'var(--radius-sm)',
  border: 'none', background: '#1a1814', color: '#faf9f7',
  fontSize: 13, fontWeight: 500, cursor: 'pointer',
}

const btnSecStyle = {
  padding: '8px 16px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border2)', background: 'none',
  color: 'var(--text2)', fontSize: 13, cursor: 'pointer',
}
