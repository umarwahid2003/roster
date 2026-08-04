import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/Nav'
import DeleteMaterialButton from './DeleteMaterialButton'

export default async function MaterialsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: memberships }
  ] = await Promise.all([
    supabase.from('profiles').select('role').eq('id', user.id).single(),
    supabase.from('course_memberships').select('course_id, courses(name)').eq('user_id', user.id)
  ])

  const isAdmin = profile?.role === 'admin'
  
  const courseIds = (memberships ?? []).map(m => m.course_id)
  
  // Fetch materials for these courses
  let materials: any[] = []
  if (courseIds.length > 0) {
    const { data } = await supabase
      .from('course_materials')
      .select('id, course_id, title, file_path, created_at')
      .in('course_id', courseIds)
      .order('created_at', { ascending: true })
    
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
    <>
      
      <h1>Course Materials</h1>

      {materialsWithUrls.length === 0 ? (
        <p className="muted">You have not joined any courses yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {materialsWithUrls.map((course, index) => (
            <div key={index} className="admin-card stagger-item" style={{ animationDelay: `${(index + 3) * 60}ms`, marginBottom: 0 } as React.CSSProperties}>
              <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                {course.courseName}
              </h2>
              {course.materials.length === 0 ? (
                <p className="no-tasks" style={{ margin: 0 }}>No materials uploaded for this course yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {course.materials.map((mat, i) => (
                    <div 
                      key={mat.id} 
                      className="material-row"
                      style={{ 
                        borderBottom: i < course.materials.length - 1 ? '1px solid var(--border)' : 'none' 
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '15px', color: 'var(--text)' }}>{mat.title}</div>
                        <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                          Added {new Date(mat.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="material-row-actions">
                        <a 
                          href={mat.publicUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}
                        >
                          Download
                        </a>
                        {isAdmin && (
                          <DeleteMaterialButton materialId={mat.id} filePath={mat.file_path} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
