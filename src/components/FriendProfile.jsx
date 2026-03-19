import { useState, useEffect } from 'react'
import { loadFriendData } from '../hooks/useFriends'

const STATUS = {
  to_read: { label: 'À lire',   color: 'var(--text3)',  bg: 'var(--surface3)' },
  reading: { label: 'En cours', color: 'var(--amber)',   bg: 'var(--amber-soft)' },
  done:    { label: 'Lu',       color: 'var(--green)',   bg: 'var(--green-soft)' },
}

export default function FriendProfile({ friendId, profile, onClose, isMobile }) {
  const [books,    setBooks]    = useState([])
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('books')

  useEffect(() => {
    if (!friendId) return
    setLoading(true)
    loadFriendData(friendId).then(({ books, sessions }) => {
      setBooks(books)
      setSessions(sessions)
      setLoading(false)
    })
  }, [friendId])

  const initials = (profile?.username || profile?.email || '?').slice(0, 2).toUpperCase()

  const stats = {
    done:        books.filter(b => b.status === 'done').length,
    reading:     books.filter(b => b.status === 'reading').length,
    toRead:      books.filter(b => b.status === 'to_read').length,
    totalPages:  sessions.reduce((s, r) => s + (r.pages_read || 0), 0),
    totalMin:    sessions.reduce((s, r) => s + (r.duration || 0), 0),
  }

  const wrapStyle = isMobile
    ? { position: 'fixed', inset: 0, zIndex: 80, background: 'var(--surface)', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease' }
    : { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80 }

  const modalStyle = isMobile
    ? { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
    : { background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', width: 580, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(0,0,0,0.18)', animation: 'modalIn 0.2s ease' }

  return (
    <div onClick={e => !isMobile && e.target === e.currentTarget && onClose()} style={wrapStyle}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
          {isMobile && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--text2)', cursor: 'pointer', padding: '0 4px 0 0' }}>←</button>
          )}
          <AvatarDisplay profile={profile} size={48} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 400 }}>{profile?.username || 'Utilisateur'}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: profile?.bio ? 4 : 0 }}>{profile?.email}</div>
            {profile?.bio && <div style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic' }}>{profile.bio}</div>}
            {profile?.genres?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {profile.genres.slice(0, 4).map(g => (
                  <span key={g} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--surface3)', color: 'var(--text3)' }}>{g}</span>
                ))}
              </div>
            )}
          </div>
          {!isMobile && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--text3)', cursor: 'pointer' }}>×</button>
          )}
        </div>

        {/* Stats rapides */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, borderBottom: '1px solid var(--border)' }}>
            {[
              { label: 'Lus',     value: stats.done },
              { label: 'En cours', value: stats.reading },
              { label: 'À lire',  value: stats.toRead },
              { label: 'Pages',   value: stats.totalPages },
            ].map((s, i) => (
              <div key={i} style={{ padding: '14px 8px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
          {[['books', `Bibliothèque (${books.length})`], ['reading', 'En cours'], ['done', 'Lus']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '12px 0', marginRight: 20, background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === id ? 'var(--accent)' : 'transparent'}`,
              color: tab === id ? 'var(--accent)' : 'var(--text3)',
              fontSize: 13, fontWeight: tab === id ? 500 : 400, cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>

        {/* Books list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>Chargement…</div>
          ) : (() => {
            const filtered = tab === 'books' ? books : books.filter(b => b.status === (tab === 'done' ? 'done' : 'reading'))
            if (filtered.length === 0) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 14 }}>Aucun livre ici</div>
            return filtered.map(book => <FriendBookRow key={book.id} book={book} sessions={sessions.filter(s => s.book_id === book.id)} />)
          })()}
        </div>
      </div>
    </div>
  )
}

function FriendBookRow({ book, sessions }) {
  const st  = STATUS[book.status] || STATUS.to_read
  const pct = book.total_pages > 0 ? Math.min(Math.round((book.current_page / book.total_pages) * 100), 100) : 0

  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 40, height: 58, borderRadius: 5, overflow: 'hidden', background: 'var(--surface3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {book.cover_url ? <img src={book.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 16 }}>📖</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{book.author}</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 20, background: st.bg, color: st.color, flexShrink: 0 }}>{st.label}</span>
        </div>

        {book.rating > 0 && (
          <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 3 }}>{'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}</div>
        )}

        {book.status === 'reading' && book.total_pages > 0 && (
          <div style={{ marginTop: 6 }}>
            <div style={{ height: 3, background: 'var(--surface3)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: pct + '%', background: 'var(--accent)', borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>Page {book.current_page} / {book.total_pages} — {pct}%</div>
          </div>
        )}

        {book.review && (
          <div style={{ fontSize: 11, color: 'var(--text2)', fontStyle: 'italic', marginTop: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            « {book.review} »
          </div>
        )}
      </div>
    </div>
  )
}

function AvatarDisplay({ profile, size }) {
  const initials = (profile?.username || profile?.email || '?').slice(0, 2).toUpperCase()
  const colors = ['#2980b9', '#8a44f2', '#27ae60', '#c96800', '#cc2e26', '#0077a8', '#cc1844']
  const color  = profile?.id ? colors[profile.id.charCodeAt(0) % colors.length] : colors[0]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: profile?.avatar_url ? 'var(--surface3)' : color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 500, color: '#fff', flexShrink: 0 }}>
      {profile?.avatar_url
        ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
        : initials}
    </div>
  )
}
