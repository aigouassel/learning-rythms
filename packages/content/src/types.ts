import type { Fraction, Meter, Pattern, Style, Voice } from '@rythmes/core'

/**
 * Un module du cours.
 *
 * `requires` déclare les prérequis, et l'ensemble forme un graphe orienté
 * vérifié par les tests : acyclique, et tout module atteignable depuis le
 * module 0. Une erreur de rédaction devient un test rouge plutôt qu'une
 * impasse découverte en naviguant.
 */
export type Module = {
  readonly number: number
  readonly slug: string
  readonly title: string
  readonly summary: string
  readonly requires: readonly number[]
  /** Les répertoires qui **démontrent** le concept, pas ceux qui l'illustrent. */
  readonly styles: readonly Style[]
  /** Les termes que ce module installe — les slugs du lexique. */
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
export type Term = {
  readonly slug: string
  readonly nom: string
  /** Les synonymes d'usage — *anacrouse* et *levée* désignent la même chose. */
  readonly aussiAppele?: readonly string[]
  /** Ce que ça fait à l'oreille, avant d'avoir un nom. */
  readonly sensation: string
  readonly definition: string
  readonly introduitAu: number
  /** Les voisins, et surtout ceux avec lesquels on le confond. */
  readonly voirAussi?: readonly string[]
  readonly style?: Style
}

type Commun = {
  readonly id: string
  readonly module: number
  readonly consigne: string
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
      /**
       * La voix à frapper, quand le motif en compte plusieurs.
       *
       * En polyrythmie, on joue une voix pendant que l'autre sonne : sans
       * cette précision, la correction attendrait les attaques des deux.
       */
      readonly voix?: Voice
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
    | 'finit-avant-la-fin'
  readonly n?: number
}

export type ExerciseKind = Exercise['kind']
