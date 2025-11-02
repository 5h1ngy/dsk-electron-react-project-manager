import { Select } from 'antd'
import type { JSX } from 'react'

import { LANGUAGE_SELECT_STYLE } from '@renderer/components/LanguageSwitcher.helpers'
import { useLanguageSwitcher } from '@renderer/components/LanguageSwitcher.hooks'
import type { LanguageSwitcherProps } from '@renderer/components/LanguageSwitcher.types'

export const LanguageSwitcher = ({ className, size }: LanguageSwitcherProps = {}): JSX.Element => {
  const { locale, options, ariaLabel, handleChange, defaultSize } = useLanguageSwitcher()

  return (
    <Select
      className={className}
      size={size ?? defaultSize}
      value={locale}
      onChange={handleChange}
      options={options}
      aria-label={ariaLabel}
      popupMatchSelectWidth={false}
      style={LANGUAGE_SELECT_STYLE}
      optionLabelProp="title"
    />
  )
}
