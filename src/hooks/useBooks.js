import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useBooks(userId) {
  const [books,    setBooks]    = useState([])
  const [sessions, setSessions] = useState([])
  const [goal,     setGoal]     = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    const year = new Date().getFullYear()
    Promise.all([
      supabase.from('books').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
      supabase.from('reading_sessions').select('*').eq('user_id', userId).order('session_at', { ascending: false }),
      supabase.from('reading_goals').select('*').eq('user_id', userId).eq('year', year).single(),
    ]).then(([{ data: b }, { data: s }, { data: g }]) => {
      setBooks(b || [])
      setSessions(s || [])
      setGoal(g || null)
      setLoading(false)
    })
  }, [userId])

  // ── Books CRUD ──
  const addBook = useCallback(async (bookData) => {
    const { data, error } = await supabase.from('books').insert({ user_id: userId, ...bookData, status: 'to_read' }).select().single()
    if (error) throw error
    setBooks(p => [data, ...p])
    return data
  }, [userId])

  const updateBook = useCallback(async (id, changes) => {
    const { data, error } = await supabase.from('books').update(changes).eq('id', id).select().single()
    if (error) throw error
    setBooks(p => p.map(b => b.id === id ? data : b))
    return data
  }, [])

  const deleteBook = useCallback(async (id) => {
    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) throw error
    setBooks(p => p.filter(b => b.id !== id))
    setSessions(p => p.filter(s => s.book_id !== id))
  }, [])

  // ── Sessions ──
  const addSession = useCallback(async (bookId, pagesRead, duration, note = '', currentPageEnd = null) => {
    const book = books.find(b => b.id === bookId)
    if (!book) return

    const pageStart  = book.current_page || 0
    const newPage    = currentPageEnd !== null
      ? Math.min(currentPageEnd, book.total_pages || 9999)
      : Math.min(pageStart + pagesRead, book.total_pages || 9999)
    const actualRead = newPage - pageStart
    const isFinished = book.total_pages > 0 && newPage >= book.total_pages

    const { data: session, error: se } = await supabase.from('reading_sessions').insert({
      user_id: userId, book_id: bookId,
      pages_read: Math.max(actualRead, 0),
      duration, note,
      page_start: pageStart,
      page_end: newPage,
    }).select().single()
    if (se) throw se

    const bookUpdates = { current_page: newPage }
    if (book.status === 'to_read') { bookUpdates.status = 'reading'; bookUpdates.started_at = new Date().toISOString().split('T')[0] }
    if (isFinished) { bookUpdates.status = 'done'; bookUpdates.finished_at = new Date().toISOString().split('T')[0] }
    const updated = await updateBook(bookId, bookUpdates)
    setSessions(p => [session, ...p])
    return { session, book: updated }
  }, [books, userId, updateBook])

  // ── Goal ──
  const setReadingGoal = useCallback(async (target) => {
    const year = new Date().getFullYear()
    const { data, error } = await supabase.from('reading_goals').upsert({ user_id: userId, year, target }, { onConflict: 'user_id,year' }).select().single()
    if (error) throw error
    setGoal(data)
  }, [userId])

  // ── Computed stats ──
  const stats = computeStats(books, sessions, goal)

  return { books, sessions, goal, loading, stats, addBook, updateBook, deleteBook, addSession, setReadingGoal }
}

function computeStats(books, sessions, goal) {
  const now       = new Date()
  const year      = now.getFullYear()
  const today     = toDateStr(now)

  // Livres finis cette année
  const doneThisYear = books.filter(b => b.status === 'done' && b.finished_at?.startsWith(year.toString()))

  // Streak
  const streak = computeStreak(sessions)

  // Pages par jour (30 derniers jours)
  const pagesPerDay = computePagesPerDay(sessions, 30)

  // Pages par semaine (12 dernières semaines)
  const pagesPerWeek = computePagesPerWeek(sessions, 12)

  // Sessions des 30 derniers jours
  const last30 = sessions.filter(s => Date.now() - new Date(s.session_at).getTime() < 30 * 86400000)

  // Heure de lecture préférée
  const favoriteHour = computeFavoriteHour(sessions)

  // Niveau lecteur
  const level = computeLevel(doneThisYear.length, sessions.reduce((s, r) => s + r.pages_read, 0))

  return {
    totalBooks:    books.length,
    reading:       books.filter(b => b.status === 'reading').length,
    done:          books.filter(b => b.status === 'done').length,
    toRead:        books.filter(b => b.status === 'to_read').length,
    doneThisYear:  doneThisYear.length,
    totalPages:    sessions.reduce((s, r) => s + (r.pages_read || 0), 0),
    totalMinutes:  sessions.reduce((s, r) => s + (r.duration || 0), 0),
    avgSpeed:      (() => {
      const w = sessions.filter(s => s.duration > 0 && s.pages_read > 0)
      if (!w.length) return 0
      return Math.round(w.reduce((s, r) => s + r.pages_read / r.duration, 0) / w.length * 60)
    })(),
    last30Pages:   last30.reduce((s, r) => s + r.pages_read, 0),
    last30Min:     last30.reduce((s, r) => s + r.duration, 0),
    last30Count:   last30.length,
    streak,
    pagesPerDay,
    pagesPerWeek,
    favoriteHour,
    level,
    goal: goal ? { target: goal.target, done: doneThisYear.length, pct: Math.min(Math.round((doneThisYear.length / goal.target) * 100), 100) } : null,
  }
}

function toDateStr(d) {
  return d.toISOString().split('T')[0]
}

function computeStreak(sessions) {
  if (!sessions.length) return 0
  const days = new Set(sessions.map(s => toDateStr(new Date(s.session_at))))
  let streak = 0
  let d = new Date()
  // Si pas de session aujourd'hui, on commence hier
  if (!days.has(toDateStr(d))) d.setDate(d.getDate() - 1)
  while (days.has(toDateStr(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

function computePagesPerDay(sessions, days) {
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = toDateStr(d)
    const pages   = sessions.filter(s => toDateStr(new Date(s.session_at)) === dateStr).reduce((s, r) => s + r.pages_read, 0)
    result.push({ date: dateStr, label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), pages })
  }
  return result
}

function computePagesPerWeek(sessions, weeks) {
  const result = []
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(); start.setDate(start.getDate() - i * 7 - start.getDay())
    const end   = new Date(start); end.setDate(start.getDate() + 6)
    const pages = sessions.filter(s => {
      const d = new Date(s.session_at)
      return d >= start && d <= end
    }).reduce((s, r) => s + r.pages_read, 0)
    result.push({ label: start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), pages })
  }
  return result
}

function computeFavoriteHour(sessions) {
  if (!sessions.length) return null
  const hours = Array(24).fill(0)
  sessions.forEach(s => { hours[new Date(s.session_at).getHours()]++ })
  const max = Math.max(...hours)
  const h   = hours.indexOf(max)
  if (h >= 5  && h < 12) return { label: 'Le matin',     icon: '🌅', h }
  if (h >= 12 && h < 17) return { label: "L'après-midi", icon: '☀️', h }
  if (h >= 17 && h < 22) return { label: 'Le soir',      icon: '🌆', h }
  return { label: 'La nuit', icon: '🌙', h }
}

function computeLevel(booksRead, pagesRead) {
  const score = booksRead * 10 + Math.floor(pagesRead / 100)
  if (score < 10)  return { name: 'Débutant',     icon: '📖', next: 10,  score, color: '#6b6560' }
  if (score < 30)  return { name: 'Lecteur',       icon: '📚', next: 30,  score, color: '#2980b9' }
  if (score < 60)  return { name: 'Passionné',     icon: '🔥', next: 60,  score, color: '#27ae60' }
  if (score < 100) return { name: 'Bibliophile',   icon: '🏆', next: 100, score, color: '#e67e22' }
  return             { name: 'Érudit',             icon: '⭐', next: null, score, color: '#c0392b' }
}
