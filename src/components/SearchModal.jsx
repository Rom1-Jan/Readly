import { useState, useRef, useEffect } from 'react'
import { searchBooks } from '../lib/googleBooks'

export default function SearchModal({ open, onClose, onAdd, isMobile }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [added,   setAdded]   = useState({})
  const inputRef = useRef()
  const timer    = useRef()

  useEffect(() => {
    if (open) { setAdded({}); setTimeout(() => inputRef.current?.focus(), 80) }
    else { setQuery(''); setResults([]) }
  }, [open])

  useEffect(() => {
    clearTimeout(timer.current)
    if (!query.trim()) { setResults([]); return }
    timer.current = setTimeout(async () => {
      setLoading(true)
      try { setResults(await searchBooks(query)) }
      catch { setResults([]) }
      finally { setLoading(false) }
    }, 400)
  }, [query])

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  if (!open) return null

  async function handleAdd(book) {
    if (added[book.google_id]) return
    try { await onAdd(book); setAdded(p => ({ ...p, [book.google_id]: true })) }
    catch (e) { alert(e.message) }
  }

  // Mobile = plein écran
  const containerStyle = isMobile
    ? { position: 'fixed', inset: 0, zIndex: 100, background: 'var(--surface)', display: 'flex', flexDirection: 'column' }
    : { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 100, paddingTop: 80 }

  const modalStyle = isMobile
    ? { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }
    : { background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--border)', width: 580, maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(0,0,0,0.2)', animation: 'modalIn 0.2s ease' }

  return (
    <div onClick={e => !isMobile && e.target === e.currentTarget && onClose()} style={containerStyle}>
      <div style={modalStyle}>
        {/* Search bar */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          {isMobile && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--text2)', cursor: 'pointer', padding: '0 4px 0 0' }}>←</button>
          )}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un livre, un auteur…"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, color: 'var(--text)', background: 'transparent' }}
          />
          {loading && <span style={{ fontSize: 12, color: 'var(--text3)' }}>…</span>}
          {!isMobile && <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--text3)', cursor: 'pointer' }}>×</button>}
        </div>

        {/* Results */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {!query && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
              <div style={{ fontSize: 14 }}>Tapez un titre ou un auteur</div>
            </div>
          )}
          {query && !loading && results.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>Aucun résultat pour « {query} »</div>
          )}
          {results.map(book => (
            <div key={book.google_id} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
              <div style={{ width: 42, height: 60, borderRadius: 5, overflow: 'hidden', background: 'var(--surface3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {book.cover_url ? <img src={book.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 16 }}>📖</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{book.author}</div>
                {book.total_pages > 0 && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{book.total_pages} pages</div>}
              </div>
              <button
                onClick={() => handleAdd(book)}
                style={{ padding: '7px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: added[book.google_id] ? 'var(--green-soft)' : 'var(--text)', color: added[book.google_id] ? 'var(--green)' : 'var(--bg)', fontSize: 12, fontWeight: 500, cursor: added[book.google_id] ? 'default' : 'pointer', flexShrink: 0, transition: 'all var(--transition)' }}
              >
                {added[book.google_id] ? '✓' : '+'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
