import { fraction } from '@rythmes/core'
import { describe, expect, it } from 'vitest'
import { figure, figureDuration, figureFor, restName } from './figure'

describe('figureDuration', () => {
  it('divise par deux à chaque figure', () => {
    expect(figureDuration(figure('ronde'))).toEqual(fraction(1))
    expect(figureDuration(figure('blanche'))).toEqual(fraction(1, 2))
    expect(figureDuration(figure('noire'))).toEqual(fraction(1, 4))
    expect(figureDuration(figure('croche'))).toEqual(fraction(1, 8))
    expect(figureDuration(figure('double'))).toEqual(fraction(1, 16))
  })

  it('ajoute la moitié à chaque point', () => {
    expect(figureDuration(figure('noire', 1))).toEqual(fraction(3, 8))
    expect(figureDuration(figure('croche', 1))).toEqual(fraction(3, 16))
    expect(figureDuration(figure('noire', 2))).toEqual(fraction(7, 16))
  })

  it('resserre trois croches dans la place de deux', () => {
    const trioletDeCroches = figure('croche', 0, { count: 3, inSpaceOf: 2 })
    expect(figureDuration(trioletDeCroches)).toEqual(fraction(1, 12))
  })

  it('remplit exactement un temps avec un triolet de croches', () => {
    // Le test que les flottants échouent : trois douzièmes font un quart, pile.
    const t = figureDuration(figure('croche', 0, { count: 3, inSpaceOf: 2 }))
    const temps = [t, t, t].reduce((a, b) => fraction(a.num * b.den + b.num * a.den, a.den * b.den))
    expect(temps).toEqual(fraction(1, 4))
  })
})

describe('figureFor', () => {
  it('retrouve les figures nues', () => {
    expect(figureFor(fraction(1, 4))).toEqual(figure('noire'))
    expect(figureFor(fraction(1, 16))).toEqual(figure('double'))
  })

  it('préfère une figure pointée à un assemblage', () => {
    expect(figureFor(fraction(3, 8))).toEqual(figure('noire', 1))
  })

  it('reconnaît un triolet quand rien de plus simple ne convient', () => {
    expect(figureFor(fraction(1, 12))).toEqual(
      figure('croche', 0, { count: 3, inSpaceOf: 2 }),
    )
  })

  it('renvoie null pour une durée qu’aucun signe ne porte seul', () => {
    // Cinq doubles : correct musicalement, mais cela s’écrit avec une liaison.
    expect(figureFor(fraction(5, 16))).toBeNull()
  })
})

describe('restName', () => {
  it('nomme les silences par leur série propre', () => {
    expect(restName('noire')).toBe('soupir')
    expect(restName('croche')).toBe('demi-soupir')
    expect(restName('ronde')).toBe('pause')
  })
})
