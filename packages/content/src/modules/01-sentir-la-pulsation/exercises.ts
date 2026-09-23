import { fraction } from '@rythmes/core'
import type { Exercise } from '../../types'
import { house, marche, nue } from './patterns'

const NOIRE = fraction(1, 4)

/**
 * Les exercices du module 1.
 *
 * Aucune notation : elle n'existe pas encore. Ce module travaille l'exécution
 * et la perception, et rien d'autre — y glisser une dictée reviendrait à
 * demander d'écrire dans une langue qu'on n'a pas apprise.
 */
export const EXERCISES: readonly Exercise[] = [
  {
    kind: 'frappe',
    id: '01-avec-la-house',
    module: 1,
    consigne:
      'Frappe avec la grosse caisse. Rien d’autre à faire que tomber avec elle — c’est le battement le plus explicite qu’une musique puisse offrir.',
    grille: house,
    bpm: 120,
    parTemps: NOIRE,
    cycles: 4,
    voix: 'kick',
  },
  {
    kind: 'frappe',
    id: '01-tenir-seule',
    module: 1,
    consigne:
      'Le battement s’arrête à mi-parcours et tu continues seule. C’est l’épreuve la plus honnête du rythme intérieur : dix ans de fanfare devraient s’y entendre.',
    grille: nue,
    bpm: 88,
    parTemps: NOIRE,
    cycles: 6,
    clicSArrete: true,
  },
  {
    kind: 'discrimination',
    id: '01-lent-ou-rapide',
    module: 1,
    consigne:
      'Deux marches, la même musique. Laquelle avance le plus vite ? Écoute la seconde — elle est jouée à la moitié de la vitesse de la première.',
    joue: marche,
    choix: ['La première', 'La seconde', 'Les deux avancent pareil'],
    bonne: 0,
  },
]
