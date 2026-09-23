import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'
import { describe, expect, it } from 'vitest'
import { engraveVoice } from './engrave'
import { spoken, syllabize } from './syllable'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)
const DOUBLE = fraction(1, 16)

const frappe = (at: [number, number], duration = NOIRE, voice: Voice = 'kick'): Onset => ({
  at: fraction(...at),
  duration,
  voice,
})

const dire = (onsets: Onset[], m = meter(2, 4), length?: [number, number]): string =>
  spoken(
    engraveVoice(
      pattern({ meter: m, onsets, ...(length ? { length: fraction(...length) } : {}) }),
      'kick',
    ),
  )

describe('syllabize', () => {
  it('dit ta sur les noires', () => {
    expect(dire([frappe([0, 1]), frappe([1, 4])])).toBe('ta ta')
  })

  it('dit ti sur les croches', () => {
    expect(
      dire([frappe([0, 1], CROCHE), frappe([1, 8], CROCHE), frappe([1, 4], NOIRE)]),
    ).toBe('ti ti ta')
  })

  it('alterne ti et ka sur les doubles d’un même temps', () => {
    const doubles = [0, 1, 2, 3].map((i) => frappe([i, 16], DOUBLE))
    expect(dire([...doubles, frappe([1, 4], NOIRE)])).toBe('ti ka ti ka ta')
  })

  it('étire la syllabe des valeurs longues', () => {
    expect(dire([frappe([0, 1], fraction(1, 2))], meter(2, 4))).toBe('ta-a')
    expect(dire([frappe([0, 1], fraction(1))], meter(4, 4))).toBe('ta-a-a-a')
  })
})

describe('ce qui ne se prononce pas', () => {
  it('laisse les silences muets', () => {
    const s = syllabize(
      engraveVoice(pattern({ meter: meter(2, 4), onsets: [frappe([0, 1])] }), 'kick'),
    )
    expect(s.map((x) => x.syllable)).toEqual(['ta', null])
  })

  it('ne redit pas la suite d’une liaison', () => {
    // Une syncope : une seule attaque, donc une seule syllabe, portée par le
    // premier signe des deux.
    const s = syllabize(
      engraveVoice(
        pattern({ meter: meter(2, 4), length: fraction(1, 2), onsets: [frappe([1, 8], NOIRE)] }),
        'kick',
      ),
    )
    expect(s.map((x) => x.syllable)).toEqual([null, 'ti', null, null])
  })

  it('se tait sur ce qui sort du vocabulaire du module 3', () => {
    // Un triolet de croches : le module 6 le nommera, quand les syllabes
    // auront disparu du cours.
    const tiers = fraction(1, 12)
    const s = syllabize(
      engraveVoice(
        pattern({
          meter: meter(2, 4),
          length: fraction(1, 4),
          onsets: [frappe([0, 1], tiers), frappe([1, 12], tiers), frappe([1, 6], tiers)],
        }),
        'kick',
      ),
    )
    expect(s.every((x) => x.syllable === null)).toBe(true)
  })
})
