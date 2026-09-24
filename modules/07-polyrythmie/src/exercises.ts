import { fraction } from '@rythmes/core'
import type { Exercise } from '@rythmes/syllabus'
import {
  cinqHuitCourt,
  cinqHuitLong,
  claveAmputee,
  claveDeuxTrois,
  claveTroisDeux,
  deuxSeul,
  hemiole,
  septHuitAppuis,
  septHuitCourt,
  septHuitLong,
  troisContreDeux,
  troisSeul,
  troisTempsReguliers,
} from './patterns'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)

/**
 * Les exercices du module 7.
 *
 * Pas de dictée, et c'est un choix : transcrire un trois-contre-deux n'est pas
 * l'objectif — le sentir l'est. Écrire cette superposition demande des
 * conventions dont le cours n'a pas besoin, et qui détourneraient l'attention
 * de la seule chose qui compte ici, la coordination.
 *
 * Les frappes dominent donc, et elles suivent une progression précise : jouer
 * une voix pendant que l'autre sonne, puis l'autre, puis la cellule qui
 * gouverne, puis les appuis inégaux. À chaque fois la difficulté est la même —
 * ne pas se laisser tirer par ce qu'on entend.
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
    voix: ['kick'],
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
    voix: ['cowbell'],
  },
  {
    kind: 'appariement',
    id: '07-apparier-les-voix',
    module: 7,
    consigne:
      'Les deux voix séparées, puis ensemble. Relie chaque son à sa notation — et remarque que la troisième n’ajoute rien : elle superpose.',
    motifs: [deuxSeul, troisSeul, troisContreDeux],
    bpm: 60,
  },
  {
    kind: 'discrimination',
    id: '07-ou-tombe-l-appui-long',
    module: 7,
    consigne:
      'Sept croches par mesure, réparties en trois appuis inégaux. Le plus long est-il au début ou à la fin ?',
    joue: septHuitLong,
    bpm: 132,
    parTemps: CROCHE,
    choix: ['Au début', 'À la fin'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '07-l-autre-groupement',
    module: 7,
    consigne: 'Et celui-ci ? Même chiffrage, appuis répartis autrement.',
    joue: septHuitCourt,
    bpm: 132,
    parTemps: CROCHE,
    choix: ['Au début', 'À la fin'],
    bonne: 0,
  },
  {
    kind: 'discrimination',
    id: '07-cinq-croches-long-d-abord',
    module: 7,
    consigne:
      'Cinq croches cette fois, en deux appuis seulement : un long et un court. Lequel vient en premier ?',
    joue: cinqHuitLong,
    bpm: 144,
    parTemps: CROCHE,
    choix: ['Le long', 'Le court'],
    bonne: 0,
  },
  {
    kind: 'discrimination',
    id: '07-cinq-croches-court-d-abord',
    module: 7,
    consigne: 'Même question, et c’est la seule façon d’apprendre à les séparer.',
    joue: cinqHuitCourt,
    bpm: 144,
    parTemps: CROCHE,
    choix: ['Le long', 'Le court'],
    bonne: 1,
  },
  {
    kind: 'frappe',
    id: '07-frapper-les-appuis-inegaux',
    module: 7,
    consigne:
      'Ne frappe que les trois appuis : court, court, long. Ne compte pas jusqu’à sept — retiens la formule, c’est ainsi que ça se joue là-bas.',
    grille: septHuitAppuis,
    bpm: 132,
    parTemps: CROCHE,
    cycles: 6,
    voix: ['clave'],
  },
  {
    kind: 'discrimination',
    id: '07-deux-appuis-dans-trois-temps',
    module: 7,
    consigne:
      'La mesure annonce trois temps. Combien d’appuis entends-tu réellement ?',
    joue: hemiole,
    bpm: 132,
    choix: ['Deux', 'Trois'],
    bonne: 0,
  },
  {
    kind: 'discrimination',
    id: '07-trois-appuis-dans-trois-temps',
    module: 7,
    consigne:
      'Et ici ? Rien n’a changé à l’écrit — ni le chiffrage, ni le nombre de croches. Seuls les accents ont bougé.',
    joue: troisTempsReguliers,
    bpm: 132,
    choix: ['Deux', 'Trois'],
    bonne: 1,
  },
  {
    kind: 'frappe',
    id: '07-frapper-l-hemiole',
    module: 7,
    consigne:
      'Frappe les deux appuis longs pendant que le charleston continue d’égrener ses six croches. Ton geste et ce que tu entends ne tombent ensemble qu’au début de la mesure.',
    grille: hemiole,
    bpm: 132,
    parTemps: NOIRE,
    cycles: 6,
    voix: ['clave'],
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
  {
    kind: 'dechiffrage',
    id: '07-lire-la-clave-retournee',
    module: 7,
    consigne:
      'La même cellule, ses deux mesures échangées. Les notes sont identiques et le morceau ne serait pas le même : lis-la comme si tu ne la connaissais pas.',
    aLire: claveDeuxTrois,
    bpm: 96,
    parTemps: CROCHE,
  },
  {
    kind: 'discrimination',
    id: '07-trois-deux-ou-deux-trois',
    module: 7,
    consigne:
      'Écoute la première mesure du cycle : porte-t-elle trois attaques, ou deux ?',
    joue: claveDeuxTrois,
    bpm: 96,
    parTemps: CROCHE,
    choix: ['Trois puis deux', 'Deux puis trois'],
    bonne: 1,
  },
  {
    kind: 'reperage',
    id: '07-la-clave-trouee',
    module: 7,
    consigne:
      'Cinq attaques écrites, quatre jouées. Celle qui manque est aussi celle qu’on remarque le moins — ce qui est exactement le problème.',
    ecrit: claveTroisDeux,
    joue: claveAmputee,
    bpm: 88,
    parTemps: CROCHE,
  },
]
