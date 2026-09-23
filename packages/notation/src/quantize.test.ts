import { fraction, meter, sameRhythm, toNumber } from '@rythmes/core'
import { describe, expect, it } from 'vitest'
import { quantize } from './quantize'

const enQuatreQuarts = (positions: number[], length = fraction(1)) =>
  quantize({ positions, meter: meter(4, 4), length })

describe('quantize', () => {
  it('retrouve une frappe exacte sans rien coûter', () => {
    const [meilleur] = enQuatreQuarts([0, 0.25, 0.5, 0.75])
    expect(meilleur!.cost).toBeCloseTo(0)
    expect(meilleur!.label).toBe('en noires')
    expect(meilleur!.pattern.onsets).toHaveLength(4)
  })

  it('pardonne une frappe approximative', () => {
    // Quelques millièmes de ronde d’écart : la grille des noires reste la
    // lecture la moins coûteuse.
    const [meilleur] = enQuatreQuarts([0.004, 0.26, 0.49, 0.752])
    expect(meilleur!.label).toBe('en noires')
    expect(meilleur!.cost).toBeLessThan(0.03)
  })

  it('préfère le triolet quand c’est lui qu’on a joué', () => {
    // Trois frappes régulières dans un temps : aucune grille binaire ne les
    // explique sans coût.
    const candidats = quantize({
      positions: [0, 1 / 12, 2 / 12],
      meter: meter(4, 4),
      length: fraction(1, 4),
    })
    expect(candidats[0]!.label).toMatch(/triolets/)
    expect(candidats[0]!.cost).toBeCloseTo(0)
  })

  it('propose plusieurs lectures quand la frappe est ambiguë', () => {
    // À mi-chemin entre deux croches et un triolet : il faut choisir, et c’est
    // justement ce qu’on demande à l’élève.
    const candidats = quantize({
      positions: [0, 0.1, 0.2],
      meter: meter(4, 4),
      length: fraction(1, 2),
    })
    expect(candidats.length).toBeGreaterThan(1)
    expect(candidats[0]!.cost).toBeLessThanOrEqual(candidats[1]!.cost)
  })

  it('ne propose jamais deux fois le même rythme', () => {
    // Des noires tombent aussi bien sur la grille des croches : la même
    // réponse ne doit pas occuper deux places dans la liste.
    const candidats = enQuatreQuarts([0, 0.25, 0.5, 0.75])
    for (let i = 1; i < candidats.length; i++) {
      expect(sameRhythm(candidats[0]!.pattern, candidats[i]!.pattern)).toBe(false)
    }
  })

  it('ne laisse jamais deux frappes tomber au même endroit', () => {
    // Deux frappes très rapprochées : les écraser l’une sur l’autre ferait
    // disparaître une attaque que l’élève a bel et bien jouée.
    const [meilleur] = enQuatreQuarts([0, 0.01, 0.5])
    const places = meilleur!.pattern.onsets.map((o) => toNumber(o.at))
    expect(new Set(places).size).toBe(places.length)
  })

  it('remplit le motif jusqu’au bout', () => {
    const [meilleur] = enQuatreQuarts([0, 0.5])
    const derniere = meilleur!.pattern.onsets.at(-1)!
    expect(toNumber(derniere.at) + toNumber(derniere.duration)).toBeCloseTo(1)
  })

  it('ne rend rien pour une absence de frappe', () => {
    expect(enQuatreQuarts([])).toEqual([])
  })
})
