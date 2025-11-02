/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'

interface ShellHeaderContextValue {
  setHeader: (content: ReactNode) => void
}

const ShellHeaderContext = createContext<ShellHeaderContextValue | null>(null)

export const ShellHeaderProvider = ({
  children,
  onHeaderChange
}: {
  children: ReactNode
  onHeaderChange: (content: ReactNode) => void
}) => {
  const value = useMemo<ShellHeaderContextValue>(
    () => ({
      setHeader: onHeaderChange
    }),
    [onHeaderChange]
  )

  return <ShellHeaderContext.Provider value={value}>{children}</ShellHeaderContext.Provider>
}

export const useShellHeaderContext = (): ShellHeaderContextValue => {
  const context = useContext(ShellHeaderContext)
  if (!context) {
    throw new Error('Shell header context is not available outside of the Shell component.')
  }
  return context
}

export const ShellHeaderPortal = ({ children }: { children: ReactNode | null }) => {
  const { setHeader } = useShellHeaderContext()

  useEffect(() => {
    setHeader(children)
    return () => {
      setHeader(null)
    }
  }, [children, setHeader])

  return null
}
