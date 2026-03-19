const items = [
  { id: 'home',    icon: '⊞', label: 'Biblio' },
  { id: 'reading', icon: '📖', label: 'En cours' },
  { id: 'stats',   icon: '📊', label: 'Stats' },
  { id: 'friends', icon: '👥', label: 'Amis' },
  { id: 'profile', icon: '👤', label: 'Profil' },
]

export default function BottomNav({ page, onPage, pendingCount }) {
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 50 }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onPage(item.id)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 3, padding: '10px 4px', background: 'none', border: 'none', cursor: 'pointer',
          color: page === item.id ? 'var(--accent)' : 'var(--text3)',
          fontSize: 11, fontFamily: 'var(--font)', transition: 'color var(--transition)', position: 'relative',
        }}>
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          <span style={{ fontWeight: page === item.id ? 500 : 400 }}>{item.label}</span>
          {item.id === 'friends' && pendingCount > 0 && (
            <span style={{ position: 'absolute', top: 6, right: '50%', marginRight: -18, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
          )}
        </button>
      ))}
    </nav>
  )
}