import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'

const NOIRE = fraction(1, 4)

const frappe = (
  at: [number, number],
  voice: Voice = 'kick',
  accent = false,
): Onset => ({ at: fraction(...at), duration: NOIRE, voice, ...(accent ? { accent } : {}) })

/** Marche : deux appuis, le second plus léger. */
export const marche = pattern({
  meter: meter(2, 4),
  style: 'marche',
  onsets: [frappe([0, 1], 'kick', true), frappe([1, 4], 'snare')],
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

/** Le même battement, sans aucun appui marqué : rien à quoi s'accrocher. */
export const sansAppui = pattern({
  meter: meter(4, 4),
  style: 'neutre',
  onsets: [0, 1, 2, 3].map((i) => frappe([i, 4], 'clave')),
})
