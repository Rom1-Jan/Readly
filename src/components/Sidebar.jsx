import { useState } from 'react'

export default function Sidebar({ page, onPage, stats, pendingCount, user, onLogout }) {
  const navItems = [
    { id: 'home',    icon: '⊞', label: 'Accueil' },
    { id: 'reading', icon: '📖', label: 'En cours' },
    { id: 'toread',  icon: '🔖', label: 'À lire' },
    { id: 'done',    icon: '✓',  label: 'Lus' },
    { id: 'stats',   icon: '📊', label: 'Statistiques' },
    { id: 'friends', icon: '👥', label: 'Amis', badge: pendingCount },
  ]

  return (
    <aside style={{ width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '28px 0 20px' }}>
      <div style={{ padding: '0 20px 32px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, letterSpacing: -0.5 }}>Readly</div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>Bibliothèque personnelle</div>
      </div>
      <nav style={{ flex: 1, padding: '0 8px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: '0.6px', textTransform: 'uppercase', padding: '0 12px 8px' }}>Navigation</div>
        {navItems.map(item => (
          <NavBtn key={item.id} item={item} active={page === item.id} count={getCount(item.id, stats)} onClick={() => onPage(item.id)} />
        ))}
      </nav>
      <div style={{ padding: '16px 16px 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
        <button onClick={onLogout} style={{ width: '100%', padding: 7, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text2)', background: 'none', cursor: 'pointer' }}>Déconnexion</button>
      </div>
    </aside>
  )
}

function NavBtn({ item, active, count, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: active ? 'var(--accent-soft)' : hov ? 'var(--surface2)' : 'none', color: active ? 'var(--accent)' : 'var(--text2)', fontSize: 13.5, fontWeight: active ? 500 : 400, cursor: 'pointer', transition: 'all var(--transition)', marginBottom: 2, textAlign: 'left', position: 'relative' }}>
      <span style={{ fontSize: 14 }}>{item.icon}</span>
      {item.label}
      {count !== null && <span style={{ marginLeft: 'auto', fontSize: 11, padding: '1px 7px', borderRadius: 20, background: active ? 'var(--accent-soft)' : 'var(--surface3)', color: active ? 'var(--accent)' : 'var(--text3)' }}>{count}</span>}
      {item.badge > 0 && !count && <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
    </button>
  )
}

function getCount(id, stats) {
  if (id === 'reading') return stats.reading
  if (id === 'toread')  return stats.toRead
  if (id === 'done')    return stats.done
  if (id === 'home')    return stats.totalBooks
  return null
}
