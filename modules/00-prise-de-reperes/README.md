# `@rythmes/00-prise-de-reperes`

Module 0 — Prise de repères.

| Fichier | Rôle |
| --- | --- |
| `src/module.ts` | la métadonnée : prérequis, répertoires de styles |
| `src/lexique.ts` | les termes que le module installe |
| `src/patterns.ts` | les motifs, en fractions exactes |
| `src/exercises.ts` | les exercices |
| `src/index.ts` | ce que le module apporte au cours — lu par `@rythmes/content` |

Le module ne connaît ni les autres modules ni l'application : il déclare ses
prérequis par leur numéro, et c'est `assembleCours` qui en fait un graphe.
