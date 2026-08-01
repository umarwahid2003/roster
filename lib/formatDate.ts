export function formatDueDate(iso: string) {
  const utcIso = iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`
  return new Date(utcIso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Karachi',
  })
}