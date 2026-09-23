import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)
const DOUBLE = fraction(1, 16)
const BLANCHE = fraction(1, 2)

const frappe = (
  at: [number, number],
  duration = CROCHE,
  voice: Voice = 'snare',
  accent = false,
): Onset => ({ at: fraction(...at), duration, voice, ...(accent ? { accent } : {}) })

/** Le motif de départ, en une mesure : trois attaques et un trou. */
export const depart = pattern({
  meter: meter(4, 4),
  style: 'neutre',
  onsets: [
    frappe([0, 1], CROCHE, 'snare', true),
    frappe([1, 8], CROCHE),
    frappe([1, 2], NOIRE),
  ],
})

/** Le même, deux fois plus lent : chaque durée doublée. */
export const augmente = pattern({
  meter: meter(4, 4),
  style: 'neutre',
  length: fraction(2),
  onsets: [
    frappe([0, 1], NOIRE, 'snare', true),
    frappe([1, 4], NOIRE),
    frappe([1, 1], BLANCHE),
  ],
})

/** Le même, deux fois plus rapide : il tient dans la moitié du temps. */
export const diminue = pattern({
  meter: meter(2, 4),
  style: 'neutre',
  onsets: [
    frappe([0, 1], DOUBLE, 'snare', true),
    frappe([1, 16], DOUBLE),
    frappe([1, 4], CROCHE),
  ],
})

/** Le même, décalé d'une croche : l'appui n'est plus au même endroit. */
export const deplace = pattern({
  meter: meter(4, 4),
  style: 'neutre',
  onsets: [
    frappe([1, 8], CROCHE, 'snare', true),
    frappe([1, 4], CROCHE),
    frappe([5, 8], NOIRE),
  ],
})

/** Le même, densifié : deux attaques de plus, la silhouette tient. */
export const densifie = pattern({
  meter: meter(4, 4),
  style: 'neutre',
  onsets: [
    frappe([0, 1], CROCHE, 'snare', true),
    frappe([1, 8], CROCHE),
    frappe([3, 8], CROCHE),
    frappe([1, 2], CROCHE),
    frappe([7, 8], CROCHE),
  ],
})

/** Une figure répétée obstinément, qui porte tout le reste. */
export const fondation = pattern({
  meter: meter(4, 4),
  style: 'hip-hop',
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([3, 8], CROCHE, 'kick'),
    frappe([1, 4], NOIRE, 'snare'),
    frappe([3, 4], NOIRE, 'snare'),
  ],
})

/** La boucle complète : la fondation, plus le motif par-dessus. */
export const boucle = pattern({
  meter: meter(4, 4),
  style: 'hip-hop',
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([3, 8], CROCHE, 'kick'),
    frappe([1, 4], NOIRE, 'snare'),
    frappe([3, 4], NOIRE, 'snare'),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => frappe([i, 8], CROCHE, 'hihat')),
  ],
})

/**
 * Le motif lu à l'envers.
 *
 * La transformation la moins intuitive des cinq : elle ne change ni les
 * durées ni leur nombre, seulement leur ordre — et pourtant on ne reconnaît
 * plus rien. C'est la preuve que la silhouette d'un rythme tient à son début
 * autant qu'à son contenu.
 */
export const retrograde = pattern({
  meter: meter(4, 4),
  style: 'neutre',
  onsets: [
    frappe([1, 4], NOIRE, 'snare', true),
    frappe([3, 4], CROCHE),
    frappe([7, 8], CROCHE),
  ],
})

/** La fondation amputée de sa dernière frappe claire : pour le repérage. */
export const fondationAmputee = pattern({
  meter: meter(4, 4),
  style: 'hip-hop',
  onsets: [
    frappe([0, 1], NOIRE, 'kick', true),
    frappe([3, 8], CROCHE, 'kick'),
    frappe([1, 4], NOIRE, 'snare'),
  ],
})

/**
 * Quatre mesures : la carrure telle qu'elle s'entend.
 *
 * Les trois premières sont identiques ; la quatrième s'ouvre pour annoncer le
 * retour. C'est la façon la plus économique de faire sentir qu'une phrase a
 * une longueur — on ne l'entend qu'au moment où elle se referme.
 */
export const phraseDeQuatre = pattern({
  meter: meter(4, 4),
  style: 'hip-hop',
  length: fraction(4),
  onsets: [0, 1, 2, 3].flatMap((m) => [
    frappe([m * 8, 8], NOIRE, 'kick', m === 0),
    frappe([m * 8 + 3, 8], CROCHE, 'kick'),
    frappe([m * 8 + 2, 8], NOIRE, 'snare'),
    frappe([m * 8 + 6, 8], NOIRE, 'snare'),
    ...(m === 3 ? [frappe([m * 8 + 7, 8], CROCHE, 'hihat')] : []),
  ]),
})
