'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function signIn(e: FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
  }

  async function signUp() {
    setError('')
    setInfo('')
    if (!email || !password) {
      setError('Enter an email and password first.')
      return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setInfo('Account created. Click "Sign in" now.')
  }

  return (
    <main className="login-screen">
      <div className="card">
        <div className="brand" style={{ marginBottom: 32, borderRight: 'none', paddingRight: 0 }}>
  <Image src="/icon-192.png" alt="Roster" width={56} height={56} />
</div>
        <h1 style={{ fontSize: 22, marginBottom: 20 }}>Sign in</h1>
        <form onSubmit={signIn}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign in</button>
        </form>
        <p className="muted">
          New here?{' '}
          <button
            type="button"
            onClick={signUp}
            style={{ all: 'unset', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Create account
          </button>
        </p>
        {info && <p className="muted">{info}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </main>
  )
}