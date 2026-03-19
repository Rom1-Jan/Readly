import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const GENRES = [
  'Roman', 'Fantasy', 'Science-Fiction', 'Thriller', 'Policier',
  'Historique', 'Biographie', 'Développement personnel', 'Sciences',
  'Philosophie', 'BD / Manga', 'Jeunesse', 'Humour', 'Poésie',
]

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    supabase.from('profiles').select('*').eq('id', userId).single()
      .then(({ data }) => { setProfile(data); setLoading(false) })
  }, [userId])

  // Mettre à jour le profil
  const updateProfile = useCallback(async (changes) => {
    const { data, error } = await supabase
      .from('profiles').update(changes).eq('id', userId).select().single()
    if (error) throw error
    setProfile(data)
    return data
  }, [userId])

  // Upload avatar
  const uploadAvatar = useCallback(async (file) => {
    const ext  = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars').upload(path, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('avatars').getPublicUrl(path)

    // Ajoute un timestamp pour forcer le refresh du cache
    const url = publicUrl + '?t=' + Date.now()
    await updateProfile({ avatar_url: url })
    return url
  }, [userId, updateProfile])

  // Changer email
  const updateEmail = useCallback(async (newEmail) => {
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) throw error
  }, [])

  // Changer mot de passe
  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }, [])

  return { profile, loading, updateProfile, uploadAvatar, updateEmail, updatePassword }
}

// Helper pour afficher l'avatar (photo ou initiales)
export function getInitials(profile) {
  const str = profile?.username || profile?.email || '?'
  return str.slice(0, 2).toUpperCase()
}

// Couleur déterministe basée sur l'id
export function getAvatarColor(id) {
  const colors = ['#2980b9', '#8a44f2', '#27ae60', '#c96800', '#cc2e26', '#0077a8', '#cc1844']
  if (!id) return colors[0]
  const index = id.charCodeAt(0) % colors.length
  return colors[index]
}
