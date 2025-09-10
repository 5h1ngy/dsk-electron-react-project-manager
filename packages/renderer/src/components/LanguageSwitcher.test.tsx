import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LanguageSwitcher } from '@renderer/components/LanguageSwitcher'
import { changeLocale, selectLocale, selectSupportedLocales } from '@renderer/store/slices/locale'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'

jest.mock('@renderer/store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn()
}))

jest.mock('@renderer/store/slices/locale', () => ({
  changeLocale: jest.fn(),
  selectLocale: jest.fn(),
  selectSupportedLocales: jest.fn()
}))

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { index?: number }) =>
      options?.index ? `${key}-${options.index}` : key
  })
}))

const selectRenderer = jest.fn(
  ({
    value,
    onChange,
    options,
    ...rest
  }: {
    value: string
    onChange: (value: string) => void
    options: Array<{ value: string; title: string }>
    [key: string]: unknown
  }) => (
    <select
      data-testid="language-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={rest['aria-label'] as string}
    >
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.title}
        </option>
      ))}
    </select>
  )
)

jest.mock('antd', () => ({
  Select: (props: Parameters<typeof selectRenderer>[0]) => selectRenderer(props)
}))

describe('LanguageSwitcher', () => {
  const dispatch = jest.fn()

  const renderComponent = () => {
    ;(useAppDispatch as jest.Mock).mockReturnValue(dispatch)
    ;(useAppSelector as jest.Mock).mockImplementation((selector) => {
      if (selector === selectLocale) {
        return 'it'
      }
      return undefined
    })
    ;(selectSupportedLocales as jest.Mock).mockReturnValue(['it', 'en', 'de'])
    ;(changeLocale as jest.Mock).mockImplementation((locale: string) => ({
      type: 'locale/change',
      payload: locale
    }))

    return render(<LanguageSwitcher />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows the current locale as the active value', () => {
    renderComponent()

    expect(screen.getByTestId('language-select')).toHaveValue('it')
    expect(selectSupportedLocales).toHaveBeenCalled()
  })

  it('dispatches a changeLocale action when another locale is selected', async () => {
    renderComponent()

    await userEvent.selectOptions(screen.getByTestId('language-select'), 'en')

    expect(changeLocale).toHaveBeenCalledWith('en')
    expect(dispatch).toHaveBeenCalledWith({ type: 'locale/change', payload: 'en' })
  })
})
