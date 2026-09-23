import { equals, fraction, toNumber, type Onset, type Pattern } from '@rythmes/core'
import { align } from './align'

/**
 * Ce qui sépare le rythme écrit du rythme attendu.
 *
 * C'est la correction de tous les exercices d'écriture — QCM, appariement,
 * complétion, palette libre. Seul le widget de saisie change ; la question
 * posée est la même : *est-ce le même rythme, et sinon en quoi ?*
 */
export type SymbolicDiff = {
  readonly identical: boolean
  readonly correct: readonly Onset[]
  /** Bonne place, mauvaise durée — l'erreur la plus fréquente en dictée. */
  readonly wrongDuration: readonly { readonly expected: Onset; readonly actual: Onset }[]
  /** Bonne intention, mauvaise place. */
  readonly displaced: readonly { readonly expected: Onset; readonly actual: Onset }[]
  readonly missing: readonly Onset[]
  readonly extra: readonly Onset[]
}

/**
 * Au-delà d'une noire d'écart, deux attaques ne parlent plus de la même chose.
 *
 * Comme un mauvais appariement coûte deux fois cette valeur, on apparie tant
 * que l'écart reste sous une blanche — ce qui laisse de la place à une note
 * franchement déplacée sans pour autant relier deux attaques étrangères.
 */
const ECART_MAXIMAL = 1 / 4

export function compareRhythms(attendu: Pattern, propose: Pattern): SymbolicDiff {
  const apparie = align(attendu.onsets, propose.onsets, {
    keyOf: (o) => toNumber(o.at),
    keyOfActual: (o) => toNumber(o.at),
    penalty: ECART_MAXIMAL,
  })

  const correct: Onset[] = []
  const wrongDuration: { expected: Onset; actual: Onset }[] = []
  const displaced: { expected: Onset; actual: Onset }[] = []

  for (const { expected, actual } of apparie.pairs) {
    if (!equals(expected.at, actual.at)) displaced.push({ expected, actual })
    else if (!equals(expected.duration, actual.duration)) wrongDuration.push({ expected, actual })
    else correct.push(expected)
  }

  return {
    identical:
      apparie.missing.length === 0 &&
      apparie.extra.length === 0 &&
      displaced.length === 0 &&
      wrongDuration.length === 0 &&
      equals(attendu.length, propose.length),
    correct,
    wrongDuration,
    displaced,
    missing: apparie.missing,
    extra: apparie.extra,
  }
}

/**
 * Le constat en français, pour l'élève.
 *
 * Une seule phrase, celle qui porte l'erreur la plus instructive — empiler
 * cinq reproches sur une dictée de deux mesures décourage sans apprendre.
 */
export function explain(diff: SymbolicDiff): string {
  if (diff.identical) return 'C’est exactement ça.'

  if (diff.wrongDuration.length > 0) {
    const { expected, actual } = diff.wrongDuration[0]!
    return `Au bon endroit, mais pas la bonne durée : tu as écrit ${duree(actual)} là où il fallait ${duree(expected)}.`
  }
  if (diff.displaced.length > 0) {
    const { expected, actual } = diff.displaced[0]!
    const sens = toNumber(actual.at) < toNumber(expected.at) ? 'trop tôt' : 'trop tard'
    return `Une attaque est placée ${sens} — écoute à nouveau où elle tombe par rapport au temps.`
  }
  if (diff.missing.length > 0) {
    return diff.missing.length === 1
      ? 'Il manque une attaque.'
      : `Il manque ${diff.missing.length} attaques.`
  }
  if (diff.extra.length > 0) {
    return diff.extra.length === 1
      ? 'Il y a une attaque de trop.'
      : `Il y a ${diff.extra.length} attaques de trop.`
  }
  return 'Le rythme a la bonne forme, mais pas la bonne longueur.'
}

/** « 1/8 de ronde » — une description neutre, sans présumer de la figure. */
const duree = (o: Onset): string => {
  const d = fraction(o.duration.num, o.duration.den)
  return d.den === 1 ? `${d.num} ronde(s)` : `${d.num}/${d.den} de ronde`
}
