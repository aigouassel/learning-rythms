# `@rythmes/syllabus`

Le **contrat** du cours : ce qu'est un module, un terme, un exercice — et les
opérations qui s'appliquent à n'importe quel cours ayant cette forme.

Ce paquet ne contient **aucune donnée** du cours. C'est la condition pour que
chaque module soit une lib indépendante : une lib de module a besoin des types,
donc elle dépend d'ici ; et l'agrégat (`@rythmes/content`) a besoin des modules,
donc il dépend d'eux. Réunir contrat et agrégation dans un seul paquet ferait un
cycle — que `tsc --build` refuse, les références de projets formant
obligatoirement un graphe acyclique.

| Fichier | Rôle |
| --- | --- |
| `types.ts` | `Module`, `Term`, `Exercise`, `Contrainte`, `ModuleDuCours` |
| `coherence.ts` | les contrôles de rédaction, sur des données reçues en paramètre |
| `examen.ts` | le tirage du contrôle transversal, sur un vivier reçu en paramètre |
| `cours.ts` | `assembleCours(libs)` — lie ces fonctions à un cours réel |

Les fonctions d'ici prennent leurs données en argument plutôt que de les lire
dans une globale. `assembleCours` fait la liaison une fois pour toutes, si bien
que les appelants — l'application, les tests — écrivent `controle(graine)` et non
`controle(vivier, graine)`.
