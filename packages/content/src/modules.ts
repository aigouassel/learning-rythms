import type { Module } from './types'

/**
 * Le cours, module par module.
 *
 * L'ordre n'est pas une liste mais un graphe : les modules 5 (écrire
 * proprement) et 6 (entendre du complexe) travaillent deux choses
 * indépendantes et peuvent se faire dans n'importe quel ordre. Le module 8 les
 * exige tous les deux.
 *
 *         0 → 1 → 2 → 3 → 4 ─┬→ 5 ─┬→ 7 → 8
 *                            └→ 6 ─┘
 */
export const MODULES: readonly Module[] = [
  {
    number: 0,
    slug: 'prise-de-reperes',
    title: 'Prise de repères',
    summary:
      'Calibrer la latence, puis mesurer un point de départ. Ni théorie ni note : on lève la zone d’ombre au lieu de la supposer.',
    requires: [],
    styles: [],
    introduces: [],
  },
  {
    number: 1,
    slug: 'sentir-la-pulsation',
    title: 'Sentir la pulsation',
    summary:
      'Le battement sous la musique, et sa vitesse. La house met la pulsation à nu ; la marche la met dans les jambes.',
    requires: [0],
    styles: ['house', 'marche'],
    introduces: ['pulsation', 'tempo', 'battue'],
  },
  {
    number: 2,
    slug: 'temps-forts-et-faibles',
    title: 'Temps forts et temps faibles',
    summary:
      'La pulsation s’organise en cycles. Marche à deux, valse à trois, pop à quatre : le cycle s’entend sans compter.',
    requires: [1],
    styles: ['marche', 'valse', 'pop'],
    introduces: ['mesure', 'temps', 'temps-fort', 'temps-faible', 'accent', 'barre-de-mesure'],
  },
  {
    number: 3,
    slug: 'les-durees',
    title: 'Les durées',
    summary:
      'Les figures comme des rapports avant d’être des dessins. Le charleston d’une batterie rock double de vitesse, et la proportion devient audible.',
    requires: [2],
    styles: ['rock'],
    introduces: [
      'duree-relative',
      'ronde',
      'blanche',
      'noire',
      'croche',
      'double-croche',
      'silence',
      'soupir',
      'hampe',
      'ligature',
      'syllabes-rythmiques',
    ],
  },
  {
    number: 4,
    slug: 'lire-et-ecrire',
    title: 'Lire et écrire le rythme',
    summary:
      'Les chiffrages, les cellules, et pourquoi on n’écrit pas un rythme n’importe comment : la notation doit rendre les temps visibles.',
    requires: [3],
    styles: ['marche', 'rock'],
    introduces: ['chiffrage', 'cellule', 'regroupement'],
  },
  {
    number: 5,
    slug: 'enrichir-le-vocabulaire',
    title: 'Enrichir le vocabulaire',
    summary:
      'Croche pointée, syncope, contretemps. Le reggae est le contretemps à l’état pur : la guitare ne joue que sur les temps faibles.',
    requires: [4],
    styles: ['reggae', 'funk', 'ska', 'jazz'],
    introduces: ['point', 'liaison', 'contretemps', 'syncope', 'anacrouse'],
  },
  {
    number: 6,
    slug: 'composees-et-ternaire',
    title: 'Mesures composées et ternaire',
    summary:
      'Le temps divisé en trois. La marche en 6/8 est un terrain de fanfare ; le 3/4 lui ressemble et n’a rien à voir.',
    requires: [4],
    styles: ['blues-shuffle', 'marche', 'gigue'],
    introduces: [],
  },
  {
    number: 7,
    slug: 'polyrythmie',
    title: 'Polyrythmie et métriques asymétriques',
    summary:
      'Deux contre trois, la clave, les groupements inégaux des Balkans. Ici le 3-contre-2 est structurel, pas un exercice.',
    requires: [5, 6],
    styles: ['clave', 'afrobeat', 'balkan'],
    introduces: [],
  },
  {
    number: 8,
    slug: 'le-rythme-comme-materiau',
    title: 'Le rythme comme matériau',
    summary:
      'Motif, variation, augmentation, ostinato. Le module qui sert le but : composer, en recyclant les cellules déposées par tout le cours.',
    requires: [7],
    styles: ['hip-hop'],
    introduces: [],
  },
]

export const moduleByNumber = (n: number): Module | undefined =>
  MODULES.find((m) => m.number === n)
