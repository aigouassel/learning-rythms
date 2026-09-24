import { fraction } from '@rythmes/core'
import type { Exercise } from '@rythmes/syllabus'
import {
  deuxCrochesPuisNoire,
  enDeux,
  enSixHuit,
  enTrois,
  enTroisQuarts,
  marcheEnSixHuit,
  quatreDoublesPuisNoire,
  shuffle,
  shuffleComplet,
  sixHuitAmpute,
  triolet,
  trioletDeNoires,
} from './patterns'

const NOIRE = fraction(1, 4)
const NOIRE_POINTEE = fraction(3, 8)

/**
 * Les exercices du module 6.
 *
 * Pas de dictée : écrire du ternaire demande des conventions qu'on vient à
 * peine d'introduire, et le point dur de ce module n'est pas l'écriture —
 * c'est d'entendre la différence. Tout le reste y passe en revanche, parce
 * que ce module est celui des faux amis, et qu'un faux ami ne se dissipe
 * qu'en le mettant face à son jumeau.
 *
 * Trois couples structurent la liste : deux contre trois à l'intérieur du
 * temps, deux appuis contre trois sur les mêmes six croches, et le balancement
 * contre l'égalité. Dans chaque couple, les deux motifs se suivent
 * immédiatement — comparer de mémoire à dix exercices d'écart ne marche pas.
 */
export const EXERCISES: readonly Exercise[] = [
  {
    kind: 'discrimination',
    id: '06-deux-ou-trois',
    module: 6,
    consigne:
      'Combien de frappes tombent à l’intérieur d’un seul temps ? C’est la question centrale du module, et elle se répond à l’oreille.',
    joue: enTrois,
    bpm: 80,
    choix: ['Deux', 'Trois'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '06-deux-ou-trois-bis',
    module: 6,
    consigne: 'Même question, autre motif. Rien d’autre ne change que la division.',
    joue: enDeux,
    bpm: 80,
    choix: ['Deux', 'Trois'],
    bonne: 0,
  },
  {
    kind: 'discrimination',
    id: '06-six-huit-ou-trois-quarts',
    module: 6,
    consigne:
      'Six croches dans les deux cas. Écoute où reviennent les appuis : combien en entends-tu par mesure ?',
    joue: enSixHuit,
    bpm: 108,
    parTemps: NOIRE_POINTEE,
    choix: ['Deux appuis', 'Trois appuis'],
    bonne: 0,
  },
  {
    kind: 'discrimination',
    id: '06-le-meme-mais-groupe-autrement',
    module: 6,
    consigne: 'Celui-ci maintenant. Mêmes six croches, appuis différents — deux ou trois ?',
    joue: enTroisQuarts,
    bpm: 112,
    choix: ['Deux appuis', 'Trois appuis'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '06-balance-ou-egal',
    module: 6,
    consigne:
      'Deux sons par temps. Sont-ils égaux, ou le premier mange-t-il la place du second ?',
    joue: shuffle,
    bpm: 84,
    choix: ['Égaux', 'Le premier est plus long'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '06-balance-ou-egal-bis',
    module: 6,
    consigne:
      'Et celui-ci ? La différence est petite à l’écrit et énorme à l’oreille : c’est tout le sujet.',
    joue: enDeux,
    bpm: 84,
    choix: ['Égaux', 'Le premier est plus long'],
    bonne: 0,
  },
  {
    kind: 'discrimination',
    id: '06-trois-sur-deux-temps',
    module: 6,
    consigne:
      'Trois frappes régulières au début de la mesure. Occupent-elles un seul temps, ou deux ?',
    joue: trioletDeNoires,
    bpm: 72,
    choix: ['Un seul temps', 'Deux temps'],
    bonne: 1,
  },
  {
    kind: 'qcm',
    id: '06-reconnaitre-le-triolet',
    module: 6,
    consigne:
      'Le premier temps porte plusieurs sons. Combien, et donc laquelle des trois notations ?',
    joue: triolet,
    bpm: 72,
    options: [deuxCrochesPuisNoire, triolet, quatreDoublesPuisNoire],
    bonne: 1,
  },
  {
    kind: 'appariement',
    id: '06-apparier-les-divisions',
    module: 6,
    consigne:
      'Trois façons de remplir le même temps. Relie chaque son à sa notation — c’est le nombre de frappes qui décide, pas leur vitesse apparente.',
    motifs: [enDeux, enTrois, triolet],
    bpm: 76,
  },
  {
    kind: 'frappe',
    id: '06-frapper-le-triolet',
    module: 6,
    consigne:
      'Frappe les trois notes du premier temps, puis la noire du second. Le passage de trois à un est ce qui résiste.',
    grille: triolet,
    bpm: 66,
    parTemps: NOIRE,
    cycles: 4,
  },
  {
    kind: 'frappe',
    id: '06-frapper-le-shuffle',
    module: 6,
    consigne:
      'Le balancement du blues, à la main. Ne cherche pas à mesurer : pense « long-court », et laisse le geste trouver la proportion.',
    grille: shuffleComplet,
    bpm: 84,
    parTemps: NOIRE,
    cycles: 4,
    voix: 'hihat',
  },
  {
    kind: 'frappe',
    id: '06-frapper-les-deux-appuis',
    module: 6,
    consigne:
      'En 6/8, ne frappe que les deux appuis — un toutes les trois croches. C’est le geste du chef de fanfare, et il ne compte pas jusqu’à six.',
    grille: marcheEnSixHuit,
    bpm: 104,
    parTemps: NOIRE_POINTEE,
    cycles: 6,
    voix: 'kick',
  },
  {
    kind: 'frappe',
    id: '06-frapper-trois-sur-deux-temps',
    module: 6,
    consigne:
      'Les trois notes du début couvrent deux temps entiers. Compte les deux temps, et répartis les trois frappes dedans sans t’appuyer sur le second.',
    grille: trioletDeNoires,
    bpm: 66,
    parTemps: NOIRE,
    cycles: 4,
    voix: 'snare',
  },
  {
    kind: 'dechiffrage',
    id: '06-lire-une-marche-en-six-huit',
    module: 6,
    consigne:
      'Une marche en 6/8 — terrain connu. Lis la grosse caisse et frappe ses deux appuis par mesure, sans écouter d’abord.',
    aLire: marcheEnSixHuit,
    bpm: 104,
    parTemps: NOIRE_POINTEE,
  },
  {
    kind: 'reperage',
    id: '06-le-six-huit-troue',
    module: 6,
    consigne:
      'Six croches écrites, et l’enregistrement en oublie une. Compte par groupes de trois, jamais une à une.',
    ecrit: enSixHuit,
    joue: sixHuitAmpute,
    bpm: 96,
    parTemps: NOIRE_POINTEE,
  },
]
