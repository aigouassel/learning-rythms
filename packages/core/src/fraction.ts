/**
 * Des rationnels exacts, pour situer les attaques dans la mesure.
 *
 * Un flottant ne sait pas représenter un tiers : `1/3 + 1/3 + 1/3` y vaut
 * `0.9999999999999998`, et un triolet ne remplit jamais tout à fait son temps.
 * L'erreur est minuscule mais elle est fatale ici, parce que comparer deux
 * rythmes — corriger une dictée, reconnaître qu'un motif est le même — exige
 * une égalité stricte, pas une égalité à epsilon près.
 *
 * Les dénominateurs musicaux sont petits (2, 3, 4, 6, 8, 12, 16, 24) : des
 * entiers natifs suffisent largement, et `bigint` ne coûterait que de
 * l'inconfort.
 */

export type Fraction = {
  readonly num: number
  readonly den: number
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

/**
 * Construit une fraction sous forme normalisée : réduite, et le signe toujours
 * porté par le numérateur.
 *
 * La normalisation à la construction est ce qui rend l'égalité structurelle
 * fiable : `fraction(2, 4)` et `fraction(1, 2)` produisent le même objet, donc
 * deux rythmes écrits différemment mais sonnant pareil se comparent sans
 * précaution.
 */
export function fraction(num: number, den = 1): Fraction {
  if (den === 0) throw new RangeError('Une fraction ne peut pas avoir 0 pour dénominateur')
  if (!Number.isInteger(num) || !Number.isInteger(den)) {
    throw new RangeError(`Une fraction se construit sur des entiers, reçu ${num}/${den}`)
  }

  const signe = den < 0 ? -1 : 1
  const d = gcd(num, den) || 1

  return { num: (signe * num) / d, den: (signe * den) / d }
}

export const ZERO: Fraction = fraction(0)
export const ONE: Fraction = fraction(1)

export const add = (a: Fraction, b: Fraction): Fraction =>
  fraction(a.num * b.den + b.num * a.den, a.den * b.den)

export const sub = (a: Fraction, b: Fraction): Fraction =>
  fraction(a.num * b.den - b.num * a.den, a.den * b.den)

export const mul = (a: Fraction, b: Fraction): Fraction =>
  fraction(a.num * b.num, a.den * b.den)

export const div = (a: Fraction, b: Fraction): Fraction => {
  if (b.num === 0) throw new RangeError('Division par zéro')
  return fraction(a.num * b.den, a.den * b.num)
}

/** Négatif si `a < b`, zéro si égales, positif si `a > b`. */
export const compare = (a: Fraction, b: Fraction): number => a.num * b.den - b.num * a.den

export const equals = (a: Fraction, b: Fraction): boolean => a.num === b.num && a.den === b.den

export const lessThan = (a: Fraction, b: Fraction): boolean => compare(a, b) < 0

/**
 * Sortie vers le monde continu — le temps en secondes, une position en pixels.
 *
 * À n'appeler qu'à la frontière : dès qu'une valeur est passée en flottant,
 * l'exactitude est perdue et ne revient pas.
 */
export const toNumber = (f: Fraction): number => f.num / f.den

export const toString = (f: Fraction): string => (f.den === 1 ? `${f.num}` : `${f.num}/${f.den}`)
