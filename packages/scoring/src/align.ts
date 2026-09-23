/**
 * Apparier deux suites ordonnées, en tolérant des manques et des ajouts.
 *
 * C'est le problème que pose toute correction : si sept frappes répondent à
 * huit attaques attendues, **laquelle manque** ? La réponse naïve — associer
 * chaque frappe à l'attaque la plus proche — produit des absurdités en
 * cascade : une frappe très en retard s'approprie l'attaque suivante, qui
 * déplace la suivante, et tout le reste de la mesure est déclaré faux alors
 * qu'une seule note manquait.
 *
 * On cherche donc l'appariement de **coût total minimal**, en préservant
 * l'ordre — deux notes ne peuvent pas se croiser dans le temps. C'est le même
 * calcul qu'une distance d'édition, et il donne la lecture la plus charitable
 * cohérente avec l'ordre des événements.
 *
 * Le même appariement sert deux corrections très différentes : les
 * millisecondes d'une frappe, et les positions en fractions d'une dictée.
 * Seule la clé change.
 */
export type Alignment<A, B> = {
  readonly pairs: readonly { readonly expected: A; readonly actual: B }[]
  readonly missing: readonly A[]
  readonly extra: readonly B[]
}

export type AlignOptions<A, B> = {
  readonly keyOf: (a: A) => number
  readonly keyOfActual: (b: B) => number
  /**
   * Ce que coûte un manque, ou un ajout.
   *
   * Comme un mauvais appariement coûte deux fois cette valeur (un manque plus
   * un ajout), apparier reste préférable tant que l'écart est inférieur au
   * double. Un seuil trop bas déclare des fautes là où il y a du retard ; trop
   * haut, il apparie n'importe quoi.
   */
  readonly penalty: number
}

export function align<A, B>(
  expected: readonly A[],
  actual: readonly B[],
  options: AlignOptions<A, B>,
): Alignment<A, B> {
  const { keyOf, keyOfActual, penalty } = options
  const n = expected.length
  const m = actual.length

  const APPARIER = 0
  const MANQUE = 1
  const AJOUT = 2

  // coût[i][j] : meilleur coût pour les i premières attendues et j premières
  // réelles. Les deux suites étant ordonnées, on ne revient jamais en arrière.
  const cout: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  // On mémorise la décision prise à chaque case. La redéduire en comparant des
  // coûts serait une comparaison de flottants : deux sommes mathématiquement
  // égales ne le sont pas toujours en machine, et aucune branche ne
  // correspondrait plus.
  const choix: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(MANQUE))

  for (let i = 1; i <= n; i++) {
    cout[i]![0] = i * penalty
    choix[i]![0] = MANQUE
  }
  for (let j = 1; j <= m; j++) {
    cout[0]![j] = j * penalty
    choix[0]![j] = AJOUT
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const ecart = Math.abs(keyOf(expected[i - 1]!) - keyOfActual(actual[j - 1]!))
      const candidats = [
        cout[i - 1]![j - 1]! + ecart,
        cout[i - 1]![j]! + penalty,
        cout[i]![j - 1]! + penalty,
      ] as const

      let meilleur = APPARIER
      if (candidats[MANQUE] < candidats[meilleur]!) meilleur = MANQUE
      if (candidats[AJOUT] < candidats[meilleur]!) meilleur = AJOUT

      cout[i]![j] = candidats[meilleur]!
      choix[i]![j] = meilleur
    }
  }

  // On remonte en suivant les décisions mémorisées.
  const pairs: { expected: A; actual: B }[] = []
  const missing: A[] = []
  const extra: B[] = []
  let i = n
  let j = m

  while (i > 0 || j > 0) {
    if (i === 0) {
      extra.push(actual[--j]!)
      continue
    }
    if (j === 0) {
      missing.push(expected[--i]!)
      continue
    }

    switch (choix[i]![j]) {
      case APPARIER:
        pairs.push({ expected: expected[i - 1]!, actual: actual[j - 1]! })
        i--
        j--
        break
      case MANQUE:
        missing.push(expected[--i]!)
        break
      default:
        extra.push(actual[--j]!)
    }
  }

  return { pairs: pairs.reverse(), missing: missing.reverse(), extra: extra.reverse() }
}
