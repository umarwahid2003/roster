'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Course = { id: string; name: string }

export default function AddItemForm({ courses }: { courses: Course[] }) {
  const router = useRouter()
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [itemType, setItemType] = useState('assignment')
  const [dueAt, setDueAt] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('schedule_items').insert({
      course_id: courseId,
      title,
      item_type: itemType,
      due_at: new Date(dueAt).toISOString(),
      created_by: user?.id,
    })
    if (error) {
      setError(error.message)
      return
    }
    setTitle('')
    setDueAt('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Title, e.g. Quiz 2 - chapters 4 and 5"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
        <option value="assignment">Assignment</option>
        <option value="quiz">Quiz</option>
        <option value="exam">Exam</option>
        <option value="deadline">Deadline</option>
        <option value="other">Other</option>
      </select>
      <input
        type="datetime-local"
        value={dueAt}
        onChange={(e) => setDueAt(e.target.value)}
        required
      />
      <button type="submit">Add to schedule</button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
