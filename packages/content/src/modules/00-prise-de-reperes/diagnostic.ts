import { fraction } from '@rythmes/core'
import type { Exercise } from '../../types'
import {
  clic,
  enDeux,
  cycleDeTrois,
  deuxCrochesUneNoire,
  deuxNoires,
  doublesPuisNoire,
  enTrois,
  quatreCroches,
  silencePuisNoire,
  uneNoireDeuxCroches,
} from './patterns'

const NOIRE = fraction(1, 4)

/**
 * Les épreuves du diagnostic.
 *
 * Elles ne notent rien et ne ferment aucune porte : elles disent par où
 * commencer. Une zone d'ombre reste ouverte tant qu'on ne l'a pas mesurée — la
 * lecture rythmique tient-elle, ou se contourne-t-elle à l'oreille ? — et un
 * cours sérieux la lève au lieu de la supposer.
 *
 * Cette page reste volontairement plus courte que celles des modules. Un
 * diagnostic n'entraîne rien : il mesure, et se mesurer quinze fois de suite
 * avant d'avoir rien appris décourage sans rien apprendre. Neuf épreuves,
 * trois par question posée — tenir, compter, lire — parce qu'une épreuve
 * unique se réussit ou se rate par hasard.
 *
 * Les consignes n'emploient **aucun mot de théorie**, ce qui n'est pas une
 * précaution de façade : à ce stade, nommer serait déjà enseigner. On demande
 * de compter et de comparer, pas de qualifier.
 */
export const DIAGNOSTIC: readonly Exercise[] = [
  {
    kind: 'frappe',
    id: '00-tenir',
    module: 0,
    consigne:
      'Frappe avec le clic, puis continue sans lui quand il s’arrête. On regarde ensuite si tu accélères, si tu ralentis, ou si tu tiens.',
    grille: clic,
    bpm: 84,
    parTemps: NOIRE,
    cycles: 4,
    clicSArrete: true,
  },
  {
    kind: 'frappe',
    id: '00-tenir-lentement',
    module: 0,
    consigne:
      'La même chose, beaucoup plus lentement. C’est une autre épreuve : entre deux frappes lentes, rien ne vient te corriger.',
    grille: clic,
    bpm: 54,
    parTemps: NOIRE,
    cycles: 4,
    clicSArrete: true,
  },
  {
    kind: 'frappe',
    id: '00-tenir-vite',
    module: 0,
    consigne:
      'Et nettement plus vite. Les trois ensemble disent quelque chose qu’aucune ne dit seule.',
    grille: clic,
    bpm: 150,
    parTemps: NOIRE,
    cycles: 6,
    clicSArrete: true,
  },
  {
    kind: 'discrimination',
    id: '00-deux-ou-trois',
    module: 0,
    consigne:
      'Écoute, et compte combien de frappes tombent entre deux appuis. Deux, ou trois ?',
    joue: enTrois,
    bpm: 80,
    choix: ['Deux', 'Trois'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '00-deux-ou-trois-bis',
    module: 0,
    consigne: 'Même question sur un autre extrait.',
    joue: enDeux,
    bpm: 80,
    choix: ['Deux', 'Trois'],
    bonne: 0,
  },
  {
    kind: 'discrimination',
    id: '00-longueur-du-cycle',
    module: 0,
    consigne:
      'Écoute où revient l’appui — la frappe qui sonne plus fort. Tous les combien revient-il ?',
    joue: cycleDeTrois,
    bpm: 120,
    choix: ['Tous les deux', 'Tous les trois', 'Tous les quatre'],
    bonne: 1,
  },
  {
    kind: 'qcm',
    id: '00-lire',
    module: 0,
    consigne:
      'Celle-ci demande de lire. Si les trois dessins ne te disent rien, ce n’est pas grave : c’est précisément ce que le cours va construire.',
    joue: deuxCrochesUneNoire,
    bpm: 76,
    options: [deuxCrochesUneNoire, uneNoireDeuxCroches, quatreCroches],
    bonne: 0,
  },
  {
    kind: 'qcm',
    id: '00-lire-plus-fin',
    module: 0,
    consigne:
      'La même chose, en plus serré. Compte les frappes avant de choisir : c’est leur nombre qui décide, pas l’allure du dessin.',
    joue: doublesPuisNoire,
    bpm: 72,
    options: [deuxCrochesUneNoire, doublesPuisNoire, quatreCroches],
    bonne: 1,
  },
  {
    kind: 'qcm',
    id: '00-lire-un-silence',
    module: 0,
    consigne:
      'Celle-ci porte un silence. Trouver ce qui ne sonne pas est une autre affaire que reconnaître ce qui sonne — et c’est ce qu’on vérifie ici.',
    joue: silencePuisNoire,
    bpm: 72,
    options: [deuxNoires, silencePuisNoire, quatreCroches],
    bonne: 1,
  },
]
