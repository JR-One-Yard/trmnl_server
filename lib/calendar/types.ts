export type CalEvent = {
  id: string
  title: string
  start: Date // local Australia/Sydney
  end: Date // local Australia/Sydney
  allDay: boolean
  location?: string
  calendar?: string
}
