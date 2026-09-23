import type { Term } from './types'

/**
 * Le lexique du cours, en données.
 *
 * Il est la contrepartie de `docs/lexique.md` : le document est l'inventaire
 * éditorial, ceci est ce que l'application sert et ce que les tests vérifient.
 *
 * Les modules à venir apporteront leurs termes. Un terme absent d'ici ne peut
 * pas être cité dans une leçon — c'est précisément ce que le test des
 * références en avant garantit.
 */
export const LEXIQUE: readonly Term[] = [
  // ── Module 1 — Sentir la pulsation ──────────────────────────────────────
  {
    slug: 'pulsation',
    nom: 'Pulsation',
    sensation: 'ce sur quoi on tape du pied sans y penser',
    definition: 'le battement régulier sous-jacent à la musique, qu’il soit joué ou non',
    introduitAu: 1,
    voirAussi: ['temps', 'tempo'],
    style: 'house',
  },
  {
    slug: 'tempo',
    nom: 'Tempo',
    sensation: 'ce qui rend un morceau pressé ou étale',
    definition: 'la vitesse de la pulsation, mesurée en battements par minute',
    introduitAu: 1,
    voirAussi: ['pulsation'],
  },
  {
    slug: 'battue',
    nom: 'Battue',
    sensation: 'le geste du chef, en fanfare',
    definition: 'le tracé manuel qui rend la pulsation et la mesure visibles à l’ensemble',
    introduitAu: 1,
    style: 'marche',
  },

  // ── Module 2 — Temps forts et temps faibles ─────────────────────────────
  {
    slug: 'mesure',
    nom: 'Mesure',
    sensation: 'le cycle qui revient : UN deux, UN deux…',
    definition:
      'un groupe régulier de temps, délimité à l’écrit par des barres de mesure',
    introduitAu: 2,
    voirAussi: ['temps', 'temps-fort'],
  },
  {
    slug: 'temps',
    nom: 'Temps',
    sensation: 'chaque battement à l’intérieur du cycle',
    definition: 'une pulsation considérée par sa place dans la mesure',
    introduitAu: 2,
    voirAussi: ['pulsation', 'mesure'],
  },
  {
    slug: 'temps-fort',
    nom: 'Temps fort',
    sensation: 'l’appui, celui qui donne envie de poser le pied',
    definition: 'le premier temps de la mesure, point d’appui du cycle',
    introduitAu: 2,
    voirAussi: ['temps-faible', 'accent'],
  },
  {
    slug: 'temps-faible',
    nom: 'Temps faible',
    sensation: 'ce qui mène vers l’appui suivant',
    definition: 'tout temps qui n’est pas le temps fort',
    introduitAu: 2,
    voirAussi: ['temps-fort'],
  },
  {
    slug: 'accent',
    nom: 'Accent',
    sensation: 'une note qui ressort',
    definition:
      'un renforcement ponctuel, qui peut coïncider avec le temps fort ou le contredire',
    introduitAu: 2,
  },
  {
    slug: 'barre-de-mesure',
    nom: 'Barre de mesure',
    sensation: '—',
    definition: 'le trait vertical qui sépare deux mesures',
    introduitAu: 2,
    voirAussi: ['mesure'],
  },

  // ── Module 3 — Les durées ───────────────────────────────────────────────
  {
    slug: 'duree-relative',
    nom: 'Durée relative',
    sensation: 'une note qui dure « deux fois moins » que la précédente',
    definition: 'la longueur d’une note exprimée en rapport, jamais en secondes',
    introduitAu: 3,
    voirAussi: ['tempo'],
  },
  {
    slug: 'ronde',
    nom: 'Ronde',
    sensation: 'la plus longue tenue du cours',
    definition: 'vaut quatre temps quand la noire vaut le temps',
    introduitAu: 3,
    voirAussi: ['blanche', 'duree-relative'],
  },
  {
    slug: 'blanche',
    nom: 'Blanche',
    sensation: 'la moitié d’une ronde',
    definition: 'vaut deux temps quand la noire vaut le temps',
    introduitAu: 3,
    voirAussi: ['ronde', 'noire'],
  },
  {
    slug: 'noire',
    nom: 'Noire',
    sensation: 'l’unité qu’on tape du pied, le plus souvent',
    definition: 'vaut un temps dans les mesures en /4',
    introduitAu: 3,
    voirAussi: ['blanche', 'croche'],
  },
  {
    slug: 'croche',
    nom: 'Croche',
    sensation: 'deux notes dans le temps d’une',
    definition: 'la moitié d’une noire',
    introduitAu: 3,
    voirAussi: ['noire', 'double-croche'],
  },
  {
    slug: 'double-croche',
    nom: 'Double croche',
    sensation: 'quatre notes dans le temps d’une',
    definition: 'la moitié d’une croche',
    introduitAu: 3,
    voirAussi: ['croche'],
  },
  {
    slug: 'silence',
    nom: 'Silence',
    sensation: 'un trou qui dure, pas une absence',
    definition:
      'une durée sans son — elle occupe le temps exactement comme une note',
    introduitAu: 3,
    voirAussi: ['soupir'],
  },
  {
    slug: 'soupir',
    nom: 'Soupir',
    sensation: '—',
    definition:
      'le silence qui vaut une noire ; la série a ses noms propres — pause, demi-pause, soupir, demi-soupir, quart de soupir',
    introduitAu: 3,
    voirAussi: ['silence', 'noire'],
  },
  {
    slug: 'hampe',
    nom: 'Hampe',
    sensation: '—',
    definition: 'le trait vertical attaché à la tête de note',
    introduitAu: 3,
    voirAussi: ['ligature'],
  },
  {
    slug: 'ligature',
    nom: 'Ligature',
    sensation: '—',
    definition: 'la barre qui relie plusieurs croches ou doubles en un groupe',
    introduitAu: 3,
    voirAussi: ['hampe', 'croche'],
  },
  {
    slug: 'syllabes-rythmiques',
    nom: 'Syllabes rythmiques',
    aussiAppele: ['Kodály'],
    sensation: 'dire le rythme avant de l’écrire',
    definition:
      'des syllabes parlées associées aux figures — ta pour la noire, ti pour la croche',
    introduitAu: 3,
  },

  // ── Module 4 — Lire et écrire le rythme ─────────────────────────────────
  {
    slug: 'chiffrage',
    nom: 'Chiffrage indicateur',
    sensation: '—',
    definition:
      'les deux chiffres en début de portée : combien d’unités par mesure, et quelle est l’unité',
    introduitAu: 4,
    voirAussi: ['mesure'],
  },
  {
    slug: 'cellule',
    nom: 'Cellule rythmique',
    sensation: 'un petit motif qu’on reconnaît tout de suite',
    definition: 'une figure courte, d’une mesure ou moins, traitée comme une unité',
    introduitAu: 4,
  },
  {
    slug: 'regroupement',
    nom: 'Regroupement',
    sensation: '—',
    definition:
      'la façon de ligaturer les notes pour que les temps restent visibles à l’œil',
    introduitAu: 4,
    voirAussi: ['ligature'],
  },

  // ── Module 5 — Enrichir le vocabulaire ──────────────────────────────────
  {
    slug: 'point',
    nom: 'Point de prolongation',
    sensation: 'une note qui déborde un peu',
    definition: 'un point à droite de la note : ajoute la moitié de sa durée',
    introduitAu: 5,
  },
  {
    slug: 'liaison',
    nom: 'Liaison de prolongation',
    sensation: 'une note qui franchit la barre de mesure',
    definition:
      'relie deux notes de même hauteur : une seule attaque, deux durées additionnées',
    introduitAu: 5,
    voirAussi: ['syncope'],
  },
  {
    slug: 'contretemps',
    nom: 'Contretemps',
    sensation: 'ça joue entre les temps, et le temps reste vide',
    definition:
      'une attaque sur un temps faible, sans prolongation sur le temps fort suivant',
    introduitAu: 5,
    voirAussi: ['syncope', 'temps-faible'],
    style: 'reggae',
  },
  {
    slug: 'syncope',
    nom: 'Syncope',
    sensation: 'ça déborde sur l’appui et le déplace',
    definition:
      'une note attaquée sur un temps faible et prolongée sur le temps fort suivant, qui se trouve privé d’attaque',
    introduitAu: 5,
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
    introduitAu: 5,
    voirAussi: ['temps-fort'],
    style: 'marche',
  },
]

export const termBySlug = (slug: string): Term | undefined =>
  LEXIQUE.find((t) => t.slug === slug)
