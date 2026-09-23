import { fraction, meter } from '@rythmes/core'
import type { Exercise } from '../../types'
import {
  augmente,
  boucle,
  densifie,
  depart,
  deplace,
  diminue,
  fondation,
  fondationAmputee,
  phraseDeQuatre,
  retrograde,
} from './patterns'

const NOIRE = fraction(1, 4)

/**
 * Les exercices du module 8.
 *
 * Le module produit plus qu'il ne reconnaît, et les quatre compositions en
 * sont le cœur : ce sont les seuls exercices du cours dont la réponse n'est
 * pas prévue d'avance.
 *
 * Les appariements du début ne contredisent pas ce principe, parce qu'ils ne
 * font pas reconnaître des figures — cela, les modules 3 et 4 l'ont fait — mais
 * des **transformations**. Entendre qu'un motif est l'augmentation d'un autre
 * et non sa diminution est exactement le geste qu'il faudra savoir faire en
 * écrivant : c'est de la production déguisée en reconnaissance.
 */
export const EXERCISES: readonly Exercise[] = [
  {
    kind: 'appariement',
    id: '08-apparier-les-vitesses',
    module: 8,
    consigne:
      'Un seul motif, trois vitesses. Relie chaque son à sa notation — et remarque que les trois ont la même forme, pas la même durée.',
    motifs: [depart, augmente, diminue],
    bpm: 84,
  },
  {
    kind: 'appariement',
    id: '08-apparier-les-transformations',
    module: 8,
    consigne:
      'Trois transformations du même motif : déplacé, densifié, retourné. La dernière est la plus difficile à reconnaître — c’est normal, et instructif.',
    motifs: [deplace, densifie, retrograde],
    bpm: 84,
  },
  {
    kind: 'qcm',
    id: '08-retrouver-l-original',
    module: 8,
    consigne:
      'Celui que tu entends est l’un des trois écrits. Compare d’abord les départs : c’est là que la silhouette se décide.',
    joue: retrograde,
    bpm: 84,
    options: [depart, deplace, retrograde],
    bonne: 2,
  },
  {
    kind: 'reperage',
    id: '08-la-fondation-trouee',
    module: 8,
    consigne:
      'Une figure répétée sans fin finit par s’écouter distraitement. Celle-ci perd une frappe : laquelle ?',
    ecrit: fondation,
    joue: fondationAmputee,
    bpm: 88,
    parTemps: NOIRE,
  },
  {
    kind: 'frappe',
    id: '08-tenir-la-fondation',
    module: 8,
    consigne:
      'Frappe la grosse caisse et rien d’autre, huit fois de suite sans varier. Tenir sans varier est un geste à part entière : c’est ce qui fait qu’on peut construire par-dessus.',
    grille: fondation,
    bpm: 88,
    parTemps: NOIRE,
    cycles: 8,
    voix: 'kick',
  },
  {
    kind: 'frappe',
    id: '08-le-charleston-de-la-boucle',
    module: 8,
    consigne:
      'La voix la plus régulière de la boucle, pendant que le reste bouge dessous. C’est le poste le plus ingrat et le plus structurant.',
    grille: boucle,
    bpm: 88,
    parTemps: NOIRE,
    cycles: 4,
    voix: 'hihat',
  },
  {
    kind: 'frappe',
    id: '08-sentir-la-carrure',
    module: 8,
    consigne:
      'Quatre mesures, dont la dernière s’ouvre. Frappe la caisse claire et compte les mesures : c’est le nombre quatre qu’il faut finir par sentir sans compter.',
    grille: phraseDeQuatre,
    bpm: 88,
    parTemps: NOIRE,
    cycles: 2,
    voix: 'snare',
  },
  {
    kind: 'dechiffrage',
    id: '08-lire-la-boucle',
    module: 8,
    consigne:
      'Trois voix superposées, toutes à lire d’un coup. Prends la plus lente d’abord, ajoute les autres mentalement, puis joue.',
    aLire: boucle,
    bpm: 88,
    parTemps: NOIRE,
  },
  {
    kind: 'dechiffrage',
    id: '08-lire-le-retrograde',
    module: 8,
    consigne:
      'Lis celui-ci sans chercher à reconnaître : c’est un motif que tu connais, à l’envers, et la mémoire va te tromper plus qu’elle ne va t’aider.',
    aLire: retrograde,
    bpm: 84,
    parTemps: NOIRE,
  },
  {
    kind: 'completion',
    id: '08-densifier-un-motif',
    module: 8,
    consigne:
      'Voici le début d’un motif. Ajoute deux attaques pour le rendre plus dense, sans lui faire perdre sa silhouette.',
    attendu: densifie,
    donne: depart,
  },
  {
    kind: 'completion',
    id: '08-achever-l-augmentation',
    module: 8,
    consigne:
      'Les deux premières attaques de la version ralentie sont écrites. Ajoute la dernière — et donne-lui la durée qu’exige le doublement, pas celle qui te semble tomber bien.',
    attendu: augmente,
    donne: {
      ...augmente,
      onsets: augmente.onsets.slice(0, 2),
    },
    bpm: 84,
  },
  {
    kind: 'composition',
    id: '08-une-mesure-a-toi',
    module: 8,
    consigne:
      'Écris une mesure. Les contraintes sont là pour t’obliger à un choix, pas pour te juger : le reste ne se vérifie pas, il s’écoute.',
    meter: meter(4, 4),
    length: fraction(1),
    voix: 'snare',
    contraintes: [
      { libelle: 'La mesure est pleine', regle: 'mesures-pleines' },
      { libelle: 'Au moins quatre attaques', regle: 'au-moins', n: 4 },
      { libelle: 'Au plus huit attaques', regle: 'au-plus', n: 8 },
      { libelle: 'Une attaque au moins tombe hors des appuis', regle: 'une-hors-du-temps' },
    ],
  },
  {
    kind: 'composition',
    id: '08-un-ostinato',
    module: 8,
    consigne:
      'Écris une figure courte destinée à tourner en boucle. Peu d’attaques, et rien qui appelle une suite : un motif qui se referme sur lui-même se supporte cent fois, un motif qui raconte quelque chose devient vite insupportable.',
    meter: meter(4, 4),
    length: fraction(1),
    voix: 'kick',
    contraintes: [
      { libelle: 'La mesure est pleine', regle: 'mesures-pleines' },
      { libelle: 'Au moins trois attaques', regle: 'au-moins', n: 3 },
      { libelle: 'Au plus cinq attaques', regle: 'au-plus', n: 5 },
      { libelle: 'Commence sur le premier temps', regle: 'commence-sur-le-temps' },
    ],
  },
  {
    kind: 'composition',
    id: '08-deux-mesures-avec-un-elan',
    module: 8,
    consigne:
      'Deux mesures, cette fois. Ne commence pas sur le premier appui : laisse-le arriver.',
    meter: meter(4, 4),
    length: fraction(2),
    voix: 'kick',
    contraintes: [
      { libelle: 'Deux mesures pleines', regle: 'mesures-pleines' },
      { libelle: 'Rien sur la toute première position', regle: 'commence-apres-le-debut' },
      { libelle: 'Au moins six attaques', regle: 'au-moins', n: 6 },
      { libelle: 'Une attaque au moins tombe hors des appuis', regle: 'une-hors-du-temps' },
    ],
  },
  {
    kind: 'composition',
    id: '08-quatre-mesures',
    module: 8,
    consigne:
      'Quatre mesures : la longueur par défaut de presque toute la musique que tu connais. Écris-les d’un trait, puis écoute si la quatrième donne envie de revenir à la première — c’est la seule chose qu’on demande à une phrase.',
    meter: meter(4, 4),
    length: fraction(4),
    voix: 'snare',
    contraintes: [
      { libelle: 'Quatre mesures pleines', regle: 'mesures-pleines' },
      { libelle: 'Au moins dix attaques', regle: 'au-moins', n: 10 },
      { libelle: 'Au plus vingt-quatre attaques', regle: 'au-plus', n: 24 },
      { libelle: 'Une attaque au moins tombe hors des appuis', regle: 'une-hors-du-temps' },
    ],
  },
]
