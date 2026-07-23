export const COURSE_SLOTS: Record<string, string> = {
  'Software Engineering': 'Mon,Wed 9-12',
  'Multivariable Calculus': 'Mon,Wed 3-6',
  'MVC': 'Mon,Wed 3-6',
  'Virtualization and Cloud Computing': 'Mon,Wed 12-3',
  'Virualizaition and Cloud Computing': 'Mon,Wed 12-3',
}

export function getCourseSlot(courseName: string): string | null {
  const normalizedName = courseName.toLowerCase();
  for (const key in COURSE_SLOTS) {
    if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
      return COURSE_SLOTS[key] || null;
    }
  }
  return null;
}
