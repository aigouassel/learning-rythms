import { fraction } from '@rythmes/core'
import type { Exercise } from '../../types'
import {
  bienGroupe,
  bienGroupeAmpute,
  cellule,
  celluleAmputee,
  celluleEtendue,
  deuxQuarts,
  dicteeTroisQuarts,
  quatreQuarts,
  quatreQuartsDecale,
  stompAmpute,
  stompStompClap,
  troisQuarts,
} from './patterns'

const NOIRE = fraction(1, 4)

/**
 * Les exercices du module 4.
 *
 * Plus de frappe libre ni de discrimination de sensation : la perception n'est
 * plus le point dur, c'est le passage entre le son et le signe. Tout ce qui
 * suit va dans un sens ou dans l'autre.
 *
 * Le repérage y tient quatre places, ce qui est beaucoup et délibéré : c'est
 * le seul exercice qu'on ne peut pas réussir à l'oreille. Reconnaître, écrire,
 * même lire à voix haute se contournent par l'audiation ; retrouver l'unique
 * signe qui ment oblige à suivre le texte signe par signe. Pour quelqu'un dont
 * l'oreille dépasse largement la lecture, c'est l'exercice qui travaille
 * vraiment le point faible.
 */
export const EXERCISES: readonly Exercise[] = [
  {
    kind: 'discrimination',
    id: '04-quel-chiffrage-quatre',
    module: 4,
    consigne:
      'Compte les temps d’un cycle, et déduis-en les deux chiffres du début. Lequel est-ce ?',
    joue: quatreQuarts,
    bpm: 88,
    choix: ['2/4', '3/4', '4/4'],
    bonne: 2,
  },
  {
    kind: 'discrimination',
    id: '04-quel-chiffrage-trois',
    module: 4,
    consigne: 'Même question. Le chiffre du haut change, celui du bas ne bouge pas.',
    joue: troisQuarts,
    bpm: 112,
    choix: ['2/4', '3/4', '4/4'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '04-quel-chiffrage-deux',
    module: 4,
    consigne:
      'Et celui-ci. Attention : un cycle de deux et un cycle de quatre se ressemblent tant qu’on n’écoute pas où l’appui revient.',
    joue: deuxQuarts,
    bpm: 108,
    choix: ['2/4', '3/4', '4/4'],
    bonne: 0,
  },
  {
    kind: 'qcm',
    id: '04-reconnaitre-la-cellule',
    module: 4,
    consigne:
      'Trois cellules proches. Écoute combien d’attaques tombent dans la mesure avant de regarder où elles sont.',
    joue: cellule,
    bpm: 80,
    options: [celluleAmputee, cellule, celluleEtendue],
    bonne: 1,
  },
  {
    kind: 'appariement',
    id: '04-apparier-les-cellules',
    module: 4,
    consigne:
      'Les trois mêmes, à relier. Une cellule se reconnaît d’un bloc, comme un mot — c’est exactement ce qu’on installe ici.',
    motifs: [cellule, celluleAmputee, celluleEtendue],
    bpm: 80,
  },
  {
    kind: 'dechiffrage',
    id: '04-lire-avant-d-entendre',
    module: 4,
    consigne:
      'Lis d’abord, joue ensuite — sans avoir entendu. C’est l’épreuve qui compte vraiment : tout le reste peut se faire à l’oreille, pas celle-ci.',
    aLire: stompStompClap,
    bpm: 84,
    parTemps: NOIRE,
  },
  {
    kind: 'dechiffrage',
    id: '04-lire-a-trois-temps',
    module: 4,
    consigne:
      'La même consigne sur un cycle de trois. Ne compte pas jusqu’à quatre par habitude : les deux chiffres du début disent autre chose.',
    aLire: troisQuarts,
    bpm: 108,
    parTemps: NOIRE,
  },
  {
    kind: 'dechiffrage',
    id: '04-lire-le-groupe-dense',
    module: 4,
    consigne:
      'Ici le regroupement fait tout le travail : chaque temps se voit d’un bloc. Lis temps par temps, jamais signe par signe.',
    aLire: bienGroupe,
    bpm: 66,
    parTemps: NOIRE,
  },
  {
    kind: 'reperage',
    id: '04-ou-ca-differe',
    module: 4,
    consigne:
      'La partition et l’enregistrement ne disent pas tout à fait la même chose. Suis le texte du doigt, signe par signe.',
    ecrit: cellule,
    joue: celluleAmputee,
    bpm: 76,
    parTemps: NOIRE,
  },
  {
    kind: 'reperage',
    id: '04-une-attaque-en-trop',
    module: 4,
    consigne:
      'Cette fois, l’enregistrement en dit plus que la partition. Une attaque n’est écrite nulle part — laquelle ?',
    ecrit: cellule,
    joue: celluleEtendue,
    bpm: 76,
    parTemps: NOIRE,
  },
  {
    kind: 'reperage',
    id: '04-une-attaque-en-avance',
    module: 4,
    consigne:
      'Le compte est bon des deux côtés : aucune attaque ne manque, aucune n’est en trop. L’une d’elles arrive seulement trop tôt.',
    ecrit: quatreQuarts,
    joue: quatreQuartsDecale,
    bpm: 80,
    parTemps: NOIRE,
  },
  {
    kind: 'reperage',
    id: '04-le-groupe-troue',
    module: 4,
    consigne:
      'Le plus difficile des quatre : l’écart tombe à l’intérieur d’un groupe rapide, là où l’oreille compte mal.',
    ecrit: bienGroupe,
    joue: bienGroupeAmpute,
    bpm: 60,
    parTemps: NOIRE,
  },
  {
    kind: 'reperage',
    id: '04-le-stomp-troue',
    module: 4,
    consigne:
      'Une figure que tout le monde connaît par cœur — ce qui est précisément le risque : on la lit de mémoire au lieu de la lire.',
    ecrit: stompStompClap,
    joue: stompAmpute,
    bpm: 84,
    parTemps: NOIRE,
  },
  {
    kind: 'dictee',
    id: '04-dictee-simple',
    module: 4,
    consigne:
      'Écoute, puis écris. La grille te donne les emplacements possibles ; à toi de dire lesquels sonnent.',
    attendu: quatreQuarts,
    saisie: 'palette',
  },
  {
    kind: 'dictee',
    id: '04-dictee-a-trois-temps',
    module: 4,
    consigne:
      'Une dictée sur un cycle de trois. La grille est plus courte : commence par compter les temps, pas les attaques.',
    attendu: dicteeTroisQuarts,
    saisie: 'palette',
    bpm: 84,
  },
  {
    kind: 'completion',
    id: '04-completer-le-groupe',
    module: 4,
    consigne:
      'Il manque la fin. Complète pour que la mesure soit pleine, et regarde comment les groupes se reforment.',
    attendu: bienGroupe,
    donne: {
      ...bienGroupe,
      onsets: bienGroupe.onsets.slice(0, 4),
    },
    bpm: 66,
  },
]
