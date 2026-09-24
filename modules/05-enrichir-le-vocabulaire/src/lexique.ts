import type { TermeRedige } from '@rythmes/syllabus'

/** Les termes que ce module installe — dans l'ordre où la leçon les amène. */
export const TERMES: readonly TermeRedige[] = [
  {
    slug: 'point',
    nom: 'Point de prolongation',
    sensation: 'une note qui déborde un peu',
    definition: 'un point à droite de la note : ajoute la moitié de sa durée',
  },
  {
    slug: 'liaison',
    nom: 'Liaison de prolongation',
    sensation: 'une note qui franchit la barre de mesure',
    definition:
      'relie deux notes de même hauteur : une seule attaque, deux durées additionnées',
    voirAussi: ['syncope'],
  },
  {
    slug: 'contretemps',
    nom: 'Contretemps',
    sensation: 'ça joue entre les temps, et le temps reste vide',
    definition:
      'une attaque sur un temps faible, sans prolongation sur le temps fort suivant',
    voirAussi: ['syncope', 'temps-faible'],
    style: 'reggae',
  },
  {
    slug: 'syncope',
    nom: 'Syncope',
    sensation: 'ça déborde sur l’appui et le déplace',
    definition:
      'une note attaquée sur un temps faible et prolongée sur le temps fort suivant, qui se trouve privé d’attaque',
    voirAussi: ['contretemps', 'liaison'],
    style: 'funk',
  },
  {
    slug: 'anacrouse',
    nom: 'Anacrouse',
    aussiAppele: ['levée'],
    sensation: 'l’élan avant le premier appui',
    definition:
      'une ou plusieurs notes placées avant la première barre de mesure, conduisant au temps fort',
    voirAussi: ['temps-fort'],
    style: 'marche',
  },
]
