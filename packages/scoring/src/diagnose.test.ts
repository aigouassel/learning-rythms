import { describe, expect, it } from 'vitest'
import { diagnose } from './diagnose'
import { analyseTiming } from './timing'

const GRILLE = [0, 1, 2, 3, 4, 5, 6, 7]
const frappes = (f: (t: number) => number) => GRILLE.map((t) => ({ at: t + f(t) / 1000 }))

const genres = (taps: { at: number }[]) => diagnose(analyseTiming(GRILLE, taps)).map((c) => c.kind)

describe('diagnose', () => {
  it('félicite une exécution en place', () => {
    expect(genres(frappes(() => 0))).toEqual(['juste'])
  })

  it('distingue celle qui accélère de celle qui est instable', () => {
    expect(genres(frappes((t) => -8 * t))).toContain('derive')
    expect(genres(frappes((t) => (t % 2 === 0 ? 45 : -45)))).toContain('dispersion')
  })

  it('ne confond pas un biais matériel avec une faute', () => {
    const constats = diagnose(analyseTiming(GRILLE, frappes(() => 40)))
    expect(constats.map((c) => c.kind)).toEqual(['decalage'])
    expect(constats[0]!.severity).toBe('info')
    expect(constats[0]!.message).toMatch(/calibration/)
  })

  it('range le plus important d’abord', () => {
    // Une dérive franche et un biais de 45 ms : la dérive est la vraie faute,
    // le biais n’est qu’un renseignement sur le matériel.
    const constats = diagnose(analyseTiming(GRILLE, frappes((t) => 80 - 10 * t)))
    expect(constats[0]!.kind).toBe('derive')
    expect(constats.at(-1)!.kind).toBe('decalage')
  })

  it('signale ce qui manque', () => {
    const taps = frappes(() => 0).filter((_, i) => i !== 2 && i !== 5)
    expect(genres(taps)).toContain('manques')
  })
})
