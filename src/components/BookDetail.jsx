import { useState, useRef, useEffect } from 'react'

const STATUS_OPTIONS = [
  { value: 'to_read', label: 'À lire' },
  { value: 'reading', label: 'En cours' },
  { value: 'done',    label: 'Lu' },
]

export default function BookDetail({ book, sessions, onUpdate, onAddSession, onClose, isMobile }) {
  const [tab,           setTab]           = useState('info')
  const [addingSession, setAddingSession] = useState(false)

  // Fermer avec Escape
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  if (!book) return null

  const bookSessions = sessions.filter(s => s.book_id === book.id)
  const pct        = book.total_pages > 0 ? Math.min(Math.round((book.current_page / book.total_pages) * 100), 100) : 0
  const totalMin   = bookSessions.reduce((s, r) => s + (r.duration || 0), 0)
  const totalPages = bookSessions.reduce((s, r) => s + (r.pages_read || 0), 0)

  const panel = (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface)',
      ...(isMobile
        ? { width: '100%', height: '100%' }
        : { width: 420, minWidth: 420, borderLeft: '1px solid var(--border)', animation: 'slideIn 0.2s ease' }
      )
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 52, height: 76, borderRadius: 6, overflow: 'hidden', background: 'var(--surface3)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {book.cover_url
            ? <img src={book.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 20 }}>📖</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 400, lineHeight: 1.3, marginBottom: 3 }}>{book.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>{book.author}</div>
          <select
            value={book.status}
            onChange={e => onUpdate(book.id, { status: e.target.value })}
            style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text2)', cursor: 'pointer', outline: 'none' }}
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--text3)', cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
      </div>

      {/* Progress */}
      {book.total_pages > 0 && (
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
            <span>Progression</span>
            <span style={{ fontWeight: 500 }}>Page {book.current_page} / {book.total_pages} — {pct}%</span>
          </div>
          <div style={{ height: 5, background: 'var(--surface3)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: pct + '%', background: 'var(--accent)', borderRadius: 3, transition: 'width 0.4s' }} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
        {[['info', 'Infos'], ['sessions', `Sessions (${bookSessions.length})`], ['review', 'Avis']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '12px 0', marginRight: 20, background: 'none', border: 'none', borderBottom: `2px solid ${tab === id ? 'var(--accent)' : 'transparent'}`, color: tab === id ? 'var(--accent)' : 'var(--text3)', fontSize: 13, fontWeight: tab === id ? 500 : 400, cursor: 'pointer', transition: 'all var(--transition)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {tab === 'info'     && <InfoTab book={book} onUpdate={onUpdate} totalMin={totalMin} totalPages={totalPages} />}
        {tab === 'sessions' && <SessionsTab book={book} sessions={bookSessions} onAddSession={onAddSession} addingSession={addingSession} setAddingSession={setAddingSession} />}
        {tab === 'review'   && <ReviewTab book={book} onUpdate={onUpdate} />}
      </div>
    </div>
  )

  // Mobile = plein écran par-dessus
  if (isMobile) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--surface)', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease' }}>
        {panel}
      </div>
    )
  }

  return panel
}

function InfoTab({ book, onUpdate, totalMin, totalPages }) {
  const h   = Math.floor(totalMin / 60)
  const min = totalMin % 60
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'Pages totales', value: book.total_pages || '—' },
          { label: 'Page actuelle', value: book.current_page || '—' },
          { label: 'Temps total',   value: totalMin === 0 ? '—' : h > 0 ? `${h}h ${min}m` : `${min} min` },
          { label: 'Pages lues',    value: totalPages || '—' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, fontFamily: 'var(--font-display)' }}>{s.value}</div>
          </div>
        ))}
      </div>
      <Field label="Pages totales du livre">
        <input type="number" min="0" defaultValue={book.total_pages || ''} placeholder="Ex : 320" onBlur={e => onUpdate(book.id, { total_pages: parseInt(e.target.value) || 0 })} style={inp} />
      </Field>
      <Field label="Date de début">
        <input type="date" defaultValue={book.started_at || ''} onBlur={e => onUpdate(book.id, { started_at: e.target.value || null })} style={inp} />
      </Field>
      <Field label="Date de fin">
        <input type="date" defaultValue={book.finished_at || ''} onBlur={e => onUpdate(book.id, { finished_at: e.target.value || null })} style={inp} />
      </Field>
    </div>
  )
}

function SessionsTab({ book, sessions, onAddSession, addingSession, setAddingSession }) {
  const currentPageRef = useRef()
  const durationRef    = useRef()
  const noteRef        = useRef()
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    const currentPage = parseInt(currentPageRef.current.value) || 0
    const duration    = parseInt(durationRef.current.value) || 0
    const note        = noteRef.current.value
    if (!currentPage && !duration) return

    // Calcul automatique des pages lues
    const pagesRead = Math.max(currentPage - (book.current_page || 0), 0)

    setLoading(true)
    try {
      await onAddSession(book.id, pagesRead, duration, note, currentPage)
      currentPageRef.current.value = ''; durationRef.current.value = ''; noteRef.current.value = ''
      setAddingSession(false)
    } catch (e) { alert(e.message) }
    finally { setLoading(false) }
  }

  const currentPage = book.current_page || 0
  const totalPages  = book.total_pages || 0

  return (
    <div>
      <button onClick={() => setAddingSession(!addingSession)} style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border2)', background: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 500, cursor: 'pointer', marginBottom: 16 }}>
        + Ajouter une session
      </button>

      {addingSession && (
        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label={`Page actuelle${totalPages > 0 ? ` (sur ${totalPages})` : ''}`}>
              <input
                ref={currentPageRef}
                type="number"
                min={currentPage}
                max={totalPages || undefined}
                placeholder={`Après ${currentPage}`}
                style={inp}
              />
            </Field>
            <Field label="Durée (min)"><input ref={durationRef} type="number" min="0" placeholder="Ex : 45" style={inp} /></Field>
          </div>
          {currentPage > 0 && (
            <div style={{ fontSize: 12, color: 'var(--text3)', background: 'var(--surface3)', borderRadius: 6, padding: '6px 10px' }}>
              Vous étiez page {currentPage} — les pages lues seront calculées automatiquement
            </div>
          )}
          <Field label="Note (optionnel)"><input ref={noteRef} type="text" placeholder="Un commentaire…" style={inp} /></Field>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setAddingSession(false)} style={{ flex: 1, padding: 8, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'none', color: 'var(--text2)', fontSize: 13, cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleAdd} disabled={loading} style={{ flex: 1, padding: 8, borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--text)', color: 'var(--bg)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>{loading ? '…' : 'Enregistrer'}</button>
          </div>
        </div>
      )}

      {sessions.length === 0
        ? <p style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', marginTop: 20 }}>Aucune session enregistrée</p>
        : sessions.map(s => (
          <div key={s.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                {s.page_start != null && s.page_end != null
                  ? `Pages ${s.page_start} → ${s.page_end}`
                  : `${s.pages_read} page${s.pages_read > 1 ? 's' : ''}`
                }
                {s.duration > 0 && ` · ${s.duration} min`}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.pages_read} page{s.pages_read > 1 ? 's' : ''} lues · {new Date(s.session_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
              {s.note && <div style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic', marginTop: 2 }}>{s.note}</div>}
            </div>
          </div>
        ))
      }
    </div>
  )
}

function ReviewTab({ book, onUpdate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={lbl}>Note</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => onUpdate(book.id, { rating: n })} style={{ fontSize: 26, background: 'none', border: 'none', cursor: 'pointer', opacity: n <= (book.rating || 0) ? 1 : 0.25, transition: 'opacity 0.15s' }}>★</button>
          ))}
          {book.rating > 0 && <button onClick={() => onUpdate(book.id, { rating: 0 })} style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}>Retirer</button>}
        </div>
      </div>
      <Field label="Avis personnel">
        <textarea defaultValue={book.review || ''} placeholder="Vos impressions…" onBlur={e => onUpdate(book.id, { review: e.target.value })} rows={6} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
      </Field>
    </div>
  )
}

function Field({ label, children }) {
  return <div style={{ marginBottom: 0 }}><label style={lbl}>{label}</label>{children}</div>
}

const lbl = { fontSize: 12, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 5 }
const inp = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, outline: 'none' }
