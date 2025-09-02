import { fireEvent, render } from '@testing-library/react'
import { ThemeToggle } from './ThemeToggle'
import { useThemeStore } from '../store/themeStore'

describe('ThemeToggle', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: 'light' })
    localStorage.clear()
  })

  it('toggles the theme store value', () => {
    const { getByRole } = render(<ThemeToggle />)

    const toggle = getByRole('switch')
    expect(useThemeStore.getState().mode).toBe('light')

    fireEvent.click(toggle)
    expect(useThemeStore.getState().mode).toBe('dark')

    fireEvent.click(toggle)
    expect(useThemeStore.getState().mode).toBe('light')
  })
})
