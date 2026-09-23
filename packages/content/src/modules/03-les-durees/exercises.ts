import { fraction } from '@rythmes/core'
import type { Exercise } from '../../types'
import {
  demiSilencePuisDeux,
  deuxCrochesUneNoire,
  deuxFoisPlusVite,
  deuxNoires,
  dicteeAvecSilences,
  dicteeSimple,
  escalier,
  noireQuatreDoubles,
  quatreCroches,
  quatreDoublesUneNoire,
  quatreFoisPlusVite,
  quatreNoires,
  rockElementaire,
  silencePuisNoire,
  uneBlanche,
  uneNoireDeuxCroches,
} from './patterns'

const NOIRE = fraction(1, 4)

/**
 * Les exercices du module 3.
 *
 * C'est le module charnière : la notation apparaît, donc cinq genres
 * deviennent possibles d'un coup — reconnaître, apparier, compléter, écrire
 * sous dictée, lire. Ils sont tous là, et dans cet ordre, parce que c'est
 * l'ordre dans lequel un signe s'installe : d'abord on le reconnaît parmi
 * d'autres, à la fin on le produit seul.
 *
 * Pas de frappe mesurée : l'exécution est le sujet des modules 1 et 2. Ce
 * module-ci travaille le passage du son au signe, et le déchiffrage suffit à
 * le faire dans l'autre sens.
 */
export const EXERCISES: readonly Exercise[] = [
  {
    kind: 'discrimination',
    id: '03-combien-dans-un-temps',
    module: 3,
    consigne:
      'Écoute un seul temps, pas la mesure entière. Combien de frappes y tombent ?',
    joue: deuxFoisPlusVite,
    bpm: 72,
    choix: ['Une', 'Deux', 'Quatre'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '03-combien-dans-un-temps-encore',
    module: 3,
    consigne: 'Même question, et c’est la seule qui compte vraiment dans ce module.',
    joue: quatreFoisPlusVite,
    bpm: 72,
    choix: ['Une', 'Deux', 'Quatre'],
    bonne: 2,
  },
  {
    kind: 'qcm',
    id: '03-qcm-reconnaitre',
    module: 3,
    consigne: 'Écoute, puis désigne la notation qui correspond.',
    joue: deuxCrochesUneNoire,
    bpm: 76,
    options: [deuxCrochesUneNoire, uneNoireDeuxCroches, quatreCroches],
    bonne: 0,
  },
  {
    kind: 'qcm',
    id: '03-qcm-les-doubles',
    module: 3,
    consigne:
      'Le même exercice, un cran plus fin : cette fois l’un des temps est coupé en quatre. Au début, ou à la fin ?',
    joue: noireQuatreDoubles,
    bpm: 72,
    options: [quatreDoublesUneNoire, noireQuatreDoubles, quatreCroches],
    bonne: 1,
  },
  {
    kind: 'qcm',
    id: '03-qcm-les-longues',
    module: 3,
    consigne:
      'Dans l’autre sens maintenant. Combien de sons entends-tu dans la mesure entière — et donc combien de signes faut-il pour l’écrire ?',
    joue: uneBlanche,
    bpm: 76,
    options: [deuxNoires, uneBlanche, quatreCroches],
    bonne: 1,
  },
  {
    kind: 'qcm',
    id: '03-qcm-le-silence',
    module: 3,
    consigne:
      'Attention : ici, ce qu’il faut reconnaître est ce qu’on n’entend pas. Où tombe le silence ?',
    joue: silencePuisNoire,
    bpm: 72,
    options: [deuxNoires, silencePuisNoire, demiSilencePuisDeux],
    bonne: 1,
  },
  {
    kind: 'appariement',
    id: '03-apparier-les-trois',
    module: 3,
    consigne:
      'Trois motifs, trois notations. Relie chaque son à ce qui l’écrit — ils ne diffèrent que par l’ordre des durées.',
    motifs: [deuxCrochesUneNoire, uneNoireDeuxCroches, quatreCroches],
    bpm: 76,
  },
  {
    kind: 'appariement',
    id: '03-apparier-les-doubles',
    module: 3,
    consigne:
      'Trois motifs de nouveau, mais il faut désormais séparer deux vitesses à l’intérieur d’une même mesure.',
    motifs: [quatreDoublesUneNoire, noireQuatreDoubles, quatreCroches],
    bpm: 72,
  },
  {
    kind: 'appariement',
    id: '03-apparier-les-silences',
    module: 3,
    consigne:
      'Ces trois-là ont le même nombre de sons ou presque : c’est l’endroit du silence qui les distingue.',
    motifs: [silencePuisNoire, demiSilencePuisDeux, deuxNoires],
    bpm: 72,
  },
  {
    kind: 'completion',
    id: '03-completer-le-temps',
    module: 3,
    consigne:
      'Il manque une attaque pour que la mesure soit pleine. Place-la, et choisis sa durée.',
    attendu: quatreNoires,
    donne: {
      ...quatreNoires,
      onsets: quatreNoires.onsets.slice(0, 3),
    },
  },
  {
    kind: 'completion',
    id: '03-completer-l-escalier',
    module: 3,
    consigne:
      'Les trois premiers temps sont écrits, chacun plus rapide que le précédent. Écris le quatrième — mais écoute avant de supposer qu’il continue la série.',
    attendu: escalier,
    donne: {
      ...escalier,
      onsets: escalier.onsets.slice(0, 7),
    },
    bpm: 66,
  },
  {
    kind: 'dictee',
    id: '03-dictee-quatre-temps',
    module: 3,
    consigne:
      'Écoute et écris. Un seul des quatre temps est coupé en deux ; les autres portent un son chacun.',
    attendu: dicteeSimple,
    saisie: 'palette',
    bpm: 66,
  },
  {
    kind: 'dictee',
    id: '03-dictee-avec-silences',
    module: 3,
    consigne:
      'Celle-ci comporte des trous. Ne les écris pas : laisse la place vide, et elle dira le silence toute seule.',
    attendu: dicteeAvecSilences,
    saisie: 'palette',
    bpm: 66,
  },
  {
    kind: 'dictee',
    id: '03-dictee-escalier',
    module: 3,
    consigne:
      'Écoute et écris ce que tu entends. Chaque temps va deux fois plus vite que ne l’indique ton oreille au départ : prends le temps de compter combien d’attaques tombent dans un seul temps.',
    attendu: escalier,
    // Ta frappe sert de porte d'entrée, mais valider impose de départager des
    // notations : l'oreille propose, le nommage tranche.
    saisie: 'frappe-puis-choix',
    bpm: 66,
  },
  {
    kind: 'dechiffrage',
    id: '03-lire-le-rock',
    module: 3,
    consigne:
      'Lis avant d’écouter. Trois voix, trois vitesses : la plus lente en bas, la plus rapide en haut.',
    aLire: rockElementaire,
    bpm: 84,
    parTemps: NOIRE,
  },
]
