import Avatar from './Avatar'
import { useState, useRef, useEffect } from 'react'

export default function FriendsPage({ friends, pendingReceived, pendingSent, onSearch, onSendRequest, onAccept, onDecline, onViewProfile, getFriendshipStatus, isMobile }) {
  const [tab,     setTab]     = useState('friends')
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const timer = useRef()

  useEffect(() => {
    clearTimeout(timer.current)
    if (!query.trim()) { setResults([]); return }
    timer.current = setTimeout(async () => {
      setLoading(true)
      try { setResults(await onSearch(query)) }
      catch { setResults([]) }
      finally { setLoading(false) }
    }, 400)
  }, [query, onSearch])

  const pendingCount = pendingReceived.length

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {[
          ['friends',  `Amis (${friends.length})`],
          ['requests', `Demandes${pendingCount > 0 ? ` (${pendingCount})` : ''}`],
          ['search',   'Rechercher'],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding: '12px 0', marginRight: 24, background: 'none', border: 'none',
            borderBottom: `2px solid ${tab === id ? 'var(--accent)' : 'transparent'}`,
            color: tab === id ? 'var(--accent)' : 'var(--text3)',
            fontSize: 14, fontWeight: tab === id ? 500 : 400, cursor: 'pointer',
            transition: 'all var(--transition)', position: 'relative',
          }}>
            {label}
            {id === 'requests' && pendingCount > 0 && (
              <span style={{ position: 'absolute', top: 8, right: -8, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            )}
          </button>
        ))}
      </div>

      {tab === 'friends' && (
        <div>
          {friends.length === 0
            ? <Empty icon="👥" text="Vous n'avez pas encore d'amis" sub="Allez dans Rechercher pour en ajouter" />
            : friends.map(({ friendship, profile, friendId }) => (
              <FriendRow key={friendship.id} profile={profile} action={<>
                <Btn onClick={() => onViewProfile(friendId, profile)}>Voir le profil</Btn>
                <Btn danger onClick={() => { if (confirm('Retirer cet ami ?')) onDecline(friendship.id) }}>Retirer</Btn>
              </>} />
            ))
          }
        </div>
      )}

      {tab === 'requests' && (
        <div>
          {pendingReceived.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <SecTitle>Demandes reçues</SecTitle>
              {pendingReceived.map(({ friendship, profile }) => (
                <FriendRow key={friendship.id} profile={profile} action={<>
                  <Btn primary onClick={() => onAccept(friendship.id)}>Accepter</Btn>
                  <Btn danger onClick={() => onDecline(friendship.id)}>Refuser</Btn>
                </>} />
              ))}
            </div>
          )}
          {pendingSent.length > 0 && (
            <div>
              <SecTitle>Demandes envoyées</SecTitle>
              {pendingSent.map(({ friendship, profile }) => (
                <FriendRow key={friendship.id} profile={profile} action={
                  <span style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>En attente…</span>
                } />
              ))}
            </div>
          )}
          {pendingReceived.length === 0 && pendingSent.length === 0 && <Empty icon="📭" text="Aucune demande en attente" />}
        </div>
      )}

      {tab === 'search' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 20 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher par email ou pseudo…"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: 'var(--text)', background: 'transparent' }}
            />
            {loading && <span style={{ fontSize: 12, color: 'var(--text3)' }}>…</span>}
          </div>
          {!query && <Empty icon="🔍" text="Tapez un email ou un pseudo" />}
          {query && !loading && results.length === 0 && <Empty icon="😕" text={`Aucun résultat pour « ${query} »`} />}
          {results.map(profile => {
            const status = getFriendshipStatus(profile.id)
            return (
              <FriendRow key={profile.id} profile={profile} action={
                !status ? (
                  <Btn primary onClick={async () => {
                    try { await onSendRequest(profile.id); setQuery(''); setResults([]) }
                    catch (e) { alert(e.message) }
                  }}>Ajouter</Btn>
                ) : status.status === 'pending' && status.isMine ? (
                  <span style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>Envoyée</span>
                ) : status.status === 'pending' ? (
                  <Btn primary onClick={() => onAccept(status.id)}>Accepter</Btn>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--green)' }}>✓ Ami</span>
                )
              } />
            )
          })}
        </div>
      )}
    </div>
  )
}

function FriendRow({ profile, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <Avatar profile={profile} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.username || 'Utilisateur'}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.email}</div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>{action}</div>
    </div>
  )
}

function Btn({ children, onClick, primary, danger }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      padding: '6px 12px', borderRadius: 'var(--radius-sm)',
      fontSize: 12, fontWeight: 500, cursor: 'pointer',
      background: primary ? '#1a1814' : danger ? (hov ? 'var(--accent-soft)' : 'transparent') : (hov ? 'var(--surface2)' : 'transparent'),
      color: primary ? '#faf9f7' : danger ? 'var(--accent)' : 'var(--text2)',
      border: primary ? 'none' : `1px solid ${danger ? 'var(--accent-soft)' : 'var(--border)'}`,
      transition: 'all var(--transition)',
    }}>{children}</button>
  )
}

function SecTitle({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>{children}</div>
}

function Empty({ icon, text, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
      <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.4 }}>{icon}</div>
      <div style={{ fontSize: 14, marginBottom: sub ? 6 : 0 }}>{text}</div>
      {sub && <div style={{ fontSize: 12 }}>{sub}</div>}
    </div>
  )
}