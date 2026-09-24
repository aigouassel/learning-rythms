import { align } from './align'

/** Une frappe, datée sur la même horloge que les attaques attendues. */
export type Tap = { readonly at: number }

/**
 * Ce qu'on retient d'une exécution : trois grandeurs, pas une note.
 *
 * Un pourcentage de réussite n'apprend rien — il dit qu'on s'est trompée, pas
 * en quoi. Ces trois-là nomment trois défauts qui n'ont rien à voir et
 * n'appellent pas le même remède.
 *
 * Tous les temps sont en millisecondes, et les erreurs **signées** : négatif
 * en avance, positif en retard. Le signe est l'essentiel de l'information.
 */
export type TimingAnalysis = {
  /**
   * Le décalage global — la moyenne des erreurs.
   *
   * Souvent matériel plutôt que musical : la sortie audio, le trajet de la
   * frappe et le temps de réaction s'additionnent en un biais constant de
   * 20 à 40 ms. C'est ce que la calibration mesure pour le soustraire ensuite.
   */
  readonly offsetMs: number
  /**
   * La dérive — la pente de l'erreur au fil du temps, en ms par seconde.
   *
   * Positive, on ralentit ; négative, on accélère. C'est un vrai défaut de
   * musicien, celui qu'un métronome révèle et qu'aucune moyenne ne montre.
   */
  readonly driftMsPerSecond: number
  /**
   * La dispersion — l'écart-type autour de la tendance.
   *
   * Ce qui reste quand on a retiré le biais et la dérive : l'instabilité pure.
   */
  readonly dispersionMs: number
  readonly matched: number
  readonly missed: number
  readonly extra: number
  /** Les erreurs signées des frappes appariées, dans l'ordre. */
  readonly errorsMs: readonly number[]
}

export type TimingOptions = {
  /** Le biais connu, mesuré à la calibration, retiré avant toute analyse. */
  readonly calibrationMs?: number
  /** Au-delà, on préfère parler de note manquée plutôt que de note en retard. */
  readonly penaltySeconds?: number
}

/**
 * Comparer une suite de frappes à la grille attendue.
 *
 * `expected` et les frappes sont en secondes, sur la même horloge — celle de
 * l'audio. Convertir les événements du clavier est le travail de l'appelant,
 * et c'est un piège connu : leurs horloges n'ont pas la même origine.
 */
export function analyseTiming(
  expected: readonly number[],
  taps: readonly Tap[],
  options: TimingOptions = {},
): TimingAnalysis {
  return analyseParLigne([{ expected, taps }], options)
}

/**
 * La même analyse, quand plusieurs lignes se jouent à la fois.
 *
 * Chaque ligne s'apparie **avec les siennes** : un motif de batterie fait
 * tomber la grosse caisse et le charleston sur le même temps, et un
 * appariement commun les mettrait en concurrence pour la même frappe — la
 * seconde passerait pour une note en trop, la seconde attaque pour une note
 * manquée. Deux mains, deux touches, deux appariements.
 *
 * Les grandeurs, elles, se calculent sur l'ensemble des erreurs : c'est une
 * seule exécution, et la dérive qu'on cherche à voir est celle de la
 * musicienne, pas celle d'un doigt.
 */
export function analyseParLigne(
  lignes: readonly { readonly expected: readonly number[]; readonly taps: readonly Tap[] }[],
  options: TimingOptions = {},
): TimingAnalysis {
  const { calibrationMs = 0, penaltySeconds = 0.15 } = options

  const apparies = lignes.map((ligne) =>
    align(ligne.expected, ligne.taps, {
      keyOf: (e) => e,
      keyOfActual: (t) => t.at,
      penalty: penaltySeconds,
    }),
  )

  const points = apparies
    .flatMap((a) => a.pairs)
    .map((p) => ({
      t: p.expected,
      erreur: (p.actual.at - p.expected) * 1000 - calibrationMs,
    }))
    // Les lignes ont été appariées séparément : remises ensemble, leurs points
    // doivent retrouver l'ordre du temps, sans quoi la régression lirait une
    // dérive dans le seul fait d'avoir changé de main.
    .sort((a, b) => a.t - b.t)

  const erreurs = points.map((p) => p.erreur)

  const n = points.length
  const vide = { offsetMs: 0, driftMsPerSecond: 0, dispersionMs: 0 }
  const { offsetMs, driftMsPerSecond, dispersionMs } = n === 0 ? vide : decomposer(points)

  return {
    offsetMs,
    driftMsPerSecond,
    dispersionMs,
    matched: n,
    missed: apparies.reduce((s, a) => s + a.missing.length, 0),
    extra: apparies.reduce((s, a) => s + a.extra.length, 0),
    errorsMs: erreurs,
  }
}

/**
 * Séparer le biais, la tendance et le bruit.
 *
 * C'est une régression linéaire de l'erreur en fonction du temps : la
 * moyenne donne le décalage, la pente donne la dérive, et l'écart-type des
 * résidus donne la dispersion. Trois nombres, trois diagnostics — et le
 * troisième n'est honnête que parce qu'on a retiré les deux premiers.
 */
function decomposer(points: readonly { t: number; erreur: number }[]): {
  offsetMs: number
  driftMsPerSecond: number
  dispersionMs: number
} {
  const n = points.length
  const moyenneT = points.reduce((s, p) => s + p.t, 0) / n
  const moyenneErreur = points.reduce((s, p) => s + p.erreur, 0) / n

  const variance = points.reduce((s, p) => s + (p.t - moyenneT) ** 2, 0)
  const covariance = points.reduce((s, p) => s + (p.t - moyenneT) * (p.erreur - moyenneErreur), 0)

  // Une seule frappe, ou toutes au même instant : aucune tendance ne se lit.
  const pente = variance === 0 ? 0 : covariance / variance
  const ordonnee = moyenneErreur - pente * moyenneT

  const residus = points.map((p) => p.erreur - (ordonnee + pente * p.t))
  const dispersion =
    n < 2 ? 0 : Math.sqrt(residus.reduce((s, r) => s + r * r, 0) / (n - 1))

  return { offsetMs: moyenneErreur, driftMsPerSecond: pente, dispersionMs: dispersion }
}

/**
 * La calibration : le biais matériel, mesuré une fois.
 *
 * On prend la **médiane** et non la moyenne : sur seize frappes, une seule
 * distraction suffirait à fausser une moyenne, là où la médiane l'ignore.
 */
export function calibrate(expected: readonly number[], taps: readonly Tap[]): number {
  const { errorsMs } = analyseTiming(expected, taps)
  if (errorsMs.length === 0) return 0

  const triees = [...errorsMs].sort((a, b) => a - b)
  const milieu = Math.floor(triees.length / 2)
  return triees.length % 2 === 1
    ? triees[milieu]!
    : (triees[milieu - 1]! + triees[milieu]!) / 2
}
