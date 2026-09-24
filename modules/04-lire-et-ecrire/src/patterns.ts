import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)
const DOUBLE = fraction(1, 16)

const frappe = (
  at: [number, number],
  duration = NOIRE,
  voice: Voice = 'snare',
  accent = false,
): Onset => ({ at: fraction(...at), duration, voice, ...(accent ? { accent } : {}) })

const enRock = (onsets: Onset[], m = meter(4, 4), length = fraction(1)) =>
  pattern({ meter: m, style: 'rock', onsets, length })

/** Quatre noires en 4/4 : le chiffrage le plus courant du monde. */
export const quatreQuarts = enRock([
  frappe([0, 1], NOIRE, 'snare', true),
  frappe([1, 4]),
  frappe([1, 2]),
  frappe([3, 4]),
])

/** Les mêmes durées, mais en 3/4 : le cycle change, pas les figures. */
export const troisQuarts = pattern({
  meter: meter(3, 4),
  style: 'marche',
  onsets: [frappe([0, 1], NOIRE, 'snare', true), frappe([1, 4]), frappe([1, 2])],
})

/** Un 2/4 de marche : deux temps, et la fanfare avance. */
export const deuxQuarts = pattern({
  meter: meter(2, 4),
  style: 'marche',
  onsets: [frappe([0, 1], NOIRE, 'snare', true), frappe([1, 4])],
})

/** La figure la plus célèbre du rock : deux frappes, une frappe. */
export const stompStompClap = enRock([
  frappe([0, 1], NOIRE, 'kick', true),
  frappe([1, 4], NOIRE, 'kick'),
  frappe([1, 2], NOIRE, 'snare'),
  frappe([3, 4], NOIRE, 'snare'),
])

/** Une figure courte qu'on reconnaît d'un bloc. */
export const cellule = pattern({
  meter: meter(2, 4),
  style: 'rock',
  onsets: [
    frappe([0, 1], CROCHE, 'snare', true),
    frappe([1, 8], CROCHE),
    frappe([1, 4], NOIRE),
  ],
})

/** Bien groupé : chaque temps se voit d'un coup d'œil. */
export const bienGroupe = enRock([
  frappe([0, 1], CROCHE, 'hihat', true),
  frappe([1, 8], CROCHE, 'hihat'),
  frappe([1, 4], CROCHE, 'hihat'),
  frappe([3, 8], CROCHE, 'hihat'),
  ...[8, 9, 10, 11].map((i) => frappe([i, 16], DOUBLE, 'hihat')),
  frappe([3, 4], NOIRE, 'hihat'),
])

/** Le même rythme, avec une attaque de moins — pour le repérage d'erreur. */
export const celluleAmputee = pattern({
  meter: meter(2, 4),
  style: 'rock',
  onsets: [frappe([0, 1], NOIRE, 'snare', true), frappe([1, 4], NOIRE)],
})

// ── Les paires du repérage d'erreur ───────────────────────────────────────
//
// Chaque motif ci-dessous est le jumeau d'un autre, à une attaque près — pas
// deux, pas une demie. La contrainte est vérifiée au test : un écart double
// transformerait l'exercice en « trouve les différences », qui se joue à
// l'œil et n'apprend rien à lire.

/** La même cellule, avec une attaque de plus à la fin. */
export const celluleEtendue = pattern({
  meter: meter(2, 4),
  style: 'rock',
  onsets: [0, 1, 2, 3].map((i) => frappe([i, 8], CROCHE, 'snare', i === 0)),
})

/** Quatre noires dont la dernière arrive un demi-temps trop tôt. */
export const quatreQuartsDecale = enRock([
  frappe([0, 1], NOIRE, 'snare', true),
  frappe([1, 4]),
  frappe([1, 2], CROCHE),
  frappe([5, 8], fraction(3, 8)),
])

/** Le groupe dense auquel il manque une double. */
export const bienGroupeAmpute = enRock([
  frappe([0, 1], CROCHE, 'hihat', true),
  frappe([1, 8], CROCHE, 'hihat'),
  frappe([1, 4], CROCHE, 'hihat'),
  frappe([3, 8], CROCHE, 'hihat'),
  ...[8, 9, 10].map((i) => frappe([i, 16], DOUBLE, 'hihat')),
  frappe([3, 4], NOIRE, 'hihat'),
])

/** Une mesure à trois temps, à écrire sous la dictée. */
export const dicteeTroisQuarts = pattern({
  meter: meter(3, 4),
  style: 'marche',
  onsets: [
    frappe([0, 1], NOIRE, 'snare', true),
    frappe([1, 4], CROCHE),
    frappe([3, 8], CROCHE),
    frappe([1, 2], NOIRE),
  ],
})
