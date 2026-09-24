import type { TermeRedige } from '@rythmes/syllabus'

/** Les termes que ce module installe — dans l'ordre où la leçon les amène. */
export const TERMES: readonly TermeRedige[] = [
  {
    slug: 'polyrythmie',
    nom: 'Polyrythmie',
    sensation: 'deux vitesses qui coexistent sans se contredire',
    definition:
      'superposition de deux divisions différentes du même temps — typiquement trois contre deux',
    voirAussi: ['polymetrie', 'subdivision'],
    style: 'afrobeat',
  },
  {
    slug: 'polymetrie',
    nom: 'Polymétrie',
    sensation: 'deux cycles de longueurs différentes',
    definition: 'superposition de deux mesures différentes',
    voirAussi: ['polyrythmie'],
  },
  {
    slug: 'hemiole',
    nom: 'Hémiole',
    sensation: 'le mètre qui bascule un instant',
    definition:
      'trois groupes binaires réentendus comme deux groupes ternaires, ou l’inverse',
    voirAussi: ['polyrythmie'],
  },
  {
    slug: 'clave',
    nom: 'Clave',
    sensation: 'le motif qui gouverne tout le morceau',
    definition:
      'une figure de cinq attaques étalée sur deux mesures, matrice rythmique de la musique afro-cubaine',
    style: 'clave',
  },
  {
    slug: 'metrique-asymetrique',
    nom: 'Métrique asymétrique',
    sensation: 'des temps de longueurs inégales',
    definition: 'mesure dont les temps ne sont pas tous égaux — 7/8 se groupe en 2+2+3',
    voirAussi: ['groupement'],
    style: 'balkan',
  },
  {
    slug: 'groupement',
    nom: 'Groupement',
    sensation: 'l’endroit où l’on sent les appuis',
    definition:
      'la façon dont les subdivisions se répartissent en appuis — 2+3 et 3+2 ne sonnent pas pareil',
    voirAussi: ['metrique-asymetrique'],
  },
]
