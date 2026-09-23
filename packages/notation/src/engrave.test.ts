import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'
import { describe, expect, it } from 'vitest'
import { beatDivisions, engraveVoice, type Written } from './engrave'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)

const frappe = (at: [number, number], duration = NOIRE, voice: Voice = 'kick'): Onset => ({
  at: fraction(...at),
  duration,
  voice,
})

/** Une lecture courte de ce qui est écrit : « noire », « croche liée », « soupir ». */
const lire = (e: Written): string => {
  const nom = e.figure.dots === 1 ? `${e.figure.name} pointée` : e.figure.name
  if (e.kind === 'rest') return `silence de ${nom}`
  return e.tied ? `${nom} liée` : nom
}

const ecrits = (p: Parameters<typeof engraveVoice>[0], v: Voice = 'kick'): string[] =>
  engraveVoice(p, v).beats.flatMap((b) => b.events.map(lire))

describe('beatDivisions', () => {
  it('donne des temps égaux à une mesure simple', () => {
    expect(beatDivisions(meter(4, 4))).toEqual([
      fraction(1, 4),
      fraction(1, 4),
      fraction(1, 4),
      fraction(1, 4),
    ])
  })

  it('groupe par trois une mesure composée — 6/8 a deux temps, pas six', () => {
    expect(beatDivisions(meter(6, 8))).toEqual([fraction(3, 8), fraction(3, 8)])
  })

  it('suit le groupement d’une mesure asymétrique', () => {
    expect(beatDivisions(meter(7, 8, [2, 2, 3]))).toEqual([
      fraction(1, 4),
      fraction(1, 4),
      fraction(3, 8),
    ])
  })
})

describe('gravure d’une voix', () => {
  it('écrit quatre noires en quatre temps', () => {
    const p = pattern({
      meter: meter(4, 4),
      onsets: [frappe([0, 1]), frappe([1, 4]), frappe([1, 2]), frappe([3, 4])],
    })
    expect(engraveVoice(p, 'kick').beats).toHaveLength(4)
    expect(ecrits(p)).toEqual(['noire', 'noire', 'noire', 'noire'])
  })

  it('reconstitue les silences, découpés temps par temps', () => {
    // Une noire, puis rien jusqu’à la fin de la mesure. Les trois temps vides
    // s’écrivent en trois soupirs : un seul signe cacherait la pulsation.
    const p = pattern({ meter: meter(4, 4), onsets: [frappe([0, 1])] })
    expect(ecrits(p)).toEqual(['noire', 'silence de noire', 'silence de noire', 'silence de noire'])
  })

  it('écrit une pause seule pour une mesure entièrement vide', () => {
    // La convention : le signe ne dit plus une durée mais « on ne joue pas ».
    // Un 3/4 vide porte une pause, bien qu’il ne dure pas une ronde.
    const p = pattern({ meter: meter(3, 4), onsets: [] })
    expect(ecrits(p)).toEqual(['silence de ronde'])
  })

  it('laisse entière une note qui commence et s’achève sur un temps', () => {
    // Une blanche au premier temps d’un 4/4 : la découper serait illisible.
    const p = pattern({
      meter: meter(4, 4),
      onsets: [frappe([0, 1], fraction(1, 2)), frappe([1, 2], fraction(1, 2))],
    })
    expect(ecrits(p)).toEqual(['blanche', 'blanche'])
  })

  it('découpe et lie une note qui entre dans un temps par le milieu', () => {
    // Une syncope : attaque sur la deuxième croche, tenue jusqu’au temps suivant.
    // C’est la liaison de prolongation qui la rend lisible.
    const p = pattern({
      meter: meter(4, 4),
      length: fraction(1, 2),
      onsets: [frappe([1, 8], NOIRE)],
    })
    expect(ecrits(p)).toEqual([
      'silence de croche',
      'croche liée',
      'croche',
      'silence de croche',
    ])
  })

  it('écrit une noire pointée d’un seul signe en 6/8', () => {
    // Un temps entier de mesure composée : trois croches, une seule figure.
    const p = pattern({
      meter: meter(6, 8),
      onsets: [frappe([0, 1], fraction(3, 8)), frappe([3, 8], fraction(3, 8))],
    })
    expect(ecrits(p)).toEqual(['noire pointée', 'noire pointée'])
  })

  it('lie deux figures quand aucune ne porte la durée seule', () => {
    // Cinq doubles au départ d’un temps : noire liée à une double.
    const p = pattern({
      meter: meter(4, 4),
      onsets: [frappe([0, 1], fraction(5, 16))],
    })
    expect(ecrits(p).slice(0, 2)).toEqual(['noire liée', 'double'])
  })

  it('range les croches par temps — l’unité de ligature', () => {
    const p = pattern({
      meter: meter(2, 4),
      onsets: [
        frappe([0, 1], CROCHE),
        frappe([1, 8], CROCHE),
        frappe([1, 4], CROCHE),
        frappe([3, 8], CROCHE),
      ],
    })
    const beats = engraveVoice(p, 'kick').beats
    expect(beats).toHaveLength(2)
    expect(beats.every((b) => b.events.length === 2)).toBe(true)
  })
})

describe('le skank du reggae', () => {
  it('écrit une guitare qui ne joue que sur les contretemps', () => {
    // Module 5 : l’accompagnement reggae, contretemps purs — chaque temps
    // s’ouvre sur un silence, ce que la notation doit montrer.
    const p = pattern({
      meter: meter(4, 4),
      style: 'reggae',
      onsets: [
        frappe([1, 8], CROCHE, 'rimshot'),
        frappe([3, 8], CROCHE, 'rimshot'),
        frappe([5, 8], CROCHE, 'rimshot'),
        frappe([7, 8], CROCHE, 'rimshot'),
      ],
    })
    const beats = engraveVoice(p, 'rimshot').beats
    expect(beats).toHaveLength(4)
    expect(beats.map((b) => b.events.map(lire))).toEqual([
      ['silence de croche', 'croche'],
      ['silence de croche', 'croche'],
      ['silence de croche', 'croche'],
      ['silence de croche', 'croche'],
    ])
  })
})

describe('découpages irréguliers', () => {
  it('ne découpe pas une noire de triolet, qui traverse le temps par nature', () => {
    // Trois noires de triolet sur une blanche de 4/4 : chacune dure un sixième
    // de ronde et chevauche forcément un temps. Les couper en deux croches de
    // triolet liées détruirait la figure.
    const sixieme = fraction(1, 6)
    const p = pattern({
      meter: meter(4, 4),
      length: fraction(1, 2),
      onsets: [
        frappe([0, 1], sixieme, 'cowbell'),
        frappe([1, 6], sixieme, 'cowbell'),
        frappe([1, 3], sixieme, 'cowbell'),
      ],
    })
    const events = engraveVoice(p, 'cowbell').beats.flatMap((b) => b.events)
    expect(events).toHaveLength(3)
    expect(events.every((e) => e.kind === 'note' && !e.tied)).toBe(true)
    expect(events.every((e) => e.figure.name === 'noire' && e.figure.tuplet)).toBe(true)
  })
})
