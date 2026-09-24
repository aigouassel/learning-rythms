import type { TermeRedige } from '@rythmes/syllabus'

/** Les termes que ce module installe — dans l'ordre où la leçon les amène. */
export const TERMES: readonly TermeRedige[] = [
  {
    slug: 'pulsation',
    nom: 'Pulsation',
    sensation: 'ce sur quoi on tape du pied sans y penser',
    definition: 'le battement régulier sous-jacent à la musique, qu’il soit joué ou non',
    voirAussi: ['temps', 'tempo'],
    style: 'house',
  },
  {
    slug: 'tempo',
    nom: 'Tempo',
    sensation: 'ce qui rend un morceau pressé ou étale',
    definition: 'la vitesse de la pulsation, mesurée en battements par minute',
    voirAussi: ['pulsation'],
  },
  {
    slug: 'battue',
    nom: 'Battue',
    sensation: 'le geste du chef, en fanfare',
    definition: 'le tracé manuel qui rend la pulsation et la mesure visibles à l’ensemble',
    style: 'marche',
  },
]
