'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Course = { id: string; name: string }

export default function AddMaterialForm({ courses }: { courses: Course[] }) {
  const router = useRouter()
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload')
      return
    }
    
    setError('')
    setIsUploading(true)
    const supabase = createClient()
    
    // Create a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `${courseId}/${fileName}`

    // 1. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filePath, file)

    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`)
      setIsUploading(false)
      return
    }

    // 2. Save metadata to course_materials table
    const { error: dbError } = await supabase.from('course_materials').insert({
      course_id: courseId,
      title,
      file_path: filePath
    })

    if (dbError) {
      setError(`Database error: ${dbError.message}`)
      setIsUploading(false)
      return
    }

    setTitle('')
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
        placeholder="Material Title, e.g. Week 1 Lecture Slides"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        accept=".pdf,.doc,.docx,.ppt,.pptx"
        required
      />
      <button type="submit" disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload Material'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
