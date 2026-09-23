import { fraction } from '@rythmes/core'
import type { Exercise } from '../../types'
import {
  cycleDeTrois,
  clic,
  deuxCrochesUneNoire,
  enTrois,
  quatreCroches,
  uneNoireDeuxCroches,
} from './patterns'

const NOIRE = fraction(1, 4)

/**
 * Les quatre épreuves du diagnostic.
 *
 * Elles ne notent rien et ne ferment aucune porte : elles disent par où
 * commencer. Le profil de l'apprenante déclare une zone d'ombre — sa lecture
 * rythmique est-elle plus solide que sa lecture des hauteurs ? — et un cours
 * sérieux la lève au lieu de la supposer.
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
      'Frappe avec le clic, puis continue seule quand il s’arrête. On regarde ensuite si tu accélères, si tu ralentis, ou si tu tiens.',
    grille: clic,
    bpm: 84,
    parTemps: NOIRE,
    cycles: 4,
    clicSArrete: true,
  },
  {
    kind: 'discrimination',
    id: '00-deux-ou-trois',
    module: 0,
    consigne:
      'Écoute, et compte combien de frappes tombent entre deux appuis. Deux, ou trois ?',
    joue: enTrois,
    choix: ['Deux', 'Trois'],
    bonne: 1,
  },
  {
    kind: 'discrimination',
    id: '00-longueur-du-cycle',
    module: 0,
    consigne:
      'Écoute où revient l’appui — la frappe qui sonne plus fort. Tous les combien revient-il ?',
    joue: cycleDeTrois,
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
    options: [deuxCrochesUneNoire, uneNoireDeuxCroches, quatreCroches],
    bonne: 0,
  },
]
