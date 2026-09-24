import type { Fraction, Meter, Pattern, Style, Voice } from '@rythmes/core'

/**
 * Un module du cours.
 *
 * `requires` déclare les prérequis, et l'ensemble forme un graphe orienté
 * vérifié par les tests : acyclique, et tout module atteignable depuis le
 * module 0. Une erreur de rédaction devient un test rouge plutôt qu'une
 * impasse découverte en naviguant.
 */
export type ModuleRedige = {
  readonly number: number
  readonly slug: string
  readonly title: string
  readonly summary: string
  readonly requires: readonly number[]
  /** Les répertoires qui **démontrent** le concept, pas ceux qui l'illustrent. */
  readonly styles: readonly Style[]
}

/**
 * Un module, tel que le cours assemblé le présente.
 *
 * `introduces` n'est pas rédigé : il se déduit du lexique que la lib du module
 * porte. Avant que chaque module ait son paquet, la liste des slugs était
 * saisie à la main *et* chaque terme déclarait son module d'origine — deux
 * écritures de la même chose, qu'un contrôle de cohérence devait comparer.
 * Faire tenir les deux au même endroit rend ce désaccord impossible à écrire,
 * ce qui vaut mieux qu'un test qui l'attrape.
 */
export type Module = ModuleRedige & {
  /** Les termes que ce module installe — les slugs de son lexique. */
  readonly introduces: readonly string[]
}

/**
 * Une entrée du lexique.
 *
 * L'ordre des champs n'est pas décoratif : `sensation` précède `definition`
 * parce que le cours entier procède ainsi — entendre, puis nommer. Une entrée
 * qui commencerait par la définition formelle trahirait ce principe au seul
 * endroit où l'on vient chercher un mot qu'on ne possède pas encore.
 */
export type TermeRedige = {
  readonly slug: string
  readonly nom: string
  /** Les synonymes d'usage — *anacrouse* et *levée* désignent la même chose. */
  readonly aussiAppele?: readonly string[]
  /** Ce que ça fait à l'oreille, avant d'avoir un nom. */
  readonly sensation: string
  readonly definition: string
  /**
   * Le mot existe aussi en français ordinaire.
   *
   * « Temps », « mesure », « accent », « silence » sont des termes du cours et
   * des mots de tous les jours. Les surveiller comme les autres rendrait toute
   * prose impossible avant le module qui les définit — on ne peut pas écrire
   * une leçon de rythme sans jamais dire « en même temps ».
   *
   * Le contrôle des références en avant les ignore donc. C'est une faiblesse
   * assumée : elle porte sur les mots les plus courants, ceux dont l'emploi
   * fautif serait de toute façon le plus visible à la relecture.
   */
  readonly courant?: boolean
  /** Les voisins, et surtout ceux avec lesquels on le confond. */
  readonly voirAussi?: readonly string[]
  readonly style?: Style
}

/**
 * Un terme, tel que le cours assemblé le présente.
 *
 * `introduitAu` vient de la lib qui porte le terme : un terme écrit dans
 * `modules/03-les-durees` est introduit au module 3, et ne peut pas prétendre
 * le contraire.
 */
export type Term = TermeRedige & {
  readonly introduitAu: number
}

/**
 * Ce qu'une lib de module expose — le contrat entre un module et l'agrégat.
 *
 * La prose n'en fait pas partie : un `.mdx` demande un compilateur que les
 * tests n'ont pas, et l'application l'importe donc directement depuis la lib.
 * Ici ne passe que ce qui est vérifiable sans navigateur.
 */
export type ModuleDuCours = {
  readonly module: ModuleRedige
  readonly termes: readonly TermeRedige[]
  readonly exercices: readonly Exercise[]
}

/**
 * Combien de lignes un exercice peut demander de frapper.
 *
 * Trois, parce qu'on a deux index et un pouce. Ce n'est pas une limite
 * d'interface déguisée en règle de contenu : au-delà, l'exercice cesserait de
 * porter sur le rythme pour porter sur la coordination instrumentale, et un
 * échec ne dirait plus si c'est la lecture ou les doigts qui ont manqué.
 *
 * Quelles touches, et dans quel ordre, ne regarde en revanche que
 * l'application — voir `apps/web/src/exercices/touches.ts`.
 */
export const MAX_VOIX_FRAPPEES = 3

type Commun = {
  readonly id: string
  readonly module: number
  readonly consigne: string
  /**
   * À quelle vitesse l'exercice se fait entendre.
   *
   * Optionnel ici, et redéclaré obligatoire par les genres qui ne peuvent pas
   * s'en passer — déchiffrage, frappe, repérage — où le tempo fait partie de
   * la consigne. Ailleurs il corrige une écoute : une gigue en 6/8 et une
   * house n'ont pas la même allure, et les jouer toutes deux à la vitesse par
   * défaut suffit à rendre l'une méconnaissable.
   *
   * `parTemps` dit *de quelle figure* ce nombre compte les passages : en
   * mesure composée, c'est la noire pointée et non la noire.
   */
  readonly bpm?: number
  readonly parTemps?: Fraction
}

/**
 * Les exercices, choisis **par la compétence que le module installe** et jamais
 * par souci de complétude (cadrage §6.2). Un module sans notation ne peut pas
 * avoir de dictée ; un module de polyrythmie n'a pas à en avoir une.
 */
export type Exercise =
  /** Catégoriser une sensation : binaire ou ternaire, 6/8 ou 3/4. */
  | (Commun & {
      readonly kind: 'discrimination'
      readonly joue: Pattern
      readonly choix: readonly string[]
      readonly bonne: number
    })
  /** Reconnaître : on écoute, on désigne la notation qui correspond. */
  | (Commun & {
      readonly kind: 'qcm'
      readonly joue: Pattern
      readonly options: readonly Pattern[]
      readonly bonne: number
    })
  /** Discriminer finement : relier des sons à des notations. */
  | (Commun & {
      readonly kind: 'appariement'
      readonly motifs: readonly Pattern[]
    })
  /** Produire sous contrainte : une mesure à trous, un élément à placer. */
  | (Commun & {
      readonly kind: 'completion'
      readonly attendu: Pattern
      /** Ce qui est déjà écrit ; l'élève ajoute le reste. */
      readonly donne: Pattern
    })
  /** Produire : écouter et écrire. */
  | (Commun & {
      readonly kind: 'dictee'
      readonly attendu: Pattern
      readonly saisie: 'palette' | 'frappe-puis-choix'
    })
  /** Lire et jouer, sans avoir entendu d'abord. */
  | (Commun & {
      readonly kind: 'dechiffrage'
      readonly aLire: Pattern
      readonly bpm: number
      readonly parTemps: Fraction
      readonly voix?: readonly Voice[]
    })
  /** Exécuter : taper en place, tenir, frapper des contretemps. */
  | (Commun & {
      readonly kind: 'frappe'
      readonly grille: Pattern
      readonly bpm: number
      readonly parTemps: Fraction
      readonly cycles: number
      /** Le clic s'arrête et tu continues : le test du rythme intérieur. */
      readonly clicSArrete?: boolean
      readonly voix?: readonly Voice[]
    })
  /**
   * Lecture active : la partition dit une chose, l'enregistrement en dit une
   * autre. Où ?
   *
   * C'est l'exercice le plus efficace pour apprendre à lire, parce qu'il
   * oblige à suivre le texte au lieu de le survoler — on ne peut pas repérer
   * un écart sans avoir lu chaque signe.
   */
  | (Commun & {
      readonly kind: 'reperage'
      /** Ce qui est écrit. */
      readonly ecrit: Pattern
      /** Ce qui sonne — il en diffère par une attaque et une seule. */
      readonly joue: Pattern
      readonly bpm: number
      readonly parTemps: Fraction
    })
  /**
   * Écrire soi-même, sous contraintes.
   *
   * Une composition ne se note pas : elle se vérifie sur ce qu'on a demandé,
   * puis elle se joue, et c'est l'oreille qui juge le reste. C'est le seul
   * exercice du cours dont la réponse n'est pas prévue d'avance — et c'est
   * l'objectif vers lequel tout le reste conduit.
   */
  | (Commun & {
      readonly kind: 'composition'
      readonly meter: Meter
      readonly length: Fraction
      readonly contraintes: readonly Contrainte[]
      readonly voix?: Voice
    })

/**
 * Ce qu'une composition doit respecter.
 *
 * Déclaratif, pour rester une donnée : le libellé est ce qu'on affiche, la
 * règle est ce qu'on vérifie, et les deux vivent au même endroit — impossible
 * d'afficher une consigne que le contrôle ne teste pas.
 */
export type Contrainte = {
  readonly libelle: string
  readonly regle:
    | 'mesures-pleines'
    | 'au-moins'
    | 'au-plus'
    | 'une-hors-du-temps'
    | 'commence-sur-le-temps'
    | 'commence-apres-le-debut'
  readonly n?: number
}

export type ExerciseKind = Exercise['kind']
