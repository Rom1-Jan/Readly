import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFriends(userId) {
  const [friendships, setFriendships] = useState([])
  const [profiles,    setProfiles]    = useState({}) // id -> profile
  const [loading,     setLoading]     = useState(true)

  // Charger les friendships + profils associés
  useEffect(() => {
    if (!userId) return
    setLoading(true)

    supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .then(async ({ data: fs, error }) => {
        if (error) { setLoading(false); return }
        setFriendships(fs || [])

        // Charger les profils des autres
        const ids = (fs || []).map(f => f.requester_id === userId ? f.addressee_id : f.requester_id)
        if (ids.length > 0) {
          const { data: profs } = await supabase.from('profiles').select('*').in('id', ids)
          const map = {}
          ;(profs || []).forEach(p => { map[p.id] = p })
          setProfiles(map)
        }
        setLoading(false)
      })

    // Realtime
    const sub = supabase
      .channel('friendships-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, async payload => {
        const f = payload.new || payload.old
        if (!f || (f.requester_id !== userId && f.addressee_id !== userId)) return

        if (payload.eventType === 'INSERT') {
          setFriendships(p => [...p, payload.new])
          // Charger le profil de l'autre
          const otherId = payload.new.requester_id === userId ? payload.new.addressee_id : payload.new.requester_id
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', otherId).single()
          if (prof) setProfiles(p => ({ ...p, [prof.id]: prof }))
        }
        if (payload.eventType === 'UPDATE') setFriendships(p => p.map(x => x.id === payload.new.id ? payload.new : x))
        if (payload.eventType === 'DELETE') setFriendships(p => p.filter(x => x.id !== payload.old.id))
      })
      .subscribe()

    return () => supabase.removeChannel(sub)
  }, [userId])

  // Amis acceptés
  const friends = friendships
    .filter(f => f.status === 'accepted')
    .map(f => {
      const friendId = f.requester_id === userId ? f.addressee_id : f.requester_id
      return { friendship: f, profile: profiles[friendId], friendId }
    })

  // Demandes reçues en attente
  const pendingReceived = friendships
    .filter(f => f.status === 'pending' && f.addressee_id === userId)
    .map(f => ({ friendship: f, profile: profiles[f.requester_id] }))

  // Demandes envoyées en attente
  const pendingSent = friendships
    .filter(f => f.status === 'pending' && f.requester_id === userId)
    .map(f => ({ friendship: f, profile: profiles[f.addressee_id] }))

  // Rechercher un utilisateur
  const searchUsers = useCallback(async (query) => {
    if (!query.trim()) return []
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`email.ilike.%${query}%,username.ilike.%${query}%`)
      .neq('id', userId)
      .limit(10)
    return data || []
  }, [userId])

  // Envoyer une demande
  const sendRequest = useCallback(async (addresseeId) => {
    const { error } = await supabase.from('friendships').insert({
      requester_id: userId, addressee_id: addresseeId, status: 'pending',
    })
    if (error) throw error
  }, [userId])

  // Accepter une demande
  const acceptRequest = useCallback(async (friendshipId) => {
    const { data, error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
      .select()
      .single()
    if (error) throw error
    setFriendships(p => p.map(f => f.id === friendshipId ? { ...f, status: 'accepted' } : f))
    if (data) {
      const otherId = data.requester_id === userId ? data.addressee_id : data.requester_id
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', otherId).single()
      if (prof) setProfiles(p => ({ ...p, [prof.id]: prof }))
    }
  }, [userId, profiles])

  // Refuser / supprimer
  const declineOrRemove = useCallback(async (friendshipId) => {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)
    if (error) throw error
    setFriendships(p => p.filter(f => f.id !== friendshipId))
  }, [])

  // Statut avec un user
  const getFriendshipStatus = useCallback((targetId) => {
    const f = friendships.find(x =>
      (x.requester_id === userId && x.addressee_id === targetId) ||
      (x.addressee_id === userId && x.requester_id === targetId)
    )
    if (!f) return null
    return { ...f, isMine: f.requester_id === userId }
  }, [friendships, userId])

  return {
    friends, pendingReceived, pendingSent, loading,
    searchUsers, sendRequest, acceptRequest, declineOrRemove, getFriendshipStatus,
  }
}

// Charger les livres et sessions d'un ami
export async function loadFriendData(friendId) {
  const [{ data: books }, { data: sessions }] = await Promise.all([
    supabase.from('books').select('*').eq('user_id', friendId).order('updated_at', { ascending: false }),
    supabase.from('reading_sessions').select('*').eq('user_id', friendId),
  ])
  return { books: books || [], sessions: sessions || [] }
}
