import { describe, expect, it } from 'vitest'
import { equals, fraction } from './fraction'
import { isCompound, measureLength, meter } from './meter'

describe('meter', () => {
  it('refuse un chiffrage absurde', () => {
    expect(() => meter(0, 4)).toThrow(RangeError)
    expect(() => meter(4, 0)).toThrow(RangeError)
  })

  it('exige qu’un groupement totalise le numérateur', () => {
    expect(meter(7, 8, [2, 2, 3]).grouping).toEqual([2, 2, 3])
    expect(() => meter(7, 8, [2, 2, 2])).toThrow(RangeError)
  })
})

describe('measureLength', () => {
  it('mesure en rondes, indépendamment de l’unité choisie', () => {
    // 4/4 et 2/2 durent la même chose écrite de deux façons.
    expect(equals(measureLength(meter(4, 4)), measureLength(meter(2, 2)))).toBe(true)
    expect(measureLength(meter(4, 4))).toEqual(fraction(1))
  })

  it('donne trois quarts de ronde à un 3/4, et six huitièmes à un 6/8', () => {
    expect(measureLength(meter(3, 4))).toEqual(fraction(3, 4))
    expect(measureLength(meter(6, 8))).toEqual(fraction(3, 4))
  })

  it('confirme que 6/8 et 3/4 durent pareil — seul le groupement diffère', () => {
    expect(equals(measureLength(meter(6, 8)), measureLength(meter(3, 4)))).toBe(true)
  })
})

describe('isCompound', () => {
  it('sépare les mesures simples des composées', () => {
    expect(isCompound(meter(6, 8))).toBe(true)
    expect(isCompound(meter(9, 8))).toBe(true)
    expect(isCompound(meter(3, 4))).toBe(false)
    expect(isCompound(meter(4, 4))).toBe(false)
  })
})
