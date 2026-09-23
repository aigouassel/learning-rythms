import { fraction, meter } from '@rythmes/core'
import type { Exercise } from '../../types'
import { densifie, depart } from './patterns'

/**
 * Les exercices du module 8.
 *
 * Ni QCM ni discrimination : on ne reconnaît plus, on produit. C'est le seul
 * module dont les réponses ne sont pas prévues d'avance — et c'est l'objectif
 * vers lequel tout le reste conduisait.
 */
export const EXERCISES: readonly Exercise[] = [
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
]
