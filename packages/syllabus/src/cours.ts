import {
  cycles,
  danglingRequires,
  danglingSeeAlso,
  forwardReferences,
  unreachable,
} from './coherence'
import { controle, strates, TAILLE_DU_CONTROLE, vivier, type Controle } from './examen'
import type { Exercise, Module, ModuleDuCours, Term } from './types'

/**
 * Un cours assemblé : ses données, et les opérations déjà liées à ces données.
 *
 * L'intérêt de cette liaison est aux appelants. L'application et les tests
 * écrivent `controle(graine)` et `forwardReferences(texte, 3)` comme avant que
 * le cours soit découpé en libs — ils n'ont pas à savoir que ces fonctions ont
 * désormais besoin qu'on leur passe le lexique ou le vivier.
 */
export type Cours = {
  readonly MODULES: readonly Module[]
  readonly LEXIQUE: readonly Term[]
  readonly EXERCISES_BY_MODULE: Readonly<Record<number, readonly Exercise[]>>
  readonly moduleByNumber: (n: number) => Module | undefined
  readonly termBySlug: (slug: string) => Term | undefined
  readonly exercisesOf: (module: number) => readonly Exercise[]
  readonly cycles: () => readonly number[][]
  readonly unreachable: () => readonly number[]
  readonly danglingRequires: () => readonly string[]
  readonly danglingSeeAlso: () => readonly string[]
  readonly misplacedExercises: () => readonly string[]
  readonly forwardReferences: (texte: string, module: number) => readonly string[]
  readonly vivier: () => readonly Exercise[]
  readonly strates: () => readonly (readonly Exercise[])[]
  readonly controle: (graine: string, taille?: number) => Controle
}

/**
 * Assembler le cours à partir des libs de ses modules.
 *
 * Deux champs ne sont pas rédigés mais déduits, et c'est ici que ça se passe :
 * `module.introduces` est la liste des slugs du lexique que la lib porte, et
 * `term.introduitAu` le numéro de cette lib. Tant que les termes vivaient dans
 * un lexique central, ces deux informations s'écrivaient deux fois et pouvaient
 * se contredire ; il fallait un contrôle pour comparer les deux écritures. Ce
 * contrôle a disparu avec la redondance qui le justifiait.
 *
 * L'ordre est imposé ici plutôt que confié à l'ordre des arguments : `MODULES`
 * est parcouru pour afficher le sommaire et pour constituer le vivier du
 * contrôle, et un cours dont le sommaire dépendrait de l'ordre d'une liste
 * d'imports serait une invitation au dégât silencieux.
 */
export function assembleCours(libs: readonly ModuleDuCours[]): Cours {
  const ordonne = [...libs].sort((a, b) => a.module.number - b.module.number)

  const MODULES: readonly Module[] = ordonne.map((l) => ({
    ...l.module,
    introduces: l.termes.map((t) => t.slug),
  }))

  const LEXIQUE: readonly Term[] = ordonne.flatMap((l) =>
    l.termes.map((t) => ({ ...t, introduitAu: l.module.number })),
  )

  const EXERCISES_BY_MODULE: Readonly<Record<number, readonly Exercise[]>> = Object.fromEntries(
    ordonne.map((l) => [l.module.number, l.exercices]),
  )

  const exercisesOf = (module: number): readonly Exercise[] => EXERCISES_BY_MODULE[module] ?? []

  // Calculés une fois : le vivier ne change pas, et les strates coûtent un tri
  // de tout le cours à chaque appel.
  const leVivier = vivier(MODULES, exercisesOf)
  const lesStrates = strates(leVivier)

  return {
    MODULES,
    LEXIQUE,
    EXERCISES_BY_MODULE,
    moduleByNumber: (n) => MODULES.find((m) => m.number === n),
    termBySlug: (slug) => LEXIQUE.find((t) => t.slug === slug),
    exercisesOf,
    cycles: () => cycles(MODULES),
    unreachable: () => unreachable(MODULES),
    danglingRequires: () => danglingRequires(MODULES),
    danglingSeeAlso: () => danglingSeeAlso(LEXIQUE),
    // Le découpage en libs crée une jointure neuve : un exercice porte son
    // numéro de module, et il vit dans la lib d'un module. Rien dans les types
    // n'oblige les deux à s'accorder — le contrôle, si.
    misplacedExercises: () =>
      ordonne.flatMap((l) =>
        l.exercices
          .filter((e) => e.module !== l.module.number)
          .map((e) => `${e.id} se dit du module ${e.module} mais vit dans le ${l.module.number}`),
      ),
    forwardReferences: (texte, module) => forwardReferences(LEXIQUE, texte, module),
    vivier: () => leVivier,
    strates: () => lesStrates,
    controle: (graine, taille = TAILLE_DU_CONTROLE) => controle(leVivier, graine, taille),
  }
}
