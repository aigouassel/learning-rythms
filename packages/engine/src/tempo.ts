import { div, toNumber, type Fraction } from '@rythmes/core'

/**
 * Un tempo, tel qu'une partition l'écrit : une figure et son nombre par minute.
 *
 * ♩ = 72 et ♩. = 60 ne désignent pas la même chose, et aucun des deux ne se
 * réduit à « des temps par minute » : en 6/8 le temps est une noire pointée,
 * en 7/8 groupé en 2+2+3 les temps n'ont même pas tous la même durée. Nommer
 * explicitement la figure de référence évite cette ambiguïté partout.
 *
 * `per` est une durée en rondes, comme dans tout le reste du domaine.
 */
export type Tempo = {
  readonly bpm: number
  readonly per: Fraction
}

export const tempo = (bpm: number, per: Fraction): Tempo => {
  if (!(bpm > 0) || !Number.isFinite(bpm)) {
    throw new RangeError(`Un tempo est un nombre positif fini, reçu ${bpm}`)
  }
  return { bpm, per }
}

/**
 * Combien de secondes dure une durée à ce tempo.
 *
 * C'est la frontière : au-delà, on est en flottants et l'exactitude est perdue.
 * Elle ne revient pas, ce qui est sans conséquence — le temps physique n'a
 * jamais été exact.
 */
export const secondsFor = (duration: Fraction, t: Tempo): number =>
  toNumber(div(duration, t.per)) * (60 / t.bpm)
