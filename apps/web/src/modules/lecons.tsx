import Lecon01 from '@rythmes/content/modules/01-sentir-la-pulsation/lesson.mdx'
import Lecon02 from '@rythmes/content/modules/02-temps-forts-et-faibles/lesson.mdx'
import Lecon03 from '@rythmes/content/modules/03-les-durees/lesson.mdx'
import type { ComponentType } from 'react'

/**
 * Les leçons écrites, par module.
 *
 * Ce registre est côté application et non dans le paquet `content`, parce
 * qu'un `.mdx` a besoin d'un compilateur que les tests n'ont pas. Les données
 * du cours restent vérifiables sans navigateur ; la prose, elle, ne l'est
 * qu'ici.
 *
 * Un module absent de cette table n'a pas encore de cours rédigé, et
 * l'application le dit plutôt que d'afficher une page vide.
 */
export const LECONS: Readonly<Record<number, ComponentType>> = {
  1: Lecon01,
  2: Lecon02,
  3: Lecon03,
}
