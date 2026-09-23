import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)
const SIXIEME = fraction(1, 6)

const frappe = (
  at: [number, number],
  duration = NOIRE,
  voice: Voice = 'clave',
  accent = false,
): Onset => ({ at: fraction(...at), duration, voice, ...(accent ? { accent } : {}) })

/**
 * Trois contre deux : deux divisions de la même durée, superposées.
 *
 * Écrit en 2/4 pour que la boucle tombe sur une mesure pleine — une
 * demi-mesure qui tourne serait juste à l'oreille et fausse à l'écrit.
 */
export const troisContreDeux = pattern({
  meter: meter(2, 4),
  style: 'afrobeat',
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([1, 4], NOIRE, 'kick'),
    frappe([0, 1], SIXIEME, 'cowbell', true),
    frappe([1, 6], SIXIEME, 'cowbell'),
    frappe([1, 3], SIXIEME, 'cowbell'),
  ],
})

/** Les deux voix séparées, pour les entendre l'une puis l'autre. */
export const deuxSeul = pattern({
  meter: meter(2, 4),
  style: 'afrobeat',
  onsets: [frappe([0, 1], NOIRE, 'kick', true), frappe([1, 4], NOIRE, 'kick')],
})

export const troisSeul = pattern({
  meter: meter(2, 4),
  style: 'afrobeat',
  onsets: [
    frappe([0, 1], SIXIEME, 'cowbell', true),
    frappe([1, 6], SIXIEME, 'cowbell'),
    frappe([1, 3], SIXIEME, 'cowbell'),
  ],
})

/** La clave son 3-2 : cinq attaques sur deux mesures. */
export const claveTroisDeux = pattern({
  meter: meter(4, 4),
  style: 'clave',
  length: fraction(2),
  onsets: [
    frappe([0, 1], CROCHE, 'clave', true),
    frappe([3, 8], CROCHE),
    frappe([3, 4], CROCHE),
    frappe([5, 4], CROCHE),
    frappe([3, 2], CROCHE),
  ],
})

/** La même cellule, retournée : 2-3. Le morceau change de caractère. */
export const claveDeuxTrois = pattern({
  meter: meter(4, 4),
  style: 'clave',
  length: fraction(2),
  onsets: [
    frappe([1, 4], CROCHE, 'clave', true),
    frappe([1, 2], CROCHE),
    frappe([1, 1], CROCHE),
    frappe([11, 8], CROCHE),
    frappe([7, 4], CROCHE),
  ],
})

/** Un 7/8 groupé 2+2+3 : trois appuis, dont un plus long. */
export const septHuitLong = pattern({
  meter: meter(7, 8, [2, 2, 3]),
  style: 'balkan',
  onsets: [
    frappe([0, 1], CROCHE, 'kick', true),
    frappe([1, 8], CROCHE, 'hihat'),
    frappe([1, 4], CROCHE, 'snare', true),
    frappe([3, 8], CROCHE, 'hihat'),
    frappe([1, 2], CROCHE, 'kick', true),
    frappe([5, 8], CROCHE, 'hihat'),
    frappe([3, 4], CROCHE, 'hihat'),
  ],
})

/** Le même 7/8, groupé 3+2+2 : l'appui long passe en tête. */
export const septHuitCourt = pattern({
  meter: meter(7, 8, [3, 2, 2]),
  style: 'balkan',
  onsets: [
    frappe([0, 1], CROCHE, 'kick', true),
    frappe([1, 8], CROCHE, 'hihat'),
    frappe([1, 4], CROCHE, 'hihat'),
    frappe([3, 8], CROCHE, 'snare', true),
    frappe([1, 2], CROCHE, 'hihat'),
    frappe([5, 8], CROCHE, 'kick', true),
    frappe([3, 4], CROCHE, 'hihat'),
  ],
})
