import type { ReactNode } from "react"

interface PreSatoriProps {
  children: (transform: (element: ReactNode) => ReactNode) => ReactNode
}

/**
 * PreSatori utility for wrapping React components that will be converted to images
 * This is a simple pass-through component that allows for future Satori integration
 */
export function PreSatori({ children }: PreSatoriProps) {
  // Simple transform function that returns the element as-is
  const transform = (element: ReactNode) => element

  return <>{children(transform)}</>
}
