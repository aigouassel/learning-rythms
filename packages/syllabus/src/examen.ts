import type { Exercise, ExerciseKind, Module } from './types'

/**
 * Le contrôle : vingt questions prises dans tout le cours.
 *
 * Ce n'est pas un module de plus, et surtout pas une liste d'exercices de
 * mieux : l'onglet Exercices d'un module interroge ce qu'on vient de lire,
 * dans l'ordre où on l'a lu. Le contrôle fait l'inverse — il mélange les
 * sujets et les difficultés, pour poser la seule question qu'un module ne peut
 * pas poser : *reconnaîtrais-tu ça sans savoir d'où ça vient ?*
 *
 * Tout ici est une fonction pure d'un vivier et d'une graine. Deux conséquences
 * qui valent
 * les quelques lignes du générateur pseudo-aléatoire : le tirage est rejouable
 * (`#examen/7a3f` redonne le même contrôle, d'une séance à l'autre et d'une
 * machine à l'autre) et il est testable — ce qu'un `Math.random` dispersé dans
 * les composants ne serait pas.
 */

/**
 * Ce que coûte un genre, en plus du module où il se trouve.
 *
 * L'échelle est celle du cadrage §6.1 — reconnaître, discriminer, produire
 * sous contrainte, produire — et non une intuition de plus. Un QCM du module 6
 * et une dictée du module 3 se valent à peu près ; c'est exactement ce que ces
 * poids disent, et c'est ce qui permet de mélanger sans tout aplatir.
 */
export const POIDS_DU_GENRE: Readonly<Record<ExerciseKind, number>> = {
  /** Reconnaître : le point de départ assumé du cours. */
  discrimination: 0,
  qcm: 0,
  /** Discriminer finement, lire activement. */
  appariement: 1,
  reperage: 1,
  /** Produire sous contrainte. */
  completion: 2,
  frappe: 2,
  /** Produire, sans filet : le symbole devient son, ou le son devient signe. */
  dechiffrage: 3,
  dictee: 3,
  /** L'objectif final. */
  composition: 4,
}

/**
 * La difficulté, dérivée plutôt que déclarée.
 *
 * Aucun champ n'est ajouté aux 124 exercices : la difficulté se lit sur ce
 * qu'ils sont déjà — l'endroit du cours et la compétence exigée. Un seul
 * endroit à corriger quand le jugement se révèle faux, au lieu de cent
 * vingt-quatre.
 *
 * Le prix : deux exercices de même module et de même genre sont réputés
 * égaux, ce qu'ils ne sont pas toujours. C'est acceptable parce que cette
 * mesure ne sert qu'à *répartir* un tirage, jamais à noter qui que ce soit.
 */
export const difficulte = (e: Exercise): number => e.module + POIDS_DU_GENRE[e.kind]

export const TAILLE_DU_CONTROLE = 20

/** Trois bandes de difficulté : une facile, une moyenne, une exigeante. */
export const NOMBRE_DE_STRATES = 3

/**
 * Le vivier : les modules 1 à 8.
 *
 * L'unité 0 en est exclue. Ses neuf exercices forment un diagnostic — ils
 * mesurent un point de départ, ils n'enseignent rien — et un contrôle
 * interroge ce que le cours a installé. Les tenir à l'écart n'enlève d'ailleurs
 * aucune compétence au tirage : tenir une pulsation, compter un cycle et lire
 * une figure sont repris et approfondis par les modules 1 à 4.
 */
export const vivier = (
  modules: readonly Module[],
  exercicesDe: (module: number) => readonly Exercise[],
): readonly Exercise[] => modules.filter((m) => m.number > 0).flatMap((m) => [...exercicesDe(m.number)])

/**
 * Les trois strates, par tertiles de la population réelle.
 *
 * On découpe la liste triée en trois tranches d'effectif égal, plutôt que de
 * fixer des seuils sur la difficulté elle-même. Des seuils écrits en dur
 * (« facile = moins de 4 ») donneraient des bandes très inégales — et se
 * fausseraient au premier module ajouté. Ici le découpage suit le cours quel
 * que soit ce qu'il devient.
 *
 * Le tri départage les ex æquo par identifiant : sans ça, la composition des
 * strates dépendrait de la stabilité du tri du moteur, et le contrôle ne serait
 * plus tout à fait le même d'un navigateur à l'autre pour une graine donnée.
 */
export function strates(vivier: readonly Exercise[]): readonly (readonly Exercise[])[] {
  const ordonne = [...vivier].sort(
    (a, b) => difficulte(a) - difficulte(b) || (a.id < b.id ? -1 : 1),
  )
  return Array.from({ length: NOMBRE_DE_STRATES }, (_, i) =>
    ordonne.slice(
      Math.floor((i * ordonne.length) / NOMBRE_DE_STRATES),
      Math.floor(((i + 1) * ordonne.length) / NOMBRE_DE_STRATES),
    ),
  )
}

export type Controle = {
  readonly graine: string
  readonly questions: readonly Exercise[]
}

/**
 * Le contrôle d'une graine.
 *
 * Trois temps, et chacun répond à un défaut précis du tirage naïf :
 *
 * 1. **Un quota par strate**, sinon un tirage uniforme sort volontiers vingt
 *    discriminations des premiers modules — le vivier en est plein.
 * 2. **Un tourniquet par genre** dans chaque strate, sinon la strate haute
 *    rend quatre dictées d'affilée.
 * 3. **Un enchaînement sous pénalité**, parce que des questions bien choisies
 *    mal ordonnées se lisent encore comme un module : c'est l'étape qui fait
 *    la différence à l'écran.
 */
export function controle(
  vivier: readonly Exercise[],
  graine: string,
  taille: number = TAILLE_DU_CONTROLE,
): Controle {
  const tirer = alea(graine)
  const bandes = strates(vivier)
  const parts = quotas(taille, bandes.length, tirer)

  const tires: Tire[] = []
  const reste: Tire[] = []

  bandes.forEach((bande, strate) => {
    const pris = tourniquet(bande, parts[strate]!, tirer)
    for (const exercice of pris) tires.push({ exercice, strate })
    // Ce qui n'a pas été pris reste disponible : voir le complément ci-dessous.
    const dedans = new Set(pris.map((e) => e.id))
    for (const exercice of bande) {
      if (!dedans.has(exercice.id)) reste.push({ exercice, strate })
    }
  })

  // Une strate trop maigre pour son quota ne raccourcit pas le contrôle : on
  // complète ailleurs. Le cas ne se produit pas aujourd'hui — chaque bande
  // compte une trentaine d'exercices pour sept demandés — mais un contrôle qui
  // rendrait dix-sept questions sur vingt sans rien dire serait un bug muet.
  const complement = battu(reste, tirer)
  while (tires.length < taille && complement.length > 0) tires.push(complement.pop()!)

  return { graine, questions: enchaine(tires, tirer) }
}

/** Une graine courte, lisible dans une URL et dictable à voix haute. */
export function graineAleatoire(): string {
  return Math.floor(Math.random() * 0x10000)
    .toString(16)
    .padStart(4, '0')
}

/* ── Le tirage ─────────────────────────────────────────────────────────── */

/** Un exercice tiré, et la strate d'où il vient — elle sert à l'ordonner. */
type Tire = {
  readonly exercice: Exercise
  readonly strate: number
}

/**
 * Répartir `total` questions en `parts` quotas aussi égaux que possible.
 *
 * Vingt questions sur trois strates font 6, 6 et 6, plus deux à placer. Les
 * donner aux deux premières strates par commodité chargerait toujours le
 * contrôle du côté facile : le surplus va donc à des strates tirées au sort.
 */
function quotas(total: number, parts: number, tirer: () => number): readonly number[] {
  const base = Math.floor(total / parts)
  const quotas = Array.from({ length: parts }, () => base)
  for (const i of battu([...quotas.keys()], tirer).slice(0, total % parts)) quotas[i]! += 1
  return quotas
}

/**
 * Prendre `combien` exercices dans une strate, un genre à la fois.
 *
 * Chaque genre forme une file battue ; on sert les files à tour de rôle. La
 * propriété obtenue vaut mieux qu'un quota de genres écrit à la main :
 * **aucun genre n'est servi deux fois avant que tous l'aient été une fois.**
 * Sur sept questions tirées parmi six ou sept genres, ça suffit à couvrir
 * presque toute la typologie sans jamais l'imposer — un genre absent d'une
 * strate n'y est tout simplement pas réclamé.
 */
function tourniquet(
  strate: readonly Exercise[],
  combien: number,
  tirer: () => number,
): readonly Exercise[] {
  const parGenre = new Map<ExerciseKind, Exercise[]>()
  for (const e of strate) {
    const file = parGenre.get(e.kind)
    if (file) file.push(e)
    else parGenre.set(e.kind, [e])
  }

  const files = battu([...parGenre.values()], tirer).map((file) => battu(file, tirer))
  const pris: Exercise[] = []

  while (pris.length < combien && files.some((f) => f.length > 0)) {
    for (const file of files) {
      if (pris.length === combien) break
      const e = file.shift()
      if (e) pris.push(e)
    }
  }
  return pris
}

/* ── L'ordre ───────────────────────────────────────────────────────────── */

/**
 * Ce que coûte de poser cette question juste après la précédente.
 *
 * Les trois poids ne sont pas interchangeables. La **strate** pèse le plus
 * lourd : c'est elle qui produirait l'effet « ça devient dur d'un coup », celui
 * qui donne l'impression d'un examen classé par niveau. Le **module** vient
 * ensuite — deux questions voisines venues du même module ramènent au
 * sommaire mental qu'on cherche justement à défaire. Le **genre** compte le
 * moins : deux discriminations de suite sur des sujets éloignés ne trahissent
 * rien, et c'est même le seul enchaînement que le cours recommande (§6.3, « les
 * discriminations vont par paires »).
 */
const penalite = (t: Tire, precedent: Tire | undefined): number =>
  precedent === undefined
    ? 0
    : (t.strate === precedent.strate ? 4 : 0) +
      (t.exercice.module === precedent.exercice.module ? 2 : 0) +
      (t.exercice.kind === precedent.exercice.kind ? 1 : 0)

/**
 * Mettre les questions dans un ordre qui ne se lit pas.
 *
 * Un simple battage ne suffit pas : sur vingt questions tirées dans huit
 * modules, il place presque toujours deux voisines du même module quelque
 * part, et rien n'empêche les sept questions de la strate haute de se retrouver
 * groupées.
 *
 * On construit donc la suite question par question, en prenant à chaque fois la
 * candidate la moins pénalisée. C'est un glouton **à score** et non à
 * interdiction : empiler trois interdictions sur vingt éléments, c'est se
 * garantir un cas où la fin de la séquence n'a plus de solution. Ici il n'y a
 * pas d'échec possible — au pire une pénalité assumée, ce qui est très
 * exactement ce qu'on veut d'un arrangement esthétique.
 *
 * Les ex æquo se départagent par l'effectif restant — d'abord celui de la
 * strate, puis celui du module. Sans cette règle, le glouton épuise une bande
 * puis se retrouve forcé d'enchaîner les six dernières questions de la même :
 * c'est la précaution classique qui rend ce genre de rangement optimal plutôt
 * qu'à peu près correct. Le second critère n'est pas un raffinement gratuit —
 * sans lui, la contrainte de module échoue sur une graine sur dix, faute
 * d'avoir vu venir le module qui restait seul en fin de séquence.
 *
 * Le premier tour de boucle n'a pas de précédent : toutes les candidates y
 * valent zéro, et c'est le battage initial qui décide — donc la graine.
 */
function enchaine(tires: readonly Tire[], tirer: () => number): readonly Exercise[] {
  const restants = battu(tires, tirer)
  const suite: Tire[] = []

  while (restants.length > 0) {
    const precedent = suite[suite.length - 1]
    const parStrate = effectifs(restants, (t) => t.strate)
    const parModule = effectifs(restants, (t) => t.exercice.module)

    let choix = 0
    for (let i = 1; i < restants.length; i += 1) {
      const candidate = restants[i]!
      const tenante = restants[choix]!
      const ecart =
        penalite(candidate, precedent) - penalite(tenante, precedent) ||
        (parStrate.get(tenante.strate) ?? 0) - (parStrate.get(candidate.strate) ?? 0) ||
        (parModule.get(tenante.exercice.module) ?? 0) -
          (parModule.get(candidate.exercice.module) ?? 0)
      if (ecart < 0) choix = i
    }

    suite.push(restants.splice(choix, 1)[0]!)
  }

  return suite.map((t) => t.exercice)
}

/** Combien de candidates restantes partagent chaque valeur d'un critère. */
function effectifs<T>(restants: readonly Tire[], critere: (t: Tire) => T): Map<T, number> {
  const compte = new Map<T, number>()
  for (const t of restants) compte.set(critere(t), (compte.get(critere(t)) ?? 0) + 1)
  return compte
}

/* ── Le hasard, reproductible ──────────────────────────────────────────── */

/**
 * `mulberry32`, semé par un FNV-1a de la graine.
 *
 * `Math.random` ne se sème pas : c'est la seule raison d'écrire un générateur
 * à la main plutôt que d'appeler la plateforme. Celui-ci tient en cinq lignes,
 * ne prétend à aucune qualité cryptographique — on distribue des questions,
 * pas des clés — et rend la même suite partout, ce qui est tout ce qu'on lui
 * demande.
 */
function alea(graine: string): () => number {
  let a = 0x811c9dc5
  for (let i = 0; i < graine.length; i += 1) {
    a ^= graine.charCodeAt(i)
    a = Math.imul(a, 0x01000193)
  }

  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher-Yates, sur le hasard de la graine et non sur celui du moteur. */
function battu<T>(items: readonly T[], tirer: () => number): T[] {
  const cartes = [...items]
  for (let i = cartes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(tirer() * (i + 1))
    ;[cartes[i], cartes[j]] = [cartes[j]!, cartes[i]!]
  }
  return cartes
}
