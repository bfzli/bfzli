export const initials = (name: string) =>
    name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

// Splits `backtick` spans out of plain text so they can render as inline code.
export const codeSegments = (text: string) =>
    text
        .split(/`([^`]+)`/)
        .map((part, index) => ({ text: part, code: index % 2 === 1 }))
        .filter((segment) => segment.text)