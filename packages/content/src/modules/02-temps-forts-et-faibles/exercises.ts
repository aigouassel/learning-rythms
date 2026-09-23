import { fraction } from '@rythmes/core'
import type { Exercise } from '../../types'
import { marche, pop, valse } from './patterns'

const NOIRE = fraction(1, 4)

/**
 * Les exercices du module 2.
 *
 * Toujours pas de notation — elle arrive au module 3. Ce qu'on travaille ici
 * est la perception d'un cycle et la capacité à le marquer soi-même, ce qui ne
 * demande aucun signe écrit.
 */
export const EXERCISES: readonly Exercise[] = [
  {
    kind: 'discrimination',
    id: '02-combien-de-temps',
    module: 2,
    consigne:
      'Écoute où revient l’appui — la frappe qui sonne plus fort. Tous les combien revient-il ?',
    joue: valse,
    choix: ['Tous les deux', 'Tous les trois', 'Tous les quatre'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '02-marche-ou-valse',
    module: 2,
    consigne:
      'Celle-ci : marche ou valse ? Tu n’as pas besoin de compter, l’appui suffit à décider.',
    joue: marche,
    choix: ['Une marche', 'Une valse'],
    bonne: 0,
  },
  {
    kind: 'frappe',
    id: '02-marquer-l-appui',
    module: 2,
    consigne:
      'Ne frappe que l’appui, une fois par cycle — laisse passer les autres. C’est plus difficile que de tout frapper : il faut compter en silence.',
    grille: pop,
    bpm: 96,
    parTemps: NOIRE,
    cycles: 4,
    voix: 'kick',
  },
]
