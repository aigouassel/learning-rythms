import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)
const DOUBLE = fraction(1, 16)
const CROCHE_POINTEE = fraction(3, 16)

const frappe = (
  at: [number, number],
  duration = NOIRE,
  voice: Voice = 'snare',
  accent = false,
): Onset => ({ at: fraction(...at), duration, voice, ...(accent ? { accent } : {}) })

/** Le skank : la guitare reggae ne joue que hors des appuis. */
export const skank = pattern({
  meter: meter(4, 4),
  style: 'reggae',
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([1, 2], NOIRE, 'kick'),
    ...[1, 3, 5, 7].map((i) => frappe([i, 8], CROCHE, 'rimshot')),
  ],
})

/** Les appuis seuls, pour comparer. */
export const surLesAppuis = pattern({
  meter: meter(4, 4),
  style: 'reggae',
  onsets: [0, 1, 2, 3].map((i) => frappe([i, 4], NOIRE, 'rimshot', i === 0)),
})

/**
 * Une syncope : la note entre entre deux appuis et déborde sur le suivant,
 * qui se trouve privé d'attaque.
 */
export const syncope = pattern({
  meter: meter(4, 4),
  style: 'funk',
  onsets: [
    frappe([0, 1], CROCHE, 'snare', true),
    frappe([1, 8], fraction(3, 8), 'snare'),
    frappe([1, 2], CROCHE, 'snare'),
    frappe([3, 4], NOIRE, 'snare'),
  ],
})

/** Le même placement, mais la note s'arrête avant l'appui : un contretemps. */
export const contretemps = pattern({
  meter: meter(4, 4),
  style: 'funk',
  onsets: [
    frappe([0, 1], CROCHE, 'snare', true),
    frappe([1, 8], CROCHE, 'snare'),
    frappe([1, 2], CROCHE, 'snare'),
    frappe([3, 4], NOIRE, 'snare'),
  ],
})

/** Le boitement de la croche pointée, suivie de sa double. */
export const pointee = pattern({
  meter: meter(4, 4),
  style: 'ska',
  onsets: [
    frappe([0, 1], CROCHE_POINTEE, 'snare', true),
    frappe([3, 16], DOUBLE, 'snare'),
    frappe([1, 4], CROCHE_POINTEE, 'snare'),
    frappe([7, 16], DOUBLE, 'snare'),
    frappe([1, 2], NOIRE, 'snare'),
    frappe([3, 4], NOIRE, 'snare'),
  ],
})

/**
 * Une levée : deux notes d'élan avant le premier appui.
 *
 * Elles occupent la fin d'une première mesure restée silencieuse, et non une
 * mesure incomplète. Le modèle n'a pas de temps négatif — une vraie mesure
 * d'anacrouse, plus courte que les autres, n'y est pas représentable. Ce
 * détour a d'ailleurs un avantage pédagogique : on **voit** le silence d'où
 * l'élan surgit, au lieu de le deviner.
 */
export const levee = pattern({
  meter: meter(4, 4),
  style: 'jazz',
  length: fraction(2),
  onsets: [
    frappe([3, 4], CROCHE, 'snare'),
    frappe([7, 8], CROCHE, 'snare'),
    frappe([1, 1], NOIRE, 'kick', true),
    frappe([5, 4], NOIRE, 'snare'),
    frappe([3, 2], NOIRE, 'snare'),
    frappe([7, 4], NOIRE, 'snare'),
  ],
})

/** Le skank, amputé d'une attaque — pour le repérage. */
export const skankAmpute = pattern({
  meter: meter(4, 4),
  style: 'reggae',
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([1, 2], NOIRE, 'kick'),
    ...[1, 3, 7].map((i) => frappe([i, 8], CROCHE, 'rimshot')),
  ],
})

// ── De quoi opposer deux à deux ───────────────────────────────────────────

/** Rien que des contretemps : l'appui n'est jamais frappé. */
export const contretempsSeuls = pattern({
  meter: meter(4, 4),
  style: 'ska',
  onsets: [1, 3, 5, 7].map((i) => frappe([i, 8], CROCHE, 'rimshot', i === 1)),
})

/** Les mêmes deux sons par temps, mais égaux : rien ne boite. */
export const crochesEgales = pattern({
  meter: meter(4, 4),
  style: 'ska',
  onsets: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => frappe([i, 8], CROCHE, 'snare', i === 0)),
})

/** Le motif pointé amputé d'une double : pour le repérage. */
export const pointeeAmputee = pattern({
  meter: meter(4, 4),
  style: 'ska',
  onsets: [
    frappe([0, 1], CROCHE_POINTEE, 'snare', true),
    frappe([3, 16], DOUBLE, 'snare'),
    frappe([1, 4], CROCHE_POINTEE, 'snare'),
    frappe([1, 2], NOIRE, 'snare'),
    frappe([3, 4], NOIRE, 'snare'),
  ],
})

/**
 * Un son qui déborde la barre de mesure.
 *
 * C'est le cas où la liaison de prolongation n'est pas un raffinement mais
 * une nécessité : aucune figure unique ne peut traverser une barre, donc
 * la durée s'écrit en deux signes reliés.
 */
export const parDessusLaBarre = pattern({
  meter: meter(4, 4),
  style: 'jazz',
  length: fraction(2),
  onsets: [
    frappe([0, 1], NOIRE, 'snare', true),
    frappe([1, 4], NOIRE, 'snare'),
    frappe([1, 2], NOIRE, 'snare'),
    frappe([3, 4], fraction(1, 2), 'snare'),
    frappe([5, 4], NOIRE, 'snare'),
    frappe([3, 2], NOIRE, 'snare'),
    frappe([7, 4], NOIRE, 'snare'),
  ],
})

/** Une levée d'une seule note : l'élan le plus court possible. */
export const leveeCourte = pattern({
  meter: meter(4, 4),
  style: 'jazz',
  length: fraction(2),
  onsets: [
    frappe([7, 8], CROCHE, 'snare'),
    frappe([1, 1], NOIRE, 'kick', true),
    frappe([5, 4], NOIRE, 'snare'),
    frappe([3, 2], NOIRE, 'snare'),
    frappe([7, 4], NOIRE, 'snare'),
  ],
})

/** Le même départ, mais sur l'appui : rien avant la barre. */
export const sansLevee = pattern({
  meter: meter(4, 4),
  style: 'jazz',
  length: fraction(2),
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([1, 4], NOIRE, 'snare'),
    frappe([1, 2], NOIRE, 'snare'),
    frappe([3, 4], NOIRE, 'snare'),
    frappe([1, 1], NOIRE, 'kick', true),
    frappe([5, 4], NOIRE, 'snare'),
    frappe([3, 2], NOIRE, 'snare'),
    frappe([7, 4], NOIRE, 'snare'),
  ],
})

/** Une autre syncope, plus longue : le son couvre deux appuis d'affilée. */
export const syncopeLongue = pattern({
  meter: meter(4, 4),
  style: 'funk',
  onsets: [
    frappe([0, 1], CROCHE, 'snare', true),
    frappe([1, 8], CROCHE, 'snare'),
    frappe([3, 8], fraction(3, 8), 'snare'),
    frappe([3, 4], NOIRE, 'snare'),
  ],
})
