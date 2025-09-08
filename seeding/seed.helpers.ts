import type { Faker } from '@faker-js/faker'

export type WeightedValue<T> = { value: T; weight: number }

export const capitalize = (value: string): string => {
  if (!value) {
    return value
  }
  return value[0].toUpperCase() + value.slice(1)
}

export const stripAccents = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')

export const formatIsoDate = (date: Date): string => date.toISOString().slice(0, 10)

export const pickWeighted = <T>(random: Faker, values: ReadonlyArray<WeightedValue<T>>): T =>
  (random.helpers.weightedArrayElement(values) as WeightedValue<T>).value
