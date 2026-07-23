import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import DeleteMaterialButton from './DeleteMaterialButton'

export default async function MaterialsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  // Fetch courses user has joined
  const { data: memberships } = await supabase
    .from('course_memberships')
    .select('course_id, courses(name)')
    .eq('user_id', user.id)
  
  const courseIds = (memberships ?? []).map(m => m.course_id)
  
  // Fetch materials for these courses
  let materials: any[] = []
  if (courseIds.length > 0) {
    const { data } = await supabase
      .from('course_materials')
      .select('id, course_id, title, file_path, created_at')
      .in('course_id', courseIds)
      .order('created_at', { ascending: false })
    
    materials = data ?? []
  }

  // Group materials by course
  const courseMaterials: Record<string, { courseName: string, materials: any[] }> = {}
  
  memberships?.forEach(m => {
    courseMaterials[m.course_id] = {
      // @ts-ignore
      courseName: m.courses?.name ?? 'Unknown Course',
      materials: []
    }
  })

  materials.forEach(mat => {
    if (courseMaterials[mat.course_id]) {
      courseMaterials[mat.course_id].materials.push(mat)
    }
  })

  // Get public URLs for each material
  const materialsWithUrls = Object.values(courseMaterials).map(course => {
    return {
      ...course,
      materials: course.materials.map(mat => {
        const { data } = supabase.storage.from('materials').getPublicUrl(mat.file_path)
        return { ...mat, publicUrl: data.publicUrl }
      })
    }
  })

  return (
    <main className="container">
      <Nav isAdmin={isAdmin} />
      
      <h1>Course Materials</h1>

      {materialsWithUrls.length === 0 ? (
        <p className="muted">You have not joined any courses yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {materialsWithUrls.map((course, index) => (
            <div key={index} className="stagger-item" style={{ animationDelay: `${(index + 3) * 60}ms` } as React.CSSProperties}>
              <h2 style={{ marginTop: 0 }}>{course.courseName}</h2>
              {course.materials.length === 0 ? (
                <p className="no-tasks">No materials uploaded for this course yet.</p>
              ) : (
                <ul className="course-tasks-list">
                  {course.materials.map((mat) => (
                    <li key={mat.id} className="course-task-item type-other">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div className="item-title">{mat.title}</div>
                          <div className="item-due">{new Date(mat.created_at).toLocaleDateString()}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <a 
                            href={mat.publicUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="join-btn"
                            style={{ textDecoration: 'none', display: 'inline-block' }}
                          >
                            Download
                          </a>
                          {isAdmin && (
                            <DeleteMaterialButton materialId={mat.id} filePath={mat.file_path} />
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
