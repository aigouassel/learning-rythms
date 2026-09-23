import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'

const RONDE = fraction(1)
const BLANCHE = fraction(1, 2)
const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)
const DOUBLE = fraction(1, 16)

const frappe = (
  at: [number, number],
  duration: ReturnType<typeof fraction>,
  voice: Voice = 'hihat',
  accent = false,
): Onset => ({ at: fraction(...at), duration, voice, ...(accent ? { accent } : {}) })

const enQuatreQuarts = (onsets: Onset[], length = RONDE) =>
  pattern({ meter: meter(4, 4), style: 'rock', onsets, length })

/** Le charleston sur chaque temps — le point de départ, déjà connu. */
export const surLesTemps = enQuatreQuarts([
  frappe([0, 1], NOIRE, 'hihat', true),
  frappe([1, 4], NOIRE),
  frappe([1, 2], NOIRE),
  frappe([3, 4], NOIRE),
])

/** Le même charleston, deux fois plus rapide. */
export const deuxFoisPlusVite = enQuatreQuarts([
  frappe([0, 1], CROCHE, 'hihat', true),
  ...[1, 2, 3, 4, 5, 6, 7].map((i) => frappe([i, 8], CROCHE)),
])

/** Encore deux fois plus rapide. */
export const quatreFoisPlusVite = enQuatreQuarts([
  frappe([0, 1], DOUBLE, 'hihat', true),
  ...Array.from({ length: 15 }, (_, i) => frappe([i + 1, 16], DOUBLE)),
])

/** L'escalier complet, dans une seule mesure : un temps par vitesse. */
export const escalier = enQuatreQuarts([
  frappe([0, 1], NOIRE, 'hihat', true),
  frappe([1, 4], CROCHE),
  frappe([3, 8], CROCHE),
  ...[8, 9, 10, 11].map((i) => frappe([i, 16], DOUBLE)),
  frappe([3, 4], NOIRE),
])

/** Dans l'autre sens : les valeurs longues. */
export const deuxBlanches = enQuatreQuarts([
  frappe([0, 1], BLANCHE, 'hihat', true),
  frappe([1, 2], BLANCHE),
])

export const uneRonde = enQuatreQuarts([frappe([0, 1], RONDE, 'hihat', true)])

/** Le silence occupe le temps exactement comme une note. */
export const avecSilences = enQuatreQuarts([
  frappe([0, 1], NOIRE, 'snare', true),
  frappe([1, 2], NOIRE, 'snare'),
])

/** La même durée totale, jouée ou tue : deux mesures à comparer. */
export const quatreNoires = enQuatreQuarts([
  frappe([0, 1], NOIRE, 'snare', true),
  frappe([1, 4], NOIRE, 'snare'),
  frappe([1, 2], NOIRE, 'snare'),
  frappe([3, 4], NOIRE, 'snare'),
])

/** Deux croches puis une noire : la figure à reconnaître. */
export const deuxCrochesUneNoire = pattern({
  meter: meter(2, 4),
  style: 'rock',
  onsets: [
    frappe([0, 1], CROCHE, 'snare', true),
    frappe([1, 8], CROCHE, 'snare'),
    frappe([1, 4], NOIRE, 'snare'),
  ],
})

/** Une noire puis deux croches — l'inverse, qu'on confond à l'oreille. */
export const uneNoireDeuxCroches = pattern({
  meter: meter(2, 4),
  style: 'rock',
  onsets: [
    frappe([0, 1], NOIRE, 'snare', true),
    frappe([1, 4], CROCHE, 'snare'),
    frappe([3, 8], CROCHE, 'snare'),
  ],
})

/** Quatre croches — la troisième réponse possible. */
export const quatreCroches = pattern({
  meter: meter(2, 4),
  style: 'rock',
  onsets: [
    frappe([0, 1], CROCHE, 'snare', true),
    frappe([1, 8], CROCHE, 'snare'),
    frappe([1, 4], CROCHE, 'snare'),
    frappe([3, 8], CROCHE, 'snare'),
  ],
})

/** Une batterie rock élémentaire : trois voix, trois vitesses. */
export const rockElementaire = pattern({
  meter: meter(4, 4),
  style: 'rock',
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([1, 2], NOIRE, 'kick'),
    frappe([1, 4], NOIRE, 'snare'),
    frappe([3, 4], NOIRE, 'snare'),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => frappe([i, 8], CROCHE, 'hihat')),
  ],
})

// ── De quoi comparer deux à deux ──────────────────────────────────────────
//
// Une famille de cellules d'une seule mesure à 2/4, toutes de même durée
// totale. C'est la seule façon honnête de faire entendre une durée : isolée,
// elle ne veut rien dire ; mise à côté d'une autre, elle devient un rapport.

/** Deux noires : l'étalon auquel tout le reste se compare. */
export const deuxNoires = pattern({
  meter: meter(2, 4),
  style: 'rock',
  onsets: [frappe([0, 1], NOIRE, 'snare', true), frappe([1, 4], NOIRE, 'snare')],
})

/** Une blanche : un seul son pour toute la mesure. */
export const uneBlanche = pattern({
  meter: meter(2, 4),
  style: 'rock',
  onsets: [frappe([0, 1], BLANCHE, 'snare', true)],
})

/** Quatre doubles puis une noire : le temps coupé en quatre, puis entier. */
export const quatreDoublesUneNoire = pattern({
  meter: meter(2, 4),
  style: 'rock',
  onsets: [
    ...[0, 1, 2, 3].map((i) => frappe([i, 16], DOUBLE, 'snare', i === 0)),
    frappe([1, 4], NOIRE, 'snare'),
  ],
})

/** L'inverse : la noire d'abord, les quatre doubles ensuite. */
export const noireQuatreDoubles = pattern({
  meter: meter(2, 4),
  style: 'rock',
  onsets: [
    frappe([0, 1], NOIRE, 'snare', true),
    ...[4, 5, 6, 7].map((i) => frappe([i, 16], DOUBLE, 'snare')),
  ],
})

/** Le premier temps est tu : un silence qui dure autant qu'une noire. */
export const silencePuisNoire = pattern({
  meter: meter(2, 4),
  style: 'rock',
  onsets: [frappe([1, 4], NOIRE, 'snare', true)],
})

/** Un demi-temps de silence, puis le reste : le retard est écrit. */
export const demiSilencePuisDeux = pattern({
  meter: meter(2, 4),
  style: 'rock',
  onsets: [frappe([1, 8], CROCHE, 'snare', true), frappe([1, 4], NOIRE, 'snare')],
})

/** Une mesure de rock à 4/4, à écrire sous la dictée. */
export const dicteeSimple = enQuatreQuarts([
  frappe([0, 1], NOIRE, 'snare', true),
  frappe([1, 4], CROCHE, 'snare'),
  frappe([3, 8], CROCHE, 'snare'),
  frappe([1, 2], NOIRE, 'snare'),
  frappe([3, 4], NOIRE, 'snare'),
])

/** La même, trouée : deux temps sonnent, deux se taisent. */
export const dicteeAvecSilences = enQuatreQuarts([
  frappe([0, 1], CROCHE, 'snare', true),
  frappe([1, 8], CROCHE, 'snare'),
  frappe([1, 2], NOIRE, 'snare'),
])
