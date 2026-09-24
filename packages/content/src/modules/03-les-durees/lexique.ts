import type { TermeRedige } from '@rythmes/syllabus'

/** Les termes que ce module installe — dans l'ordre où la leçon les amène. */
export const TERMES: readonly TermeRedige[] = [
  {
    slug: 'duree-relative',
    nom: 'Durée relative',
    sensation: 'une note qui dure « deux fois moins » que la précédente',
    definition: 'la longueur d’une note exprimée en rapport, jamais en secondes',
    voirAussi: ['tempo'],
  },
  {
    slug: 'ronde',
    nom: 'Ronde',
    sensation: 'la plus longue tenue du cours',
    definition: 'vaut quatre temps quand la noire vaut le temps',
    voirAussi: ['blanche', 'duree-relative'],
  },
  {
    slug: 'blanche',
    nom: 'Blanche',
    sensation: 'la moitié d’une ronde',
    definition: 'vaut deux temps quand la noire vaut le temps',
    voirAussi: ['ronde', 'noire'],
  },
  {
    slug: 'noire',
    nom: 'Noire',
    sensation: 'l’unité qu’on tape du pied, le plus souvent',
    definition: 'vaut un temps dans les mesures en /4',
    voirAussi: ['blanche', 'croche'],
  },
  {
    slug: 'croche',
    nom: 'Croche',
    sensation: 'deux notes dans le temps d’une',
    definition: 'la moitié d’une noire',
    voirAussi: ['noire', 'double-croche'],
  },
  {
    slug: 'double-croche',
    nom: 'Double croche',
    sensation: 'quatre notes dans le temps d’une',
    definition: 'la moitié d’une croche',
    voirAussi: ['croche'],
  },
  {
    slug: 'silence',
    nom: 'Silence',
    sensation: 'un trou qui dure, pas une absence',
    definition:
      'une durée sans son — elle occupe le temps exactement comme une note',
    courant: true,
    voirAussi: ['soupir'],
  },
  {
    slug: 'soupir',
    nom: 'Soupir',
    sensation: '—',
    definition:
      'le silence qui vaut une noire ; la série a ses noms propres — pause, demi-pause, soupir, demi-soupir, quart de soupir',
    voirAussi: ['silence', 'noire'],
  },
  {
    slug: 'hampe',
    nom: 'Hampe',
    sensation: '—',
    definition: 'le trait vertical attaché à la tête de note',
    voirAussi: ['ligature'],
  },
  {
    slug: 'ligature',
    nom: 'Ligature',
    sensation: '—',
    definition: 'la barre qui relie plusieurs croches ou doubles en un groupe',
    voirAussi: ['hampe', 'croche'],
  },
  {
    slug: 'syllabes-rythmiques',
    nom: 'Syllabes rythmiques',
    aussiAppele: ['Kodály'],
    sensation: 'dire le rythme avant de l’écrire',
    definition:
      'des syllabes parlées associées aux figures — ta pour la noire, ti pour la croche',
  },
]
