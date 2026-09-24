import type { TermeRedige } from '@rythmes/syllabus'

/** Les termes que ce module installe — dans l'ordre où la leçon les amène. */
export const TERMES: readonly TermeRedige[] = [
  {
    slug: 'subdivision',
    nom: 'Subdivision',
    sensation: 'ce qu’on entend à l’intérieur d’un temps',
    definition: 'la division du temps en parties égales',
    voirAussi: ['binaire', 'ternaire'],
  },
  {
    slug: 'binaire',
    nom: 'Binaire',
    sensation: 'un-deux, un-deux dans chaque temps',
    definition: 'temps divisé en deux — et non « mesure à deux temps »',
    voirAussi: ['ternaire', 'subdivision'],
  },
  {
    slug: 'ternaire',
    nom: 'Ternaire',
    sensation: 'un-deux-trois dans chaque temps, un balancement',
    definition: 'temps divisé en trois',
    voirAussi: ['binaire', 'triolet'],
    style: 'blues-shuffle',
  },
  {
    slug: 'triolet',
    nom: 'Triolet',
    sensation: 'trois notes là où on en attendait deux',
    definition:
      'trois notes occupant la durée de deux de même valeur, dans un contexte binaire',
    voirAussi: ['ternaire'],
  },
  {
    slug: 'mesure-composee',
    nom: 'Mesure composée',
    sensation: 'le balancement du 6/8 : deux appuis, trois notes chacun',
    definition:
      'mesure dont le temps se divise en trois ; le chiffre du bas y nomme la subdivision, pas le temps',
    voirAussi: ['ternaire', 'chiffrage'],
    style: 'gigue',
  },
  {
    slug: 'shuffle',
    nom: 'Shuffle',
    aussiAppele: ['swing'],
    sensation: 'le balancement long-court du blues',
    definition: 'une subdivision inégale, proche du ternaire, rarement notée telle quelle',
    style: 'blues-shuffle',
  },
]
