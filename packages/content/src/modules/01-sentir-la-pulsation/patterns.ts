import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)

const frappe = (
  at: [number, number],
  duration = NOIRE,
  voice: Voice = 'kick',
  accent = false,
): Onset => ({ at: fraction(...at), duration, voice, ...(accent ? { accent } : {}) })

/** La house met la pulsation à nu : une grosse caisse sur chaque temps. */
export const house = pattern({
  meter: meter(4, 4),
  style: 'house',
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([1, 4]),
    frappe([1, 2]),
    frappe([3, 4]),
    ...[1, 3, 5, 7].map((i) => frappe([i, 8], CROCHE, 'hihat')),
  ],
})

/** Le même battement, nu, sans rien pour s'y accrocher. */
export const nue = pattern({
  meter: meter(4, 4),
  style: 'neutre',
  onsets: [
    frappe([0, 1], NOIRE, 'clave', true),
    frappe([1, 4], NOIRE, 'clave'),
    frappe([1, 2], NOIRE, 'clave'),
    frappe([3, 4], NOIRE, 'clave'),
  ],
})

/** Une marche : la caisse claire sur le second appui, comme en fanfare. */
export const marche = pattern({
  meter: meter(2, 4),
  style: 'marche',
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([1, 4], NOIRE, 'snare'),
  ],
})

/** La même marche, avec le charleston qui remplit : plus de repères. */
export const marcheSoutenue = pattern({
  meter: meter(2, 4),
  style: 'marche',
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([1, 4], NOIRE, 'snare'),
    ...[0, 1, 2, 3].map((i) => frappe([i, 8], CROCHE, 'hihat')),
  ],
})

/** Deux frappes par battement au charleston : de quoi les compter. */
export const houseDense = pattern({
  meter: meter(4, 4),
  style: 'house',
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([1, 4]),
    frappe([1, 2]),
    frappe([3, 4]),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => frappe([i, 8], CROCHE, 'hihat')),
  ],
})

/**
 * La grosse caisse n'occupe qu'un battement sur deux.
 *
 * C'est le cas le plus instructif du module : la pulsation continue là où
 * plus rien ne la frappe. Tant qu'on la suit à l'oreille, on la perd ; il
 * faut la porter.
 */
export const pulsationCachee = pattern({
  meter: meter(4, 4),
  style: 'house',
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([1, 2], NOIRE, 'kick'),
    ...[1, 3, 5, 7].map((i) => frappe([i, 8], CROCHE, 'hihat')),
  ],
})

/** Quatre battements attendus, trois joués : le trou tombe au troisième. */
export const trouAuTroisieme = pattern({
  meter: meter(4, 4),
  style: 'neutre',
  onsets: [
    frappe([0, 1], NOIRE, 'clave', true),
    frappe([1, 4], NOIRE, 'clave'),
    frappe([3, 4], NOIRE, 'clave'),
  ],
})

/** Le même trou, déplacé au dernier battement. */
export const trouAuDernier = pattern({
  meter: meter(4, 4),
  style: 'neutre',
  onsets: [
    frappe([0, 1], NOIRE, 'clave', true),
    frappe([1, 4], NOIRE, 'clave'),
    frappe([1, 2], NOIRE, 'clave'),
  ],
})
