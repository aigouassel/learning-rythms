import { describe, expect, it } from 'vitest'
import { add, compare, div, equals, fraction, mul, sub, toNumber, toString } from './fraction'

describe('fraction', () => {
  it('réduit à la construction', () => {
    expect(fraction(2, 4)).toEqual(fraction(1, 2))
    expect(fraction(6, 3)).toEqual(fraction(2, 1))
  })

  it('porte le signe sur le numérateur', () => {
    expect(fraction(1, -2)).toEqual(fraction(-1, 2))
    expect(fraction(-1, -2)).toEqual(fraction(1, 2))
  })

  it('refuse un dénominateur nul et les non-entiers', () => {
    expect(() => fraction(1, 0)).toThrow(RangeError)
    expect(() => fraction(0.5, 1)).toThrow(RangeError)
  })
})

describe('arithmétique', () => {
  it('additionne un triolet jusqu’à exactement un temps', () => {
    // La raison d’être de tout ce fichier : en flottants, cette somme vaut
    // 0.9999999999999998 et le triolet ne remplit pas son temps.
    const tiers = fraction(1, 3)
    expect(add(add(tiers, tiers), tiers)).toEqual(fraction(1))
  })

  it('remplit une mesure de quatre noires', () => {
    const noire = fraction(1, 4)
    const mesure = [noire, noire, noire, noire].reduce(add)
    expect(equals(mesure, fraction(1))).toBe(true)
  })

  it('soustrait, multiplie et divise', () => {
    expect(sub(fraction(3, 4), fraction(1, 4))).toEqual(fraction(1, 2))
    expect(mul(fraction(1, 2), fraction(2, 3))).toEqual(fraction(1, 3))
    expect(div(fraction(1, 2), fraction(1, 4))).toEqual(fraction(2))
  })

  it('refuse la division par zéro', () => {
    expect(() => div(fraction(1), fraction(0))).toThrow(RangeError)
  })
})

describe('comparaison', () => {
  it('ordonne des fractions de dénominateurs différents', () => {
    expect(compare(fraction(1, 3), fraction(1, 2))).toBeLessThan(0)
    expect(compare(fraction(2, 3), fraction(1, 2))).toBeGreaterThan(0)
    expect(compare(fraction(2, 4), fraction(1, 2))).toBe(0)
  })

  it('distingue égalité structurelle et égalité numérique', () => {
    // Deux écritures du même point : normalisées, elles sont le même objet.
    expect(equals(fraction(3, 6), fraction(1, 2))).toBe(true)
  })
})

describe('sorties', () => {
  it('convertit vers le continu et vers le texte', () => {
    expect(toNumber(fraction(1, 4))).toBeCloseTo(0.25)
    expect(toString(fraction(1, 3))).toBe('1/3')
    expect(toString(fraction(2, 1))).toBe('2')
  })
})
