'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Typewriter from '@/components/Typewriter'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [isIntroDone, setIsIntroDone] = useState(false)

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
      <div className={`spotlight ${isIntroDone ? 'on' : ''}`}></div>
      <div className="title-wordmark wordmark">
        <Typewriter text="roster" speed={110} onDone={() => setIsIntroDone(true)} />
      </div>
      <div className={`tagline ${isIntroDone ? 'show' : ''}`}>never miss what's due</div>
      <div className={`card ${isIntroDone ? 'reveal' : ''}`}>
        <form onSubmit={signIn}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={!isIntroDone}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={!isIntroDone}
          />
          <button type="submit" disabled={!isIntroDone}>Sign in</button>
        </form>
        <p className="muted">
          New here?{' '}
          <button
            type="button"
            onClick={signUp}
            disabled={!isIntroDone}
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