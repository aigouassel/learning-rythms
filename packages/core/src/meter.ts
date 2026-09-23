import { fraction, type Fraction } from './fraction'

/**
 * Le chiffrage indicateur d'une mesure.
 *
 * `beats` compte, `unit` nomme l'unité : 3/4 vaut trois noires, 6/8 vaut six
 * croches. Le dénominateur ne dit donc pas combien il y a de temps — un 6/8 a
 * deux temps ternaires, pas six temps. C'est le faux ami le plus fréquent du
 * cours (voir docs/lexique.md).
 *
 * `grouping` porte les appuis quand ils ne sont pas réguliers : un 7/8 se
 * groupe en 2+2+3, et le choix du groupement change complètement ce qu'on
 * entend. Absent, le groupement est celui que la convention impose.
 */
export type Meter = {
  readonly beats: number
  readonly unit: number
  readonly grouping?: readonly number[]
}

export function meter(beats: number, unit: number, grouping?: readonly number[]): Meter {
  if (!Number.isInteger(beats) || beats <= 0) {
    throw new RangeError(`Un chiffrage compte un nombre entier positif d’unités, reçu ${beats}`)
  }
  if (!Number.isInteger(unit) || unit <= 0) {
    throw new RangeError(`L’unité d’un chiffrage est un entier positif, reçu ${unit}`)
  }
  if (grouping) {
    const total = grouping.reduce((s, g) => s + g, 0)
    if (total !== beats) {
      throw new RangeError(
        `Le groupement ${grouping.join('+')} totalise ${total}, mais le chiffrage en annonce ${beats}`,
      )
    }
  }
  return grouping ? { beats, unit, grouping } : { beats, unit }
}

/**
 * La longueur d'une mesure, exprimée en rondes.
 *
 * La ronde sert d'unité de référence parce qu'elle est la seule figure dont la
 * valeur ne dépend pas du chiffrage : 4/4 et 2/2 durent tous deux une ronde.
 */
export const measureLength = (m: Meter): Fraction => fraction(m.beats, m.unit)

/** Un 6/8 ou un 9/8 : le temps s'y divise en trois. */
export const isCompound = (m: Meter): boolean => m.beats % 3 === 0 && m.beats > 3
