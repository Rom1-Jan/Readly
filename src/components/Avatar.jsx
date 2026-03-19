import { getInitials, getAvatarColor } from '../hooks/useProfile'

export default function Avatar({ profile, size = 40, onClick, editable = false }) {
  const initials = getInitials(profile)
  const color    = getAvatarColor(profile?.id)

  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: '50%',
        overflow: 'hidden', flexShrink: 0, cursor: onClick ? 'pointer' : 'default',
        background: profile?.avatar_url ? 'var(--surface3)' : color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.35, fontWeight: 500, color: '#fff',
        position: 'relative',
        border: onClick ? '2px solid var(--border2)' : 'none',
        transition: 'opacity var(--transition)',
      }}
    >
      {profile?.avatar_url
        ? <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
        : initials
      }
      {editable && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => e.currentTarget.style.opacity = 0}
        >
          <span style={{ fontSize: size * 0.3, color: '#fff' }}>✏️</span>
        </div>
      )}
    </div>
  )
}
