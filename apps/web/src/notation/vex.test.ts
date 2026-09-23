import { fraction } from '@rythmes/core'
import { figure, type Written } from '@rythmes/notation'
import { describe, expect, it } from 'vitest'
import { isBeamable, span, toVexPitch, vexDuration, vexKeys } from './vex'

describe('vexDuration', () => {
  it('traduit les figures françaises en codes VexFlow', () => {
    expect(vexDuration(figure('ronde'), false)).toBe('w')
    expect(vexDuration(figure('noire'), false)).toBe('q')
    expect(vexDuration(figure('croche'), false)).toBe('8')
    expect(vexDuration(figure('double'), false)).toBe('16')
  })

  it('suffixe les silences', () => {
    expect(vexDuration(figure('noire'), true)).toBe('qr')
  })

  it('ignore les points, que VexFlow attache séparément', () => {
    expect(vexDuration(figure('noire', 1), false)).toBe('q')
  })
})

describe('isBeamable', () => {
  it('ne ligature que les figures à crochet', () => {
    expect(isBeamable(figure('croche'))).toBe(true)
    expect(isBeamable(figure('double'))).toBe(true)
    expect(isBeamable(figure('noire'))).toBe(false)
    expect(isBeamable(figure('blanche'))).toBe(false)
  })
})

describe('hauteurs', () => {
  it('transcrit sans interpréter', () => {
    expect(toVexPitch('C4')).toBe('c/4')
    expect(toVexPitch('Eb4')).toBe('eb/4')
    expect(toVexPitch('F#3')).toBe('f#/3')
  })

  it('refuse ce qu’elle ne sait pas lire', () => {
    expect(() => toVexPitch('do4')).toThrow(RangeError)
  })

  it('pose la percussion sur la ligne unique', () => {
    const note: Written = {
      kind: 'note',
      figure: figure('noire'),
      at: fraction(0),
      duration: fraction(1, 4),
      tied: false,
    }
    expect(vexKeys(note)).toEqual(['b/4'])
    expect(vexKeys({ ...note, pitch: 'Eb4' })).toEqual(['eb/4'])
  })
})

describe('span', () => {
  it('donne l’intervalle occupé, pour savoir quoi allumer', () => {
    const note: Written = {
      kind: 'note',
      figure: figure('croche'),
      at: fraction(1, 4),
      duration: fraction(1, 8),
      tied: false,
    }
    expect(span(note)).toEqual({ start: 0.25, end: 0.375 })
  })
})
