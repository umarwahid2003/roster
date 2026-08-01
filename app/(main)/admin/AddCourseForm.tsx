'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AddCourseForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [term, setTerm] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from('courses').insert({ name, term })
    if (error) {
      setError(error.message)
      return
    }
    setName('')
    setTerm('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Course name, e.g. Linear Algebra"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Term, e.g. Summer 2026"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        required
      />
      <button type="submit">Add course</button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}