import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)
const TIERS = fraction(1, 12)

const frappe = (
  at: [number, number],
  duration = NOIRE,
  voice: Voice = 'clave',
  accent = false,
): Onset => ({ at: fraction(...at), duration, voice, ...(accent ? { accent } : {}) })

export const clic = pattern({
  meter: meter(4, 4),
  onsets: [
    frappe([0, 1], NOIRE, 'clave', true),
    frappe([1, 4]),
    frappe([1, 2]),
    frappe([3, 4]),
  ],
})

export const enDeux = pattern({
  meter: meter(4, 4),
  onsets: [
    frappe([0, 1], CROCHE, 'clave', true),
    ...[1, 2, 3, 4, 5, 6, 7].map((i) => frappe([i, 8], CROCHE)),
  ],
})

export const enTrois = pattern({
  meter: meter(4, 4),
  onsets: Array.from({ length: 12 }, (_, i) => frappe([i, 12], TIERS, 'clave', i === 0)),
})

export const cycleDeTrois = pattern({
  meter: meter(3, 4),
  onsets: [frappe([0, 1], NOIRE, 'clave', true), frappe([1, 4]), frappe([1, 2])],
})

export const deuxCrochesUneNoire = pattern({
  meter: meter(2, 4),
  onsets: [
    frappe([0, 1], CROCHE, 'snare', true),
    frappe([1, 8], CROCHE, 'snare'),
    frappe([1, 4], NOIRE, 'snare'),
  ],
})

export const uneNoireDeuxCroches = pattern({
  meter: meter(2, 4),
  onsets: [
    frappe([0, 1], NOIRE, 'snare', true),
    frappe([1, 4], CROCHE, 'snare'),
    frappe([3, 8], CROCHE, 'snare'),
  ],
})

export const quatreCroches = pattern({
  meter: meter(2, 4),
  onsets: [0, 1, 2, 3].map((i) => frappe([i, 8], CROCHE, 'snare', i === 0)),
})
