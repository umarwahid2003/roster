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
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let filePath = null

    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const uploadPath = `assignments/${courseId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(uploadPath, file)

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        setIsUploading(false)
        return
      }
      filePath = uploadPath
    }

    const { error: dbError } = await supabase.from('schedule_items').insert({
      course_id: courseId,
      title,
      item_type: itemType,
      due_at: new Date(dueAt).toISOString(),
      created_by: user?.id,
      file_path: filePath
    })
    
    if (dbError) {
      setError(`Database error: ${dbError.message}`)
      setIsUploading(false)
      return
    }
    
    setTitle('')
    setDueAt('')
    setFile(null)
    setIsUploading(false)
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '12px', color: 'var(--muted)', paddingLeft: '2px' }}>Attachment (Optional)</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
        />
      </div>
      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Adding...' : 'Add to schedule'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
