import { useState } from 'react'

const STATUS = {
  to_read: { label: 'À lire',   color: 'var(--text3)',  bg: 'var(--surface3)' },
  reading: { label: 'En cours', color: 'var(--amber)',   bg: 'var(--amber-soft)' },
  done:    { label: 'Lu',       color: 'var(--green)',   bg: 'var(--green-soft)' },
}

export default function BookCard({ book, sessions, onClick, onDelete }) {
  const [hov, setHov] = useState(false)
  const pct = book.total_pages > 0 ? Math.min(Math.round((book.current_page / book.total_pages) * 100), 100) : 0
  const st  = STATUS[book.status] || STATUS.to_read
  const bookSessions = sessions.filter(s => s.book_id === book.id)
  const totalMin = bookSessions.reduce((s, r) => s + (r.duration || 0), 0)

  return (
    <div
      onClick={() => onClick(book)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${hov ? 'var(--border2)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)', padding: '14px',
        cursor: 'pointer', display: 'flex', gap: 14,
        transition: 'all var(--transition)',
        transform: hov ? 'translateY(-1px)' : 'none',
        boxShadow: hov ? '0 4px 16px rgba(0,0,0,0.06)' : 'none',
        animation: 'fadeIn 0.2s ease', position: 'relative',
      }}
    >
      {/* Cover */}
      <div style={{ width: 56, height: 82, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {book.cover_url
          ? <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 22 }}>📖</span>}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 400, lineHeight: 1.3, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{book.author}</div>
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 500, padding: '3px 8px', borderRadius: 20, background: st.bg, color: st.color, flexShrink: 0 }}>{st.label}</span>
        </div>

        {book.rating > 0 && (
          <div style={{ fontSize: 12, color: 'var(--amber)' }}>{'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}</div>
        )}

        {book.status === 'reading' && book.total_pages > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
              <span>Page {book.current_page} / {book.total_pages}</span>
              <span>{pct}%</span>
            </div>
            <div style={{ height: 3, background: 'var(--surface3)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: pct + '%', background: 'var(--accent)', borderRadius: 2, transition: 'width 0.4s' }} />
            </div>
          </div>
        )}

        {bookSessions.length > 0 && (
          <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>⏱ {totalMin < 60 ? totalMin + ' min' : Math.round(totalMin / 60) + 'h'}</span>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>📅 {bookSessions.length} session{bookSessions.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {hov && (
        <button
          onClick={e => { e.stopPropagation(); if (confirm('Supprimer ce livre ?')) onDelete(book.id) }}
          style={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text3)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >🗑</button>
      )}
    </div>
  )
}
