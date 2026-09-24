import type { TermeRedige } from '@rythmes/syllabus'

/** Les termes que ce module installe — dans l'ordre où la leçon les amène. */
export const TERMES: readonly TermeRedige[] = [
  {
    slug: 'mesure',
    nom: 'Mesure',
    sensation: 'le cycle qui revient : UN deux, UN deux…',
    definition:
      'un groupe régulier de temps, délimité à l’écrit par des barres de mesure',
    courant: true,
    voirAussi: ['temps', 'temps-fort'],
  },
  {
    slug: 'temps',
    nom: 'Temps',
    sensation: 'chaque battement à l’intérieur du cycle',
    definition: 'une pulsation considérée par sa place dans la mesure',
    courant: true,
    voirAussi: ['pulsation', 'mesure'],
  },
  {
    slug: 'temps-fort',
    nom: 'Temps fort',
    sensation: 'l’appui, celui qui donne envie de poser le pied',
    definition: 'le premier temps de la mesure, point d’appui du cycle',
    voirAussi: ['temps-faible', 'accent'],
  },
  {
    slug: 'temps-faible',
    nom: 'Temps faible',
    sensation: 'ce qui mène vers l’appui suivant',
    definition: 'tout temps qui n’est pas le temps fort',
    voirAussi: ['temps-fort'],
  },
  {
    slug: 'accent',
    nom: 'Accent',
    sensation: 'une note qui ressort',
    definition:
      'un renforcement ponctuel, qui peut coïncider avec le temps fort ou le contredire',
    courant: true,
  },
  {
    slug: 'barre-de-mesure',
    nom: 'Barre de mesure',
    sensation: '—',
    definition: 'le trait vertical qui sépare deux mesures',
    voirAussi: ['mesure'],
  },
]
