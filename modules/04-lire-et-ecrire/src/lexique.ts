import type { TermeRedige } from '@rythmes/syllabus'

/** Les termes que ce module installe — dans l'ordre où la leçon les amène. */
export const TERMES: readonly TermeRedige[] = [
  {
    slug: 'chiffrage',
    nom: 'Chiffrage indicateur',
    sensation: '—',
    definition:
      'les deux chiffres en début de portée : combien d’unités par mesure, et quelle est l’unité',
    voirAussi: ['mesure'],
  },
  {
    slug: 'cellule',
    nom: 'Cellule rythmique',
    sensation: 'un petit motif qu’on reconnaît tout de suite',
    definition: 'une figure courte, d’une mesure ou moins, traitée comme une unité',
  },
  {
    slug: 'regroupement',
    nom: 'Regroupement',
    sensation: '—',
    definition:
      'la façon de ligaturer les notes pour que les temps restent visibles à l’œil',
    voirAussi: ['ligature'],
  },
]
