import { fraction } from '@rythmes/core'
import type { Exercise } from '../../types'
import { claveTroisDeux, septHuitCourt, septHuitLong, troisContreDeux } from './patterns'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)

/**
 * Les exercices du module 7.
 *
 * Pas de dictée, et c'est un choix : transcrire un trois-contre-deux n'est pas
 * l'objectif — le sentir l'est. Écrire cette superposition demande des
 * conventions dont le cours n'a pas besoin, et qui détourneraient l'attention
 * de la seule chose qui compte ici, la coordination.
 */
export const EXERCISES: readonly Exercise[] = [
  {
    kind: 'frappe',
    id: '07-frapper-les-deux',
    module: 7,
    consigne:
      'Le motif tourne en entier ; ne frappe que la voix lente, celle qui divise le temps en deux. Laisse l’autre te passer dessus sans la suivre.',
    grille: troisContreDeux,
    bpm: 60,
    parTemps: NOIRE,
    cycles: 6,
    voix: 'kick',
  },
  {
    kind: 'frappe',
    id: '07-frapper-les-trois',
    module: 7,
    consigne:
      'La même chose, mais l’autre voix : les trois. Plus difficile, parce que la voix lente tire l’oreille vers elle.',
    grille: troisContreDeux,
    bpm: 60,
    parTemps: NOIRE,
    cycles: 6,
    voix: 'cowbell',
  },
  {
    kind: 'discrimination',
    id: '07-ou-tombe-l-appui-long',
    module: 7,
    consigne:
      'Sept croches par mesure, réparties en trois appuis inégaux. Le plus long est-il au début ou à la fin ?',
    joue: septHuitLong,
    choix: ['Au début', 'À la fin'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '07-l-autre-groupement',
    module: 7,
    consigne: 'Et celui-ci ? Même chiffrage, appuis répartis autrement.',
    joue: septHuitCourt,
    choix: ['Au début', 'À la fin'],
    bonne: 0,
  },
  {
    kind: 'dechiffrage',
    id: '07-lire-la-clave',
    module: 7,
    consigne:
      'Cinq attaques sur deux mesures. Lis-les et frappe-les sans écouter d’abord — c’est une cellule qu’il vaut mieux avoir dans les mains.',
    aLire: claveTroisDeux,
    bpm: 96,
    parTemps: CROCHE,
  },
]
