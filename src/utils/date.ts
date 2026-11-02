export const isoDate = (value: string | Date) => {
    const date = typeof value === 'string' ? new Date(value) : value
    const pad = (part: number) => String(part).padStart(2, '0')

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
// "Nov 2, 2026" -> { day: 'Nov 2' }, with the year only when it isn't this year.
export const shortDate = (value: string) => {
    const date = new Date(value)
    const day = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    })
    const year = date.getFullYear()

    return {
        day,
        year: year === new Date().getFullYear() ? undefined : String(year)
    }
}