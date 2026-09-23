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
