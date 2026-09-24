import Lecon01 from '@rythmes/01-sentir-la-pulsation/lesson.mdx'
import Lecon02 from '@rythmes/02-temps-forts-et-faibles/lesson.mdx'
import Lecon03 from '@rythmes/03-les-durees/lesson.mdx'
import Lecon04 from '@rythmes/04-lire-et-ecrire/lesson.mdx'
import Lecon05 from '@rythmes/05-enrichir-le-vocabulaire/lesson.mdx'
import Lecon06 from '@rythmes/06-composees-et-ternaire/lesson.mdx'
import Lecon07 from '@rythmes/07-polyrythmie/lesson.mdx'
import Lecon08 from '@rythmes/08-le-rythme-comme-materiau/lesson.mdx'
import type { ComponentType } from 'react'

/**
 * Les leçons écrites, par module.
 *
 * Ce registre est côté application et non dans les libs de module, parce qu'un
 * `.mdx` a besoin d'un compilateur que les tests n'ont pas. Chaque lib porte sa
 * leçon et l'expose ; c'est ici, et ici seulement, qu'elle devient un
 * composant. Les données du cours restent vérifiables sans navigateur ; la
 * prose, elle, ne l'est qu'ici.
 *
 * Un module absent de cette table n'a pas encore de cours rédigé, et
 * l'application le dit plutôt que d'afficher une page vide.
 */
export const LECONS: Readonly<Record<number, ComponentType>> = {
  1: Lecon01,
  2: Lecon02,
  3: Lecon03,
  4: Lecon04,
  5: Lecon05,
  6: Lecon06,
  7: Lecon07,
  8: Lecon08,
}
