'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDueDate } from '@/lib/formatDate'

type Item = {
  id: string
  title: string
  item_type: string
  due_at: string
  course_id: string
  courses: { name: string } | null
}

type Course = { id: string; name: string }

function toLocalInputValue(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ScheduleItemRow({
  item,
  courses,
  delay,
}: {
  item: Item
  courses: Course[]
  delay?: string
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [itemType, setItemType] = useState(item.item_type)
  const [courseId, setCourseId] = useState(item.course_id)
  const [dueAt, setDueAt] = useState(toLocalInputValue(item.due_at))
  const [error, setError] = useState('')

  async function save() {
    setError('')
    const supabase = createClient()
    const { error } = await supabase
      .from('schedule_items')
      .update({
        title,
        item_type: itemType,
        course_id: courseId,
        due_at: new Date(dueAt).toISOString(),
        notified_24h: false,
        notified_1h: false,
      })
      .eq('id', item.id)
    if (error) {
      setError(error.message)
      return
    }
    setEditing(false)
    router.refresh()
  }

  async function remove() {
    if (!confirm(`Delete "${item.title}"? This can't be undone.`)) return
    const supabase = createClient()
    await supabase.from('schedule_items').delete().eq('id', item.id)
    router.refresh()
  }

  if (editing) {
    return (
      <li className={`type-${itemType} stagger-item`} style={{ animationDelay: delay }}>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select value={itemType} onChange={(e) => setItemType(e.target.value)}>
          <option value="assignment">Assignment</option>
          <option value="quiz">Quiz</option>
          <option value="exam">Exam</option>
          <option value="deadline">Deadline</option>
          <option value="other">Other</option>
        </select>
        <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save}>Save</button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' }}
          >
            Cancel
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </li>
    )
  }

  return (
    <li className={`type-${item.item_type} stagger-item`} style={{ animationDelay: delay }}>
      <div className="item-course">{item.courses?.name}</div>
      <div className="item-title">{item.title}</div>
      <div className={`item-badge badge-${item.item_type}`}>
        {item.item_type}
      </div>
      <div className="item-due" style={{ marginTop: 6 }}>Due {formatDueDate(item.due_at)}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', padding: '4px 10px', fontSize: 12 }}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={remove}
          style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '4px 10px', fontSize: 12 }}
        >
          Delete
        </button>
      </div>
    </li>
  )
}