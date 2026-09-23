import { describe, expect, it } from 'vitest'
import { equals, fraction } from './fraction'
import { meter } from './meter'
import {
  isWellFormed,
  measureCount,
  onsetsOf,
  pattern,
  sameRhythm,
  voicesOf,
  type Onset,
  type Voice,
} from './pattern'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)
const TIERS_DE_BLANCHE = fraction(1, 6) // un temps de triolet en 4/4

const frappe = (at: [number, number], duration = NOIRE, voice: Voice = 'kick'): Onset => ({
  at: fraction(...at),
  duration,
  voice,
})

describe('construction', () => {
  it('trie les attaques, quel que soit l’ordre de saisie', () => {
    const p = pattern({
      meter: meter(4, 4),
      onsets: [frappe([1, 2]), frappe([0, 1]), frappe([1, 4])],
    })
    expect(p.onsets.map((o) => o.at)).toEqual([fraction(0), fraction(1, 4), fraction(1, 2)])
  })

  it('donne une mesure de long par défaut', () => {
    expect(pattern({ meter: meter(3, 4), onsets: [] }).length).toEqual(fraction(3, 4))
  })

  it('refuse une durée ou une position absurde', () => {
    const m = meter(4, 4)
    expect(() => pattern({ meter: m, onsets: [frappe([0, 1], fraction(0))] })).toThrow(RangeError)
    expect(() => pattern({ meter: m, onsets: [frappe([-1, 4])] })).toThrow(RangeError)
    expect(() => pattern({ meter: m, onsets: [frappe([1, 1])] })).toThrow(RangeError)
  })

  it('refuse qu’une attaque déborde la fin du motif', () => {
    expect(() =>
      pattern({ meter: meter(4, 4), onsets: [frappe([7, 8], NOIRE)] }),
    ).toThrow(/dépasse la fin/)
  })
})

describe('chevauchements', () => {
  it('refuse deux attaques simultanées dans la même voix', () => {
    expect(() =>
      pattern({
        meter: meter(4, 4),
        onsets: [frappe([0, 1], NOIRE, 'kick'), frappe([1, 8], CROCHE, 'kick')],
      }),
    ).toThrow(/chevauchent/)
  })

  it('autorise la superposition entre voix — c’est la polyrythmie', () => {
    // Trois contre deux sur un temps de 4/4 : la grosse caisse divise en deux,
    // le charleston en trois. Les deux voix se croisent sans se contredire.
    const p = pattern({
      meter: meter(4, 4),
      length: fraction(1, 2),
      onsets: [
        frappe([0, 1], NOIRE, 'kick'),
        frappe([1, 4], NOIRE, 'kick'),
        frappe([0, 1], TIERS_DE_BLANCHE, 'hihat'),
        frappe([1, 6], TIERS_DE_BLANCHE, 'hihat'),
        frappe([1, 3], TIERS_DE_BLANCHE, 'hihat'),
      ],
    })
    // À position égale, le tri départage par nom de voix : hihat avant kick.
    expect(voicesOf(p)).toEqual(['hihat', 'kick'])
    expect(onsetsOf(p, 'hihat')).toHaveLength(3)
  })
})

describe('longueur et mesures', () => {
  it('représente un silence final, que la dernière attaque ignore', () => {
    // Une noire puis trois temps de silence : sans longueur explicite, le
    // silence final serait perdu.
    const p = pattern({ meter: meter(4, 4), onsets: [frappe([0, 1])] })
    expect(p.length).toEqual(fraction(1))
    expect(isWellFormed(p)).toBe(true)
  })

  it('compte les deux mesures d’une clave', () => {
    const p = pattern({
      meter: meter(4, 4),
      length: fraction(2),
      style: 'clave',
      onsets: [
        // Clave son 3-2 : trois attaques sur la première mesure, deux sur la seconde.
        frappe([0, 1], CROCHE, 'clave'),
        frappe([3, 8], CROCHE, 'clave'),
        frappe([3, 4], CROCHE, 'clave'),
        frappe([5, 4], CROCHE, 'clave'),
        frappe([3, 2], CROCHE, 'clave'),
      ],
    })
    expect(measureCount(p)).toEqual(fraction(2))
    expect(isWellFormed(p)).toBe(true)
    expect(p.style).toBe('clave')
  })

  it('signale un motif qui ne remplit pas ses mesures', () => {
    const p = pattern({ meter: meter(4, 4), length: fraction(3, 4), onsets: [] })
    expect(equals(measureCount(p), fraction(3, 4))).toBe(true)
    expect(isWellFormed(p)).toBe(false)
  })
})

describe('sameRhythm', () => {
  const base = () =>
    pattern({
      meter: meter(2, 4),
      onsets: [frappe([0, 1], CROCHE), frappe([1, 8], CROCHE)],
    })

  it('reconnaît le même rythme saisi dans un autre ordre', () => {
    const inverse = pattern({
      meter: meter(2, 4),
      onsets: [frappe([1, 8], CROCHE), frappe([0, 1], CROCHE)],
    })
    expect(sameRhythm(base(), inverse)).toBe(true)
  })

  it('reconnaît deux écritures équivalentes d’une même position', () => {
    // 2/8 et 1/4 désignent le même point : la normalisation les rend identiques.
    const autre = pattern({
      meter: meter(2, 4),
      onsets: [frappe([0, 2], CROCHE), frappe([2, 16], CROCHE)],
    })
    expect(sameRhythm(base(), autre)).toBe(true)
  })

  it('distingue deux rythmes que seul l’accent sépare', () => {
    const accentue = pattern({
      meter: meter(2, 4),
      onsets: [{ ...frappe([0, 1], CROCHE), accent: true }, frappe([1, 8], CROCHE)],
    })
    expect(sameRhythm(base(), accentue)).toBe(false)
  })

  it('distingue une noire d’une croche suivie d’un silence', () => {
    // Le cas qui justifie que la durée soit explicite : mêmes points d’attaque,
    // rythmes différents à l’écrit comme à l’oreille.
    const noire = pattern({ meter: meter(2, 4), onsets: [frappe([0, 1], NOIRE)] })
    const croche = pattern({ meter: meter(2, 4), onsets: [frappe([0, 1], CROCHE)] })
    expect(sameRhythm(noire, croche)).toBe(false)
  })
})
