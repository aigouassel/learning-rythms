import { fraction } from '@rythmes/core'
import type { Exercise } from '../../types'
import {
  deuxCrochesUneNoire,
  escalier,
  quatreCroches,
  quatreNoires,
  rockElementaire,
  uneNoireDeuxCroches,
} from './patterns'

const NOIRE = fraction(1, 4)

/**
 * Les exercices du module 3.
 *
 * Quatre niveaux de nommage — reconnaître, discriminer, produire sous
 * contrainte, produire — plus une lecture. C'est le seul module à les porter
 * tous les quatre : il installe la notation, donc il doit la faire manipuler
 * sous toutes ses formes.
 *
 * Pas de frappe mesurée ici : l'exécution est le sujet des modules 1 et 2. Ce
 * module-ci travaille le passage du son au signe.
 */
export const EXERCISES: readonly Exercise[] = [
  {
    kind: 'qcm',
    id: '03-qcm-reconnaitre',
    module: 3,
    consigne: 'Écoute, puis désigne la notation qui correspond.',
    joue: deuxCrochesUneNoire,
    options: [deuxCrochesUneNoire, uneNoireDeuxCroches, quatreCroches],
    bonne: 0,
  },
  {
    kind: 'appariement',
    id: '03-apparier-les-trois',
    module: 3,
    consigne:
      'Trois motifs, trois notations. Relie chaque son à ce qui l’écrit — ils ne diffèrent que par l’ordre des durées.',
    motifs: [deuxCrochesUneNoire, uneNoireDeuxCroches, quatreCroches],
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
    kind: 'dictee',
    id: '03-dictee-escalier',
    module: 3,
    consigne:
      'Écoute et écris ce que tu entends. Chaque temps va deux fois plus vite que ne l’indique ton oreille au départ : prends le temps de compter combien d’attaques tombent dans un seul temps.',
    attendu: escalier,
    // Ta frappe sert de porte d'entrée, mais valider impose de départager des
    // notations : l'oreille propose, le nommage tranche.
    saisie: 'frappe-puis-choix',
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
