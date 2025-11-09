import type { SupportedLanguage } from '../i18n/language'

export interface HeroCta {
  label: string
  href: string
}

export interface HeroStat {
  label: string
  value: string
}

export interface HeroContent {
  eyebrow: string
  title: string
  description: string
  heroShot: string
  primaryCta: HeroCta
  secondaryCta: HeroCta
  stats: HeroStat[]
}

export interface ControlCopy {
  displayLabel: string
  languageLabel: string
  accentLabel: string
}

export interface LanguageOption {
  label: string
  value: SupportedLanguage
}
