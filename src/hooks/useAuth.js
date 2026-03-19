import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: l } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => l.subscription.unsubscribe()
  }, [])

  const login    = (e, p) => supabase.auth.signInWithPassword({ email: e, password: p }).then(({ error }) => { if (error) throw error })
  const register = (e, p) => supabase.auth.signUp({ email: e, password: p }).then(({ error }) => { if (error) throw error })
  const logout   = ()     => supabase.auth.signOut()

  return { user, loading, login, register, logout }
}
