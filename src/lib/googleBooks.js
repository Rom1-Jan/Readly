const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY
const BASE    = 'https://www.googleapis.com/books/v1'

export async function searchBooks(query) {
  if (!query.trim()) return []
  const url = `${BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=12&langRestrict=fr${API_KEY ? '&key=' + API_KEY : ''}`
  const res  = await fetch(url)
  const data = await res.json()
  return (data.items || []).map(formatBook)
}

export async function getBook(googleId) {
  const res  = await fetch(`${BASE}/volumes/${googleId}${API_KEY ? '?key=' + API_KEY : ''}`)
  const data = await res.json()
  return formatBook(data)
}

function formatBook(item) {
  const info = item.volumeInfo || {}
  return {
    google_id:   item.id,
    title:       info.title || 'Titre inconnu',
    author:      (info.authors || []).join(', ') || 'Auteur inconnu',
    cover_url:   info.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
    total_pages: info.pageCount || 0,
  }
}
