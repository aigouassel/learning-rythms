import { fraction } from '@rythmes/core'
import type { Exercise } from '../../types'
import {
  marche,
  marcheSoutenue,
  popComplete,
  sansAppui,
  valse,
  valseNue,
  valseSoutenue,
} from './patterns'

const NOIRE = fraction(1, 4)

/**
 * Les exercices du module 2.
 *
 * Toujours pas de notation — elle arrive au module 3. Ce qu'on travaille ici
 * est la perception d'un cycle et la capacité à le marquer soi-même, ce qui ne
 * demande aucun signe écrit.
 *
 * Les trois premiers posent la même question à trois cycles différents, et
 * c'est voulu : la longueur du cycle ne se déduit pas, elle se reconnaît, et
 * on ne reconnaît qu'après avoir comparé.
 */
export const EXERCISES: readonly Exercise[] = [
  {
    kind: 'discrimination',
    id: '02-combien-de-temps-marche',
    module: 2,
    consigne:
      'Écoute où revient l’appui — la frappe qui sonne plus fort. Tous les combien revient-il ?',
    joue: marche,
    bpm: 104,
    choix: ['Tous les deux', 'Tous les trois', 'Tous les quatre'],
    bonne: 0,
  },
  {
    kind: 'discrimination',
    id: '02-combien-de-temps',
    module: 2,
    consigne: 'Même question. Compte à partir de l’appui, et jusqu’au suivant.',
    joue: valse,
    bpm: 132,
    choix: ['Tous les deux', 'Tous les trois', 'Tous les quatre'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '02-combien-de-temps-pop',
    module: 2,
    consigne:
      'Et celui-ci. Attention au piège : les frappes claires reviennent deux fois plus souvent que l’appui.',
    joue: popComplete,
    bpm: 96,
    choix: ['Tous les deux', 'Tous les trois', 'Tous les quatre'],
    bonne: 2,
  },
  {
    kind: 'discrimination',
    id: '02-marche-ou-valse',
    module: 2,
    consigne:
      'Celle-ci : marche ou valse ? Tu n’as pas besoin de compter, l’appui suffit à décider.',
    joue: marche,
    bpm: 104,
    choix: ['Une marche', 'Une valse'],
    bonne: 0,
  },
  {
    kind: 'discrimination',
    id: '02-valse-ou-marche',
    module: 2,
    consigne: 'Et celle-ci ? Même question, réponse différente.',
    joue: valseSoutenue,
    bpm: 132,
    choix: ['Une marche', 'Une valse'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '02-ou-tombe-la-claire',
    module: 2,
    consigne:
      'La frappe claire revient deux fois par cycle. Tombe-t-elle sur les mêmes temps que l’appui, ou entre eux ?',
    joue: popComplete,
    bpm: 96,
    choix: ['Sur le premier et le troisième', 'Sur le deuxième et le quatrième'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '02-quand-rien-ne-marque',
    module: 2,
    consigne:
      'Celui-ci est une question honnête, pas un piège : toutes les frappes sont identiques. Tous les combien revient l’appui ?',
    joue: sansAppui,
    bpm: 92,
    choix: [
      'Tous les deux',
      'Tous les quatre',
      'On ne peut pas le savoir : rien ne le marque',
    ],
    bonne: 2,
  },
  {
    kind: 'frappe',
    id: '02-marquer-l-appui',
    module: 2,
    consigne:
      'Ne frappe que l’appui, une fois par cycle — laisse passer les autres. C’est plus difficile que de tout frapper : il faut compter en silence.',
    grille: popComplete,
    bpm: 96,
    parTemps: NOIRE,
    cycles: 4,
    voix: 'kick',
  },
  {
    kind: 'frappe',
    id: '02-marquer-l-appui-en-valse',
    module: 2,
    consigne:
      'La même chose sur un cycle de trois. Le compte impair désoriente plus qu’on ne s’y attend : deux temps à laisser passer au lieu d’un seul.',
    grille: valseSoutenue,
    bpm: 138,
    parTemps: NOIRE,
    cycles: 6,
    voix: 'kick',
  },
  {
    kind: 'frappe',
    id: '02-frapper-les-faibles',
    module: 2,
    consigne:
      'L’inverse : ne frappe que les temps faibles, jamais l’appui. C’est le geste de celle qui accompagne plutôt que de celle qui conduit — et il faut sentir l’appui pour l’éviter.',
    grille: popComplete,
    bpm: 92,
    parTemps: NOIRE,
    cycles: 4,
    voix: 'snare',
  },
  {
    kind: 'frappe',
    id: '02-frapper-les-trois-temps',
    module: 2,
    consigne:
      'Cette fois, frappe les trois temps du cycle, en faisant sonner le premier plus fort que les deux autres. L’accent est un geste, pas une idée.',
    grille: valseNue,
    bpm: 120,
    parTemps: NOIRE,
    cycles: 6,
    voix: 'clave',
  },
  {
    kind: 'frappe',
    id: '02-frapper-la-marche',
    module: 2,
    consigne:
      'Deux temps seulement, à l’allure de la fanfare. Frappe le premier de chaque paire — c’est le pied gauche.',
    grille: marcheSoutenue,
    bpm: 112,
    parTemps: NOIRE,
    cycles: 8,
    voix: 'kick',
  },
  {
    kind: 'frappe',
    id: '02-tenir-le-cycle-sans-appui',
    module: 2,
    consigne:
      'Rien ne marque le cycle, et le battement s’arrête en route. À toi de le porter : frappe les quatre temps, et fais entendre le premier plus fort.',
    grille: sansAppui,
    bpm: 84,
    parTemps: NOIRE,
    cycles: 6,
    clicSArrete: true,
  },
]
