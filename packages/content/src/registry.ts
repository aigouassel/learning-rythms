import { EXERCISES as module3 } from './modules/03-les-durees/exercises'
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
  3: module3,
}

export const exercisesOf = (module: number): readonly Exercise[] =>
  EXERCISES_BY_MODULE[module] ?? []
