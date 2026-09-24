# learning-rythms

Un cours de rythme musical servi par une application web : elle sonne, elle
mesure, elle corrige — ce qu'un support écrit ne peut pas faire.

**En ligne : <https://aigouassel.github.io/learning-rythms/>**

Le cadrage complet est dans [`docs/cadrage.md`](docs/cadrage.md) ; le vocabulaire
du cours dans [`docs/lexique.md`](docs/lexique.md).

## Organisation

| Paquet | Rôle | Dépend de |
| --- | --- | --- |
| `@rythmes/core` | le domaine rythmique, en fractions exactes | *rien* |
| `@rythmes/notation` | fractions ⇄ figures ⇄ syllabes | `core` |
| `@rythmes/engine` | transport et scheduler, sur une horloge injectée | `core` |
| `@rythmes/scoring` | correction temporelle et symbolique | `core`, `notation` |
| `@rythmes/syllabus` | le contrat du cours : ce qu'est un module, un terme, un exercice | `core` |
| `@rythmes/NN-slug` | un module du cours — neuf libs dans `modules/` | `core`, `syllabus` |
| `@rythmes/content` | le cours assemblé, et ses tests transverses | `syllabus`, les neuf modules |
| `@rythmes/web` | l'application — React, VexFlow, smplr | tous |

Le cours tient en trois couches, et l'ordre est imposé par `tsc --build`, dont
les références de projets forment obligatoirement un graphe acyclique :

```
packages/syllabus   le contrat, sans aucune donnée
      ↑
modules/00-… 08-…   un workspace par module : métadonnée, lexique,
      ↑             motifs, exercices, leçon
packages/content    l'assemblage, et ce qu'on ne peut vérifier qu'entier
      ↑
apps/web            l'application
```

Un module ne connaît ni ses voisins ni l'application : il déclare ses prérequis
par leur numéro, et `assembleCours` en fait un graphe. Deux champs n'y sont pas
rédigés mais déduits — les termes qu'un module introduit *sont* son lexique, et
un terme est introduit là où il est écrit.

VexFlow et smplr restent confinés dans `apps/web` : les paquets logiques ne les
connaissent pas, et la bibliothèque de rendu reste remplaçable.

## Où en est le projet

Les neuf modules sont écrits — leçon, motifs et exercices — et les neuf genres
d'exercices ont leur interface. La calibration de latence et le diagnostic du
module 0 fonctionnent, la progression tient dans le navigateur. Le cours compte
124 exercices : une quinzaine par module, neuf pour l'unité 0.

Un **contrôle transversal** s'ouvre depuis le sommaire : vingt questions tirées
dans les huit modules, difficultés mêlées, une à la fois et sans retour arrière.
Le tirage ne dépend que d'une graine portée par l'adresse — `#examen/7a3f`
redonne le même contrôle. Voir `docs/cadrage.md` §6.5.

Reste ouvert, par choix : le système d'acquisition (« module acquis ») et
l'échauffement par répétition espacée. Voir `docs/cadrage.md` §9.

## Commandes

```bash
yarn install
yarn dev         # lance l'application
yarn test        # les tests de tous les paquets
yarn typecheck   # compile le graphe de références TypeScript
```
