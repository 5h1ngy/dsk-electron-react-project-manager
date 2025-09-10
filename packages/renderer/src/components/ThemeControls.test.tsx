import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { ThemeControls } from '@renderer/components/ThemeControls'
import { createAppStore } from '@renderer/store'

const renderWithStore = () => {
  const store = createAppStore()
  return {
    store,
    ...render(
      <Provider store={store}>
        <ThemeControls />
      </Provider>
    )
  }
}

describe('ThemeControls', () => {
  it('toggles theme mode when switch is used', async () => {
    const { store } = renderWithStore()

    await userEvent.click(screen.getByRole('button', { name: 'Aspetto' }))
    await userEvent.click(screen.getByRole('switch', { name: 'Commuta tema' }))

    expect(store.getState().theme.mode).toBe('dark')
  })

  it('changes accent color on swatch click', async () => {
    const { store } = renderWithStore()

    await userEvent.click(screen.getByRole('button', { name: 'Aspetto' }))
    const swatches = screen.getAllByRole('button', { name: /Opzione colore/ })
    await userEvent.click(swatches[1])

    expect(store.getState().theme.accentColor).not.toBe('#00F5D4')
  })
})
