import { fireEvent } from '@testing-library/dom'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import '@renderer/i18n/config'

import { ThemeToggle } from './ThemeToggle'
import { createAppStore } from '@renderer/store'

const renderWithStore = () => {
  const store = createAppStore()

  const utils = render(
    <Provider store={store}>
      <ThemeToggle />
    </Provider>
  )

  return { store, ...utils }
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggles the theme mode in the store', () => {
    const { getByRole, store } = renderWithStore()

    const toggle = getByRole('switch')
    expect(store.getState().theme.mode).toBe('light')

    fireEvent.click(toggle)
    expect(store.getState().theme.mode).toBe('dark')

    fireEvent.click(toggle)
    expect(store.getState().theme.mode).toBe('light')
  })
})
