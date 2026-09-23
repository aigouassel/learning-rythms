import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)

const frappe = (
  at: [number, number],
  voice: Voice = 'kick',
  accent = false,
  duration = NOIRE,
): Onset => ({ at: fraction(...at), duration, voice, ...(accent ? { accent } : {}) })

/** Marche : deux appuis, le second plus léger. */
export const marche = pattern({
  meter: meter(2, 4),
  style: 'marche',
  onsets: [frappe([0, 1], 'kick', true), frappe([1, 4], 'snare')],
})

/** La même, remplie au charleston : le cycle s'entend sans effort. */
export const marcheSoutenue = pattern({
  meter: meter(2, 4),
  style: 'marche',
  onsets: [
    frappe([0, 1], 'kick', true),
    frappe([1, 4], 'snare'),
    ...[0, 1, 2, 3].map((i) => frappe([i, 8], 'hihat', false, CROCHE)),
  ],
})

/** Valse : un appui lourd, deux légers. Le cycle s'entend sans compter. */
export const valse = pattern({
  meter: meter(3, 4),
  style: 'valse',
  onsets: [
    frappe([0, 1], 'kick', true),
    frappe([1, 4], 'hihat'),
    frappe([1, 2], 'hihat'),
  ],
})

/** Le « pom-tchi-tchi » complet : la basse tombe seule sur le premier temps. */
export const valseSoutenue = pattern({
  meter: meter(3, 4),
  style: 'valse',
  onsets: [
    frappe([0, 1], 'kick', true),
    frappe([1, 4], 'snare'),
    frappe([1, 2], 'snare'),
    ...[0, 1, 2, 3, 4, 5].map((i) => frappe([i, 8], 'hihat', false, CROCHE)),
  ],
})

/** Les trois temps frappés à l'identique, sauf l'appui. */
export const valseNue = pattern({
  meter: meter(3, 4),
  style: 'valse',
  onsets: [
    frappe([0, 1], 'clave', true),
    frappe([1, 4], 'clave'),
    frappe([1, 2], 'clave'),
  ],
})

/** Pop : quatre temps, et la caisse claire sur le deuxième et le quatrième. */
export const pop = pattern({
  meter: meter(4, 4),
  style: 'pop',
  onsets: [
    frappe([0, 1], 'kick', true),
    frappe([1, 4], 'snare'),
    frappe([1, 2], 'kick'),
    frappe([3, 4], 'snare'),
  ],
})

/**
 * La même pop, mais la grosse caisse ne tombe que sur l'appui.
 *
 * Elle existe pour que « ne frappe que l'appui » veuille dire quelque chose :
 * avec la grosse caisse sur deux temps, la consigne et ce qui est corrigé ne
 * parlent pas de la même chose.
 */
export const popComplete = pattern({
  meter: meter(4, 4),
  style: 'pop',
  onsets: [
    frappe([0, 1], 'kick', true),
    frappe([1, 4], 'snare'),
    frappe([3, 4], 'snare'),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => frappe([i, 8], 'hihat', false, CROCHE)),
  ],
})

/** Le même battement, sans aucun appui marqué : rien à quoi s'accrocher. */
export const sansAppui = pattern({
  meter: meter(4, 4),
  style: 'neutre',
  onsets: [0, 1, 2, 3].map((i) => frappe([i, 4], 'clave')),
})
