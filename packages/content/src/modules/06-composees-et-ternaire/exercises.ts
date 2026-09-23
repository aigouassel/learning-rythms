import { fraction } from '@rythmes/core'
import type { Exercise } from '../../types'
import { enSixHuit, enTrois, enTroisQuarts, marcheEnSixHuit, triolet } from './patterns'

const NOIRE = fraction(1, 4)
const NOIRE_POINTEE = fraction(3, 8)

/**
 * Les exercices du module 6.
 *
 * Pas de dictée : écrire du ternaire demande une notation qu'on vient à peine
 * d'introduire, et le point dur de ce module n'est pas l'écriture — c'est
 * d'entendre la différence. Deux discriminations, donc, et deux exécutions.
 */
export const EXERCISES: readonly Exercise[] = [
  {
    kind: 'discrimination',
    id: '06-deux-ou-trois',
    module: 6,
    consigne:
      'Combien de frappes tombent à l’intérieur d’un seul temps ? C’est la question centrale du module, et elle se répond à l’oreille.',
    joue: enTrois,
    choix: ['Deux', 'Trois'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '06-six-huit-ou-trois-quarts',
    module: 6,
    consigne:
      'Six croches dans les deux cas. Écoute où reviennent les appuis : combien en entends-tu par mesure ?',
    joue: enSixHuit,
    choix: ['Deux appuis', 'Trois appuis'],
    bonne: 0,
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
    kind: 'discrimination',
    id: '06-le-meme-mais-groupe-autrement',
    module: 6,
    consigne:
      'Celui-ci maintenant. Mêmes six croches, appuis différents — deux ou trois ?',
    joue: enTroisQuarts,
    choix: ['Deux appuis', 'Trois appuis'],
    bonne: 1,
  },
]
