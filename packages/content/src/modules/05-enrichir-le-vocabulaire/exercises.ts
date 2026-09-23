import { fraction } from '@rythmes/core'
import type { Exercise } from '../../types'
import {
  contretemps,
  contretempsSeuls,
  crochesEgales,
  levee,
  leveeCourte,
  parDessusLaBarre,
  pointee,
  pointeeAmputee,
  sansLevee,
  skank,
  skankAmpute,
  surLesAppuis,
  syncope,
  syncopeLongue,
} from './patterns'

const NOIRE = fraction(1, 4)

/**
 * Les exercices du module 5.
 *
 * Ce module installe quatre choses qu'on confond : la syncope et le
 * contretemps, le point et la liaison, l'élan d'avant le départ, et le
 * boitement du pointé. Chacune revient au moins deux fois, une première pour
 * la reconnaître et une seconde pour la produire — reconnaître une syncope
 * sans jamais avoir eu à en frapper une ne fixe rien.
 *
 * Les discriminations vont par paires, et ce n'est pas du remplissage : une
 * question posée une seule fois se devine à sa formulation. « Le deuxième
 * appui est-il occupé ? » appelle oui quand on l'entend une fois ; posée deux
 * fois sur deux motifs qui ne diffèrent que par une durée, elle oblige à
 * écouter.
 */
export const EXERCISES: readonly Exercise[] = [
  {
    kind: 'discrimination',
    id: '05-syncope-ou-contretemps',
    module: 5,
    consigne:
      'Écoute le deuxième appui de la mesure. Est-il occupé par une note qui déborde sur lui, ou reste-t-il vide ?',
    joue: syncope,
    bpm: 76,
    choix: ['Une note déborde dessus', 'Il reste vide'],
    bonne: 0,
  },
  {
    kind: 'discrimination',
    id: '05-l-autre-cas',
    module: 5,
    consigne:
      'Même question, même endroit. Les deux motifs ont exactement les mêmes départs : seule la durée du deuxième son change.',
    joue: contretemps,
    bpm: 76,
    choix: ['Une note déborde dessus', 'Il reste vide'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '05-egal-ou-boiteux',
    module: 5,
    consigne:
      'Deux sons par temps dans les deux cas. Sont-ils de durées égales, ou l’un est-il nettement plus long que l’autre ?',
    joue: pointee,
    bpm: 84,
    choix: ['Égaux', 'Le premier est plus long'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '05-egal-ou-boiteux-bis',
    module: 5,
    consigne: 'Et celui-ci ? La question ne change pas ; la réponse, si.',
    joue: crochesEgales,
    bpm: 84,
    choix: ['Égaux', 'Le premier est plus long'],
    bonne: 0,
  },
  {
    kind: 'discrimination',
    id: '05-avec-ou-sans-elan',
    module: 5,
    consigne:
      'Le motif démarre-t-il sur le premier appui, ou y a-t-il quelque chose avant lui ?',
    joue: leveeCourte,
    bpm: 92,
    choix: ['Sur l’appui', 'Quelque chose arrive avant'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '05-sans-elan',
    module: 5,
    consigne: 'Même question sur un motif voisin.',
    joue: sansLevee,
    bpm: 92,
    choix: ['Sur l’appui', 'Quelque chose arrive avant'],
    bonne: 0,
  },
  {
    kind: 'qcm',
    id: '05-reconnaitre-la-syncope',
    module: 5,
    consigne:
      'Trois notations, un seul enregistrement. Regarde d’abord ce qui tombe sur le deuxième appui de chaque mesure écrite.',
    joue: syncope,
    bpm: 76,
    options: [surLesAppuis, syncope, contretemps],
    bonne: 1,
  },
  {
    kind: 'qcm',
    id: '05-reconnaitre-la-liaison',
    module: 5,
    consigne:
      'Ici un son traverse la barre de mesure. Aucune figure ne sait faire ça toute seule : cherche la notation qui en emploie deux, reliées.',
    joue: parDessusLaBarre,
    bpm: 88,
    options: [sansLevee, parDessusLaBarre],
    bonne: 1,
  },
  {
    kind: 'appariement',
    id: '05-apparier-les-placements',
    module: 5,
    consigne:
      'Trois façons d’occuper les mêmes quatre temps : sur les appuis, entre eux, ou à cheval. Relie chaque son à sa notation.',
    motifs: [surLesAppuis, contretempsSeuls, syncope],
    bpm: 76,
  },
  {
    kind: 'frappe',
    id: '05-frapper-les-contretemps',
    module: 5,
    consigne:
      'Frappe uniquement entre les appuis, jamais dessus. C’est l’exercice le plus inconfortable du cours — et celui qui change le plus de choses.',
    grille: skank,
    bpm: 76,
    parTemps: NOIRE,
    cycles: 4,
    voix: 'rimshot',
  },
  {
    kind: 'frappe',
    id: '05-contretemps-sans-filet',
    module: 5,
    consigne:
      'Les mêmes contretemps, mais plus rien ne tombe sur les appuis pour te les rappeler. Il faut les porter en silence pour pouvoir jouer entre eux.',
    grille: contretempsSeuls,
    bpm: 76,
    parTemps: NOIRE,
    cycles: 6,
    voix: 'rimshot',
  },
  {
    kind: 'frappe',
    id: '05-frapper-la-syncope',
    module: 5,
    consigne:
      'Produis-la, maintenant. La difficulté n’est pas d’attaquer au bon moment : c’est de ne pas rattaquer sur l’appui suivant, où la main veut retomber.',
    grille: syncopeLongue,
    bpm: 72,
    parTemps: NOIRE,
    cycles: 4,
    voix: 'snare',
  },
  {
    kind: 'frappe',
    id: '05-partir-en-avance',
    module: 5,
    consigne:
      'Deux notes d’élan avant le premier appui. Compte les temps de la mesure silencieuse : c’est le seul moyen d’entrer au bon endroit.',
    grille: levee,
    bpm: 92,
    parTemps: NOIRE,
    cycles: 3,
    voix: 'snare',
  },
  {
    kind: 'reperage',
    id: '05-skank-troue',
    module: 5,
    consigne:
      'Le skank écrit compte quatre attaques ; l’enregistrement n’en a pas autant. Laquelle manque ?',
    ecrit: skank,
    joue: skankAmpute,
    bpm: 76,
    parTemps: NOIRE,
  },
  {
    kind: 'reperage',
    id: '05-le-pointe-troue',
    module: 5,
    consigne:
      'Le boitement rend le repérage plus dur : l’oreille s’accroche au balancement et cesse de compter. Suis les signes.',
    ecrit: pointee,
    joue: pointeeAmputee,
    bpm: 72,
    parTemps: NOIRE,
  },
  {
    kind: 'dictee',
    id: '05-dictee-syncope',
    module: 5,
    consigne:
      'Écoute et écris. Écris d’abord les attaques dont tu es sûre, puis déduis la durée de celle qui déborde sur l’appui suivant.',
    attendu: syncopeLongue,
    saisie: 'palette',
    bpm: 66,
  },
  {
    kind: 'dechiffrage',
    id: '05-lire-une-levee',
    module: 5,
    consigne:
      'Lis avant d’écouter. La première mesure est presque vide : ne la saute pas, compte-la — c’est elle qui place l’élan.',
    aLire: leveeCourte,
    bpm: 92,
    parTemps: NOIRE,
  },
]
