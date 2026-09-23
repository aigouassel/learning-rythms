import {
  compare,
  fraction,
  measureLength,
  pattern,
  sub,
  toNumber,
  type Fraction,
  type Meter,
  type Onset,
  type Pattern,
  type Voice,
} from '@rythmes/core'

/**
 * Une lecture possible d'une suite de frappes.
 *
 * Le pluriel est le sujet : quantifier n'a pas de réponse unique. Trois frappes
 * légèrement inégales sont-elles un triolet, ou deux croches et un retard ?
 * La machine doit choisir, et selon ce qu'elle choisit elle masque ton erreur
 * ou en invente une.
 *
 * On rend donc la liste des lectures plausibles, du moins coûteux au plus
 * coûteux, et c'est l'élève qui tranche. L'ambiguïté technique devient le
 * levier pédagogique : ton oreille propose, ton nommage dispose.
 */
export type QuantizeCandidate = {
  readonly pattern: Pattern
  /** La subdivision sur laquelle on a aligné. */
  readonly grid: Fraction
  readonly label: string
  /** L'écart total à cette grille, en rondes. Zéro pour une frappe parfaite. */
  readonly cost: number
}

/**
 * Les grilles qu'on essaie, et leur nom en français.
 *
 * Volontairement restreintes à ce que le cours emploie : ouvrir à toutes les
 * subdivisions rendrait la quantification capable de tout justifier, et la
 * liste de candidats cesserait d'être un choix pour devenir un bruit.
 */
const GRILLES: readonly { grid: Fraction; label: string }[] = [
  { grid: fraction(1, 4), label: 'en noires' },
  { grid: fraction(1, 8), label: 'en croches' },
  { grid: fraction(1, 16), label: 'en doubles croches' },
  { grid: fraction(1, 6), label: 'en triolets de noires' },
  { grid: fraction(1, 12), label: 'en triolets de croches' },
]

export type QuantizeOptions = {
  /** Les instants frappés, en rondes depuis le début du motif. */
  readonly positions: readonly number[]
  readonly meter: Meter
  readonly length?: Fraction
  readonly voice?: Voice
  readonly grids?: readonly { grid: Fraction; label: string }[]
  /** Combien de lectures proposer. Trois suffisent à faire un choix. */
  readonly max?: number
}

export function quantize(options: QuantizeOptions): readonly QuantizeCandidate[] {
  const { positions, meter, voice = 'kick', grids = GRILLES, max = 3 } = options
  const length = options.length ?? measureLength(meter)
  if (positions.length === 0) return []

  const candidats: QuantizeCandidate[] = []

  for (const { grid, label } of grids) {
    const pas = toNumber(grid)
    const dernierPas = Math.round(toNumber(length) / pas)

    // On aligne chaque frappe sur le point de grille le plus proche, sans
    // jamais la laisser sortir du motif ni retomber sur la précédente.
    const cases: number[] = []
    let cout = 0
    let tientTout = true

    for (const p of positions) {
      const brut = Math.min(Math.max(Math.round(p / pas), 0), dernierPas - 1)
      const dernier = cases.at(-1)
      const place = dernier !== undefined && brut <= dernier ? dernier + 1 : brut

      // Une grille trop grossière ne peut pas loger toutes les frappes. Ce
      // n'est pas une lecture imparfaite, c'est une lecture impossible : si on
      // se contentait d'ignorer les frappes en trop, cette grille paraîtrait
      // gratuite et gagnerait à tous les coups.
      if (place >= dernierPas) {
        tientTout = false
        break
      }

      cases.push(place)
      cout += Math.abs(p - place * pas)
    }

    if (!tientTout || cases.length === 0) continue

    const onsets: Onset[] = cases.map((c, i) => {
      const debut = fraction(c * grid.num, grid.den)
      const suivante = cases[i + 1]
      const fin = suivante === undefined ? length : fraction(suivante * grid.num, grid.den)
      return { at: debut, duration: sub(fin, debut), voice }
    })

    candidats.push({
      pattern: pattern({ meter, length, onsets }),
      grid,
      label,
      cost: cout,
    })
  }

  return candidats
    .sort((a, b) => a.cost - b.cost || compare(b.grid, a.grid))
    .filter(distinctes())
    .slice(0, max)
}

/**
 * Deux grilles produisent souvent le même rythme — des noires tombent aussi
 * bien sur la grille des croches. On ne propose pas deux fois la même réponse.
 */
function distinctes(): (c: QuantizeCandidate) => boolean {
  const vus = new Set<string>()
  return (c) => {
    const signature = c.pattern.onsets
      .map((o) => `${o.at.num}/${o.at.den}:${o.duration.num}/${o.duration.den}`)
      .join(' ')
    if (vus.has(signature)) return false
    vus.add(signature)
    return true
  }
}
