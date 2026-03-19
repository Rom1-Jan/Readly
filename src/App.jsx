import { useState, useEffect } from 'react'
import { useAuth }     from './hooks/useAuth'
import { useBooks }    from './hooks/useBooks'
import { useFriends }  from './hooks/useFriends'
import AuthPage        from './pages/AuthPage'
import Sidebar         from './components/Sidebar'
import BottomNav       from './components/BottomNav'
import BookCard        from './components/BookCard'
import BookDetail      from './components/BookDetail'
import SearchModal     from './components/SearchModal'
import StatsPage       from './components/StatsPage'
import FriendsPage     from './components/FriendsPage'
import FriendProfile   from './components/FriendProfile'
import './styles/globals.css'

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth <= 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

export default function App() {
  const { user, loading, login, register, logout } = useAuth()
  if (loading) return <Splash />
  if (!user)   return <AuthPage onLogin={login} onRegister={register} />
  return <Dashboard user={user} onLogout={logout} />
}

function Dashboard({ user, onLogout }) {
  const { books, sessions, goal, loading, stats, addBook, updateBook, deleteBook, addSession, setReadingGoal } = useBooks(user.id)
  const { friends, pendingReceived, pendingSent, searchUsers, sendRequest, acceptRequest, declineOrRemove, getFriendshipStatus } = useFriends(user.id)

  const [page,          setPage]          = useState('home')
  const [activeBook,    setActiveBook]    = useState(null)
  const [showSearch,    setShowSearch]    = useState(false)
  const [viewingFriend, setViewingFriend] = useState(null) // { friendId, profile }
  const isMobile = useIsMobile()

  const visibleBooks = {
    home:    books,
    reading: books.filter(b => b.status === 'reading'),
    toread:  books.filter(b => b.status === 'to_read'),
    done:    books.filter(b => b.status === 'done'),
  }[page] || books

  const pageTitle = { home: 'Ma bibliothèque', reading: 'En cours', toread: 'À lire', done: 'Lus', stats: 'Statistiques', friends: 'Amis' }
  const pendingCount = pendingReceived.length

  function handlePageChange(p) { setPage(p); setActiveBook(null) }

  function handleViewFriendProfile(friendId, profile) {
    setViewingFriend({ friendId, profile })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {!isMobile && (
        <Sidebar page={page} onPage={handlePageChange} stats={stats} pendingCount={pendingCount} user={user} onLogout={onLogout} />
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: isMobile ? '12px 16px' : '16px 28px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {isMobile && <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, letterSpacing: -0.5 }}>Readly</div>}
          <span style={{ fontFamily: 'var(--font-display)', fontSize: isMobile ? 15 : 20, fontWeight: 400, flex: 1, letterSpacing: -0.3, color: isMobile ? 'var(--text2)' : 'var(--text)' }}>
            {pageTitle[page]}
          </span>
          {!isMobile && page !== 'stats' && page !== 'friends' && (
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{visibleBooks.length} livre{visibleBooks.length !== 1 ? 's' : ''}</span>
          )}
          {page !== 'friends' && page !== 'stats' && (
            <button onClick={() => setShowSearch(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: isMobile ? '8px 12px' : '9px 18px', borderRadius: 'var(--radius-sm)', border: 'none', background: '#1a1814', color: '#faf9f7', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              {!isMobile && 'Ajouter un livre'}
            </button>
          )}
          {isMobile && (
            <button onClick={onLogout} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'none', fontSize: 12, color: 'var(--text3)', cursor: 'pointer' }}>⎋</button>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '14px 12px 100px' : '24px 28px' }}>
          {page === 'stats' && <StatsPage stats={stats} books={books} sessions={sessions} isMobile={isMobile} goal={goal} onSetGoal={setReadingGoal} />}

          {page === 'friends' && (
            <FriendsPage
              friends={friends}
              pendingReceived={pendingReceived}
              pendingSent={pendingSent}
              onSearch={searchUsers}
              onSendRequest={sendRequest}
              onAccept={acceptRequest}
              onDecline={declineOrRemove}
              onViewProfile={handleViewFriendProfile}
              getFriendshipStatus={getFriendshipStatus}
              isMobile={isMobile}
            />
          )}

          {page !== 'stats' && page !== 'friends' && (
            loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)', fontSize: 14 }}>Chargement…</div>
            ) : visibleBooks.length === 0 ? (
              <EmptyState page={page} onAdd={() => setShowSearch(true)} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: isMobile ? '100%' : 720 }}>
                {visibleBooks.map(book => (
                  <BookCard
                    key={book.id} book={book} sessions={sessions}
                    onClick={b => setActiveBook(b.id === activeBook ? null : b.id)}
                    onDelete={deleteBook}
                  />
                ))}
              </div>
            )
          )}
        </div>
      </main>

      {/* Panneau détail livre */}
      {activeBook && (
        <BookDetail
          book={books.find(b => b.id === activeBook)}
          sessions={sessions}
          onUpdate={updateBook}
          onAddSession={addSession}
          onClose={() => setActiveBook(null)}
          isMobile={isMobile}
        />
      )}

      {/* Profil ami */}
      {viewingFriend && (
        <FriendProfile
          friendId={viewingFriend.friendId}
          profile={viewingFriend.profile}
          onClose={() => setViewingFriend(null)}
          isMobile={isMobile}
        />
      )}

      {isMobile && <BottomNav page={page} onPage={handlePageChange} pendingCount={pendingCount} />}

      <SearchModal open={showSearch} onClose={() => setShowSearch(false)} onAdd={addBook} isMobile={isMobile} />
    </div>
  )
}

function EmptyState({ page, onAdd }) {
  const msgs = {
    home:    { icon: '📚', text: 'Votre bibliothèque est vide' },
    reading: { icon: '📖', text: 'Aucun livre en cours' },
    toread:  { icon: '🔖', text: 'Aucun livre dans votre liste' },
    done:    { icon: '✓',  text: "Aucun livre terminé pour l'instant" },
  }
  const { icon, text } = msgs[page] || msgs.home
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: 'var(--text3)', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ fontSize: 48, opacity: 0.3 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{text}</p>
      <button onClick={onAdd} style={{ marginTop: 4, padding: '10px 22px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border2)', background: 'none', color: 'var(--text2)', fontSize: 13, cursor: 'pointer' }}>+ Ajouter un livre</button>
    </div>
  )
}

function Splash() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300 }}>Readly</div>
      <div style={{ fontSize: 13, color: 'var(--text3)' }}>Chargement…</div>
    </div>
  )
}
