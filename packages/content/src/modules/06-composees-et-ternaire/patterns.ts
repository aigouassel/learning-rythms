import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)
const TIERS = fraction(1, 12)
const NOIRE_POINTEE = fraction(3, 8)

const frappe = (
  at: [number, number],
  duration = NOIRE,
  voice: Voice = 'hihat',
  accent = false,
): Onset => ({ at: fraction(...at), duration, voice, ...(accent ? { accent } : {}) })

/** Chaque temps coupé en deux. */
export const enDeux = pattern({
  meter: meter(2, 4),
  style: 'marche',
  onsets: [0, 1, 2, 3].map((i) => frappe([i, 8], CROCHE, 'hihat', i === 0)),
})

/** Le même temps coupé en trois — et tout bascule. */
export const enTrois = pattern({
  meter: meter(2, 4),
  style: 'blues-shuffle',
  onsets: Array.from({ length: 6 }, (_, i) => frappe([i, 12], TIERS, 'hihat', i === 0)),
})

/** Un triolet isolé : trois notes là où on en attendait deux. */
export const triolet = pattern({
  meter: meter(2, 4),
  style: 'blues-shuffle',
  onsets: [
    frappe([0, 1], TIERS, 'snare', true),
    frappe([1, 12], TIERS, 'snare'),
    frappe([1, 6], TIERS, 'snare'),
    frappe([1, 4], NOIRE, 'snare'),
  ],
})

/** Six croches groupées par trois : deux appuis. */
export const enSixHuit = pattern({
  meter: meter(6, 8),
  style: 'gigue',
  onsets: [0, 1, 2, 3, 4, 5].map((i) => frappe([i, 8], CROCHE, 'hihat', i === 0 || i === 3)),
})

/** Les mêmes six croches groupées par deux : trois appuis. */
export const enTroisQuarts = pattern({
  meter: meter(3, 4),
  style: 'marche',
  onsets: [0, 1, 2, 3, 4, 5].map((i) =>
    frappe([i, 8], CROCHE, 'hihat', i === 0 || i === 2 || i === 4),
  ),
})

/** Une marche en 6/8 : le ternaire à son plus évident. */
export const marcheEnSixHuit = pattern({
  meter: meter(6, 8),
  style: 'marche',
  onsets: [
    frappe([0, 1], NOIRE_POINTEE, 'kick', true),
    frappe([3, 8], NOIRE_POINTEE, 'snare'),
    ...[0, 1, 2, 3, 4, 5].map((i) => frappe([i, 8], CROCHE, 'hihat')),
  ],
})

/** Le balancement du blues : long, court, long, court. */
export const shuffle = pattern({
  meter: meter(4, 4),
  style: 'blues-shuffle',
  onsets: [0, 1, 2, 3].flatMap((t) => [
    frappe([t * 3, 12], fraction(1, 6), 'hihat', t === 0),
    frappe([t * 3 + 2, 12], TIERS, 'hihat'),
  ]),
})

// ── Les distracteurs et les jumeaux ───────────────────────────────────────

/** Deux croches puis une noire : la réponse binaire au triolet. */
export const deuxCrochesPuisNoire = pattern({
  meter: meter(2, 4),
  style: 'blues-shuffle',
  onsets: [
    frappe([0, 1], CROCHE, 'snare', true),
    frappe([1, 8], CROCHE, 'snare'),
    frappe([1, 4], NOIRE, 'snare'),
  ],
})

/** Quatre doubles puis une noire : l'autre réponse binaire, plus dense. */
export const quatreDoublesPuisNoire = pattern({
  meter: meter(2, 4),
  style: 'blues-shuffle',
  onsets: [
    ...[0, 1, 2, 3].map((i) => frappe([i, 16], fraction(1, 16), 'snare', i === 0)),
    frappe([1, 4], NOIRE, 'snare'),
  ],
})

/** Le 6/8 amputé d'une croche : l'écart tombe dans le second groupe. */
export const sixHuitAmpute = pattern({
  meter: meter(6, 8),
  style: 'gigue',
  onsets: [0, 1, 2, 3, 5].map((i) => frappe([i, 8], CROCHE, 'hihat', i === 0 || i === 3)),
})

/**
 * Le triolet de noires : trois notes dans la durée de deux temps.
 *
 * Le cas qui fait tomber tout le monde, parce qu'aucune de ses notes ne
 * coïncide avec un appui sauf la première — et parce qu'à l'écrit, la figure
 * traverse une frontière de temps sans avoir le droit d'être coupée.
 */
export const trioletDeNoires = pattern({
  meter: meter(4, 4),
  style: 'blues-shuffle',
  onsets: [
    frappe([0, 1], fraction(1, 6), 'snare', true),
    frappe([1, 6], fraction(1, 6), 'snare'),
    frappe([1, 3], fraction(1, 6), 'snare'),
    frappe([1, 2], NOIRE, 'snare'),
    frappe([3, 4], NOIRE, 'snare'),
  ],
})

/** Le shuffle avec sa caisse claire : le blues tel qu'il s'entend. */
export const shuffleComplet = pattern({
  meter: meter(4, 4),
  style: 'blues-shuffle',
  onsets: [
    ...[0, 1, 2, 3].flatMap((t) => [
      frappe([t * 3, 12], fraction(1, 6), 'hihat', t === 0),
      frappe([t * 3 + 2, 12], TIERS, 'hihat'),
    ]),
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([1, 4], NOIRE, 'snare'),
    frappe([1, 2], NOIRE, 'kick'),
    frappe([3, 4], NOIRE, 'snare'),
  ],
})
