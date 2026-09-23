import { equals, fraction, mul, type Fraction } from '@rythmes/core'

/**
 * Les figures de note, de la plus longue à la plus brève.
 *
 * L'ordre du tableau est celui des divisions successives par deux : c'est la
 * proportion que le module 3 enseigne, avant même que les noms soient donnés.
 */
export const FIGURE_NAMES = [
  'ronde',
  'blanche',
  'noire',
  'croche',
  'double',
  'triple',
] as const

export type FigureName = (typeof FIGURE_NAMES)[number]

/**
 * Un découpage irrégulier du temps : trois notes dans la place de deux.
 *
 * `count` est ce qu'on joue, `inSpaceOf` ce qu'on aurait joué sans lui. Le
 * triolet est le cas du module 6 ; le duolet (deux dans la place de trois) est
 * son symétrique en mesure composée.
 */
export type Tuplet = {
  readonly count: number
  readonly inSpaceOf: number
}

export type Figure = {
  readonly name: FigureName
  /** Chaque point ajoute la moitié de ce qui précède. */
  readonly dots: 0 | 1 | 2
  readonly tuplet?: Tuplet
}

export const figure = (name: FigureName, dots: 0 | 1 | 2 = 0, tuplet?: Tuplet): Figure =>
  tuplet ? { name, dots, tuplet } : { name, dots }

/** La valeur nue d'une figure, en rondes : une ronde vaut 1, une noire 1/4. */
const baseDuration = (name: FigureName): Fraction =>
  fraction(1, 2 ** FIGURE_NAMES.indexOf(name))

/**
 * La durée d'une figure, points et découpage compris.
 *
 * Un point ajoute la moitié de la valeur, deux points la moitié puis le quart :
 * le facteur est (2^(n+1) − 1) / 2^n. Écrit ainsi, il se lit comme ce qu'il
 * est — la somme d'une série qui approche le double sans jamais l'atteindre.
 */
export function figureDuration(f: Figure): Fraction {
  const pointee = mul(baseDuration(f.name), fraction(2 ** (f.dots + 1) - 1, 2 ** f.dots))
  return f.tuplet ? mul(pointee, fraction(f.tuplet.inSpaceOf, f.tuplet.count)) : pointee
}

/**
 * Les découpages que le cours emploie, dans l'ordre où on les essaie.
 *
 * Volontairement restreint : accepter n'importe quel rapport rendrait
 * `figureFor` capable de tout justifier, y compris des durées qu'aucune
 * notation raisonnable ne produit.
 */
const TUPLETS: readonly Tuplet[] = [
  { count: 3, inSpaceOf: 2 }, // triolet — module 6
  { count: 2, inSpaceOf: 3 }, // duolet, son symétrique en mesure composée
]

/**
 * Quelle figure vaut exactement cette durée ?
 *
 * Renvoie `null` quand aucune ne convient — c'est le cas le plus intéressant :
 * une durée inexprimable d'un seul signe devra s'écrire par une liaison de
 * prolongation, et c'est le travail de l'étape suivante, pas celui-ci.
 *
 * L'ordre de recherche porte une préférence d'écriture : d'abord les figures
 * nues, puis les pointées, puis seulement les découpages irréguliers. Entre
 * deux écritures correctes, on choisit toujours la plus simple à lire.
 */
export function figureFor(duration: Fraction): Figure | null {
  for (const dots of [0, 1, 2] as const) {
    for (const name of FIGURE_NAMES) {
      const candidate = figure(name, dots)
      if (equals(figureDuration(candidate), duration)) return candidate
    }
  }

  for (const tuplet of TUPLETS) {
    for (const dots of [0, 1] as const) {
      for (const name of FIGURE_NAMES) {
        const candidate = figure(name, dots, tuplet)
        if (equals(figureDuration(candidate), duration)) return candidate
      }
    }
  }

  return null
}

/**
 * Le nom du silence de même valeur.
 *
 * Le français nomme les silences par une série qui lui est propre — un soupir
 * n'évoque pas la noire dont il partage la durée. C'est précisément ce que le
 * module 3 doit rendre explicite : ce sont des durées, pas des absences.
 */
const REST_NAMES: Record<FigureName, string> = {
  ronde: 'pause',
  blanche: 'demi-pause',
  noire: 'soupir',
  croche: 'demi-soupir',
  double: 'quart de soupir',
  triple: 'huitième de soupir',
}

export const restName = (name: FigureName): string => REST_NAMES[name]
