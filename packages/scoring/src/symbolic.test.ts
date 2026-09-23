import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'
import { describe, expect, it } from 'vitest'
import { compareRhythms, explain } from './symbolic'

const CROCHE = fraction(1, 8)
const DOUBLE = fraction(1, 16)

const frappe = (at: [number, number], duration = CROCHE, voice: Voice = 'kick'): Onset => ({
  at: fraction(...at),
  duration,
  voice,
})

const motif = (onsets: Onset[]) => pattern({ meter: meter(4, 4), onsets })

/** Une croche sur chacun des quatre temps — de la place pour se tromper. */
const surLesTemps = () =>
  motif([frappe([0, 1]), frappe([1, 4]), frappe([1, 2]), frappe([3, 4])])

describe('compareRhythms', () => {
  it('reconnaît une réponse exacte', () => {
    const d = compareRhythms(surLesTemps(), surLesTemps())
    expect(d.identical).toBe(true)
    expect(d.correct).toHaveLength(4)
    expect(explain(d)).toBe('C’est exactement ça.')
  })

  it('distingue la bonne place de la bonne durée', () => {
    const propose = motif([
      frappe([0, 1], DOUBLE),
      frappe([1, 4]),
      frappe([1, 2]),
      frappe([3, 4]),
    ])
    const d = compareRhythms(surLesTemps(), propose)

    expect(d.wrongDuration).toHaveLength(1)
    expect(d.displaced).toHaveLength(0)
    expect(d.correct).toHaveLength(3)
    expect(explain(d)).toMatch(/pas la bonne durée/)
  })

  it('repère une attaque déplacée', () => {
    // La deuxième croche tombe sur le contretemps au lieu du temps.
    const propose = motif([frappe([0, 1]), frappe([3, 8]), frappe([1, 2]), frappe([3, 4])])
    const d = compareRhythms(surLesTemps(), propose)

    expect(d.displaced).toHaveLength(1)
    expect(d.missing).toHaveLength(0)
    expect(d.extra).toHaveLength(0)
    expect(explain(d)).toMatch(/trop tard/)
  })

  it('ne déclare pas fausse toute la suite quand une attaque manque', () => {
    // Le piège de l’appariement naïf : sans alignement, les deux dernières
    // attaques seraient déclarées déplacées en cascade.
    const propose = motif([frappe([0, 1]), frappe([1, 2]), frappe([3, 4])])
    const d = compareRhythms(surLesTemps(), propose)

    expect(d.missing).toHaveLength(1)
    expect(d.missing[0]!.at).toEqual(fraction(1, 4))
    expect(d.correct).toHaveLength(3)
    expect(explain(d)).toBe('Il manque une attaque.')
  })

  it('compte une attaque de trop', () => {
    const propose = motif([...surLesTemps().onsets, frappe([7, 8])])
    const d = compareRhythms(surLesTemps(), propose)

    expect(d.extra).toHaveLength(1)
    expect(d.correct).toHaveLength(4)
    expect(explain(d)).toBe('Il y a une attaque de trop.')
  })

  it('refuse une réponse de la bonne forme mais de la mauvaise longueur', () => {
    const deuxTemps = [frappe([0, 1]), frappe([1, 4])]
    const d = compareRhythms(
      pattern({ meter: meter(4, 4), onsets: deuxTemps }),
      pattern({ meter: meter(4, 4), length: fraction(1, 2), onsets: deuxTemps }),
    )

    expect(d.correct).toHaveLength(2)
    expect(d.identical).toBe(false)
    expect(explain(d)).toMatch(/bonne longueur/)
  })
})
