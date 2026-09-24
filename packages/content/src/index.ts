import { assembleCours } from '@rythmes/syllabus'
import module0 from '@rythmes/00-prise-de-reperes'
import module1 from '@rythmes/01-sentir-la-pulsation'
import module2 from '@rythmes/02-temps-forts-et-faibles'
import module3 from '@rythmes/03-les-durees'
import module4 from '@rythmes/04-lire-et-ecrire'
import module5 from '@rythmes/05-enrichir-le-vocabulaire'
import module6 from '@rythmes/06-composees-et-ternaire'
import module7 from '@rythmes/07-polyrythmie'
import module8 from '@rythmes/08-le-rythme-comme-materiau'

/**
 * Le cours, assemblé depuis les libs de ses modules.
 *
 * L'ordre n'est pas une liste mais un graphe : les modules 5 (écrire
 * proprement) et 6 (entendre du complexe) travaillent deux choses
 * indépendantes et peuvent se faire dans n'importe quel ordre. Le module 8 les
 * exige tous les deux.
 *
 *         0 → 1 → 2 → 3 → 4 ─┬→ 5 ─┬→ 7 → 8
 *                            └→ 6 ─┘
 *
 * Ce graphe n'est pas écrit ici : chaque lib déclare ses prérequis, et le
 * dessin ci-dessus est ce qu'ils forment. Les tests vérifient qu'il reste
 * acyclique et que tout module demeure atteignable depuis le module 0.
 */
const COURS = assembleCours([
  module0,
  module1,
  module2,
  module3,
  module4,
  module5,
  module6,
  module7,
  module8,
])

/**
 * Les données du cours et les opérations liées à ces données.
 *
 * Les noms sont ceux d'avant le découpage en libs, et volontairement : c'est
 * ici que la liaison se fait, pour que l'application et les tests continuent
 * d'écrire `controle(graine)` sans savoir qu'un vivier se glisse derrière.
 */
export const {
  MODULES,
  LEXIQUE,
  EXERCISES_BY_MODULE,
  moduleByNumber,
  termBySlug,
  exercisesOf,
  cycles,
  unreachable,
  danglingRequires,
  danglingSeeAlso,
  misplacedExercises,
  forwardReferences,
  vivier,
  strates,
  controle,
} = COURS

/* ── Le contrat, réexporté ─────────────────────────────────────────────────
 *
 * Ce qui ne dépend d'aucune donnée du cours vient tel quel de `syllabus`.
 * L'application n'a ainsi qu'un paquet à connaître.
 */
export {
  contraintesViolees,
  difficulte,
  exerciseProblems,
  graineAleatoire,
  NOMBRE_DE_STRATES,
  POIDS_DU_GENRE,
  TAILLE_DU_CONTROLE,
} from '@rythmes/syllabus'

export type {
  Contrainte,
  Controle,
  Cours,
  Exercise,
  ExerciseKind,
  Module,
  ModuleDuCours,
  ModuleRedige,
  Term,
  TermeRedige,
} from '@rythmes/syllabus'
