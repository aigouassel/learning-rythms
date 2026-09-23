import { fraction } from '@rythmes/core'
import type { Exercise } from '../../types'
import {
  house,
  houseDense,
  marcheSoutenue,
  nue,
  pulsationCachee,
  trouAuDernier,
  trouAuTroisieme,
} from './patterns'

const NOIRE = fraction(1, 4)

/**
 * Les exercices du module 1.
 *
 * Aucune notation : elle n'existe pas encore. Ce module travaille l'exécution
 * et la perception, et rien d'autre — y glisser une dictée reviendrait à
 * demander d'écrire dans une langue qu'on n'a pas apprise. Deux genres donc,
 * et la variété vient d'ailleurs : de la vitesse, et de ce qu'on retire.
 *
 * L'ordre suit une difficulté réelle. Frapper avec une musique qui frappe est
 * facile ; le faire très lentement ne l'est plus, parce que rien ne rattrape
 * entre deux battements ; le faire sans musique l'est encore moins ; et le
 * faire quand la musique ne frappe qu'un battement sur deux est le moment où
 * l'on découvre si la pulsation est au-dehors ou au-dedans.
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
    id: '01-house-au-ralenti',
    module: 1,
    consigne:
      'La même chose, moitié moins vite. C’est plus difficile, et pour une raison précise : entre deux battements lents, il y a de la place pour se tromper, et rien pour te rattraper.',
    grille: house,
    bpm: 62,
    parTemps: NOIRE,
    cycles: 4,
    voix: 'kick',
  },
  {
    kind: 'frappe',
    id: '01-la-marche',
    module: 1,
    consigne:
      'Une marche, à l’allure où l’on marche vraiment. Frappe la grosse caisse — le charleston remplit entre les deux, ne le suis pas.',
    grille: marcheSoutenue,
    bpm: 108,
    parTemps: NOIRE,
    cycles: 8,
    voix: 'kick',
  },
  {
    kind: 'frappe',
    id: '01-marche-vive',
    module: 1,
    consigne:
      'La même marche, nettement plus vive. À cette allure, corriger coup par coup ne marche plus : il faut lancer le geste et le laisser tourner.',
    grille: marcheSoutenue,
    bpm: 152,
    parTemps: NOIRE,
    cycles: 8,
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
    kind: 'frappe',
    id: '01-tenir-seule-lentement',
    module: 1,
    consigne:
      'La même épreuve, très lente. La dérive qu’on ne remarque pas à vitesse normale devient ici impossible à cacher : chaque écart a le temps de se voir.',
    grille: nue,
    bpm: 52,
    parTemps: NOIRE,
    cycles: 6,
    clicSArrete: true,
  },
  {
    kind: 'frappe',
    id: '01-tenir-seule-vite',
    module: 1,
    consigne:
      'Et vite. L’erreur change de nature : on ne dérive plus, on se crispe — et se crisper fait accélérer.',
    grille: nue,
    bpm: 160,
    parTemps: NOIRE,
    cycles: 8,
    clicSArrete: true,
  },
  {
    kind: 'frappe',
    id: '01-la-pulsation-cachee',
    module: 1,
    consigne:
      'Ici la grosse caisse ne tombe qu’un battement sur deux. Frappe-la — ce qui veut dire porter les deux autres battements sans les jouer.',
    grille: pulsationCachee,
    bpm: 96,
    parTemps: NOIRE,
    cycles: 6,
    voix: 'kick',
  },
  {
    kind: 'discrimination',
    id: '01-un-sur-deux',
    module: 1,
    consigne:
      'Écoute la frappe grave. Tombe-t-elle sur chaque battement, ou un battement sur deux ?',
    joue: pulsationCachee,
    bpm: 96,
    choix: ['Sur chaque battement', 'Un battement sur deux'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '01-combien-entre-deux-graves',
    module: 1,
    consigne:
      'Compte les frappes claires qui tombent entre deux frappes graves — celle du début comprise. Combien en entends-tu ?',
    joue: houseDense,
    bpm: 120,
    choix: ['Une', 'Deux', 'Quatre'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '01-ou-est-le-trou',
    module: 1,
    consigne:
      'Quatre battements, trois frappes : il en manque une. Compte à partir de la plus forte — laquelle manque ?',
    joue: trouAuTroisieme,
    bpm: 80,
    choix: ['La deuxième', 'La troisième', 'La quatrième'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '01-l-autre-trou',
    module: 1,
    consigne:
      'Et celle-ci ? Même chose, le trou a changé de place. C’est le battement absent qu’il faut entendre, ce qui revient à l’avoir compté soi-même.',
    joue: trouAuDernier,
    bpm: 80,
    choix: ['La deuxième', 'La troisième', 'La quatrième'],
    bonne: 2,
  },
]
