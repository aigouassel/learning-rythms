import { DIAGNOSTIC as module0 } from './modules/00-prise-de-reperes/diagnostic'
import { EXERCISES as module1 } from './modules/01-sentir-la-pulsation/exercises'
import { EXERCISES as module2 } from './modules/02-temps-forts-et-faibles/exercises'
import { EXERCISES as module3 } from './modules/03-les-durees/exercises'
import { EXERCISES as module4 } from './modules/04-lire-et-ecrire/exercises'
import { EXERCISES as module5 } from './modules/05-enrichir-le-vocabulaire/exercises'
import { EXERCISES as module6 } from './modules/06-composees-et-ternaire/exercises'
import { EXERCISES as module7 } from './modules/07-polyrythmie/exercises'
import { EXERCISES as module8 } from './modules/08-le-rythme-comme-materiau/exercises'
import type { Exercise } from './types'

/**
 * Les exercices, par module.
 *
 * La prose reste dans son `.mdx` et n'entre pas ici : elle a besoin d'un
 * compilateur que les tests n'ont pas, et l'application l'importe directement.
 * Les exercices, eux, sont des données ordinaires — donc vérifiables sans
 * navigateur, ce qui est tout l'intérêt de les avoir typés.
 */
export const EXERCISES_BY_MODULE: Readonly<Record<number, readonly Exercise[]>> = {
  0: module0,
  1: module1,
  2: module2,
  3: module3,
  4: module4,
  5: module5,
  6: module6,
  7: module7,
  8: module8,
}

export const exercisesOf = (module: number): readonly Exercise[] =>
  EXERCISES_BY_MODULE[module] ?? []
