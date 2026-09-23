import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)
const DOUBLE = fraction(1, 16)
const TIERS = fraction(1, 6)

const frappe = (
  at: [number, number],
  duration = NOIRE,
  voice: Voice = 'kick',
  accent = false,
): Onset => ({ at: fraction(...at), duration, voice, ...(accent ? { accent } : {}) })

/** Module 1 — la pulsation nue, un temps fort marqué. */
export const pulsation = pattern({
  meter: meter(4, 4),
  style: 'house',
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([1, 4], NOIRE, 'kick'),
    frappe([1, 2], NOIRE, 'kick'),
    frappe([3, 4], NOIRE, 'kick'),
  ],
})

/** Module 3 — la même durée divisée par deux, puis encore : la proportion. */
export const divisions = pattern({
  meter: meter(4, 4),
  style: 'rock',
  onsets: [
    frappe([0, 1], NOIRE, 'hihat'),
    frappe([1, 4], CROCHE, 'hihat'),
    frappe([3, 8], CROCHE, 'hihat'),
    ...[8, 9, 10, 11].map((i) => frappe([i, 16], DOUBLE, 'hihat')),
    frappe([3, 4], NOIRE, 'hihat'),
  ],
})

/** Module 5 — le skank : la guitare reggae ne joue que sur les contretemps. */
export const skank = pattern({
  meter: meter(4, 4),
  style: 'reggae',
  onsets: [
    frappe([1, 8], CROCHE, 'rimshot'),
    frappe([3, 8], CROCHE, 'rimshot'),
    frappe([5, 8], CROCHE, 'rimshot'),
    frappe([7, 8], CROCHE, 'rimshot'),
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([1, 2], NOIRE, 'kick'),
  ],
})

/** Module 6 — un triolet de croches : trois notes là où on en attendait deux. */
export const triolet = pattern({
  meter: meter(2, 4),
  style: 'blues-shuffle',
  onsets: [
    frappe([0, 1], fraction(1, 12), 'snare'),
    frappe([1, 12], fraction(1, 12), 'snare'),
    frappe([1, 6], fraction(1, 12), 'snare'),
    frappe([1, 4], NOIRE, 'snare', true),
  ],
})

/** Module 7 — trois contre deux, une voix par main. */
export const troisContreDeux = pattern({
  meter: meter(4, 4),
  length: fraction(1, 2),
  style: 'afrobeat',
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([1, 4], NOIRE, 'kick'),
    frappe([0, 1], TIERS, 'cowbell'),
    frappe([1, 6], TIERS, 'cowbell'),
    frappe([1, 3], TIERS, 'cowbell'),
  ],
})

/** Module 7 — la clave son 3-2, cellule de deux mesures. */
export const clave = pattern({
  meter: meter(4, 4),
  length: fraction(2),
  style: 'clave',
  onsets: [
    frappe([0, 1], CROCHE, 'clave'),
    frappe([3, 8], CROCHE, 'clave'),
    frappe([3, 4], CROCHE, 'clave'),
    frappe([5, 4], CROCHE, 'clave'),
    frappe([3, 2], CROCHE, 'clave'),
  ],
})
